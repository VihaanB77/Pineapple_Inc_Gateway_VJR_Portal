import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Sparkles,
  User,
  Shield,
  Clock,
  RefreshCw,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { playBlipSound, playLockSound } from '../utils/audio.ts';

interface UnlockedViewProps {
  linkUrl: string;
  username: string;
  soundEnabled: boolean;
  timeLeft: number;
  maxSessionTime: number;
  onExtendSession: () => void;
  onLock: (reason?: string) => void;
}

const containerVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 16,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 10,
    filter: 'blur(2px)',
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const UnlockedView: React.FC<UnlockedViewProps> = ({
  linkUrl,
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
      // Fallback if clipboard API is restricted in iframe
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / maxSessionTime) * 100));
  const isWarning = timeLeft <= 60;

  return (
    <motion.div
      id="unlocked-container"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-lg mx-auto"
    >
      {/* Session Expiring Warning Banner with Spring Animation */}
      <AnimatePresence>
        {isWarning && (
          <motion.div
            id="session-warning-alert"
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mb-4 p-3.5 bg-[#ffb4ab]/15 border border-[#ffb4ab]/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#ffb4ab] shadow-lg shadow-[#ffb4ab]/10"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#ffb4ab] animate-pulse" />
              <span>
                Session expiring in <strong className="font-mono font-bold text-sm tabular-nums">{timeLeft}s</strong>
              </span>
            </div>
            <motion.button
              type="button"
              id="extend-warning-button"
              onClick={onExtendSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Extend +5m
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Material You Dark Blue Surface Container */}
      <div
        id="unlocked-card"
        className="bg-[#131b2e] border border-[#1f2b48] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#060b14]/80 backdrop-blur-md relative overflow-hidden"
      >
        {/* Animated ambient top accent radiance */}
        <motion.div
          animate={{
            scale: [1, 1.15, 0.95, 1],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#9ecaff]/15 rounded-full blur-3xl pointer-events-none"
        />

        {/* Success Header with Video Icon */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center mb-6 relative z-10"
        >
          <motion.div
            id="unlock-status-icon"
            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            whileHover={{ scale: 1.08 }}
            className="w-16 h-16 rounded-2xl bg-[#004a77]/40 border border-[#00639d]/60 flex items-center justify-center text-[#9ecaff] mb-4 shadow-lg shadow-[#0a101d]/60 cursor-pointer"
          >
            <Video className="w-8 h-8" aria-hidden="true" />
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-[#0f3423] text-[#78dc9c] border border-[#1d5c3d] shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Access Granted</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-[#1d2a46] text-[#9ecaff] border border-[#2b3b5f] shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span className="font-semibold">{username}</span>
            </motion.div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#e1e7f5] tracking-tight">
            Welcome, {username}
          </h1>
          <p className="text-sm text-[#8a99b5] mt-2 max-w-sm leading-relaxed">
            Your encrypted Brave Talk link is ready. Launch directly or copy the URL below.
          </p>
        </motion.div>

        {/* Real-time Status Indicator & Session Timeout Bar */}
        <motion.div
          id="session-status-card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="mb-6 p-3.5 rounded-2xl bg-[#0d1424] border border-[#1d2a46] space-y-2.5 relative z-10 shadow-inner"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#78dc9c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#78dc9c]"></span>
              </span>
              <span className="text-[#e1e7f5] font-semibold">Secure Channel Active</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-bold text-xs flex items-center gap-1 tabular-nums ${
                  isWarning ? 'text-[#ffb4ab]' : 'text-[#9ecaff]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </span>

              <motion.button
                type="button"
                id="extend-session-button"
                onClick={onExtendSession}
                title="Extend session by 5 minutes"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#1c2944] hover:bg-[#25375c] text-[#c2d2f2] rounded-lg border border-[#2b3d64] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>+5m</span>
              </motion.button>
            </div>
          </div>

          {/* Linear Animated Progress Indicator */}
          <div className="w-full bg-[#172238] rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-all duration-300 ${
                isWarning ? 'bg-[#ffb4ab]' : 'bg-[#9ecaff]'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#697b9c]">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#78dc9c]" />
              E2E Encrypted &bull; 18ms latency
            </span>
            <span>Auto-lock after countdown</span>
          </div>
        </motion.div>

        {/* Primary Action Button (Launch) */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="space-y-4 mb-6 relative z-10"
        >
          <motion.a
            id="launch-talk-button"
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-[#9ecaff] hover:bg-[#b8d7ff] text-[#003258] font-bold rounded-2xl text-base shadow-lg shadow-[#9ecaff]/20 hover:shadow-[#9ecaff]/35 transition-all duration-200 cursor-pointer overflow-hidden group"
          >
            {/* Shimmer light sweep beam */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Join Brave Talk</span>
            <ExternalLink className="w-4 h-4 opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.a>

          {/* Link Box with Animated Copy Button */}
          <div className="bg-[#0d1424] border border-[#1e2a47] rounded-2xl p-3.5 sm:p-4 relative">
            <div className="flex items-center justify-between text-xs font-medium text-[#8a99b5] mb-2.5">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#9ecaff]" />
                Direct Link URL
              </span>
              <span className="text-[11px] text-[#78dc9c] font-mono font-medium">Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="link-url-input"
                type="text"
                readOnly
                value={linkUrl}
                aria-label="Direct Link URL"
                className="w-full bg-[#131b2e] border border-[#233150] text-[#c2d0eb] text-xs sm:text-sm font-mono px-3.5 py-2.5 rounded-xl truncate focus:outline-none focus:border-[#3a4f7c]"
              />
              <motion.button
                type="button"
                id="copy-link-button"
                onClick={handleCopy}
                aria-label={copied ? 'Link copied to clipboard' : 'Copy link to clipboard'}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl shrink-0 transition-colors duration-200 cursor-pointer ${
                  copied
                    ? 'bg-[#0f3423] text-[#78dc9c] border border-[#1d5c3d]'
                    : 'bg-[#1e2a47] hover:bg-[#28385d] text-[#e1e7f5] border border-[#2d3e67]'
                }`}
              >
                {copied ? (
                  <motion.div
                    initial={{ scale: 0.6, rotate: -15 }}
                    animate={{ scale: [1.2, 1], rotate: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-[#78dc9c]" />
                    <span>Copied!</span>
                  </motion.div>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#9ecaff]" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Subtle Inline Toast Feedback Bar */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  id="copied-url-toast"
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                  className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#0f3423]/90 border border-[#1d5c3d] flex items-center justify-between text-xs text-[#78dc9c] shadow-md shadow-[#071911]/50"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#78dc9c] shrink-0" />
                    <span className="font-medium text-[11px] sm:text-xs">
                      Confidential link copied to clipboard
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#78dc9c]/80 font-semibold uppercase tracking-wider hidden sm:inline">
                    Ready to share
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Service Info & Details */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="bg-[#0d1424]/80 border border-[#1e2a47] rounded-2xl p-4 text-xs text-[#8a99b5] space-y-2.5 mb-6 relative z-10 shadow-sm"
        >
          <div className="flex justify-between items-center py-0.5 border-b border-[#1b2640]">
            <span className="text-[#647595]">Service</span>
            <span className="text-[#e1e7f5] font-medium">Brave Talk</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-[#1b2640]">
            <span className="text-[#647595]">Authenticated User</span>
            <span className="text-[#9ecaff] font-semibold">{username}</span>
          </div>
          <div className="flex justify-between items-center py-0.5 border-b border-[#1b2640]">
            <span className="text-[#647595]">Security</span>
            <span className="text-[#e1e7f5] font-medium">End-to-End Encrypted &bull; Private</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-[#647595]">Compatibility</span>
            <span className="text-[#e1e7f5] font-medium">Any modern web browser</span>
          </div>
        </motion.div>

        {/* Footer & Lock Session with Hover micro-interaction */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
          className="flex items-center justify-between pt-4 border-t border-[#1d2a46] relative z-10"
        >
          <div className="flex items-center gap-1.5 text-xs text-[#627393]">
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums">Auto-lock: {formatTime(timeLeft)}</span>
          </div>
          <motion.button
            type="button"
            id="lock-session-button"
            onClick={handleManualLock}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8a99b5] hover:text-[#e1e7f5] hover:bg-[#1d2a46] transition-colors cursor-pointer border border-transparent hover:border-[#2b3b5f]"
          >
            <Lock className="w-3.5 h-3.5 text-[#9ecaff]" />
            <span>Lock Session</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};
