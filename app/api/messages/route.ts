import { db } from "@/app/firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { NextResponse } from "next/server";

// ... existing imports ...

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const otherId = searchParams.get("otherId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let messagesQuery;
    if (otherId) {
      messagesQuery = query(
        collection(db, "messages"),
        where("participants", "array-contains", userId),
        orderBy("timestamp", "desc")
      );
    } else {
      messagesQuery = query(
        collection(db, "messages"),
        where("participants", "array-contains", userId),
        orderBy("timestamp", "desc")
      );
    }

    const querySnapshot = await getDocs(messagesQuery);
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { senderId, receiverId, content } = body;

    // Validate required fields
    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create message data
    const messageData = {
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(), // Use ISO string for timestamp
      read: false,
      participants: [senderId, receiverId],
    };

    // Add to Firestore
    try {
      const docRef = await addDoc(collection(db, "messages"), messageData);

      return NextResponse.json(
        {
          id: docRef.id,
          ...messageData,
        },
        { status: 200 }
      );
    } catch (firestoreError) {
      console.error("Firestore error:", firestoreError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
