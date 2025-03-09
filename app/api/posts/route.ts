import { NextResponse } from "next/server";
import admin from "firebase-admin";
import serviceAccount from  "../../../info442-518fd-firebase-adminsdk-fbsvc-f437a48bb9.json";

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

export async function GET() {
  try {
    const postsSnapshot = await db.collection("posts").get();
    const posts = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const postData = await request.json();
    const docRef = await db.collection("posts").add(postData);
    const newPost = { id: docRef.id, ...postData };

    return NextResponse.json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
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

    // Get the post to verify ownership
    const postDoc = await db.collection("posts").doc(postId).get();
    if (!postDoc.exists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify the user owns the post
    if (postDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.collection("posts").doc(postId).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
