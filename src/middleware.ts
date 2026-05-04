import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that are accessible without authentication.
// All other routes require the `accessToken` HttpOnly cookie set by the backend at login.
const PUBLIC_PATHS = [
  "/login",
  "/landing",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
  "/ai-onboarding",
  "/select-organization",
  "/checkout",
  // Acessível sem cookie: JWT de firstAccess tem escopo limitado (ou inexistente).
  // A página se protege via sessionStorage.getItem("tempIdUser").
  "/auth/change-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area (/private/*): protected by adminToken stored in localStorage,
  // which is not accessible at the Edge. Shell.tsx handles this client-side.
  if (pathname.startsWith("/private")) {
    return NextResponse.next();
  }

  // Public paths are always accessible.
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  // All remaining routes require the HttpOnly `accessToken` cookie.
  // This cookie is set by the Spring backend on login (TASK-002).
  const accessToken = request.cookies.get("accessToken");
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude Next.js internals, the API basepath, and any path ending with a file
  // extension (public folder assets: images, SVGs, service workers, fonts, etc.).
  // Without the extension check, files like /assets/brand/logos/*.png and
  // /firebase-messaging-sw.js would hit the auth check and redirect to /login.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|api/|.*\\.[a-z]{2,5}$).*)",
  ],
};
