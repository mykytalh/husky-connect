import { NextResponse } from "next/server";

import { adminDb } from "@/app/lib/firebase-admin";

export async function GET() {
  try {
    const postsSnapshot = await adminDb.collection("posts").get();
    const posts = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const postData = await request.json();
    const docRef = await adminDb.collection("posts").add(postData);
    const newPost = { id: docRef.id, ...postData };

    return NextResponse.json(newPost);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "Missing post ID or user ID" },
        { status: 400 }
      );
    }

    const postDoc = await adminDb.collection("posts").doc(postId).get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (postDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await adminDb.collection("posts").doc(postId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
