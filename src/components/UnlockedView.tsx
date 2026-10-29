import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Lock,
  RefreshCw,
  Shield,
  Sparkles,
  Video,
} from 'lucide-react';
import { playBlipSound, playLockSound } from '../utils/audio.ts';
import { MaterialAvatar } from './MaterialAvatar.tsx';

interface UnlockedViewProps {
  linkUrl: string;
  serviceName: string;
  username: string;
  soundEnabled: boolean;
  timeLeft: number;
  maxSessionTime: number;
  onExtendSession: () => void;
  onLock: (reason?: string) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const UnlockedView: React.FC<UnlockedViewProps> = ({
  linkUrl,
  serviceName,
  username,
  soundEnabled,
  timeLeft,
  maxSessionTime,
  onExtendSession,
  onLock,
}) => {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      if (soundEnabled) playBlipSound();
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2600);
    } catch {
      const input = document.createElement('input');
      input.value = linkUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      if (soundEnabled) playBlipSound();
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2600);
    }
  };

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleManualLock = () => {
    if (soundEnabled) playLockSound();
    onLock();
  };

  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / maxSessionTime) * 100));
  const isWarning = timeLeft <= 60;

  return (
    <motion.div
      id="unlocked-container"
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full pb-32 sm:pb-36"
    >
      <AnimatePresence>
        {isWarning ? (
          <motion.div
            id="session-warning-alert"
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mb-4 flex flex-col gap-3 rounded-[24px] border border-[color:var(--md-sys-color-error)]/55 bg-[color:var(--md-sys-color-error-container)] px-4 py-4 text-[color:var(--md-sys-color-on-error-container)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-sm">
                Session expiring in <strong className="font-mono">{formatTime(timeLeft)}</strong>
              </span>
            </div>
            <button
              type="button"
              id="extend-warning-button"
              onClick={onExtendSession}
              className="material-danger-button w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Extend 5 minutes</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="material-panel grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:p-10">
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <MaterialAvatar
                name={username}
                badge={<Sparkles className="h-4 w-4" />}
                size="lg"
              />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="material-pill">
                    <Shield className="h-4 w-4" />
                    Secure session active
                  </span>
                  <span className="material-pill">
                    <Activity className="h-4 w-4" />
                    Dynamic HCT theme
                  </span>
                </div>
                <p className="material-eyebrow">{serviceName} handoff ready</p>
                <h2 className="material-display">Welcome back, {username}.</h2>
                <p className="material-body max-w-2xl">
                  Your private link is ready inside a Material 3 Expressive layout with adaptive surfaces, floating actions, and responsive detail panels.
                </p>
              </div>
            </div>
          </div>

          <div className="material-panel-muted p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                  Launch the meeting
                </p>
                <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  Open {serviceName} in a new tab or copy the direct URL for a secure handoff.
                </p>
              </div>
              <span className="material-chip w-fit">
                <Check className="h-3.5 w-3.5" />
                Ready
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                id="launch-talk-button"
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="material-filled-button flex-1"
              >
                <Video className="h-5 w-5" />
                <span>Join {serviceName}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                type="button"
                id="copy-link-button"
                onClick={handleCopy}
                aria-label={copied ? 'Link copied to clipboard' : 'Copy link to clipboard'}
                className="material-tonal-button sm:min-w-[180px]"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
          </div>

          <div className="material-outline-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                <Shield className="h-4 w-4 text-[var(--md-sys-color-primary)]" />
                Direct link URL
              </div>
              <span className="material-chip w-fit">
                <Activity className="h-3.5 w-3.5" />
                Encrypted
              </span>
            </div>

            <div className="mt-4 rounded-[24px] border border-[color:var(--md-sys-color-outline-variant)] bg-[color:var(--md-sys-color-surface-container-low)] p-4">
              <input
                id="link-url-input"
                type="text"
                readOnly
                value={linkUrl}
                aria-label="Direct Link URL"
                className="material-link-field"
              />
            </div>

            <AnimatePresence>
              {copied ? (
                <motion.div
                  id="copied-url-toast"
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                  className="mt-3 rounded-[20px] border border-[color:var(--md-sys-color-tertiary)]/40 bg-[color:var(--md-sys-color-secondary-container)] px-4 py-3 text-sm text-[color:var(--md-sys-color-on-secondary-container)]"
                >
                  Confidential link copied to clipboard.
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="material-stat-card">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--md-sys-color-on-surface-variant)]">
                Service
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                {serviceName}
              </p>
            </div>
            <div className="material-stat-card">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--md-sys-color-on-surface-variant)]">
                Security
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                E2E encrypted
              </p>
            </div>
            <div className="material-stat-card">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--md-sys-color-on-surface-variant)]">
                Compatibility
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                Any modern browser
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="material-panel-muted p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                  Session timer
                </p>
                <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  Extend the session before auto-lock secures the workspace.
                </p>
              </div>
              <button
                type="button"
                id="extend-session-button"
                onClick={onExtendSession}
                className="material-tonal-button min-h-0 px-4 py-3"
                title="Extend session by 5 minutes"
              >
                <RefreshCw className="h-4 w-4" />
                <span>+5m</span>
              </button>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--md-sys-color-on-surface-variant)]">
                  Time remaining
                </p>
                <p
                  className="mt-2 font-mono text-4xl font-semibold tracking-tight"
                  style={{
                    color: isWarning ? 'var(--md-sys-color-error)' : 'var(--md-sys-color-primary)',
                  }}
                >
                  {formatTime(timeLeft)}
                </p>
              </div>
              <span className="material-chip w-fit">
                <Clock className="h-3.5 w-3.5" />
                Auto-lock enabled
              </span>
            </div>

            <div className="mt-5 material-progress-track">
              <div className="material-progress-bar" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="material-outline-panel p-5 sm:p-6">
            <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
              Security details
            </p>
            <div className="mt-4 space-y-3">
              <div className="material-list-row">
                <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Latency</span>
                <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">18 ms</span>
              </div>
              <div className="material-list-row">
                <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Authenticated user</span>
                <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">{username}</span>
              </div>
              <div className="material-list-row">
                <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Transport</span>
                <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">TLS 1.3</span>
              </div>
              <div className="material-list-row">
                <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Status</span>
                <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Operational</span>
              </div>
            </div>
          </div>

          <div className="material-outline-panel flex items-center justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Lock session</p>
              <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Secure the workspace immediately.
              </p>
            </div>
            <button
              type="button"
              id="lock-session-button"
              onClick={handleManualLock}
              className="material-danger-button min-h-0 px-4 py-3"
            >
              <Lock className="h-4 w-4" />
              <span>Lock</span>
            </button>
          </div>
        </aside>
      </div>

      <div className="material-floating-stack" aria-hidden="true">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="material-fab material-fab-primary"
        >
          <Video className="h-5 w-5" />
          <span className="hidden sm:inline">Join {serviceName}</span>
        </a>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="material-fab material-fab-secondary material-mini-fab"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={handleManualLock}
            className="material-fab material-fab-danger material-mini-fab"
          >
            <Lock className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
