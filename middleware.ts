import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define route groups
const PUBLIC_ROUTES = new Set(["/", "/login", "/register"]);
const PROTECTED_ROUTES = new Set(["/dashboard", "/about", "/setup"]);
const STATIC_ROUTES = new Set([
  "/favicon.ico",
  "/_next",
  "/api",
  "/images",
  "/assets",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    STATIC_ROUTES.has(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;
  const setupComplete = request.cookies.get("setup-complete")?.value;

  // User is authenticated
  if (token) {
    // Redirect from public routes to dashboard when authenticated
    if (PUBLIC_ROUTES.has(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Check setup status for protected routes
    if (PROTECTED_ROUTES.has(pathname)) {
      // Only redirect to setup if setup is not complete and trying to access dashboard or about
      if (
        setupComplete === "false" &&
        pathname !== "/setup" &&
        (pathname === "/dashboard" || pathname === "/about")
      ) {
        return NextResponse.redirect(new URL("/setup", request.url));
      }
      return NextResponse.next();
    }
  }

  // User is not authenticated
  if (!token) {
    // Allow access to public routes
    if (PUBLIC_ROUTES.has(pathname)) {
      return NextResponse.next();
    }
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
