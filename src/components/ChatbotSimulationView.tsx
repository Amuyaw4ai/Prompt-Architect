import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Bot, Sparkles, Copy, Check } from 'lucide-react';
import { cn } from '../utils';

interface ChatbotSimulationViewProps {
  rawInput: string;
  architectedPrompt: string;
  onBackToBlueprint: () => void;
  isMobile?: boolean;
}

export const ChatbotSimulationView: React.FC<ChatbotSimulationViewProps> = ({
  rawInput,
  architectedPrompt,
  onBackToBlueprint,
  isMobile = false,
}) => {
  const [copiedArchitected, setCopiedArchitected] = useState(false);
  const [mobileSimMode, setMobileSimMode] = useState<'vanilla' | 'architected'>('architected');

  const handleCopy = () => {
    navigator.clipboard.writeText(architectedPrompt);
    setCopiedArchitected(true);
    setTimeout(() => setCopiedArchitected(false), 1500);
  };

  const vanillaResponse = `Here is a generic overview of "${rawInput.slice(0, 40)}...". It provides baseline ideas without explicit output constraints, type definitions, or defensive error boundaries.`;

  const frontierResponse = `1. SCENE ARCHITECTURE & GOALS:\nStructured domain execution based on master blueprint. Enforces strict Markdown section headers, zero conversational preamble, and defensive edge case boundaries.\n\n2. TECHNICAL SPECIFICATIONS:\n- Preserved Core Intention: 100%\n- Guardrail Enforcement: Active\n- Output Fidelity: Production-Ready Frontier Spec.`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="w-full h-full flex flex-col overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToBlueprint}
            className="px-3 py-1.5 bg-stone-200 dark:bg-slate-800 hover:bg-stone-300 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ArrowLeft size={14} />
            <span>← Back to Prompt Blueprint</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
            Chatbot Thread Simulation
          </span>
        </div>
      </div>

      {/* Desktop 40/60 Dual Column Simulation View */}
      {!isMobile ? (
        <div className="grid grid-cols-12 gap-4 p-4 flex-1 overflow-hidden min-h-0">
          {/* Left Panel (40%): Vanilla AI Run */}
          <div className="col-span-5 flex flex-col bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-sm scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-slate-800">
            <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-slate-800/80 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Vanilla AI Model Output
              </span>
              <span className="text-[9px] text-stone-400 dark:text-slate-500 font-mono">Generic Output</span>
            </div>

            {/* Right-Aligned User Chat Bubble (Truncated) */}
            <div className="ml-auto max-w-[85%] bg-stone-200 dark:bg-slate-800 text-stone-900 dark:text-slate-100 rounded-2xl rounded-tr-xs p-3 text-xs shadow-xs space-y-1">
              <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold text-stone-500 dark:text-slate-400">
                <span>You</span>
                <User size={11} />
              </div>
              <p className="line-clamp-3 font-medium text-stone-800 dark:text-slate-200">
                {rawInput || 'car driving down a street...'}
              </p>
            </div>

            {/* Left-Aligned Full-Width AI Assistant Bubble */}
            <div className="w-full bg-white dark:bg-slate-900/80 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-stone-700 dark:text-slate-300 leading-relaxed shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <Bot size={13} />
                <span>Generic LLM Assistant</span>
              </div>
              <p className="font-medium">{vanillaResponse}</p>
            </div>
          </div>

          {/* Right Panel (60%): Frontier Architected Spec Run */}
          <div className="col-span-7 flex flex-col bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-xl scrollbar-thin scrollbar-thumb-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={12} />
                Architected Frontier Model Output ✨
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                {copiedArchitected ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copiedArchitected ? 'Copied!' : 'Copy Spec'}</span>
              </button>
            </div>

            {/* Right-Aligned User Chat Bubble (Truncated Architected Spec) */}
            <div className="ml-auto max-w-[85%] bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-2xl rounded-tr-xs p-3 text-xs font-mono shadow-xs space-y-1">
              <div className="flex items-center justify-end gap-1.5 text-[9px] font-bold text-emerald-400">
                <span>Master Spec</span>
                <User size={11} />
              </div>
              <p className="line-clamp-3 leading-relaxed">
                {architectedPrompt || 'Act as a Senior AI Architect...'}
              </p>
            </div>

            {/* Left-Aligned Full-Width Frontier AI Assistant Bubble */}
            <div className="w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-200 leading-relaxed shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <Sparkles size={13} />
                <span>Frontier AI Model</span>
              </div>
              <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">{frontierResponse}</pre>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile Vertically Scrollable Chat Thread View */
        <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800 min-h-0">
          {/* Mobile Segmented Output Switcher */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-800 text-[11px] font-bold shrink-0">
            <button
              type="button"
              onClick={() => setMobileSimMode('vanilla')}
              className={cn(
                "flex-1 py-1.5 rounded-lg transition-all cursor-pointer",
                mobileSimMode === 'vanilla' ? "bg-amber-500 text-white shadow-xs" : "text-stone-500 dark:text-slate-400"
              )}
            >
              Vanilla AI Response
            </button>
            <button
              type="button"
              onClick={() => setMobileSimMode('architected')}
              className={cn(
                "flex-1 py-1.5 rounded-lg transition-all cursor-pointer",
                mobileSimMode === 'architected' ? "bg-emerald-500 text-slate-950 shadow-xs font-black" : "text-stone-500 dark:text-slate-400"
              )}
            >
              Architected Spec ✨
            </button>
          </div>

          {/* Active Mobile Thread */}
          {mobileSimMode === 'vanilla' ? (
            <div className="space-y-3">
              <div className="ml-auto max-w-[85%] bg-stone-200 dark:bg-slate-800 text-stone-900 dark:text-slate-100 rounded-2xl rounded-tr-xs p-3 text-xs space-y-1">
                <div className="text-[9px] font-bold text-stone-500 dark:text-slate-400 text-right">You</div>
                <p className="line-clamp-3 font-medium">{rawInput || 'car driving down a street...'}</p>
              </div>
              <div className="w-full bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-stone-700 dark:text-slate-300 leading-relaxed">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">Generic LLM Assistant</div>
                <p>{vanillaResponse}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="ml-auto max-w-[85%] bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-2xl rounded-tr-xs p-3 text-xs font-mono space-y-1">
                <div className="text-[9px] font-bold text-emerald-400 text-right">Master Spec</div>
                <p className="line-clamp-3">{architectedPrompt || 'Act as a Senior AI Architect...'}</p>
              </div>
              <div className="w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-3 text-xs text-emerald-200 leading-relaxed">
                <div className="text-[10px] font-bold text-emerald-400 mb-1">Frontier AI Model</div>
                <pre className="font-mono text-xs whitespace-pre-wrap">{frontierResponse}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
