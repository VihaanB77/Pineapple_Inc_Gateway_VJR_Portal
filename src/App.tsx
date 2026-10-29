/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LockedView, AuthResult } from './components/LockedView.tsx';
import { UnlockedView } from './components/UnlockedView.tsx';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal.tsx';
import { StatusIndicator } from './components/StatusIndicator.tsx';
import { ParticleBackground } from './components/ParticleBackground.tsx';
import { Video } from 'lucide-react';
import { playBlipSound, playWarningBeep, playLockSound } from './utils/audio.ts';

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
    <div className="min-h-screen bg-[#090e1a] text-[#e1e7f5] flex flex-col justify-between selection:bg-[#9ecaff] selection:text-[#003258] relative overflow-hidden font-sans">
      {/* Subtle Slow-Moving Particle Field (placed behind ambient glowing blobs) */}
      <ParticleBackground />

      {/* Ambient Material You Dark Blue Animated Glows */}
      <motion.div
        animate={{
          scale: [1, 1.08, 0.95, 1],
          opacity: [0.22, 0.32, 0.2, 0.22],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-[#1b345f]/30 via-[#0f2140]/15 to-transparent blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 15, -10, 0],
          opacity: [0.18, 0.26, 0.18],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-[#162744]/25 blur-3xl pointer-events-none"
      />

      {/* Top App Bar - Video icon only appears after unlock; displays Pineapple Inc logo before */}
      <header className="relative z-10 w-full border-b border-[#17223b] bg-[#0c1322]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="w-9 h-9 rounded-xl bg-[#172745] border border-[#263c68] flex items-center justify-center text-[#9ecaff] shadow-inner p-1.5 shrink-0 cursor-pointer"
            >
              {session ? (
                <Video className="w-5 h-5" aria-hidden="true" />
              ) : (
                <img
                  src="/pineapple-logo.svg"
                  alt="Pineapple Inc. Logo"
                  className="w-6 h-6 object-contain"
                />
              )}
            </motion.div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm tracking-tight text-[#e1e7f5] truncate">
                {session ? `${session.serviceName} Portal` : 'Pineapple Inc. Gateway'}
              </span>
              <span className="text-[11px] text-[#7182a3] truncate">
                {session ? 'Active Communication Channel' : 'Protected Authorization Portal'}
              </span>
            </div>
          </div>

          {/* Status Indicator with Visual Countdown Timer and Sound Toggle */}
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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
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

      {/* Footer with Pineapple Inc. Trademarks, All Rights Reserved & Privacy Policy */}
      <footer className="relative z-10 w-full border-t border-[#141f37] bg-[#0a101c]/80 backdrop-blur-md py-4 px-4 sm:px-8 text-xs text-[#6e80a0]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <img
              src="/pineapple-logo.svg"
              alt="Pineapple Inc. Logo"
              className="w-5 h-5 object-contain shrink-0"
            />
            <span className="leading-normal">
              &copy; {Math.max(2026, new Date().getFullYear())} Pineapple Inc. All rights reserved. Pineapple Inc.&trade; and the Pineapple logo are trademarks of Pineapple Inc.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#8a9cb8] shrink-0">
            <motion.button
              type="button"
              id="privacy-policy-link-button"
              onClick={() => setShowPrivacyPolicy(true)}
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="hover:text-[#9ecaff] underline underline-offset-4 decoration-[#33466a] hover:decoration-[#9ecaff] transition-colors cursor-pointer"
            >
              Privacy Policy
            </motion.button>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Dialog */}
      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
    </div>
  );
}
