import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Route protection is handled entirely client-side (Shell.tsx + AuthContext +
  // apiClient 401/403 interceptor). A server-side cookie check is not viable here:
  // the Spring Boot API sets the accessToken HttpOnly cookie on its own domain
  // (railway.app), which the browser never forwards to the Next.js server on a
  // different domain (easymaintenance.com.br). Attempting the check would redirect
  // every authenticated user back to /login.
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
