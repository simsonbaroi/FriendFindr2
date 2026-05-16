import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  ,
  authDomapiKey: "AIzaSyB3NUuMrEg9UsgaATbjsLFpBrn5pC5mPfA"ain: "friendfindr2.firebaseapp.com",
  projectId: "friendfindr2",
  storageBucket: "friendfindr2.firebasestorage.app",
  messagingSenderId: "997095104599",
  appId: "1:997095104599:web:d016b6e4712c8368bcc312",
};

// Prevent re-initialization during hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Fallback if auth already initialized
  auth = getAuth(app);
}

// Firestore
const db = getFirestore(app);

export { app, auth, db };
export default app;