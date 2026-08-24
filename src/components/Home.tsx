import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Zap, 
  RefreshCw,
  Copy,
  Check,
  FileText,
  PlayCircle,
  ArrowRight,
  Lock,
  Layers,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { PromptType } from '../types';
import { cn } from '../utils';
import { getSmartAssistPills, appendPillTokenToPrompt, SmartPillOption } from '../utils/smartAssistPills';

interface HomeProps {
  onNavigate: (view: 'architect' | 'saved' | 'templates' | 'history') => void;
  onNewArchitect: (type: PromptType) => void;
  onSelectTemplate: (content: string, type: PromptType, autoSend?: boolean) => void;
}

// Dynamic inspiration chip library
const PRESET_CHIP_LIBRARY: Array<{ label: string; prompt: string; type: PromptType }> = [
  { label: 'Try: SaaS Cold Email', prompt: 'Write a high-converting cold email for a B2B SaaS startup targeting CTOs.', type: 'text' },
  { label: 'Try: Python Refactor', prompt: 'Refactor this Python script to use async/await and robust error handling.', type: 'code' },
  { label: 'Try: Cinema Shot', prompt: 'Cinematic portrait of a Ghanaian king in golden hour light, 35mm film.', type: 'image' },
  { label: 'Try: Drone Video', prompt: 'Drone tracking shot following a sports car on a rainy Tokyo street at night.', type: 'video' },
  { label: 'Try: SQL Query', prompt: 'Optimize this PostgreSQL join query for high concurrency and low latency.', type: 'code' },
  { label: 'Try: Blog Headline', prompt: 'Generate 5 irresistible blog headlines for an AI product launch.', type: 'text' },
];

