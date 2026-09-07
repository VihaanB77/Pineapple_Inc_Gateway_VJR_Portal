import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Lock, FileText, Globe } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="privacy-policy-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/75 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            id="privacy-policy-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-policy-title"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[85vh] bg-[#11192b] border border-[#202e4d] rounded-3xl shadow-2xl shadow-[#040811]/90 flex flex-col overflow-hidden text-[#e1e7f5]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2946] bg-[#0c1424]/80">
              <div className="flex items-center gap-3">
                <motion.img
                  src="/pineapple-logo.svg"
                  alt="Pineapple Inc. Logo"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-8 h-8 object-contain cursor-pointer"
                />
                <div>
                  <h2 id="privacy-policy-title" className="text-base font-bold text-[#e1e7f5] leading-tight">
                    Pineapple Inc. Privacy Policy
                  </h2>
                  <p className="text-[11px] text-[#7888a7]">
                    Effective September {Math.max(2026, new Date().getFullYear())} &bull; Secure Systems
                  </p>
                </div>
              </div>
              <motion.button
                type="button"
                id="close-privacy-policy-button"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close Privacy Policy"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8293b2] hover:text-[#e1e7f5] hover:bg-[#1a2641] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#9cb0d4] leading-relaxed">
              <section className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#9ecaff] font-semibold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. Overview & Commitment</span>
                </div>
                <p>
                  Pineapple Inc. is committed to uncompromising privacy and zero-knowledge data protection. This gateway provides authorized access to secure communication channels without tracking, storing, or selling personal browsing data.
                </p>
              </section>

              <section className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#9ecaff] font-semibold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>2. Authentication & Credential Security</span>
                </div>
                <p>
                  Your credentials are authenticated directly through hardened server-side routines. Passcodes and direct access links are never exposed to browser bundles or public indexes. No permanent cookies or third-party profiling trackers are utilized.
                </p>
              </section>

              <section className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#9ecaff] font-semibold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>3. Transient Telemetry & Abuse Prevention</span>
                </div>
                <p>
                  To protect the network against brute-force attacks and unauthorized intrusion, transient security telemetry (such as temporary failed attempt counters) is maintained in isolated server memory and automatically purged after cooldown expiration.
                </p>
              </section>

              <section className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#9ecaff] font-semibold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>4. Trademarks & Legal Rights</span>
                </div>
                <p>
                  Pineapple Inc.&trade; and the Pineapple fruit emblem are proprietary trademarks of Pineapple Inc. All rights reserved. Unauthorized reproduction, distribution, or reverse engineering of this portal is strictly prohibited.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#1c2946] bg-[#0c1424]/80 flex items-center justify-between text-xs text-[#6e80a0]">
              <span>Pineapple Inc. Security Standards</span>
              <motion.button
                type="button"
                id="privacy-policy-ack-button"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[#9ecaff] hover:bg-[#b8d7ff] text-[#003258] font-bold rounded-xl transition-colors cursor-pointer"
              >
                Understood
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
