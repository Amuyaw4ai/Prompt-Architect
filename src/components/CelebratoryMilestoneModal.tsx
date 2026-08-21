import React, { useState } from 'react';
import { Sparkles, Check, Mail, Lock, X, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { setAuthenticatedState, markMilestoneCelebrationShown } from '../utils/persistence';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CelebratoryMilestoneModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDismiss = () => {
    markMilestoneCelebrationShown();
    onClose();
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setAuthenticatedState(true);
      markMilestoneCelebrationShown();
      setTimeout(() => {
        onClose();
      }, 1800);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-stone-950/75 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors z-20"
            title="Close"
          >
            <X size={18} />
          </button>

          <div className="p-6 sm:p-8 space-y-6 relative z-10">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
                  <UserCheck size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-stone-900 dark:text-slate-100">
                    Welcome to Prompt Architect!
                  </h3>
                  <p className="text-xs font-medium text-stone-500 dark:text-slate-400">
                    Your progress has been backed up. Syncing active across devices!
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Celebratory Badge */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl">
                      🥳
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-slate-100 tracking-tight leading-snug">
                      Awesome Work! You've Architected 5 Master Prompts!
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                      You're building an impressive collection. Sign in to save your work and keep your progress safe across all your devices.
                    </p>
                  </div>
                </div>

                {/* Sign-in Form */}
                <form onSubmit={handleSignIn} className="space-y-3.5 pt-2">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 transition-all font-medium"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="Create password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 transition-all font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In / Create Free Account</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-1 text-center">
                  <span className="text-[10px] text-stone-400 dark:text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span>Free account • Zero spam • Auto-sync active</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
