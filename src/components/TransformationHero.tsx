import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Zap, 
  RefreshCw, 
  FileText, 
  ArrowRight, 
  Clipboard, 
  Check,
  ShieldCheck
} from 'lucide-react';
import { PromptType } from '../types';
import { cn } from '../utils';
import { getSmartAssistPills, appendPillTokenToPrompt, SmartPillOption } from '../utils/smartAssistPills';

interface TransformationHeroProps {
  onArchitect: (rawInput: string, modality: PromptType) => void;
  isProcessing: boolean;
  selectedModality: PromptType;
  onModalityChange: (modality: PromptType) => void;
}

const INSPIRATION_PRESETS: Record<PromptType, { label: string; prompt: string }[]> = {
  text: [
    { label: 'Try: SaaS Cold Email', prompt: 'Write a high-converting cold email campaign for our B2B AI analytics tool targeting VPs of Sales.' },
    { label: 'Try: Pitch Deck Copy', prompt: 'Write a compelling elevator pitch and vision statement for a fintech startup solving cross-border payments.' },
    { label: 'Try: Technical RFC', prompt: 'Draft a Request for Comments (RFC) document for migrating a monolithic Node.js backend to microservices.' },
  ],
  code: [
    { label: 'Try: Python Refactor', prompt: 'Refactor this Python script to use async/await, add type hints, and implement defensive try-except error bounds.' },
    { label: 'Try: React Hook', prompt: 'Write a custom React TypeScript hook for managing WebSocket auto-reconnection with exponential backoff.' },
    { label: 'Try: SQL Schema', prompt: 'Design a PostgreSQL database schema for an e-commerce platform handling multi-currency orders and inventory.' },
  ],
  image: [
    { label: 'Try: Cinema Shot', prompt: 'A breathtaking cinematic portrait of an astronaut on Mars, captured on 35mm film stock, 85mm f/1.8 prime lens, golden hour volumetric lighting.' },
    { label: 'Try: Cyberpunk City', prompt: 'A neon-lit cyberpunk street in Tokyo at night, rain reflections on pavement, volumetric fog, Octane Render 8k photorealistic.' },
    { label: 'Try: Product Render', prompt: 'A sleek minimalist studio product shot of a wireless earbud, matte black finish, soft diffused lighting, 3D render.' },
  ],
  video: [
    { label: 'Try: Drone Tracking', prompt: 'Cinematic b-roll drone tracking shot following a sleek black sports car speeding down a wet neon-lit street at night, 4k 60fps stable motion.' },
    { label: 'Try: Nature Timelapse', prompt: 'A fast-paced time-lapse video of snow-capped mountain peaks transitioning from starry night to vivid sunrise clouds.' },
    { label: 'Try: Product Commercial', prompt: 'A dynamic 15-second commercial clip showcasing a luxury wristwatch, macro zoom shot, dramatic lighting shifts.' },
  ],
};

export const TransformationHero: React.FC<TransformationHeroProps> = ({
  onArchitect,
  isProcessing,
  selectedModality,
  onModalityChange,
}) => {
  const [rawInput, setRawInput] = useState('');
  const [assistPills, setAssistPills] = useState<SmartPillOption[]>([]);
  const [copiedPaste, setCopiedPaste] = useState(false);

  // 300ms Debounced Smart Assist Pills Update
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssistPills(getSmartAssistPills(rawInput, selectedModality));
    }, 300);
    return () => clearTimeout(timer);
  }, [rawInput, selectedModality]);

  const presets = INSPIRATION_PRESETS[selectedModality] || INSPIRATION_PRESETS.text;

  const handlePresetClick = (promptText: string) => {
    setRawInput(promptText);
  };

  const handlePillClick = (pill: SmartPillOption) => {
    const updated = appendPillTokenToPrompt(rawInput, pill.tokenToAppend);
    setRawInput(updated);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawInput(text);
        setCopiedPaste(true);
        setTimeout(() => setCopiedPaste(false), 1500);
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rawInput.trim() || isProcessing) return;
    onArchitect(rawInput, selectedModality);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col justify-center h-full overflow-hidden px-3 sm:px-6 py-2">
      {/* Dynamic Inspiration Chips (Pinned Above Text Canvas) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:inline-block">
          Quick Start:
        </span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetClick(preset.prompt)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-stone-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/80 dark:hover:text-emerald-300 transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Hero Sandbox Main Text Canvas Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800/90 rounded-[2rem] p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col space-y-4"
      >
        {/* Modality Selector Header */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900 dark:text-slate-100">
                Universal Prompt Architecture Engine
              </h2>
              <p className="text-[10px] sm:text-xs text-stone-400 dark:text-slate-400 font-medium hidden sm:block">
                Type or paste your raw draft idea — zero marketing fluff required
              </p>
            </div>
          </div>

          {/* Modality Pills */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800/80 p-1 rounded-xl border border-stone-200/80 dark:border-slate-700/80 text-[11px] font-bold shrink-0">
            {(['text', 'image', 'video', 'code'] as PromptType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onModalityChange(type)}
                className={cn(
                  "px-2.5 py-1 rounded-lg uppercase tracking-tight transition-all cursor-pointer",
                  selectedModality === type
                    ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                    : "text-stone-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input Canvas */}
        <div className="relative">
          <textarea
            rows={5}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`Type or paste your raw ${selectedModality} prompt idea here...\ne.g. ${
              selectedModality === 'code' ? 'Write a typescript hook for websocket reconnections...' :
              selectedModality === 'image' ? 'A cinematic portrait of an astronaut on Mars...' :
              selectedModality === 'video' ? 'Drone tracking shot following a sports car at night...' :
              'Write a high-converting marketing strategy for a DTC brand...'
            }`}
            className="w-full p-4 bg-stone-50/80 dark:bg-slate-950/80 border border-stone-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-stone-900 dark:text-slate-100 font-medium placeholder:text-stone-400 dark:placeholder:text-slate-600 resize-none transition-all leading-relaxed"
          />

          {/* Mobile Paste Clip Helper */}
          <button
            type="button"
            onClick={handlePasteClipboard}
            className="sm:hidden absolute right-3 top-3 px-2 py-1 bg-stone-200/80 dark:bg-slate-800 text-stone-700 dark:text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
          >
            {copiedPaste ? <Check size={12} className="text-emerald-500" /> : <Clipboard size={12} />}
            <span>{copiedPaste ? 'Pasted!' : 'Paste'}</span>
          </button>
        </div>

        {/* Smart Assist Pills & Character Counter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          {/* Smart Assist Pills */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500 shrink-0">
              Quick Add:
            </span>
            {assistPills.map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillClick(pill)}
                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/80 dark:border-emerald-700/60 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Character Counter & Desktop Primary CTA */}
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-slate-800">
            <span className="text-xs font-mono font-bold text-stone-500 dark:text-slate-400">
              [ Characters: {rawInput.length} ]
            </span>

            {/* Desktop CTA Button */}
            <button
              type="submit"
              disabled={!rawInput.trim() || isProcessing}
              className="hidden sm:flex px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:scale-[1.02] active:scale-95 items-center gap-2 cursor-pointer shrink-0"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Architecting...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Architect My Prompt →</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Fixed Bottom Sticky Bar for Mobile Thumb-Zone Viewports */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-md z-40">
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!rawInput.trim() || isProcessing}
          className="w-full py-3.5 bg-emerald-500 active:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Architecting...</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span>⚡ ARCHITECT MY PROMPT →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
