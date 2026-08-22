import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Sparkles, 
  X, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Zap, 
  RefreshCw,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { analyzePromptDiagnostic, DiagnosticResult } from '../utils/promptDiagnosticEngine';
import { PromptType } from '../types';
import { cn } from '../utils';
import { Tooltip } from './Tooltip';

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
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);

  // Sync initial prompt when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt && initialPrompt.trim().length > 0) {
        setRawInput(initialPrompt);
        runSpinningAudit(initialPrompt, initialModality);
      } else {
        setRawInput('');
        setHasAudited(false);
        setDiagnostic(null);
        setDisplayScore(0);
      }
    }
  }, [isOpen, initialPrompt, initialModality]);

  const runSpinningAudit = (textToAudit: string, modality: PromptType) => {
    if (!textToAudit.trim()) return;

    setIsAuditing(true);
    setHasAudited(false);
    setDisplayScore(0);

    // Calculate actual diagnostic output
    const result = analyzePromptDiagnostic(textToAudit, modality);
    setDiagnostic(result);

    // Spin-the-wheel animation timer (1.4 seconds of scanning & spinning)
    const startTime = Date.now();
    const duration = 1400;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Random energetic score fluctuations during spinning
      if (progress < 0.85) {
        const randomSpinScore = Math.floor(Math.random() * 90) + 10;
        setDisplayScore(randomSpinScore);
      } else {
        // Smoothly lock onto final score
        setDisplayScore(result.overallScore);
      }

      if (progress >= 1) {
        clearInterval(interval);
        setDisplayScore(result.overallScore);
        setIsAuditing(false);
        setHasAudited(true);
      }
    }, 45);
  };

  const handleAuditClick = () => {
    runSpinningAudit(rawInput, selectedModality);
  };

  const handleCopyBlueprint = () => {
    if (!diagnostic) return;
    navigator.clipboard.writeText(diagnostic.optimizedBlueprint);
    setCopiedBlueprint(true);
    setTimeout(() => setCopiedBlueprint(false), 2000);
  };

  const handleProceedToStudio = () => {
    if (!diagnostic) return;
    onApplyToStudio(diagnostic.optimizedBlueprint, rawInput);
    onClose();
  };

  if (!isOpen) return null;

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
                    Instant Diagnostic Scoring
                  </h2>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-700">
                    Industry Grade
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-slate-400 font-medium">
                  Audit your rough idea against 5 architectural prompt standards
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
                  Paste Rough Idea or Prompt:
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
                  placeholder="e.g. I want a high converting social media campaign for a SaaS launch, or a cyberpunk portrait with neon lights..."
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
                        <span>Diagnosing...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        <span>Run Diagnostic Audit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Spin-the-wheel & Diagnostic Output Area */}
            {(isAuditing || hasAudited) && (
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
                        <motion.path
                          className={cn(
                            "transition-all duration-300",
                            isAuditing ? "stroke-amber-400" :
                            (diagnostic?.overallScore || 0) >= 90 ? "stroke-emerald-400" :
                            (diagnostic?.overallScore || 0) >= 75 ? "stroke-blue-400" :
                            (diagnostic?.overallScore || 0) >= 50 ? "stroke-amber-400" : "stroke-pink-500"
                          )}
                          strokeDasharray={`${displayScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>

                      {/* Spinning Loader Overlay */}
                      {isAuditing && (
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400 animate-spin" />
                      )}

                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black tracking-tight leading-none text-white">
                          {displayScore}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                          / 100
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white tracking-tight">
                          {isAuditing ? 'Scanning Industry Criteria...' : diagnostic?.gradeLabel}
                        </h3>
                        {hasAudited && (
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                            diagnostic?.gradeColor === 'emerald' ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" :
                            diagnostic?.gradeColor === 'blue' ? "bg-blue-500/20 text-blue-300 border-blue-500/40" :
                            diagnostic?.gradeColor === 'amber' ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                            "bg-pink-500/20 text-pink-300 border-pink-500/40"
                          )}>
                            {diagnostic?.gradeBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        {isAuditing 
                          ? 'Auditing persona grounding, negative constraints, context framing, and structural blueprints...' 
                          : `Evaluated ${diagnostic?.wordCount} words against industry prompt engineering specifications.`}
                      </p>
                    </div>
                  </div>

                  {/* Primary Conversion CTA */}
                  {hasAudited && (
                    <button
                      type="button"
                      onClick={handleProceedToStudio}
                      className="w-full md:w-auto px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Sparkles size={16} className="fill-slate-950" />
                      <span>Auto-Architect & Fix Prompt →</span>
                    </button>
                  )}
                </div>

                {/* 5-Criteria Quality Breakdown */}
                {hasAudited && diagnostic && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-slate-300 flex items-center gap-2">
                      <Activity size={14} className="text-emerald-500" />
                      5-Point Industry Standards Breakdown:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(diagnostic.criteria).map(([key, item]) => {
                        const isPass = item.status === 'pass';
                        const isWarn = item.status === 'warning';

                        return (
                          <div 
                            key={key}
                            className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isPass ? (
                                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                ) : isWarn ? (
                                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                                ) : (
                                  <XCircle size={16} className="text-pink-500 shrink-0" />
                                )}
                                <span className="text-xs font-bold text-stone-900 dark:text-slate-100">
                                  {item.title}
                                </span>
                              </div>
                              <span className="text-xs font-mono font-bold text-stone-600 dark:text-slate-400">
                                {item.score} / {item.maxScore} pts
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-600 dark:text-slate-400 font-medium">
                              {item.description}
                            </p>

                            <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
                              💡 {item.suggestion}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Auto-Architected Blueprint Preview */}
                {hasAudited && diagnostic && (
                  <div className="p-5 rounded-3xl bg-stone-100 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-emerald-500" />
                        Auto-Architected Prompt Blueprint Preview:
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyBlueprint}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-stone-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedBlueprint ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          <span>{copiedBlueprint ? 'Copied Blueprint' : 'Copy Blueprint'}</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs font-mono text-stone-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                      {diagnostic.optimizedBlueprint}
                    </pre>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <p className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                        Transfer this blueprint directly into the Studio Editor to fine-tune variables and options.
                      </p>

                      <button
                        type="button"
                        onClick={handleProceedToStudio}
                        className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      >
                        <span>Open in Architectural Studio</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
