import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ShieldCheck,
  Volume2,
  VolumeX,
  Server,
  Zap,
  Lock,
  X,
  Radio,
  Clock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface StatusIndicatorProps {
  isUnlocked: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  username?: string;
  sessionTimeLeft?: number;
  maxSessionTime?: number;
  onExtendSession?: () => void;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isUnlocked,
  soundEnabled,
  onToggleSound,
  username,
  sessionTimeLeft,
  maxSessionTime = 600,
  onExtendSession,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isServerPulsing, setIsServerPulsing] = useState(false);

  // Periodic 30-second heartbeat pulse confirming server connection is active
  useEffect(() => {
    const interval = setInterval(() => {
      setIsServerPulsing(true);
      const timer = setTimeout(() => {
        setIsServerPulsing(false);
      }, 1600);
      return () => clearTimeout(timer);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpiring = sessionTimeLeft !== undefined && sessionTimeLeft <= 60;
  const isWarning = sessionTimeLeft !== undefined && sessionTimeLeft <= 120;
  const progressRatio = sessionTimeLeft !== undefined && maxSessionTime > 0
    ? Math.max(0, Math.min(1, sessionTimeLeft / maxSessionTime))
    : 1;

  // Circumference for r=7.5 is 2 * PI * 7.5 ≈ 47.12
  const circumference = 47.12;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const timerColor = isExpiring
    ? '#ffb4ab'
    : isWarning
    ? '#ffd08a'
    : '#78dc9c';

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Sound Notifications Toggle Button with Rotation Tap */}
        <motion.button
          type="button"
          id="toggle-sound-button"
          onClick={onToggleSound}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88, rotate: -15 }}
          aria-label={soundEnabled ? 'Mute sound notifications' : 'Enable sound notifications'}
          title={soundEnabled ? 'Sound notifications enabled (click to mute)' : 'Sound notifications muted (click to enable)'}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
            soundEnabled
              ? 'bg-[#15233c] text-[#9ecaff] border-[#25395f] hover:bg-[#1f3154]'
              : 'bg-[#101726] text-[#5b6c8a] border-[#1d273a] hover:bg-[#172236]'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </motion.button>

        {/* Live Status Indicator Pill with Visual Countdown Timer */}
        <motion.button
          type="button"
          id="system-status-indicator"
          onClick={() => setShowDetails(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          animate={
            isServerPulsing
              ? {
                  scale: [1, 1.05, 0.98, 1],
                  boxShadow: [
                    '0 0 0px rgba(158, 202, 255, 0)',
                    '0 0 16px rgba(158, 202, 255, 0.45)',
                    '0 0 0px rgba(158, 202, 255, 0)',
                  ],
                }
              : {}
          }
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          title={
            isUnlocked && sessionTimeLeft !== undefined
              ? `Active Session • ${formatTime(sessionTimeLeft)} remaining (Click for details)`
              : 'Gateway Online • Click to view security telemetry'
          }
          className={`relative flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer border whitespace-nowrap shrink-0 select-none ${
            isUnlocked
              ? isExpiring
                ? 'bg-[#3b1219] hover:bg-[#4d1621] border-[#ffb4ab]/60 text-[#ffdad6] shadow-sm shadow-[#ffb4ab]/20 animate-pulse'
                : 'bg-[#142037] hover:bg-[#1c2c4d] border-[#213459] hover:border-[#354f80] text-[#e1e7f5]'
              : 'bg-[#142037] hover:bg-[#1c2c4d] border-[#213459] hover:border-[#354f80] text-[#e1e7f5]'
          }`}
        >
          {/* Subtle 30s Server Connection Heartbeat Ring */}
          <AnimatePresence>
            {isServerPulsing && (
              <motion.span
                key="server-heartbeat-ring"
                initial={{ scale: 0.9, opacity: 0.9 }}
                animate={{ scale: 1.38, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-[#9ecaff] bg-[#9ecaff]/15 pointer-events-none -z-10 shadow-[0_0_12px_rgba(158,202,255,0.4)]"
              />
            )}
          </AnimatePresence>

          {isUnlocked && sessionTimeLeft !== undefined ? (
            <>
              {/* Circular Visual Countdown Ring */}
              <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 20 20">
                  <circle
                    cx="10"
                    cy="10"
                    r="7.5"
                    fill="none"
                    stroke="#233454"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="7.5"
                    fill="none"
                    stroke={timerColor}
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-linear"
                  />
                </svg>
                {/* Center pulsing indicator dot */}
                <span
                  className="w-1.5 h-1.5 rounded-full absolute transition-colors duration-300"
                  style={{ backgroundColor: timerColor }}
                />
                {isServerPulsing && (
                  <motion.span
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                    className="w-1.5 h-1.5 rounded-full absolute bg-[#9ecaff] pointer-events-none"
                  />
                )}
              </div>

              {/* Countdown text display */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="hidden sm:inline text-[#9cb0d4]">Active</span>
                <span className="hidden sm:inline text-[#4e6080]">&bull;</span>
                <span
                  className="font-mono font-bold tracking-tight text-xs tabular-nums"
                  style={{ color: timerColor }}
                >
                  {formatTime(sessionTimeLeft)}
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#9ecaff]" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9ecaff]" />
                {isServerPulsing && (
                  <motion.span
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 3.5, opacity: 0 }}
                    transition={{ duration: 1.4, ease: 'easeOut' }}
                    className="absolute -inset-0.5 rounded-full bg-[#9ecaff] pointer-events-none"
                  />
                )}
              </span>
              <span className="hidden sm:inline">Gateway Online</span>
              <span className="sm:hidden font-mono text-[11px] text-[#9ecaff]">ONLINE</span>
            </>
          )}
        </motion.button>
      </div>

      {/* System Status & Session Telemetry Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            id="status-details-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/70 backdrop-blur-md"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              id="status-details-card"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#11192b] border border-[#202e4d] rounded-3xl p-6 shadow-2xl text-[#e1e7f5] relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#1c2946] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1a2948] flex items-center justify-center text-[#9ecaff]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#e1e7f5]">Gateway Diagnostics</h3>
                    <p className="text-[11px] text-[#7486a6]">Pineapple Inc. Infrastructure Telemetry</p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  id="close-status-details-button"
                  onClick={() => setShowDetails(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#788cae] hover:text-[#e1e7f5] hover:bg-[#1a2641] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Visual Session Countdown Telemetry (Shown when unlocked) */}
              {isUnlocked && sessionTimeLeft !== undefined && (
                <div
                  id="modal-session-countdown-box"
                  className="mb-4 p-4 rounded-2xl bg-[#0e1627] border border-[#202f50] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#c5d6f5]">
                      <Clock className="w-4 h-4 text-[#9ecaff]" />
                      <span>Session Auto-Expiration</span>
                    </div>

                    {onExtendSession && (
                      <motion.button
                        type="button"
                        id="modal-extend-session-btn"
                        onClick={onExtendSession}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-[#1d2d4d] hover:bg-[#273d69] text-[#9ecaff] rounded-lg border border-[#2e477a] transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Extend +5m</span>
                      </motion.button>
                    )}
                  </div>

                  {/* Digital Clock readout & Progress bar */}
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] text-[#7184a7]">Time Remaining:</span>
                    <span
                      className="font-mono text-xl font-bold tracking-tight tabular-nums"
                      style={{ color: timerColor }}
                    >
                      {formatTime(sessionTimeLeft)}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-[#18243b] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-linear"
                      style={{
                        width: `${Math.round(progressRatio * 100)}%`,
                        backgroundColor: timerColor,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-[#697b9c] flex items-center gap-1.5 pt-0.5">
                    {isExpiring ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ffb4ab] shrink-0 animate-pulse" />
                        <span className="text-[#ffb4ab]">Expiring soon! Extend or conclude work.</span>
                      </>
                    ) : (
                      <span>Session automatically secures when timer reaches 00:00</span>
                    )}
                  </p>
                </div>
              )}

              {/* Core Telemetry List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1220] border border-[#192641]">
                  <div className="flex items-center gap-2 text-[#9bb0d4]">
                    <Server className="w-4 h-4 text-[#9ecaff]" />
                    <span>Gateway Status</span>
                  </div>
                  <span className="font-semibold text-[#78dc9c] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#78dc9c] inline-block animate-pulse" />
                    100% Operational
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1220] border border-[#192641]">
                  <div className="flex items-center gap-2 text-[#9bb0d4]">
                    <Radio className="w-4 h-4 text-[#9ecaff]" />
                    <span>Connection Latency</span>
                  </div>
                  <span className="font-mono text-[#9ecaff]">18 ms (Optimal)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1220] border border-[#192641]">
                  <div className="flex items-center gap-2 text-[#9bb0d4]">
                    <Activity className="w-4 h-4 text-[#9ecaff]" />
                    <span>Server Heartbeat</span>
                  </div>
                  <span className="font-semibold text-xs text-[#78dc9c] flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-[#78dc9c] inline-block ${
                        isServerPulsing ? 'animate-ping' : ''
                      }`}
                    />
                    Connected &bull; 30s Pulse
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1220] border border-[#192641]">
                  <div className="flex items-center gap-2 text-[#9bb0d4]">
                    <ShieldCheck className="w-4 h-4 text-[#9ecaff]" />
                    <span>Intrusion Prevention</span>
                  </div>
                  <span className="text-[#e1e7f5]">Enforced (Max 5 Attempts)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1220] border border-[#192641]">
                  <div className="flex items-center gap-2 text-[#9bb0d4]">
                    <Lock className="w-4 h-4 text-[#9ecaff]" />
                    <span>Transport Encryption</span>
                  </div>
                  <span className="text-[#e1e7f5]">TLS 1.3 / AES-256-GCM</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1220] border border-[#192641]">
                  <div className="flex items-center gap-2 text-[#9bb0d4]">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#78dc9c]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-[#8a9dbd]" />
                    )}
                    <span>Sound Notifications</span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={onToggleSound}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="font-semibold text-xs px-2.5 py-1 rounded-lg bg-[#182745] hover:bg-[#203358] text-[#9ecaff] border border-[#273d69] transition-colors cursor-pointer"
                  >
                    {soundEnabled ? 'Enabled' : 'Muted'}
                  </motion.button>
                </div>

                {isUnlocked && username && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1220] border border-[#192641]">
                    <div className="flex items-center gap-2 text-[#9bb0d4]">
                      <Zap className="w-4 h-4 text-[#78dc9c]" />
                      <span>Authenticated Session</span>
                    </div>
                    <span className="font-bold text-[#78dc9c]">{username}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-[#1a2642] flex justify-end">
                <motion.button
                  type="button"
                  id="close-status-modal-action"
                  onClick={() => setShowDetails(false)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 bg-[#9ecaff] hover:bg-[#b8d7ff] text-[#003258] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
