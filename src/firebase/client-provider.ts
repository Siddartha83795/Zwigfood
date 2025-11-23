// src/firebase/client-provider.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (!cachedApp) {
    cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    cachedAuth = getAuth(cachedApp);
    cachedDb = getFirestore(cachedApp);
  } else {
    cachedAuth = cachedAuth ?? getAuth(cachedApp);
    cachedDb = cachedDb ?? getFirestore(cachedApp);
  }
  return {
    app: cachedApp,
    auth: cachedAuth as Auth,
    db: cachedDb as Firestore,
  };
}