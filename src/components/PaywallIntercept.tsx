import React from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface PaywallInterceptProps {
  onSignInShortcut: (provider: 'google' | 'email') => void;
}

export const PaywallIntercept: React.FC<PaywallInterceptProps> = ({ onSignInShortcut }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl border border-emerald-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden text-center"
    >
      <div className="max-w-md space-y-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Lock size={28} className="animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700">
            Daily Free Allowance Reached
          </span>
          <h3 className="text-xl font-black tracking-tight text-white">
            🔒 PROMPT ARCHITECTED & LOCKED
          </h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Your raw draft was diagnosed and upgraded into a master-level spec! You have utilized your 3 free daily audits for today. Save your prompt history & unlock your result instantly for free.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => onSignInShortcut('google')}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue with Google</span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={() => onSignInShortcut('email')}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue with Email</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-medium pt-1">
          Free forever for personal use. Unlocks instantly in under 3 seconds.
        </p>
      </div>
    </motion.div>
  );
};
