import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Enhanced Edge-safe proxy for authentication checks.
 * Detects multiple session cookie formats used by Auth.js (NextAuth v5).
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // List of possible session cookie names in Auth.js v5
  const sessionCookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token"
  ];

  const sessionToken = sessionCookieNames.find(name => request.cookies.has(name));
  const isLoginPage = url.pathname.startsWith("/login");

  // Log detected session for debugging (visible in server terminal)
  if (sessionToken) {
    console.log(`[Proxy] Session detected via ${sessionToken} for ${url.pathname}`);
  } else {
    // Optional: console.log(`[Proxy] No session for ${url.pathname}`);
  }

  if (!sessionToken && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    // Preserving the original destination for redirect back after login
    // loginUrl.searchParams.set("callbackUrl", request.url); 
    return NextResponse.redirect(loginUrl);
  }

  if (sessionToken && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};

export default proxy;
