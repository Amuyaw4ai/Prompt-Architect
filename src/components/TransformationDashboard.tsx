import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Activity, 
  ArrowRight, 
  Zap, 
  Bot, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { cn } from '../utils';
import { ChatbotSimulationView } from './ChatbotSimulationView';
import { PaywallIntercept } from './PaywallIntercept';

interface TransformationDashboardProps {
  rawInput: string;
  telemetry: any;
  onApplyToStudio: (optimizedPrompt: string, originalPrompt: string) => void;
  onReset: () => void;
  isPaywallLocked?: boolean;
  onSignInShortcut: (provider: 'google' | 'email') => void;
}

export const TransformationDashboard: React.FC<TransformationDashboardProps> = ({
  rawInput,
  telemetry,
  onApplyToStudio,
  onReset,
  isPaywallLocked = false,
  onSignInShortcut,
}) => {
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [mobileTab, setMobileTab] = useState<'spec' | 'insights' | 'simulation'>('spec');

  const handleCopySpec = () => {
    if (!telemetry?.upgradedPrompt) return;
    navigator.clipboard.writeText(telemetry.upgradedPrompt);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 1500);
  };

  const handleProceedToStudio = () => {
    if (!telemetry?.upgradedPrompt) return;
    onApplyToStudio(telemetry.upgradedPrompt, rawInput);
  };

  const t = telemetry || {};
  const score = t.overallScore || 18;
  const gradeBadge = t.gradeBadge || 'Needs Optimization';
  const gradeColor = t.gradeColor || 'amber';
  const flaws = t.flaws || [
    { parameter: 'Persona & Role Spec', critique: 'No explicit expert persona assigned.', impact: 'AI defaults to baseline generic response.' },
    { parameter: 'Execution Guardrails', critique: 'Missing negative rules.', impact: 'Increases hallucination risk.' }
  ];

  // Drag Gesture for Mobile Touch Swipe Deck
  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      // Swiped Left -> Move forward in tabs
      if (mobileTab === 'spec') setMobileTab('insights');
      else if (mobileTab === 'insights') setMobileTab('simulation');
    } else if (info.offset.x > swipeThreshold) {
      // Swiped Right -> Move backward in tabs
      if (mobileTab === 'simulation') setMobileTab('insights');
      else if (mobileTab === 'insights') setMobileTab('spec');
    }
  };

  if (showSimulation) {
    return (
      <ChatbotSimulationView
        rawInput={rawInput}
        architectedPrompt={t.upgradedPrompt || ''}
        onBackToBlueprint={() => setShowSimulation(false)}
      />
    );
  }

  return (
    <div className="relative w-full max-w-[1400px] mx-auto h-full flex flex-col overflow-hidden px-2 sm:px-4 py-2">
      {/* Frosted Glass Paywall Intercept Overlay (Mid-Transformation Tease) */}
      <AnimatePresence>
        {isPaywallLocked && (
          <PaywallIntercept onSignInShortcut={onSignInShortcut} />
        )}
      </AnimatePresence>

      {/* Top Header Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200 dark:border-slate-800 shrink-0">
        <button
          onClick={onReset}
          className="text-xs font-bold text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>← Architect Another Prompt</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border",
            gradeColor === 'emerald' && "bg-emerald-950 text-emerald-400 border-emerald-700",
            gradeColor === 'blue' && "bg-blue-950 text-blue-400 border-blue-700",
            gradeColor === 'amber' && "bg-amber-950 text-amber-400 border-amber-700",
            gradeColor === 'pink' && "bg-pink-950 text-pink-400 border-pink-700"
          )}>
            {gradeBadge} ({score}/100)
          </span>
        </div>
      </div>

      {/* DESKTOP VIEWPORT (40/60 Split Real Estate — Zero Scroll 100vh) */}
      <div className="hidden lg:grid grid-cols-12 gap-6 p-4 flex-1 overflow-hidden min-h-0">
        {/* LEFT PANEL (40% Width): Draft & Insights */}
        <div className="col-span-5 flex flex-col space-y-4 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-3xl p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-slate-800">
          {/* Health Score Circular SVG Gauge */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800/80 shadow-sm flex items-center gap-5">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={cn(
                    gradeColor === 'emerald' && "text-emerald-500",
                    gradeColor === 'blue' && "text-blue-500",
                    gradeColor === 'amber' && "text-amber-500",
                    gradeColor === 'pink' && "text-pink-500"
                  )}
                  strokeDasharray={`${score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black tracking-tighter">{score}</span>
                <span className="text-[8px] uppercase font-bold tracking-wider text-stone-400">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">Health Audit</span>
              <h3 className="text-sm font-bold text-stone-900 dark:text-slate-100">{t.verdict || 'Architected Spec'}</h3>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 mt-0.5">
                Target: <span className="uppercase text-emerald-500 font-bold">{t.detectedModality}</span>
              </p>
            </div>
          </div>

          {/* Exactly 2 Punchy 1-Sentence Flaw Badges */}
          <div className="space-y-3 flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
              <Activity size={14} className="text-amber-500" />
              Identified Structural Gaps
            </h4>

            <div className="space-y-2.5">
              {flaws.slice(0, 2).map((flaw: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800/80 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{flaw.parameter}</span>
                    <span className="text-[9px] font-bold text-stone-400 uppercase">Gap</span>
                  </div>
                  <p className="text-xs font-medium text-stone-700 dark:text-slate-300 leading-snug">{flaw.critique}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (60% Width): Architected Spec ✨ */}
        <div className="col-span-7 flex flex-col space-y-4 bg-slate-950 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles size={14} />
              Architected Spec ✨
            </h4>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSimulation(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Bot size={13} className="text-emerald-400" />
                <span>Simulate AI Output</span>
              </button>

              <button
                type="button"
                onClick={handleCopySpec}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {copiedSpec ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedSpec ? 'Copied!' : 'Copy Spec'}</span>
              </button>
            </div>
          </div>

          {/* Code Output Box */}
          <pre className="flex-1 p-4 rounded-2xl bg-slate-900 text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto border border-slate-800/80 scrollbar-thin scrollbar-thumb-slate-800">
            {t.upgradedPrompt}
          </pre>

          {/* Open & Refine in Studio Primary CTA */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
            <button
              onClick={handleProceedToStudio}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open & Refine in Studio →</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE TOUCH DECK VIEWPORT (3-Tab Swipeable Deck — Zero Scroll 100dvh) */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Mobile Segmented Control Deck Tabs */}
        <div className="flex items-center p-1 bg-stone-100 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 shrink-0 mb-2">
          <button
            type="button"
            onClick={() => setMobileTab('spec')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
              mobileTab === 'spec' ? "bg-emerald-500 text-slate-950 font-black shadow-xs" : "text-stone-600 dark:text-slate-400"
            )}
          >
            Master Spec ✨
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('insights')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
              mobileTab === 'insights' ? "bg-emerald-500 text-slate-950 font-black shadow-xs" : "text-stone-600 dark:text-slate-400"
            )}
          >
            Insights
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('simulation')}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
              mobileTab === 'simulation' ? "bg-emerald-500 text-slate-950 font-black shadow-xs" : "text-stone-600 dark:text-slate-400"
            )}
          >
            AI Simulation
          </button>
        </div>

        {/* Swipeable Active Deck Content Container */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="flex-1 flex flex-col overflow-hidden min-h-0 touch-pan-y"
        >
          {mobileTab === 'spec' && (
            <div className="flex-1 flex flex-col bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-400">Architected Spec ✨</span>
                <button
                  onClick={handleCopySpec}
                  className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                >
                  {copiedSpec ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="flex-1 p-3 rounded-xl bg-slate-900 text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                {t.upgradedPrompt}
              </pre>
            </div>
          )}

          {mobileTab === 'insights' && (
            <div className="flex-1 flex flex-col bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 flex items-center gap-4">
                <div className="text-2xl font-black text-emerald-500">{score}/100</div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-slate-100">{gradeBadge}</div>
                  <div className="text-[10px] text-stone-500 dark:text-slate-400">{t.verdict}</div>
                </div>
              </div>
              <div className="space-y-2">
                {flaws.slice(0, 2).map((flaw: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-amber-500">{flaw.parameter}</span>
                    <p className="text-xs font-medium text-stone-700 dark:text-slate-300">{flaw.critique}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mobileTab === 'simulation' && (
            <ChatbotSimulationView
              rawInput={rawInput}
              architectedPrompt={t.upgradedPrompt || ''}
              onBackToBlueprint={() => setMobileTab('spec')}
              isMobile={true}
            />
          )}
        </motion.div>

        {/* Mobile Fixed Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md z-40">
          <button
            onClick={handleProceedToStudio}
            className="w-full py-3.5 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Open & Refine in Studio →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
