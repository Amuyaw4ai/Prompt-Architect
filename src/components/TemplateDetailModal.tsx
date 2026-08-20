import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Template, PromptType } from '../types';

interface TemplateDetailModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: string, type: PromptType, autoSend: boolean) => void;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  isOpen,
  onClose,
  onSelect
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      const initialValues: Record<string, string> = {};
      template.placeholders?.forEach(p => {
        initialValues[p] = '';
      });
      setFormValues(initialValues);
    }
  }, [template]);

  if (!template || !isOpen) return null;

  // Build the live prompt text with placeholders filled in
  const getCompiledPrompt = () => {
    let result = template.template;
    Object.entries(formValues).forEach(([key, val]) => {
      result = result.replaceAll(`[${key}]`, val.trim() || `[${key}]`);
    });
    return result;
  };

  const compiledPrompt = getCompiledPrompt();

  const handleAction = (autoSend: boolean) => {
    onSelect(compiledPrompt, template.type, autoSend);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header Bar */}
          <div className="p-6 sm:p-8 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-stone-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Template Overview & Specification
                </span>
                <h3 className="text-xl font-black text-stone-900 dark:text-slate-100 leading-tight">
                  {template.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-white bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Banner Image & Category Metadata */}
            {template.image && (
              <div className="relative w-full h-56 rounded-3xl overflow-hidden shadow-lg border border-stone-200/60 dark:border-slate-800">
                <img
                  src={template.image}
                  alt={template.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-full text-xs font-black uppercase tracking-widest">
                      {template.category}
                    </span>
                    <span className="px-3 py-1 bg-stone-900/80 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-widest border border-stone-700">
                      {template.type} Prompt
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Template Description Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-stone-400 dark:text-slate-400 flex items-center gap-2">
                <Layers size={14} className="text-emerald-500" />
                <span>Architecture Purpose & Overview</span>
              </div>
              <p className="text-stone-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal bg-stone-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-stone-200/60 dark:border-slate-800">
                {template.description}
              </p>
            </div>

            {/* Interactive Blueprint Variables / Customization Fields */}
            {template.placeholders && template.placeholders.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-widest text-stone-400 dark:text-slate-400 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Customize Template Blueprint Variables</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {template.placeholders.map((p) => (
                    <div key={p} className="space-y-2">
                      <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 capitalize">
                        {p.replace('_', ' ')}
                      </label>
                      <input
                        type="text"
                        value={formValues[p] || ''}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [p]: e.target.value }))}
                        placeholder={`Fill ${p.replace('_', ' ')}...`}
                        className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl text-xs font-medium text-stone-900 dark:text-slate-100 focus:border-emerald-500 outline-none transition-all"
                      />
                      {template.suggestions?.[p] && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {template.suggestions[p].map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => setFormValues(prev => ({ ...prev, [p]: sug }))}
                              className="px-2.5 py-1 text-[10px] font-semibold bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 hover:text-emerald-500 rounded-lg border border-stone-200 dark:border-slate-700 transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Prompt Preview Box */}
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-widest text-stone-400 dark:text-slate-400 flex items-center justify-between">
                <span>Compiled Prompt Preview</span>
                <span className="text-[10px] text-emerald-500 font-mono">
                  {compiledPrompt.length} CHARS
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-900 text-stone-200 font-mono text-xs leading-relaxed max-h-40 overflow-y-auto no-scrollbar border border-stone-800">
                {compiledPrompt}
              </div>
            </div>
          </div>

          {/* Action Footer: Choice of Loading into Input Bar vs Auto Sending */}
          <div className="p-6 sm:p-8 border-t border-stone-100 dark:border-slate-800 bg-stone-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => handleAction(false)}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-100 text-xs font-bold transition-all border border-stone-200 dark:border-slate-700 flex items-center justify-center gap-2 active:scale-95"
            >
              <BookOpen size={16} className="text-emerald-500" />
              <span>Load Prompt into Input Bar</span>
            </button>

            <button
              onClick={() => handleAction(true)}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles size={16} />
              <span>Architect & Refine Now</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
