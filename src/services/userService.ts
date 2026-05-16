import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { UserProfile } from "../context/AuthContext";

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

// ─── In-memory profile cache ─────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000;
const profileCache = new Map<string, { profile: UserProfile; ts: number }>();

export function invalidateProfileCache(uid: string) {
  profileCache.delete(uid);
}

export function setProfileCache(profile: UserProfile) {
  profileCache.set(profile.uid, { profile, ts: Date.now() });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;

  const cached = profileCache.get(uid);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.profile;
  }

  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const profile = snap.data() as UserProfile;
    profileCache.set(uid, { profile, ts: Date.now() });
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    throw error;
  }
}

export async function getUserProfiles(uids: string[]): Promise<Map<string, UserProfile>> {
  const result = new Map<string, UserProfile>();
  const toFetch: string[] = [];

  for (const uid of uids) {
    const cached = profileCache.get(uid);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      result.set(uid, cached.profile);
    } else {
      toFetch.push(uid);
    }
  }

  if (toFetch.length > 0) {
    try {
      const fetched = await Promise.all(toFetch.map((uid) => getDoc(doc(db, "users", uid))));
      for (const snap of fetched) {
        if (snap.exists()) {
          const profile = snap.data() as UserProfile;
          profileCache.set(profile.uid, { profile, ts: Date.now() });
          result.set(profile.uid, profile);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "users/multiple");
      throw error;
    }
  }

  return result;
}

export async function searchUsers(
  searchText: string,
  currentUid: string,
  filterCountry?: string
): Promise<UserProfile[]> {
  const text = searchText.trim().toLowerCase();
  if (!text) return [];

  const usersRef = collection(db, "users");
  let q = query(usersRef, where("searchVisible", "==", true), limit(50));
  
  if (filterCountry && filterCountry.trim()) {
     q = query(usersRef, where("searchVisible", "==", true), where("country", "==", filterCountry.trim()), limit(50));
  }

  try {
    const snapshot = await getDocs(q);
    const results: UserProfile[] = [];

    snapshot.forEach((d) => {
      const data = d.data() as UserProfile;
      if (data.uid === currentUid) return;

      const matchesName = data.displayName?.toLowerCase().includes(text);
      const matchesUsername = data.username?.toLowerCase().includes(text);
      const matchesProfession = data.profession?.toLowerCase().includes(text);
      const matchesTags = data.tags?.some((t) => t.toLowerCase().includes(text));
      const matchesBio = data.bio?.toLowerCase().includes(text);

      if (matchesName || matchesUsername || matchesProfession || matchesTags || matchesBio) {
        profileCache.set(data.uid, { profile: data, ts: Date.now() });
        results.push(data);
      }
    });

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "users");
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, "users", uid), data);
    invalidateProfileCache(uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function blockUser(currentUid: string, targetUid: string) {
  try {
    await updateDoc(doc(db, "users", currentUid), { blockedUsers: arrayUnion(targetUid) });
    invalidateProfileCache(currentUid);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${currentUid}`);
  }
}

export async function unblockUser(currentUid: string, targetUid: string) {
  try {
    await updateDoc(doc(db, "users", currentUid), { blockedUsers: arrayRemove(targetUid) });
    invalidateProfileCache(currentUid);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${currentUid}`);
  }
}
