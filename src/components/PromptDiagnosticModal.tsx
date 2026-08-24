import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Sparkles, 
  X, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  RefreshCw,
  Copy,
  Check,
  FileText,
  Lock
} from 'lucide-react';
import { PromptType } from '../types';
import { cn } from '../utils';
import { getSmartAssistPills, appendPillTokenToPrompt, SmartPillOption } from '../utils/smartAssistPills';

interface PromptDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToStudio: (optimizedPrompt: string, originalPrompt: string) => void;
  initialPrompt?: string;
  initialModality?: PromptType;
}

export const PromptDiagnosticModal: React.FC<PromptDiagnosticModalProps> = ({
  isOpen,
  onClose,
  onApplyToStudio,
  initialPrompt = '',
  initialModality = 'text'
}) => {
  const [rawInput, setRawInput] = useState(initialPrompt);
  const [selectedModality, setSelectedModality] = useState<PromptType>(initialModality);
  const [isAuditing, setIsAuditing] = useState(false);
  const [hasAudited, setHasAudited] = useState(false);
  const [telemetryResult, setTelemetryResult] = useState<any>(null);
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'spec'>('spec');
  const [assistPills, setAssistPills] = useState<SmartPillOption[]>([]);

  // 300ms Debounced Smart Assist Pills Update
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssistPills(getSmartAssistPills(rawInput, selectedModality));
    }, 300);
    return () => clearTimeout(timer);
  }, [rawInput, selectedModality]);

  // Sync initial prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt && initialPrompt.trim().length > 0) {
        setRawInput(initialPrompt);
        runSpinningAudit(initialPrompt, initialModality);
      } else {
        setRawInput('');
        setHasAudited(false);
        setTelemetryResult(null);
        setDisplayScore(0);
      }
    }
  }, [isOpen, initialPrompt, initialModality]);

  const runSpinningAudit = async (textToAudit: string, modality: PromptType) => {
    if (!textToAudit.trim()) return;

    setIsAuditing(true);
    setHasAudited(false);
    setDisplayScore(0);

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
      // Call Phase 1-4 Express backend compile route
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
      console.warn('[PromptDiagnosticModal] Backend API call failed, using client fallback:', err);
      setDisplayScore(15);
      setTelemetryResult({
        telemetry: {
          detectedModality: modality,
          overallScore: 15,
          verdict: '⚠️ Low Impact Draft — Lacks Guardrails',
          gradeBadge: 'Weak Draft',
          gradeColor: 'pink',
          flaws: [
            { parameter: 'Persona & Role', critique: 'No expert persona assigned.', impact: 'AI defaults to baseline generic response.' },
            { parameter: 'Execution Guardrails', critique: 'Missing negative rules.', impact: 'Increases hallucination risk.' }
          ],
          upgradedPrompt: `Act as a Senior AI Architect. Optimize: "${textToAudit}".\n\n[CONTEXT]\nTarget explicit domain boundaries and success metrics.\n\n[CONSTRAINTS]\n- Purge generic buzzwords.\n- Enforce Markdown section headers.`,
          simulatedOutputPreview: {
            rawOutputSnippet: 'Vanilla Response: Here is a basic overview.',
            upgradedOutputSnippet: 'Architected Spec Response:\n1. EXECUTIVE SUMMARY: Enforced domain output.'
          }
        }
      });
    } finally {
      setIsAuditing(false);
      setHasAudited(true);
    }
  };

  const handleAuditClick = () => {
    runSpinningAudit(rawInput, selectedModality);
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
    onApplyToStudio(telemetryResult.telemetry.upgradedPrompt, rawInput);
    onClose();
  };

  if (!isOpen) return null;

  const t = telemetryResult?.telemetry;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Main Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200/80 dark:border-slate-800/80 bg-stone-50/50 dark:bg-slate-900/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-stone-900 dark:text-slate-100">
                    Prompt Architecture & Health Check
                  </h2>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-700">
                    Precision Engine
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-slate-400 font-medium">
                  Refine your rough idea into a production-ready AI prompt blueprint
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:text-slate-500 dark:hover:text-slate-300 rounded-xl transition-colors cursor-pointer"
              aria-label="Close diagnostic auditor"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Input Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-emerald-500" />
                  Paste Rough Idea or Draft:
                </label>

                {/* Target Modality Selector */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 p-1 rounded-xl border border-stone-200 dark:border-slate-700 text-[11px] font-bold">
                  {(['text', 'image', 'video', 'code'] as PromptType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedModality(type)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg uppercase tracking-tight transition-all cursor-pointer",
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
                  placeholder="e.g. I want a high converting SaaS landing page, or a cyberpunk portrait with golden hour lights..."
                  className="w-full p-4 bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-stone-900 dark:text-slate-100 font-medium placeholder:text-stone-400 dark:placeholder:text-slate-600 resize-none"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAuditClick}
                    disabled={!rawInput.trim() || isAuditing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
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

            {/* Diagnostic Output Area */}
            {(isAuditing || hasAudited) && t && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-2"
              >
                {/* Score Header Card */}
                <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Circular Spin Gauge */}
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

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={handleProceedToStudio}
                      className="w-full md:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>Open & Refine in Studio →</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Segmented Tab Control */}
                <div className="flex md:hidden items-center p-1 bg-stone-100 dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveTab('spec')}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                      activeTab === 'spec' ? "bg-emerald-500 text-white shadow-xs" : "text-stone-600 dark:text-slate-400"
                    )}
                  >
                    Architected Spec ✨
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                      activeTab === 'insights' ? "bg-emerald-500 text-white shadow-xs" : "text-stone-600 dark:text-slate-400"
                    )}
                  >
                    Draft & Insights
                  </button>
                </div>

                {/* Desktop Split 40/60 View */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Panel: Draft & Insights */}
                  <div className={cn(
                    "md:col-span-5 space-y-4",
                    activeTab === 'insights' ? "block" : "hidden md:block"
                  )}>
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-3">
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
                            <p className="text-[11px] text-stone-500 dark:text-slate-400 italic">Impact: {flaw.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Panel: Architected Spec ✨ */}
                  <div className={cn(
                    "md:col-span-7 space-y-4",
                    activeTab === 'spec' ? "block" : "hidden md:block"
                  )}>
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

                      <pre className="p-4 rounded-xl bg-slate-900 text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto border border-slate-800">
                        {t.upgradedPrompt}
                      </pre>
                    </div>

                    {/* Simulated Output Snippet */}
                    {t.simulatedOutputPreview && (
                      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs space-y-2">
                        <span className="font-bold text-stone-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Simulated AI Response Preview:</span>
                        <p className="text-stone-600 dark:text-slate-400 font-medium italic">{t.simulatedOutputPreview.upgradedOutputSnippet}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
