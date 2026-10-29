import type { NextAuthConfig } from 'next-auth';

/** Inactivity timeout (seconds). Change to 7200 for 2 hours. */
export const SESSION_MAX_AGE = 60 * 60; // 1 hour

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith('/login');

      if (!isLoggedIn && !isLoginPage) {
        // Not authenticated — redirect to login with ?reason=expired
        // so the login page can show the appropriate message.
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('reason', 'expired');
        return Response.redirect(loginUrl);
      }
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // Add security headers to prevent caching of authenticated pages
      // so the browser back-button cannot show stale authenticated content.
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as { role: string }).role;
        // Record when the token was originally issued
        token.issuedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Extended in auth.ts
} satisfies NextAuthConfig;
