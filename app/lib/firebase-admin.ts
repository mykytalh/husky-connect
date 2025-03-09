import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin";

if (
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PROJECT_ID
) {
  throw new Error("Firebase Admin environment variables are missing");
}

// Ensure proper formatting of private key
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

try {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      } as ServiceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    console.log("Firebase Admin initialized successfully");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
  throw error;
}

const adminDb = getFirestore();

export { adminDb };
