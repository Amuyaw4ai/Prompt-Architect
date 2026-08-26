import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { PromptType, SavedPrompt } from '../types';

interface HomeProps {
  onNavigate: (view: 'architect' | 'saved' | 'templates' | 'history') => void;
  onNewArchitect: (type: PromptType) => void;
  onSelectTemplate: (content: string, type: PromptType) => void;
}

const ALL_INSPIRATION_CHIPS = [
  { label: 'Try: SaaS Cold Email', prompt: 'Write a high-converting B2B cold email campaign targeting VPs of Sales for an AI analytics platform.' },
  { label: 'Try: Python Scraper', prompt: 'Write an async Python 3.12 web scraper using httpx and BeautifulSoup4 with exponential backoff retries.' },
  { label: 'Try: Cinema Shot', prompt: 'Cinematic wide shot of a cyberpunk street market, neon lights reflecting in rain puddles, volumetric fog, 8k render.' },
  { label: 'Try: Pitch Deck Copy', prompt: 'Draft a compelling elevator pitch and vision statement for a fintech startup solving cross-border payments.' },
  { label: 'Try: React Custom Hook', prompt: 'Write a custom React TypeScript hook for managing WebSocket auto-reconnections with exponential backoff.' },
  { label: 'Try: Fantasy Citadel', prompt: 'A majestic floating island with a glowing crystal castle, surrounded by cloud-level waterfalls, digital concept art.' },
  { label: 'Try: SQL Schema', prompt: 'Design a PostgreSQL schema for an e-commerce platform handling multi-currency orders and inventory.' },
  { label: 'Try: Technical RFC', prompt: 'Draft an RFC document for migrating a monolithic Node.js backend to microservices architecture.' },
];

export const Home: React.FC<HomeProps> = ({ onNavigate, onNewArchitect, onSelectTemplate }) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [activeChips, setActiveChips] = useState(() => {
    const shuffled = [...ALL_INSPIRATION_CHIPS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  return (
    <div className="w-full pb-16 relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <h1 className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-slate-100 mb-4 tracking-tight relative z-10">
            Welcome to Prompt Architect.
          </h1>
          <p className="text-lg text-stone-500 dark:text-slate-400 mb-8 max-w-xl relative z-10">
            Engineer the perfect AI prompt in seconds. Pick a starting idea or jump straight into the workspace.
          </p>

          {/* Dynamic Rotating Inspiration Chips */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Quick Start Idea Chips:
              </span>
              <button
                onClick={() => {
                  const shuffled = [...ALL_INSPIRATION_CHIPS].sort(() => 0.5 - Math.random());
                  setActiveChips(shuffled.slice(0, 3));
                }}
                className="text-xs font-semibold text-stone-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                🔄 Refresh Chips
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {activeChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectTemplate(chip.prompt, 'text')}
                  className="px-4 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl text-xs font-bold text-stone-800 dark:text-slate-200 transition-all hover:scale-105 shadow-sm cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNewArchitect('text')}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-slate-900 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap size={18} />
                <span>Architect My Prompt →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Proof Through Examples Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              role: 'Developer',
              raw: 'Write a python script to scrape data.',
              master: 'Write a production-grade Python 3.12 scraper using httpx and BeautifulSoup4 with async concurrency, exponential retries, and Pydantic validation.',
              score: 88,
            },
            {
              role: 'Creator',
              raw: 'A cool photo of a car at night.',
              master: 'Cinematic wide shot of a black Porsche 911 GT3 on wet asphalt, neon reflections, 35mm film, 85mm f/1.8 prime lens, volumetric golden hour light.',
              score: 92,
            },
            {
              role: 'Business Owner',
              raw: 'Write a cold email to sell my app.',
              master: 'Act as a Senior B2B Copywriter. Draft a 3-part cold email sequence targeting CTOs with a 15-word hook, social proof, and a friction-free CTA.',
              score: 90,
            },
          ].map((example, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-left space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{example.role}</span>
                <span className="text-xs font-mono font-bold text-stone-400 dark:text-slate-500">Score: {example.score}/100</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-900 text-xs font-medium text-stone-600 dark:text-slate-400 space-y-1">
                <div className="text-[10px] font-bold uppercase text-stone-400">Before (Raw):</div>
                <p className="italic">"{example.raw}"</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300 space-y-1">
                <div className="text-[10px] font-bold uppercase text-emerald-400">After (Architected Spec ✨):</div>
                <p className="line-clamp-3">{example.master}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
