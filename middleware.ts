import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add paths that require authentication
const protectedPaths = ["/setup", "/dashboard"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const path = request.nextUrl.pathname;

  // Check if the path requires authentication
  if (protectedPaths.includes(path)) {
    // If no token is present and trying to access protected route, redirect to home
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/setup",
    "/dashboard",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
