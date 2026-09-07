import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { playUnlockSuccessSound, playErrorSound } from '../utils/audio.ts';

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

const formItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export const LockedView: React.FC<LockedViewProps> = ({ onUnlock, soundEnabled, timeoutMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

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
      } else {
        // Multi-stage celebratory login animation
        setIsSuccess(true);
        if (soundEnabled) playUnlockSuccessSound();
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    } catch {
      setError('Connection error. Please try again.');
      triggerShake();
      if (soundEnabled) playErrorSound();
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <motion.div
      id="locked-container"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      {/* Session Timeout Alert Banner */}
      {timeoutMessage && (
        <motion.div
          id="session-timeout-banner"
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="mb-4 p-3.5 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-2xl flex items-center gap-3 text-xs text-[#ffb4ab] shadow-lg shadow-[#ffb4ab]/5"
        >
          <Clock className="w-4 h-4 shrink-0 text-[#ffb4ab] animate-pulse" />
          <span>{timeoutMessage}</span>
        </motion.div>
      )}

      {/* Material You Dark Blue Surface Container */}
      <motion.div
        id="locked-card"
        animate={isSuccess ? { scale: [1, 1.03, 0.98] } : {}}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        className="bg-[#131b2e] border border-[#1f2b48] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#060b14]/80 backdrop-blur-md relative overflow-hidden"
      >
        {/* Animated ambient radiance & ripple bursts on unlock */}
        <AnimatePresence>
          {isSuccess ? (
            <>
              <motion.div
                initial={{ scale: 0.1, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="absolute inset-0 bg-gradient-to-r from-[#78dc9c]/30 via-[#9ecaff]/30 to-transparent rounded-full blur-2xl pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.2, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className="absolute inset-0 border-2 border-[#78dc9c]/50 rounded-full pointer-events-none"
              />
            </>
          ) : (
            <motion.div
              animate={{
                scale: [1, 1.15, 0.95, 1],
                opacity: [0.12, 0.2, 0.1, 0.12],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#9ecaff]/15 rounded-full blur-3xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Header Icon & Title with Floating Animation */}
        <div className="flex flex-col items-center text-center mb-7 relative z-10">
          <motion.div
            id="lock-icon-wrapper"
            animate={
              isSuccess
                ? {
                    scale: [1, 1.2, 1],
                    borderColor: '#78dc9c',
                    boxShadow: '0 0 35px rgba(120, 220, 156, 0.5)',
                  }
                : {
                    y: [0, -4, 0],
                  }
            }
            transition={
              isSuccess
                ? { duration: 0.5, ease: 'easeOut' }
                : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-2xl bg-[#1d2a46] border border-[#2b3b5f] flex items-center justify-center mb-4 shadow-md shadow-[#0a101d]/60 p-2 relative cursor-pointer"
          >
            <img
              src="/pineapple-logo.svg"
              alt="Pineapple Inc. Logo"
              className="w-10 h-10 object-contain drop-shadow-md"
            />
            <motion.div
              animate={
                isSuccess
                  ? { rotate: [0, -30, 390, 360], scale: [1, 1.25, 1] }
                  : {}
              }
              transition={{ duration: 0.55, ease: 'backOut' }}
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border flex items-center justify-center transition-colors shadow-md ${
                isSuccess
                  ? 'bg-[#0f3423] border-[#1d5c3d] text-[#78dc9c]'
                  : 'bg-[#0d1424] border-[#2b3b5f] text-[#9ecaff]'
              }`}
            >
              {isSuccess ? (
                <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Lock className="w-3 h-3" aria-hidden="true" />
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#1d2a46] text-[#b8c8ea] border border-[#29395d] mb-3 shadow-inner"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#9ecaff]" />
            <span>Pineapple Inc. Authorized Access</span>
          </motion.div>

          <h1 className="text-2xl font-bold text-[#e1e7f5] tracking-tight">
            {isSuccess ? 'Authorization Approved' : 'Restricted Access'}
          </h1>
          <p className="text-sm text-[#8a99b5] mt-2 max-w-xs leading-relaxed">
            {isSuccess
              ? 'Decrypting secure credentials...'
              : 'Enter your credentials to unlock the confidential link.'}
          </p>
        </div>

        {/* Auth Form with Staggered Elements */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <motion.div
            animate={isShaking ? { x: [-12, 12, -9, 9, -5, 5, 0] } : {}}
            transition={{ duration: 0.45 }}
            className="space-y-4"
          >
            {/* Username Input */}
            <motion.div variants={formItemVariants}>
              <label
                htmlFor="username-input"
                className="block text-xs font-semibold text-[#a6b8d9] uppercase tracking-wider mb-2"
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#627393] group-focus-within:text-[#9ecaff] transition-colors">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isLoading || isSuccess}
                  placeholder="Enter secret username"
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-[#0d1424] border border-[#233150] hover:border-[#33456e] focus:border-[#9ecaff] focus:ring-2 focus:ring-[#9ecaff]/25 text-[#e1e7f5] placeholder-[#516180] rounded-2xl text-sm focus:outline-none transition-all duration-200 disabled:opacity-60"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={formItemVariants}>
              <label
                htmlFor="password-input"
                className="block text-xs font-semibold text-[#a6b8d9] uppercase tracking-wider mb-2"
              >
                Passcode
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#627393] group-focus-within:text-[#9ecaff] transition-colors">
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isLoading || isSuccess}
                  placeholder="Enter passcode"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-11 py-3 bg-[#0d1424] border text-[#e1e7f5] placeholder-[#516180] rounded-2xl text-sm focus:outline-none transition-all duration-200 disabled:opacity-60 ${
                    error
                      ? 'border-[#ffb4ab]/80 focus:ring-2 focus:ring-[#ffb4ab]/25'
                      : 'border-[#233150] hover:border-[#33456e] focus:border-[#9ecaff] focus:ring-2 focus:ring-[#9ecaff]/25'
                  }`}
                />
                <motion.button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading || isSuccess}
                  whileTap={{ scale: 0.85 }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7384a5] hover:text-[#b8c8ea] transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                id="password-error-message"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-2.5 text-xs text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/30 p-3 rounded-xl shadow-inner"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ffb4ab]" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </motion.div>

          {/* Primary Action Button with Light Sweep and Hover Feedback */}
          <motion.button
            type="submit"
            id="unlock-submit-button"
            disabled={isLoading || isSuccess}
            whileHover={!isLoading && !isSuccess ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isLoading && !isSuccess ? { scale: 0.98 } : {}}
            className={`relative w-full flex items-center justify-center gap-2.5 py-3.5 px-5 font-bold rounded-2xl text-sm transition-all duration-300 shadow-md focus:outline-none cursor-pointer overflow-hidden disabled:cursor-not-allowed group ${
              isSuccess
                ? 'bg-[#78dc9c] text-[#00391c] shadow-[#78dc9c]/35'
                : 'bg-[#9ecaff] hover:bg-[#b8d7ff] text-[#003258] shadow-[#9ecaff]/20 hover:shadow-[#9ecaff]/35 focus:ring-2 focus:ring-[#9ecaff]/40 disabled:opacity-75'
            }`}
          >
            {/* Shimmer light sweep beam */}
            {!isLoading && !isSuccess && (
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            )}

            {isSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00391c]" />
                <span>Access Granted</span>
              </motion.div>
            ) : isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#003258]" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Unlock Access</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Live Status Indicators with Pulsing Beacons */}
        <div className="mt-6 pt-5 border-t border-[#1d2a46] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#7d8fae]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#78dc9c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#78dc9c]"></span>
              </span>
              <span>Gateway Status</span>
            </div>
            <span className="text-[#78dc9c] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Operational &bull; 99.99%
            </span>
          </div>

          <div className="flex items-center justify-between text-[#687a99]">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#5e7090]" />
              <span>Intrusion Defense</span>
            </div>
            <span className="text-[#9cb0d4]">Active (Max 5 Attempts)</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
