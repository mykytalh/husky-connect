import { NextResponse } from "next/server";

import { adminDb } from "@/app/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    return NextResponse.json(userData);
  } catch (error) {
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
      return NextResponse.json(
        { error: "User ID and data are required" },
        { status: 400 }
      );
    }

    await adminDb.collection("users").doc(uid).set(userData, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save user data" },
      { status: 500 }
    );
  }
}
