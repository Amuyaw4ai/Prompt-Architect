import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';

interface TransformationRitualProps {
  onComplete: () => void;
}

const RITUAL_BADGES = [
  'Analyzing Intention & Modality Vectors...',
  'Injecting Negative Guardrails & Error Bounds...',
  'Constructing Master Structural Blueprint...',
  'Finalizing High-Yield Prompt Spec...',
];

export const TransformationRitual: React.FC<TransformationRitualProps> = ({ onComplete }) => {
  const [badgeIndex, setBadgeIndex] = useState(0);

  useEffect(() => {
    // Cycle through micro-status badges over 1200ms
    const interval = setInterval(() => {
      setBadgeIndex((prev) => (prev + 1) % RITUAL_BADGES.length);
    }, 280);

    // Complete ritual after 1200ms
    const timer = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full max-w-[1000px] mx-auto h-full flex flex-col items-center justify-center p-6 text-center space-y-6"
    >
      {/* Central Pulsing Radar Scanner */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl"
        />

        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl flex items-center justify-center text-emerald-400 relative z-10">
          <RefreshCw size={36} className="animate-spin text-emerald-400" />
        </div>
      </div>

      {/* Micro-Interaction Status Title & Badge Cycle */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-black tracking-tight text-stone-900 dark:text-slate-100 flex items-center justify-center gap-2">
          <Sparkles size={18} className="text-emerald-500 animate-pulse" />
          Architecting Master Prompt Spec...
        </h3>

        <motion.div
          key={badgeIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-xs"
        >
          {RITUAL_BADGES[badgeIndex]}
        </motion.div>
      </div>

      {/* Scanning Laser Line Container */}
      <div className="w-full max-w-md h-1.5 bg-stone-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full shadow-[0_0_12px_#10b981]"
        />
      </div>

      <p className="text-xs text-stone-400 dark:text-slate-500 font-medium">
        Synthesizing task-weighted rubrics & hard gate floor boundaries
      </p>
    </motion.div>
  );
};
