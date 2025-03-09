import { NextResponse } from "next/server";
import admin from "firebase-admin";
import serviceAccount from  "../../../info442-518fd-firebase-adminsdk-fbsvc-f437a48bb9.json";

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

const db = admin.firestore();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      console.error("Missing UID in request");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching user data for UID: ${uid}`);
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      console.log(`No user found for UID: ${uid}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    console.log(`Successfully fetched user data for UID: ${uid}`);
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { uid, userData } = await request.json();

    if (!uid || !userData) {
      console.error("Missing required fields in POST request");
      return NextResponse.json(
        { error: "User ID and data are required" },
        { status: 400 }
      );
    }

    console.log(`Saving user data for UID: ${uid}`);
    await db.collection("users").doc(uid).set(userData, { merge: true });
    console.log(`Successfully saved user data for UID: ${uid}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user data:", error);
    return NextResponse.json(
      { error: "Failed to save user data" },
      { status: 500 }
    );
  }
}
