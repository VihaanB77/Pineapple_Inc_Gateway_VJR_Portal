import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { playUnlockSuccessSound, playErrorSound } from '../utils/audio.ts';
import { MaterialAvatar } from './MaterialAvatar.tsx';

export interface AuthResult {
  success: boolean;
  username?: string;
  linkUrl?: string;
  serviceName?: string;
  error?: string;
}

interface LockedViewProps {
  onUnlock: (username: string, password: string) => Promise<AuthResult>;
  soundEnabled: boolean;
  timeoutMessage?: string | null;
}

const featureCards = [
  {
    title: 'Rounded Containers',
    body: 'Large corner radii and layered surfaces keep the hierarchy soft, tactile, and distinctly Material.',
  },
  {
    title: 'Dynamic HCT Color',
    body: 'Expressive tonal roles adapt from a generated seed palette instead of relying on static accent hex values.',
  },
  {
    title: 'Responsive Layout',
    body: 'The lock screen pivots from a split desktop panel to a stacked mobile flow without losing focus or reachability.',
  },
];

export const LockedView: React.FC<LockedViewProps> = ({ onUnlock, soundEnabled, timeoutMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading || isSuccess) {
      return;
    }

    if (!username.trim()) {
      setError('Please enter your authorization username.');
      triggerShake();
      if (soundEnabled) playErrorSound();
      return;
    }

    if (!password) {
      setError('Please enter the access passcode.');
      triggerShake();
      if (soundEnabled) playErrorSound();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onUnlock(username, password);

      if (!result.success) {
        setError(result.error || 'Authentication failed. Please verify your credentials.');
        triggerShake();
        if (soundEnabled) playErrorSound();
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      if (soundEnabled) playUnlockSuccessSound();
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch {
      setError('Connection error. Please try again.');
      triggerShake();
      if (soundEnabled) playErrorSound();
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      id="locked-container"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <AnimatePresence>
        {timeoutMessage ? (
          <motion.div
            id="session-timeout-banner"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="mb-4 flex items-center gap-3 rounded-[24px] border border-[color:var(--md-sys-color-error)]/50 bg-[color:var(--md-sys-color-error-container)] px-4 py-3 text-sm text-[color:var(--md-sys-color-on-error-container)]"
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span>{timeoutMessage}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        id="locked-card"
        animate={isSuccess ? { scale: [1, 1.02, 0.99] } : {}}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        className="material-panel relative overflow-hidden p-5 sm:p-8 lg:p-10"
      >
        <motion.div
          animate={{
            scale: [1, 1.12, 0.96, 1],
            opacity: [0.14, 0.24, 0.12, 0.14],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-8 -top-10 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: 'color-mix(in srgb, var(--md-ref-palette-primary-70) 22%, transparent)',
          }}
        />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <MaterialAvatar
                name="Pineapple Inc."
                imageSrc="/pineapple-logo.svg"
                badge={<Lock className="h-4 w-4" />}
                size="lg"
              />
              <div className="space-y-3">
                <div className="material-pill w-fit">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Expressive Material access flow</span>
                </div>
                <p className="material-eyebrow">
                  {isSuccess ? 'Credentials accepted' : 'Protected handoff'}
                </p>
                <h2 className="material-display">
                  {isSuccess ? 'Authorization approved.' : 'Sign in to unlock the private session.'}
                </h2>
                <p className="material-body max-w-2xl">
                  {isSuccess
                    ? 'Loading your secured destination and refreshing the session shell.'
                    : 'This redesigned entry surface follows Material 3 Expressive guidance with adaptive color, rounded containers, and touch-friendly input states.'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {featureCards.map((feature) => (
                <div key={feature.title} className="material-stat-card">
                  <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                    {feature.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--md-sys-color-on-surface-variant)]">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="material-outline-panel grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                  <span className="material-status-dot" />
                  Gateway Status
                </div>
                <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  Operational at 99.99% uptime with secure session timeout and retry protection.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                  <ShieldAlert className="h-4 w-4 text-[var(--md-sys-color-tertiary)]" />
                  Intrusion Defense
                </div>
                <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  Five-attempt lockouts, transient telemetry, and zero client-side secret storage.
                </p>
              </div>
            </div>
          </section>

          <section className="material-panel-muted flex flex-col gap-5 p-5 sm:p-6">
            <div className="space-y-2">
              <div className="material-pill w-fit">
                <Sparkles className="h-4 w-4" />
                <span>Custom Material avatar</span>
              </div>
              <h3 className="material-title">
                {isSuccess ? 'Preparing your destination' : 'Authenticate to continue'}
              </h3>
              <p className="material-body">
                Use your authorized username and passcode to reveal the secure meeting link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                animate={isShaking ? { x: [-12, 12, -9, 9, -5, 5, 0] } : {}}
                transition={{ duration: 0.45 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="username-input" className="material-label">
                    Username
                  </label>
                  <div className="material-field">
                    <User className="h-4 w-4 shrink-0 text-[var(--md-sys-color-primary)]" aria-hidden="true" />
                    <input
                      id="username-input"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={isLoading || isSuccess}
                      placeholder="Enter your company username"
                      autoComplete="username"
                      autoFocus
                      className="material-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password-input" className="material-label">
                    Passcode
                  </label>
                  <div className="material-field" data-invalid={error ? 'true' : 'false'}>
                    <KeyRound className="h-4 w-4 shrink-0 text-[var(--md-sys-color-primary)]" aria-hidden="true" />
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={isLoading || isSuccess}
                      placeholder="Enter your passcode"
                      autoComplete="current-password"
                      className="material-input"
                    />
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isLoading || isSuccess}
                      className="material-text-button h-10 min-h-0 px-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error ? (
                    <motion.div
                      id="password-error-message"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="rounded-[20px] border border-[color:var(--md-sys-color-error)]/55 bg-[color:var(--md-sys-color-error-container)] px-4 py-3 text-sm text-[color:var(--md-sys-color-on-error-container)]"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>

              <button
                type="submit"
                id="unlock-submit-button"
                disabled={isLoading || isSuccess}
                className="material-filled-button w-full"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Access granted</span>
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying credentials</span>
                  </>
                ) : (
                  <>
                    <span>Unlock secure access</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="material-outline-panel p-4">
                <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                  Session controls
                </p>
                <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  Auto-lock resets inactive sessions after ten minutes and warns before expiration.
                </p>
              </div>
              <div className="material-outline-panel p-4">
                <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                  Material motion
                </p>
                <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  Gentle elevation, focus rings, and expressive transitions improve clarity without visual clutter.
                </p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};
