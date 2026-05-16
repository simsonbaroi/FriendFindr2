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
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type RequestStatus = "pending" | "approved" | "rejected";

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
  await setDoc(doc(db, "requests", id), {
    id,
    fromUid,
    toUid,
    status: "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function cancelRequest(fromUid: string, toUid: string) {
  await deleteDoc(doc(db, "requests", requestId(fromUid, toUid)));
}

export async function approveRequest(fromUid: string, toUid: string) {
  const id = requestId(fromUid, toUid);
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
    });
  }
}

export async function rejectRequest(fromUid: string, toUid: string) {
  await updateDoc(doc(db, "requests", requestId(fromUid, toUid)), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
}

export async function getRequestStatus(
  currentUid: string,
  targetUid: string
): Promise<{ status: RequestStatus | null; direction: "sent" | "received" | null }> {
  const sentId = requestId(currentUid, targetUid);
  const receivedId = requestId(targetUid, currentUid);

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
}

export async function getIncomingRequests(uid: string): Promise<ContactRequest[]> {
  const q = query(
    collection(db, "requests"),
    where("toUid", "==", uid),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ContactRequest);
}

export async function getSentRequests(uid: string): Promise<ContactRequest[]> {
  const q = query(
    collection(db, "requests"),
    where("fromUid", "==", uid),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ContactRequest);
}

export async function getConnections(uid: string): Promise<string[]> {
  const q1 = query(
    collection(db, "requests"),
    where("fromUid", "==", uid),
    where("status", "==", "approved")
  );
  const q2 = query(
    collection(db, "requests"),
    where("toUid", "==", uid),
    where("status", "==", "approved")
  );

  const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const uids: string[] = [];
  s1.docs.forEach((d) => uids.push((d.data() as ContactRequest).toUid));
  s2.docs.forEach((d) => uids.push((d.data() as ContactRequest).fromUid));
  return uids;
}
