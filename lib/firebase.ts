import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";

const rawAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const senderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const formattedAppId =
  rawAppId && !rawAppId.startsWith("1:") && senderId
    ? `1:${senderId}:web:${rawAppId}`
    : rawAppId;

let storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!storageBucket || storageBucket === "your_project.appspot.com") {
  storageBucket = projectId ? `${projectId}.firebasestorage.app` : undefined;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: senderId,
  appId: formattedAppId,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let storage: FirebaseStorage | null = null;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.databaseURL
);

if (typeof window !== "undefined" || isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    storage = getStorage(app);
    if (typeof window !== "undefined") {
      database = getDatabase(app);
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { app, auth, database, storage };
