import { NextResponse } from "next/server";
import admin from "firebase-admin";
import serviceAccount from "../../../info442-518fd-firebase-adminsdk-fbsvc-ab3cebd75b.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { uid, userData } = data;

    await admin.firestore().collection("users").doc(uid).set(userData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save user data" },
      { status: 500 }
    );
  }
}
