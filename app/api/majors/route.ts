import { NextResponse } from "next/server";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campus = searchParams.get("campus");
  const type = searchParams.get("type");

  if (!campus) {
    return NextResponse.json({ error: "Campus is required" }, { status: 400 });
  }

  if (type !== "majors") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/majors/${campus}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch majors" },
      { status: 500 }
    );
  }
}
