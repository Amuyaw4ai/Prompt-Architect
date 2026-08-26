import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { PromptType, Template } from '../types';
import { TransformationHero } from './TransformationHero';
import { TransformationRitual } from './TransformationRitual';
import { TransformationDashboard } from './TransformationDashboard';

interface HomeProps {
  onNavigate: (view: 'architect' | 'saved' | 'templates' | 'history') => void;
  onNewArchitect: (type: PromptType) => void;
  onSelectTemplate: (content: string, type: PromptType, autoSend?: boolean) => void;
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
<<<<<<< HEAD
  const [selectedModality, setSelectedModality] = useState<PromptType>('text');
  const [engineState, setEngineState] = useState<'idle' | 'ritual' | 'dashboard'>('idle');
  const [activeRawInput, setActiveRawInput] = useState('');
  const [compiledTelemetry, setCompiledTelemetry] = useState<any>(null);
  const [isPaywallLocked, setIsPaywallLocked] = useState(false);
=======
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [recentPrompts, setRecentPrompts] = useState<SavedPrompt[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [activeChips, setActiveChips] = useState(() => {
    const shuffled = [...ALL_INSPIRATION_CHIPS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });
>>>>>>> 8658bd2 (fix(desktop): fix navigation menu blank screen, align dropdown below button, omit modality selector, add dynamic chip rotation, and upgrade dynamic flaws)

  const handleStartArchitect = async (rawInput: string, modality: PromptType) => {
    setActiveRawInput(rawInput);
    setSelectedModality(modality);
    setEngineState('ritual');

    try {
      // Call Phase 1-4 production backend API
      const response = await fetch('/api/audit/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput,
          targetModality: modality,
          deviceFingerprint: 'client_device_hash',
        }),
      });

      const data = await response.json();
      if (data.success && data.telemetry) {
        setCompiledTelemetry(data.telemetry);
        setIsPaywallLocked(Boolean(data.fingerprint?.isPaywallTriggered));
      } else {
        throw new Error(data.error || 'Failed to compile telemetry');
      }
    } catch (err) {
      console.warn('[Home Engine] API compile call error, using fallback telemetry:', err);
      setCompiledTelemetry({
        detectedModality: modality,
        overallScore: 18,
        verdict: '⚠️ Low Impact Draft — Lacks Guardrails',
        gradeBadge: 'Weak Draft',
        gradeColor: 'pink',
        flaws: [
          { parameter: 'Persona & Role Spec', critique: 'No explicit expert persona assigned.', impact: 'AI defaults to baseline generic response.' },
          { parameter: 'Execution Guardrails', critique: 'Missing negative rules.', impact: 'Increases hallucination risk.' }
        ],
        upgradedPrompt: `Act as a Senior AI Architect. Optimize: "${rawInput}".\n\n[CONTEXT]\nTarget explicit domain boundaries and success metrics.\n\n[CONSTRAINTS]\n- Purge generic buzzwords.\n- Enforce Markdown section headers.`,
      });
    }
  };

  const handleRitualComplete = () => {
    setEngineState('dashboard');
  };

  const handleApplyToStudio = (optimizedPrompt: string) => {
    onSelectTemplate(optimizedPrompt, selectedModality, true);
  };

  const handleSignInShortcut = (provider: 'google' | 'email') => {
    // Navigate to authentication route / sign-in shortcut
    onNavigate('history');
  };

  const handleResetEngine = () => {
    setActiveRawInput('');
    setEngineState('idle');
    setCompiledTelemetry(null);
    setIsPaywallLocked(false);
  };

  return (
<<<<<<< HEAD
    <div className="w-full flex flex-col space-y-16">
      {/* ZERO-SCROLL HERO TRANSFORMATION ENGINE SECTION */}
      <section className="relative w-full min-h-[calc(100vh-6rem)] md:min-h-[600px] flex items-center justify-center border-b border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-950/50 rounded-[2.5rem] overflow-hidden p-2 sm:p-6 shadow-xs">
        <AnimatePresence mode="wait">
          {engineState === 'idle' && (
=======
    <div className="w-full pb-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Top Right Stats Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-4 px-5 py-2.5 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-sm font-bold text-stone-700 dark:text-slate-200 group"
            title="View Detailed Stats"
          >
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span>{totalGenerated} <span className="hidden sm:inline text-stone-400 dark:text-slate-500 font-medium">Generated</span></span>
            </div>
            <div className="w-px h-4 bg-stone-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span>{totalSaved} <span className="hidden sm:inline text-stone-400 dark:text-slate-500 font-medium">Saved</span></span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Welcome & Quick Actions */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              
              <h1 className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-slate-100 mb-4 tracking-tight relative z-10">
                {isFirstTime ? "Welcome to Prompt Architect." : "Welcome back, Architect."}
              </h1>
              <p className="text-lg text-stone-500 dark:text-slate-400 mb-10 max-w-xl relative z-10">
                {isFirstTime 
                  ? "Engineer the perfect AI prompt in seconds. Choose a modality below to start building your first architecture."
                  : "Ready to build? Jump back into your recent projects or start a fresh architecture."}
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
                    className="text-xs font-semibold text-stone-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    🔄 Refresh Chips
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {activeChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectTemplate(chip.prompt, 'text')}
                      className="px-4 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl text-xs font-bold text-stone-800 dark:text-slate-200 transition-all hover:scale-105 shadow-sm"
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

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inspirationItems.map((item, i) => (
                  <div key={i} className="relative group rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm h-48">
                    {item.img ? (
                      <img src={item.img} alt="Gallery item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="p-6 h-full flex items-center justify-center bg-stone-50 dark:bg-slate-900">
                        <Type size={32} className="text-stone-300 dark:text-slate-700 absolute top-4 right-4" />
                        <p className="text-stone-700 dark:text-slate-300 font-medium text-sm leading-relaxed line-clamp-4">"{item.text}"</p>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-stone-900/90 dark:bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {item.type === 'image' ? <ImageIcon size={14} className="text-emerald-400" /> : <Type size={14} className="text-emerald-400" />}
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{item.type} Prompt</span>
                        </div>
                        <p className="text-white text-xs leading-relaxed line-clamp-4">
                          {item.prompt || item.text}
                        </p>
                      </div>
                      <button 
                        onClick={() => onSelectTemplate(item.prompt || item.text || '', item.type as PromptType)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Sparkles size={14} /> Use Architecture
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock size={18} className="text-stone-400" />
                  Recent Work
                </h3>
                <button onClick={() => onNavigate('saved')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  View all
                </button>
              </div>
              
              {recentPrompts.length > 0 ? (
                <div className="space-y-4">
                  {recentPrompts.map(prompt => (
                    <div key={prompt.id} onClick={() => onNavigate('saved')} className="p-4 rounded-xl bg-stone-50 dark:bg-slate-900/50 border border-stone-100 dark:border-slate-700/50 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <h4 className="font-semibold text-sm text-stone-900 dark:text-slate-100 mb-1 truncate">{prompt.title}</h4>
                      <p className="text-xs text-stone-500 dark:text-slate-400 truncate">{prompt.refinedPrompt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-stone-500 dark:text-slate-400 mb-4">No saved prompts yet.</p>
                  <button onClick={() => onNewArchitect('text')} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg">
                    Create your first
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Stats Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
>>>>>>> 8658bd2 (fix(desktop): fix navigation menu blank screen, align dropdown below button, omit modality selector, add dynamic chip rotation, and upgrade dynamic flaws)
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full h-full"
            >
              <TransformationHero
                onArchitect={handleStartArchitect}
                isProcessing={false}
                selectedModality={selectedModality}
                onModalityChange={setSelectedModality}
              />
            </motion.div>
          )}

          {engineState === 'ritual' && (
            <motion.div
              key="ritual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex items-center justify-center"
            >
              <TransformationRitual onComplete={handleRitualComplete} />
            </motion.div>
          )}

          {engineState === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full h-full"
            >
              <TransformationDashboard
                rawInput={activeRawInput}
                telemetry={compiledTelemetry}
                onApplyToStudio={handleApplyToStudio}
                onReset={handleResetEngine}
                isPaywallLocked={isPaywallLocked}
                onSignInShortcut={handleSignInShortcut}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* PART V: LANDING PAGE STRUCTURE BELOW THE HERO */}
      <section className="space-y-16 py-8">
        {/* Section 1: Proof Through Examples */}
        <div className="space-y-8 text-center">
          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Proof Through Examples
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-slate-100 tracking-tight">
              Transform Messy Ideas Into Master Specs
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
              See real transformations across Developers, Creators, and Business Owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {[
              {
                role: 'Developer',
                raw: 'Write a python script to scrape data.',
                master: 'Write a production-grade Python 3.12 scraper using httpx and BeautifulSoup4. Implement async concurrency, exponential backoff retries, and strict Pydantic schema validation.',
                score: 88,
              },
              {
                role: 'Creator',
                raw: 'A cool photo of a car at night.',
                master: 'A breathtaking cinematic wide shot of a black Porsche 911 GT3, wet asphalt reflections, neon-lit cyberpunk alleyway, shot on 35mm film, 85mm f/1.8 lens, golden hour volumetric lighting.',
                score: 92,
              },
              {
                role: 'Business Owner',
                raw: 'Write a cold email to sell my app.',
                master: 'Act as a Senior B2B Copywriter. Draft a 3-part cold email sequence targeting CTOs for our developer platform. Structure with a 15-word hook, social proof, and a friction-free CTA.',
                score: 90,
              },
            ].map((example, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-left space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{example.role}</span>
                  <span className="text-xs font-mono font-bold text-stone-400 dark:text-slate-500">Score: {example.score}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 text-xs font-medium text-stone-600 dark:text-slate-400 space-y-1">
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
        </div>

        {/* Section 2: How It Helps 3-Step Narrative */}
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-slate-900 text-slate-100 border border-slate-800 max-w-6xl mx-auto space-y-8 shadow-xl text-center">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">How Prompt Architect Helps You Win</h3>
            <p className="text-xs sm:text-sm text-slate-400">3 simple steps from messy idea to production precision</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { step: '01', title: 'Give Us Whatever You Have', desc: 'Type a messy prompt, paste a code block, or describe a rough vision.' },
              { step: '02', title: 'Sub-10ms Structural Audit', desc: 'Our engine extracts intent, injects negative constraints, and builds a master blueprint.' },
              { step: '03', title: 'Copy & Execute in AI', desc: 'Get a master-level prompt spec ready to drop into ChatGPT, Claude, Midjourney, or Cursor.' },
            ].map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-2xl font-black text-emerald-400 font-mono">{s.step}</span>
                <h4 className="text-sm font-bold text-white">{s.title}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
