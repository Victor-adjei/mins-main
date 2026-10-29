export { auth as middleware } from '@/auth';

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static (static files)
     *  - _next/image  (image optimisation)
     *  - favicon.ico, logo.png and other public assets
     *  - /api/auth routes (NextAuth internals)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|api/auth).*)',
  ],
};

