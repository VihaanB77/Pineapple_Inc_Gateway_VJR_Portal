/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LockedView, AuthResult } from './components/LockedView.tsx';
import { UnlockedView } from './components/UnlockedView.tsx';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal.tsx';
import { StatusIndicator } from './components/StatusIndicator.tsx';
import { ParticleBackground } from './components/ParticleBackground.tsx';
import { ShieldCheck, Sparkles, Video } from 'lucide-react';
import { playBlipSound, playWarningBeep, playLockSound } from './utils/audio.ts';
import { MaterialAvatar } from './components/MaterialAvatar.tsx';
import { getMaterialTheme } from './utils/materialTheme.ts';

interface ActiveSession {
  username: string;
  linkUrl: string;
  serviceName: string;
}

const DEFAULT_SESSION_DURATION = 600; // 10 minutes (600 seconds)

export default function App() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeoutMessage, setTimeoutMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SESSION_DURATION);
  const hasWarnedRef = useRef(false);
  const theme = useMemo(
    () => getMaterialTheme(session ? 'unlocked' : 'locked', session?.username),
    [session],
  );

  const handleLock = useCallback((reason?: string) => {
    setSession(null);
    document.title = 'Pineapple Inc. Gateway';
    if (reason) {
      setTimeoutMessage(reason);
    } else {
      setTimeoutMessage(null);
    }
  }, []);

  // Centralized session timer
  useEffect(() => {
    if (!session) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (soundEnabled) playLockSound();
          handleLock('Your session timed out for security. Please sign in again.');
          return 0;
        }

        if (prev === 61 && !hasWarnedRef.current) {
          hasWarnedRef.current = true;
          if (soundEnabled) playWarningBeep();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, soundEnabled, handleLock]);

  const handleExtendSession = useCallback(() => {
    setTimeLeft((prev) => Math.min(prev + 300, 900)); // Add 5 minutes, cap at 15 mins
    hasWarnedRef.current = false;
    if (soundEnabled) playBlipSound();
  }, [soundEnabled]);

  const handleUnlock = async (enteredUsername: string, enteredPassword: string): Promise<AuthResult> => {
    try {
      const response = await fetch('/api/auth/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: enteredUsername,
          password: enteredPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Invalid credentials. Access denied.',
        };
      }

      // Reset timer on new login
      setTimeLeft(DEFAULT_SESSION_DURATION);
      hasWarnedRef.current = false;

      setSession({
        username: data.username,
        linkUrl: data.linkUrl,
        serviceName: data.serviceName || 'Brave Talk',
      });
      setTimeoutMessage(null);

      // Update page title only after authorized unlock
      document.title = `${data.serviceName || 'Brave Talk'} - Active Session`;

      return {
        success: true,
        username: data.username,
        linkUrl: data.linkUrl,
        serviceName: data.serviceName,
      };
    } catch {
      return {
        success: false,
        error: 'Unable to reach the authentication server. Please try again.',
      };
    }
  };

  return (
    <div className="material-app" style={theme.vars}>
      <ParticleBackground themeKey={theme.seedHex} />
      <motion.div
        animate={{
          scale: [1, 1.08, 0.95, 1],
          opacity: [0.14, 0.24, 0.12, 0.14],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-full max-w-5xl -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--md-ref-palette-primary-70) 24%, transparent) 0%, transparent 78%)',
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 15, -10, 0],
          opacity: [0.14, 0.22, 0.14],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
        style={{
          background: 'color-mix(in srgb, var(--md-ref-palette-tertiary-60) 24%, transparent)',
        }}
      />

      <header className="material-top-bar">
        <div className="material-shell flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <MaterialAvatar
              name={session ? session.username : 'Pineapple Inc.'}
              imageSrc={session ? undefined : '/pineapple-logo.svg'}
              badge={
                session ? <Video className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" />
              }
              size="md"
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="material-eyebrow truncate">
                {session ? `${session.serviceName} workspace` : 'Material 3 Expressive secure gateway'}
              </p>
              <h1 className="truncate text-base font-semibold text-[var(--md-sys-color-on-surface)] sm:text-lg">
                {session ? `${session.serviceName} active session` : 'Pineapple Inc. private access'}
              </h1>
              <p className="mt-1 truncate text-sm text-[var(--md-sys-color-on-surface-variant)]">
                {session ? 'Rounded surfaces, adaptive color, secure handoff.' : 'Adaptive HCT tokens with responsive Material surfaces.'}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <StatusIndicator
              isUnlocked={!!session}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((prev) => !prev)}
              username={session?.username}
              sessionTimeLeft={session ? timeLeft : undefined}
              maxSessionTime={DEFAULT_SESSION_DURATION}
              onExtendSession={handleExtendSession}
            />
          </div>
        </div>
      </header>

      <main className="material-shell relative z-10 flex flex-1 items-center py-6 sm:py-10">
        <AnimatePresence mode="wait">
          {!session ? (
            <LockedView
              key="locked"
              onUnlock={handleUnlock}
              soundEnabled={soundEnabled}
              timeoutMessage={timeoutMessage}
            />
          ) : (
            <UnlockedView
              key="unlocked"
              linkUrl={session.linkUrl}
              serviceName={session.serviceName}
              username={session.username}
              soundEnabled={soundEnabled}
              timeLeft={timeLeft}
              maxSessionTime={DEFAULT_SESSION_DURATION}
              onExtendSession={handleExtendSession}
              onLock={handleLock}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="material-footer">
        <div className="material-shell flex flex-col items-center justify-between gap-3 py-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--md-sys-color-primary-container)] text-[color:var(--md-sys-color-on-primary-container)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="leading-relaxed">
              &copy; {Math.max(2026, new Date().getFullYear())} Pineapple Inc. All rights reserved. Pineapple Inc.&trade; and the Pineapple logo are trademarks of Pineapple Inc.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="privacy-policy-link-button"
              onClick={() => setShowPrivacyPolicy(true)}
              className="material-text-button"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </div>
  );
}
