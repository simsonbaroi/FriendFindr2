import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "friendfindr-shimshon",
  appId: "1:463784884633:web:5b1980237241b24dfebb08",
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: "friendfindr-shimshon.firebaseapp.com",
  storageBucket: "friendfindr-shimshon.firebasestorage.app",
  messagingSenderId: "463784884633",
  measurementId: "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
