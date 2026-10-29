import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth-aware Proxy (Next.js 16 equivalent of middleware.ts).
 *
 * Performs an optimistic cookie-presence check before rendering pages:
 *  • Unauthenticated users hitting any protected route → /login?reason=expired
 *  • Authenticated users hitting /login → /
 *
 * Auth.js (NextAuth v5) sets one of the cookie names below depending on
 * whether the app is served over HTTP (dev) or HTTPS (prod).
 */

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isLoginPage = url.pathname.startsWith("/login");

  const hasSession = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name)
  );

  // Unauthenticated → redirect to login
  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "expired");
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → redirect away from login page
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimisation)
     *  - favicon.ico, logo.png and other public images
     *  - /api/auth     (NextAuth internals — must NOT be blocked)
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|api/auth).*)",
  ],
};

export default proxy;
