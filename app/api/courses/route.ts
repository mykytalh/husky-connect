import { NextResponse } from "next/server";

const API_BASE_URL = "https://husky-connect-backend-production.up.railway.app";
const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// In-memory cache
let coursesCache: { [key: string]: { data: any; timestamp: number } } = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campus = searchParams.get("campus");
  const type = searchParams.get("type");

  if (!campus) {
    return NextResponse.json({ error: "Campus is required" }, { status: 400 });
  }

  if (type !== "majors" && type !== "courses") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const cacheKey = `${type}-${campus}`;

  // Return cached data if available and not expired
  if (coursesCache[cacheKey]) {
    const now = Date.now();
    if (now - coursesCache[cacheKey].timestamp < CACHE_TIME) {
      // Add cache headers
      return new NextResponse(JSON.stringify(coursesCache[cacheKey].data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      });
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${type}/${campus}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || (type === "courses" && !data.courses)) {
      throw new Error("Invalid data format received from API");
    }

    // Update cache
    coursesCache[cacheKey] = {
      data,
      timestamp: Date.now(),
    };

    // Return response with cache headers
    return new NextResponse(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("API Error:", error);

    // Return cached data as fallback if available
    if (coursesCache[cacheKey]) {
      return NextResponse.json({
        ...coursesCache[cacheKey].data,
        fromCache: true,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