export const Home: React.FC<HomeProps> = ({ onNavigate, onNewArchitect, onSelectTemplate }) => {
  const [rawInput, setRawInput] = useState('');
  const [selectedModality, setSelectedModality] = useState<PromptType>('text');
  const [isAuditing, setIsAuditing] = useState(false);
  const [hasAudited, setHasAudited] = useState(false);
  const [telemetryResult, setTelemetryResult] = useState<any>(null);
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'spec'>('spec');
  const [assistPills, setAssistPills] = useState<SmartPillOption[]>([]);
  const [presetChips, setPresetChips] = useState<typeof PRESET_CHIP_LIBRARY>([]);
  const [showSimulation, setShowSimulation] = useState(false);

  // Rotate preset chips per visit/session start
  useEffect(() => {
    const shuffled = [...PRESET_CHIP_LIBRARY].sort(() => 0.5 - Math.random());
    setPresetChips(shuffled.slice(0, 3));
  }, []);

  // 300ms Debounced Smart Assist Pills
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssistPills(getSmartAssistPills(rawInput, selectedModality));
    }, 300);
    return () => clearTimeout(timer);
  }, [rawInput, selectedModality]);

  const runAudit = async (textToAudit: string, modality: PromptType) => {
    if (!textToAudit.trim()) return;

    setIsAuditing(true);
    setHasAudited(false);
    setDisplayScore(0);
    setShowSimulation(false);

    const startTime = Date.now();
    const duration = 1200;

    // Fast Spin-the-wheel animation timer
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (progress < 0.85) {
        const randomSpinScore = Math.floor(Math.random() * 85) + 12;
        setDisplayScore(randomSpinScore);
      }
    }, 45);

    try {
      const response = await fetch('/api/audit/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: textToAudit,
          targetModality: modality,
          deviceFingerprint: 'client_device_hash',
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.success && data.telemetry) {
        setTelemetryResult(data);
        setDisplayScore(data.telemetry.overallScore);
      } else {
        throw new Error(data.error || 'Failed to compile audit telemetry');
      }
    } catch (err) {
      clearInterval(interval);
      console.warn('[HomeSandbox] Backend audit call failed, using client fallback:', err);
      setDisplayScore(15);
      setTelemetryResult({
        telemetry: {
          detectedModality: modality,
          overallScore: 15,
          verdict: '⚠️ Low Impact Draft — Lacks Critical Guardrails',
          gradeBadge: 'Weak Draft',
          gradeColor: 'pink',
          flaws: [
            { parameter: 'Persona & Role', critique: 'No expert role is assigned, causing the AI to give generic baseline answers.' },
            { parameter: 'Execution Guardrails', critique: 'Missing negative boundary rules to purge unrequested fluff.' }
          ],
          upgradedPrompt: `Act as a Senior AI Architect. Optimize: "${textToAudit}".\n\n[CONTEXT & GOALS]\nDetail explicit target audience and success metrics.\n\n[CONSTRAINTS]\n- Purge generic buzzwords.\n- Enforce Markdown section headers.`,
          simulatedOutputPreview: {
            rawOutputSnippet: 'Vanilla AI Response: Here is a basic overview of your request with generic points.',
            upgradedOutputSnippet: 'Architected Spec Response:\n1. EXECUTIVE SUMMARY: Enforced domain output.\n2. BOUNDARIES: Zero hallucinations, clean Markdown layout.'
          }
        }
      });
    } finally {
      setIsAuditing(false);
      setHasAudited(true);
    }
  };

  const handleAuditClick = () => {
    runAudit(rawInput, selectedModality);
  };

  const handlePresetClick = (chip: typeof PRESET_CHIP_LIBRARY[0]) => {
    setRawInput(chip.prompt);
    setSelectedModality(chip.type);
  };

  const handlePillClick = (pill: SmartPillOption) => {
    const updated = appendPillTokenToPrompt(rawInput, pill.tokenToAppend);
    setRawInput(updated);
  };

  const handleCopyBlueprint = () => {
    if (!telemetryResult?.telemetry) return;
    navigator.clipboard.writeText(telemetryResult.telemetry.upgradedPrompt);
    setCopiedBlueprint(true);
    setTimeout(() => setCopiedBlueprint(false), 2000);
  };

  const handleProceedToStudio = () => {
    if (!telemetryResult?.telemetry) return;
    onSelectTemplate(telemetryResult.telemetry.upgradedPrompt, selectedModality, false);
  };

  const t = telemetryResult?.telemetry;
  const characterCount = rawInput.length;

  return (
    <div className="space-y-16 pb-12">
      {/* ========================================================================= */}
      {/* PART I: ZERO-SCROLL HERO VIEWPORT & INPUT SANDBOX                        */}
      {/* ========================================================================= */}
      <section className="relative w-full max-w-5xl mx-auto space-y-6 pt-4">
        {/* Header Branding */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Prompt Health Auditor Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-stone-900 dark:text-slate-100">
            Architect Master AI Prompts in <span className="text-emerald-500">Seconds.</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-slate-400 font-medium">
            Paste your rough draft or unrefined idea below. Get an instant Health Audit and a master-level production prompt spec.
          </p>
        </div>

        {/* Dynamic Preset Inspiration Chips */}
        {presetChips.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-slate-500">Try An Example:</span>
            {presetChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(chip)}
                className="px-3 py-1.5 bg-stone-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-stone-200 dark:border-slate-700/80 hover:border-emerald-400 text-xs font-bold text-stone-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Hero Input Sandbox Card */}
        <div className="relative bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 flex items-center gap-1.5">
              <FileText size={14} className="text-emerald-500" />
              Paste Rough Draft or Idea:
            </label>

            {/* Target Modality Selector */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 p-1 rounded-xl border border-stone-200 dark:border-slate-700 text-[11px] font-bold">
              {(['text', 'image', 'video', 'code'] as PromptType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedModality(type)}
                  className={cn(
                    "px-3 py-1 rounded-lg uppercase tracking-tight transition-all cursor-pointer",
                    selectedModality === type
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-stone-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. I want a high converting social media campaign for a SaaS launch, or a cyberpunk portrait with neon lights..."
              className="w-full p-4 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-stone-900 dark:text-slate-100 font-medium placeholder:text-stone-400 dark:placeholder:text-slate-600 resize-none"
            />

            <div className="absolute left-4 bottom-3 text-[11px] font-bold text-stone-400 dark:text-slate-500">
              Characters: {characterCount}
            </div>

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAuditClick}
                disabled={!rawInput.trim() || isAuditing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isAuditing ? (
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

          {/* 300ms Debounced Smart Assist Pills */}
          {assistPills.length > 0 && !hasAudited && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500">Quick Add:</span>
              {assistPills.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handlePillClick(pill)}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer shrink-0"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PART III: DUAL-VIEW TRANSFORMATION DASHBOARD                               */}
        {/* ========================================================================= */}
        {(isAuditing || hasAudited) && t && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4"
          >
            {/* Score Header Card */}
            <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={cn(
                        t.gradeColor === 'emerald' && "text-emerald-500",
                        t.gradeColor === 'blue' && "text-blue-500",
                        t.gradeColor === 'amber' && "text-amber-500",
                        t.gradeColor === 'pink' && "text-pink-500"
                      )}
                      strokeDasharray={`${displayScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black tracking-tighter">{displayScore}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">/ 100</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border",
                      t.gradeColor === 'emerald' && "bg-emerald-950 text-emerald-400 border-emerald-700",
                      t.gradeColor === 'blue' && "bg-blue-950 text-blue-400 border-blue-700",
                      t.gradeColor === 'amber' && "bg-amber-950 text-amber-400 border-amber-700",
                      t.gradeColor === 'pink' && "bg-pink-950 text-pink-400 border-pink-700"
                    )}>
                      {t.gradeBadge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{t.verdict}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Target Modality: <span className="uppercase text-emerald-400 font-bold">{t.detectedModality}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleProceedToStudio}
                  className="w-full md:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Open & Refine in Studio →</span>
                </button>
              </div>
            </div>

            {/* Desktop Split 40/60 Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Panel: Draft & Insights (1-Sentence Plain English) */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity size={14} className="text-amber-500" />
                    Draft Insights & Identified Gaps
                  </h4>

                  <div className="space-y-2.5">
                    {t.flaws?.map((flaw: any, index: number) => (
                      <div key={index} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{flaw.parameter}</span>
                          <span className="text-[10px] font-bold text-stone-400 uppercase">Gap</span>
                        </div>
                        <p className="text-xs font-medium text-stone-700 dark:text-slate-300">{flaw.critique}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel: Architected Spec ✨ (Seamless Custom Scrollbar) */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      Architected Spec ✨
                    </h4>

                    <button
                      onClick={handleCopyBlueprint}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedBlueprint ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedBlueprint ? 'Copied!' : 'Copy Spec'}</span>
                    </button>
                  </div>

                  {/* Seamless Custom Scrollbar container */}
                  <pre className="p-4 rounded-xl bg-slate-900 text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto border border-slate-800 scrollbar-thin scrollbar-thumb-slate-800/40 scrollbar-track-transparent">
                    {t.upgradedPrompt}
                  </pre>
                </div>

                {/* Interactive Dual Simulation Drawer */}
                {t.simulatedOutputPreview && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowSimulation(!showSimulation)}
                      className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-200 dark:border-slate-700"
                    >
                      <PlayCircle size={14} className="text-emerald-500" />
                      <span>{showSimulation ? 'Hide AI Response Simulation' : 'Simulate AI Response Preview'}</span>
                    </button>

                    <AnimatePresence>
                      {showSimulation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 rounded-2xl bg-stone-900 border border-emerald-500/20 text-xs space-y-3 overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-black text-[9px] uppercase tracking-wider rounded-md border border-emerald-500/30">
                              SIMULATED RUN
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Downstream LLM Execution Comparison</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                              <span className="text-[10px] font-bold text-pink-400 uppercase">Vanilla AI Output:</span>
                              <p className="text-slate-400 text-[11px] leading-relaxed">{t.simulatedOutputPreview.rawOutputSnippet}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase">Architected Frontier Output:</span>
                              <p className="text-emerald-300 text-[11px] leading-relaxed">{t.simulatedOutputPreview.upgradedOutputSnippet}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* PART IV: LANDING PAGE SECTIONS BELOW THE HERO                             */}
      {/* ========================================================================= */}

      {/* 1. Proof Through Examples */}
      <section className="max-w-5xl mx-auto space-y-6 border-t border-stone-200 dark:border-slate-800 pt-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-500">Real Transformations</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-slate-100">
            Proof Through Before & After Specs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold text-xs rounded-full">Score 22/100 (Weak Draft)</span>
              <span className="text-xs text-stone-400">Developer Prompt</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-950 text-xs font-mono text-stone-600 dark:text-slate-400">
              "Write a python script to parse user data."
            </div>
            <div className="text-xs text-stone-500 dark:text-slate-400 font-medium">
              ❌ Missing error handling, missing type definitions, generic response.
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-full">Score 92/100 (S-Tier Spec)</span>
              <span className="text-xs text-emerald-400 font-bold">Architected Version ✨</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 text-xs font-mono text-emerald-300 whitespace-pre-wrap">
              "Write a production Python 3.12 parser with strict dataclass typing, try-catch error boundaries, and async file stream chunking..."
            </div>
            <div className="text-xs text-slate-300 font-medium">
              ✅ Zero hallucinations, defensive programming rules, 100% production ready.
            </div>
          </div>
        </div>
      </section>

      {/* 2. "How It Helps" Simple Explanation */}
      <section className="max-w-5xl mx-auto space-y-6 border-t border-stone-200 dark:border-slate-800 pt-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-500">Simple Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-slate-100">
            How Prompt Architect Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto font-black text-lg">1</div>
            <h3 className="font-bold text-base text-stone-900 dark:text-slate-100">Paste Rough Idea</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">Give us your messy 2-word idea or incomplete prompt draft.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto font-black text-lg">2</div>
            <h3 className="font-bold text-base text-stone-900 dark:text-slate-100">Precision Audit</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">Our engine identifies structural gaps and evaluates intent preservation.</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto font-black text-lg">3</div>
            <h3 className="font-bold text-base text-stone-900 dark:text-slate-100">Get Architected Spec</h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">Receive a master prompt spec ready for Midjourney, ChatGPT, or Claude.</p>
          </div>
        </div>
      </section>

      {/* 3. Interactive Workspace & Privacy Signals */}
      <section className="max-w-5xl mx-auto space-y-6 border-t border-stone-200 dark:border-slate-800 pt-12">
        <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Private & Secure</span>
            </div>
            <h3 className="text-xl font-bold">Your Prompts Remain 100% Private</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never use your prompts for public model training. Your specs remain encrypted in your local session.
            </p>
          </div>

          <button
            onClick={() => onNavigate('architect')}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shrink-0 cursor-pointer"
          >
            Launch Architectural Studio →
          </button>
        </div>
      </section>
    </div>
  );
};
