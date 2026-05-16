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
import { db } from "@/lib/firebase";
import { UserProfile } from "@/context/AuthContext";

// ─── In-memory profile cache ─────────────────────────────────────────────────
// Avoids re-fetching the same user on requests/chat screens (N+1 problem).
// Entries expire after 5 minutes.
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

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const profile = snap.data() as UserProfile;
  profileCache.set(uid, { profile, ts: Date.now() });
  return profile;
}

// Fetch multiple profiles at once — dedupes, caches, single parallel batch.
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
    const fetched = await Promise.all(toFetch.map((uid) => getDoc(doc(db, "users", uid))));
    for (const snap of fetched) {
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        profileCache.set(profile.uid, { profile, ts: Date.now() });
        result.set(profile.uid, profile);
      }
    }
  }

  return result;
}

export async function searchUsers(
  searchText: string,
  currentUid: string
): Promise<UserProfile[]> {
  const text = searchText.trim().toLowerCase();
  if (!text) return [];

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("searchVisible", "==", true), limit(50));

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
      // Cache result so profile screen loads instantly
      profileCache.set(data.uid, { profile: data, ts: Date.now() });
      results.push(data);
    }
  });

  return results;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), data);
  // Invalidate cache so next read gets fresh data
  invalidateProfileCache(uid);
}

export async function blockUser(currentUid: string, targetUid: string) {
  await updateDoc(doc(db, "users", currentUid), { blockedUsers: arrayUnion(targetUid) });
  invalidateProfileCache(currentUid);
}

export async function unblockUser(currentUid: string, targetUid: string) {
  await updateDoc(doc(db, "users", currentUid), { blockedUsers: arrayRemove(targetUid) });
  invalidateProfileCache(currentUid);
}
