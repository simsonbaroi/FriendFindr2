import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

export type RequestStatus = "pending" | "approved" | "rejected";

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

export interface ContactRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: RequestStatus;
  createdAt: any;
  updatedAt: any;
}

function requestId(fromUid: string, toUid: string) {
  return `${fromUid}_${toUid}`;
}

export async function sendRequest(fromUid: string, toUid: string) {
  const id = requestId(fromUid, toUid);
  const path = `requests/${id}`;
  try {
    await setDoc(doc(db, "requests", id), {
      id,
      fromUid,
      toUid,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cancelRequest(fromUid: string, toUid: string) {
  const id = requestId(fromUid, toUid);
  const path = `requests/${id}`;
  try {
    await deleteDoc(doc(db, "requests", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function approveRequest(fromUid: string, toUid: string) {
  const id = requestId(fromUid, toUid);
  const path = `requests/${id}`;
  try {
    await updateDoc(doc(db, "requests", id), {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
    // Create chat between the two users
    const chatId = [fromUid, toUid].sort().join("_");
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        id: chatId,
        participants: [fromUid, toUid],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        unreadCount: {
          [fromUid]: 0,
          [toUid]: 0
        }
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function rejectRequest(fromUid: string, toUid: string) {
  const id = requestId(fromUid, toUid);
  const path = `requests/${id}`;
  try {
    await updateDoc(doc(db, "requests", id), {
      status: "rejected",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getRequestStatus(
  currentUid: string,
  targetUid: string
): Promise<{ status: RequestStatus | null; direction: "sent" | "received" | null }> {
  const sentId = requestId(currentUid, targetUid);
  const receivedId = requestId(targetUid, currentUid);

  try {
    const [sentSnap, receivedSnap] = await Promise.all([
      getDoc(doc(db, "requests", sentId)),
      getDoc(doc(db, "requests", receivedId)),
    ]);

    if (sentSnap.exists()) {
      return { status: (sentSnap.data() as ContactRequest).status, direction: "sent" };
    }
    if (receivedSnap.exists()) {
      return { status: (receivedSnap.data() as ContactRequest).status, direction: "received" };
    }
    return { status: null, direction: null };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, "requests");
    return { status: null, direction: null }; // Should not reach here
  }
}

export async function getIncomingRequests(uid: string): Promise<ContactRequest[]> {
  const path = "requests";
  const q = query(
    collection(db, path),
    where("toUid", "==", uid),
    where("status", "==", "pending")
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ContactRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
  }
}

export async function getSentRequests(uid: string): Promise<ContactRequest[]> {
  const path = "requests";
  const q = query(
    collection(db, path),
    where("fromUid", "==", uid),
    where("status", "==", "pending")
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ContactRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
  }
}
