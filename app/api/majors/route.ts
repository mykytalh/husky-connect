import { NextResponse } from "next/server";

const API_BASE_URL = "https://husky-connect-backend-production.up.railway.app";
const CACHE_TIME = 24 * 60 * 60; // 24 hours in seconds

// In-memory cache
let majorsCache: { [key: string]: { data: any; timestamp: number } } = {};

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

  const cacheKey = `majors-${campus}`;

  if (majorsCache[cacheKey]) {
    const now = Date.now();
    if (now - majorsCache[cacheKey].timestamp < CACHE_TIME) {
      return new NextResponse(JSON.stringify(majorsCache[cacheKey].data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      });
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/majors/${campus}`, {
      signal: controller.signal,
      next: { revalidate: CACHE_TIME },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Update cache
    majorsCache[cacheKey] = {
      data,
      timestamp: Date.now(),
    };

    return new NextResponse(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("API Error:", error);

    // If we have cached data, return it as fallback
    if (majorsCache[cacheKey]) {
      return new NextResponse(
        JSON.stringify({
          ...majorsCache[cacheKey].data,
          fromCache: true,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=43200",
          },
        }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch majors",
        details:
          error instanceof Error ? error.message : "Timeout or network error",
      },
      { status: 500 }
    );
  }
}
