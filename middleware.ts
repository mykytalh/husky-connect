import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that require authentication
const protectedPaths = ["/dashboard", "/about"];
// Add paths that are only for non-authenticated users
const publicOnlyPaths = ["/", "/login", "/register"];
// Add paths that don't require setup completion
const setupExemptPaths = ["/setup"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const setupComplete = request.cookies.get("setup-complete")?.value;
  const path = request.nextUrl.pathname;

  // If user is not authenticated
  if (!token) {
    // If trying to access protected route, redirect to home
    if (protectedPaths.includes(path)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If user is authenticated
  if (token) {
    // Redirect from public routes to dashboard
    if (publicOnlyPaths.includes(path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If setup is not complete and trying to access any route except setup
    if (!setupComplete && !setupExemptPaths.includes(path)) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }
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
