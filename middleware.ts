import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

// Routes that require authentication
const protectedPaths = ["/dashboard", "/about"];

// Routes that are ONLY for non-authenticated users
const publicOnlyPaths = ["/", "/login", "/register"];

// Routes exempt from setup requirement
const setupExemptPaths = ["/setup"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const setupComplete = request.cookies.get("setup-complete")?.value;
  const path = request.nextUrl.pathname;

  // If user is authenticated (has token)
  if (token) {
    // Prevent authenticated users from accessing public-only routes
    if (publicOnlyPaths.includes(path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Check setup completion for non-exempt routes
    if (!setupComplete && !setupExemptPaths.includes(path)) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }

    return NextResponse.next();
  }

  // If user is NOT authenticated (no token)
  if (!token && protectedPaths.includes(path)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/setup",
    "/dashboard",
    "/about",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
