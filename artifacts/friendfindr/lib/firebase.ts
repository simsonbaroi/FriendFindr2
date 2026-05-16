import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app (guard against hot-reload double init)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth — use AsyncStorage persistence on native so the session survives app restarts.
// On web, fall back to getAuth which uses localStorage automatically.
let auth: ReturnType<typeof getAuth>;
try {
  if (Platform.OS !== "web") {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } else {
    auth = getAuth(app);
  }
} catch {
  // Already initialized on hot reload
  auth = getAuth(app);
}

// Firestore — plain getFirestore works on all platforms.
// The in-memory profile cache in userService handles repeat-read performance.
const db = getFirestore(app);

export { auth, db };
export default app;
