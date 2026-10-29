'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Inactivity timeout in milliseconds.
 * Matches SESSION_MAX_AGE from auth.config.ts (1 hour = 3_600_000 ms).
 * Change both values together if you adjust the timeout.
 */
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

/** Events that count as user activity */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'click',
];

/**
 * SessionGuard
 *
 * Mounts invisibly inside the dashboard layout.
 * • Watches for user inactivity.
 * • When the inactivity timer fires, or when next-auth reports the
 *   session has ended, it redirects to /login?reason=expired so the
 *   login page can display a helpful message.
 */
export default function SessionGuard() {
  const { status } = useSession();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const redirectExpired = useCallback(() => {
    router.replace('/login?reason=expired');
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(redirectExpired, INACTIVITY_TIMEOUT_MS);
  }, [redirectExpired]);

  useEffect(() => {
    // Only run the inactivity watcher when there is an active session
    if (status !== 'authenticated') return;

    // Start the timer on mount
    resetTimer();

    // Re-start on any user activity
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [status, resetTimer]);

  // When next-auth itself detects the session is gone (e.g., JWT expired
  // server-side), redirect to the expired login page immediately.
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirectExpired();
    }
  }, [status, redirectExpired]);

  // Renders nothing — purely behavioural
  return null;
}

