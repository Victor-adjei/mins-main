'use server';

import { signOut } from '@/auth';

/**
 * Server Action: sign the user out and redirect to /login.
 * Using a server action avoids the ERR_CONNECTION_REFUSED issue
 * caused by the client-side signOut() trying to POST to /auth/signout
 * and following the redirect in a way that race-conditions with the
 * Next.js dev server.
 */
export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}

