import {
  collection,
  query,
  where,
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  Unsubscribe,
  limit,
  increment,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: any;
  createdAt: any;
  unreadCount?: Record<string, number>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export function chatIdFor(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join("_");
}

export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "messages"),
    where("chatId", "==", chatId),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
    callback(msgs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "messages");
  });
}

export async function sendMessage(chatId: string, senderId: string, otherParticipantId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  try {
    await addDoc(collection(db, "messages"), {
      chatId,
      senderId,
      text: trimmed,
      createdAt: serverTimestamp(),
    });

    const updateData: any = {
      lastMessage: trimmed,
      lastMessageAt: serverTimestamp(),
    };
    if (otherParticipantId) {
      updateData[`unreadCount.${otherParticipantId}`] = increment(1);
    }

    await updateDoc(doc(db, "chats", chatId), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages`);
  }
}

export async function markChatRead(chatId: string, userId: string) {
  try {
    await updateDoc(doc(db, "chats", chatId), {
      [`unreadCount.${userId}`]: 0
    });
  } catch (error) {
    console.error("Failed to mark chat as read:", error);
  }
}

export function subscribeToChats(uid: string, callback: (chats: Chat[]) => void): Unsubscribe {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid)
  );
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat));
    chats.sort((a, b) => {
      const ta = a.lastMessageAt?.toMillis?.() ?? 0;
      const tb = b.lastMessageAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    callback(chats);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "chats");
  });
}
