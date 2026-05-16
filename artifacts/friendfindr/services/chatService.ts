import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  Unsubscribe,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: any;
  createdAt: any;
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
  read: boolean;
}

export function chatIdFor(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join("_");
}

export async function getUserChats(uid: string): Promise<Chat[]> {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid)
  );
  const snap = await getDocs(q);
  const chats = snap.docs.map((d) => d.data() as Chat);
  chats.sort((a, b) => {
    const ta = a.lastMessageAt?.toMillis?.() ?? 0;
    const tb = b.lastMessageAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
  return chats;
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
  });
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await addDoc(collection(db, "messages"), {
    chatId,
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
    read: false,
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: trimmed,
    lastMessageAt: serverTimestamp(),
  });
}

export function subscribeToChats(uid: string, callback: (chats: Chat[]) => void): Unsubscribe {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid)
  );
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map((d) => d.data() as Chat);
    chats.sort((a, b) => {
      const ta = a.lastMessageAt?.toMillis?.() ?? 0;
      const tb = b.lastMessageAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    callback(chats);
  });
}
