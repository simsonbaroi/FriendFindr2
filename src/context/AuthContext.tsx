import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL: string;
  bio: string;
  country: string;
  phone?: string;
  profession: string;
  tags: string[];
  searchVisible: boolean;
  allowRequests: boolean;
  blockedUsers?: string[];
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileReady: boolean;
  signup: (email: string, password: string, displayName: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setProfileReady(true);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    // Use a listener for the profile to keep it in sync
    const unsub = onSnapshot(doc(db, "users", user.uid), async (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        // If user document is missing, let's create a minimal profile so the app doesn't break
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || "User",
          username: user.email?.split('@')[0] || "user_" + user.uid.substring(0, 5),
          email: user.email || "",
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          bio: "",
          country: "",
          profession: "",
          tags: [],
          searchVisible: true,
          allowRequests: true,
          createdAt: serverTimestamp(),
        };
        try {
          await setDoc(doc(db, "users", user.uid), newProfile);
          setProfile(newProfile);
        } catch (error) {
          console.error("Failed to create missing profile:", error);
        }
      }
      setProfileReady(true);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setProfileReady(true);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const signup = async (email: string, password: string, displayName: string, username: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    
    // Check if username is taken (Ideally should be a transaction or separate index)
    // For now, just set it.
    
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      displayName,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      email,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: "",
      country: "",
      profession: "",
      tags: [],
      searchVisible: true,
      allowRequests: true,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), newProfile);
    setProfile(newProfile);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileReady, signup, login, logout, refreshProfile, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
