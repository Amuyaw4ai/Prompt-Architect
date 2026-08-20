import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import { Pencil, Eye, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

// Define custom grammar for Prompt Engineering
Prism.languages.prompt = {
  'variable': /\[[A-Z0-9_]+\]/,
  'parameter': /--[a-zA-Z0-9]+(\s+[a-zA-Z0-9.]+)?/,
  'weight': /\([a-zA-Z0-9\s]+:[0-9.]+\)/,
  'keyword': /\b(4k|8k|masterpiece|cinematic|photorealistic|unreal engine|octane render|trending on artstation)\b/i,
  'punctuation': /[,.:;()]/
};

interface Props {
  value: string;
  onChange: (val: string) => void;
  variables: Record<string, string>;
  className?: string;
  currentVersionIndex?: number;
  totalVersions?: number;
  onPreviousVersion?: () => void;
  onNextVersion?: () => void;
  isCompact?: boolean;
  isTransforming?: boolean;
  transformingName?: string;
}

export const PromptEditor: React.FC<Props> = ({
  value,
  onChange,
  variables,
  className,
  currentVersionIndex = 0,
  totalVersions = 1,
  onPreviousVersion,
  onNextVersion,
  isCompact = false,
  isTransforming = false,
  transformingName = ''
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [cursorPos, setCursorPos] = useState({ top: 0, left: 0 });
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');

  const ALL_SUGGESTIONS = [
    'SUBJECT', 'STYLE', 'LIGHTING', 'MOOD', 'CAMERA', 'RESOLUTION', 'ASPECT_RATIO',
    'TONE', 'FORMAT', 'AUDIENCE', 'PROBLEM', 'TASK', 'CONTEXT', 'ENVIRONMENT',
    'COLOR', 'PRODUCT_SERVICE', 'ACTION', 'MOTION'
  ];

  const handleValueChange = (newVal: string) => {
    onChange(newVal);
    
    if (showAutocomplete && insertIndex !== null) {
      if (newVal.length < insertIndex || newVal[insertIndex] !== '[') {
        setShowAutocomplete(false);
        setInsertIndex(null);
        setAutocompleteQuery('');
        return;
      }
      
      const textAfterBracket = newVal.substring(insertIndex + 1);
      const match = textAfterBracket.match(/^[^\]\s]*/);
      if (match) {
        setAutocompleteQuery(match[0].toUpperCase());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '[') {
      const target = e.target as HTMLTextAreaElement;
      const textBeforeCursor = target.value.substring(0, target.selectionStart);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      const currentColumn = lines[lines.length - 1].length;
      
      const top = Math.min(currentLine * 21, 220); 
      const left = Math.min(currentColumn * 8, 260);

      setCursorPos({ top, left });
      setShowAutocomplete(true);
      setInsertIndex(target.selectionStart);
      setAutocompleteQuery('');
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setInsertIndex(null);
      setAutocompleteQuery('');
    } else if (e.key === 'Enter' && showAutocomplete) {
      e.preventDefault();
      const filtered = ALL_SUGGESTIONS.filter(s => s.includes(autocompleteQuery));
      if (filtered.length > 0) {
        insertSuggestion(filtered[0]);
      }
    }
  };

  const insertSuggestion = (suggestion: string) => {
    if (insertIndex !== null) {
      const before = value.substring(0, insertIndex + 1);
      const textAfterBracket = value.substring(insertIndex + 1);
      const match = textAfterBracket.match(/^[^\]\s]*/);
      const queryLength = match ? match[0].length : 0;
      const after = value.substring(insertIndex + 1 + queryLength);
      
      onChange(before + suggestion + ']' + after);
    } else {
      onChange(value + '[' + suggestion + ']');
    }
    setShowAutocomplete(false);
    setInsertIndex(null);
    setAutocompleteQuery('');
  };

  const filteredSuggestions = ALL_SUGGESTIONS.filter(s => s.includes(autocompleteQuery));

  const getFinalPrompt = () => {
    let final = value;
    Object.entries(variables).forEach(([name, val]) => {
      if (val && val.trim()) {
        final = final.replaceAll(`[${name}]`, val);
      }
    });
    return final;
  };

  return (
    <div className={cn("relative flex flex-col h-full w-full rounded-2xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden", className)}>
      
      {/* Transformation Overlay */}
      <AnimatePresence>
        {isTransforming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-30 bg-stone-950/80 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center overflow-hidden border border-emerald-500/40 shadow-2xl"
          >
            {/* Animated Cybernetic Scan Line */}
            <motion.div
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/50"
              >
                <RefreshCw size={18} className="animate-spin text-emerald-400" />
              </motion.div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <h4 className="text-xs font-black text-white tracking-wide">
                    Transforming into {transformingName}
                  </h4>
                </div>
                <p className="text-[10px] text-stone-300 dark:text-slate-400 max-w-xs leading-tight">
                  Restructuring prompt parameters into the {transformingName} framework schema...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Header */}
      <div className={cn(
        "flex justify-between items-center bg-stone-50/90 dark:bg-slate-900/90 border-b border-stone-100 dark:border-slate-700/80 shrink-0 transition-all",
        isCompact ? "px-3 py-2 gap-1.5" : "px-4 py-2.5 gap-2"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate">
            {isPreview ? 'Real-time Preview' : 'Prompt Editor'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {totalVersions > 1 && (
            <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-stone-200 dark:border-slate-700 shadow-2xs">
              <button 
                type="button"
                onClick={onPreviousVersion}
                disabled={currentVersionIndex === 0}
                className="p-1 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                title={`Previous Version (${currentVersionIndex > 0 ? currentVersionIndex : 1}/${totalVersions})`}
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 px-1 select-none">
                {currentVersionIndex + 1} / {totalVersions}
              </span>
              <button 
                type="button"
                onClick={onNextVersion}
                disabled={currentVersionIndex === totalVersions - 1}
                className="p-1 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                title={`Next Version (${currentVersionIndex + 2 <= totalVersions ? currentVersionIndex + 2 : totalVersions}/${totalVersions})`}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsPreview(!isPreview)}
            className={cn(
              "font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/50 dark:border-emerald-800/40 transition-colors flex items-center justify-center gap-1.5",
              isCompact ? "p-1.5 text-xs" : "text-[10px] px-2.5 py-1"
            )}
            title={isPreview ? "Switch to Edit Mode" : "Switch to Preview Mode"}
            aria-label={isPreview ? "Switch to Edit Mode" : "Switch to Preview Mode"}
          >
            {isPreview ? (
              <>
                <Pencil size={12} />
                <span className="hidden sm:inline">Edit</span>
              </>
            ) : (
              <>
                <Eye size={12} />
                <span className="hidden sm:inline">Preview</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Editor Body - Scrollable content */}
      <div className="relative p-4 pb-20 lg:pb-28 flex-1 min-h-0 overflow-y-auto no-scrollbar [mask-image:linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent_100%)]">
        {isPreview ? (
          <div className="font-mono text-sm text-stone-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {getFinalPrompt() || (
              <span className="text-stone-400 dark:text-slate-500 italic">No prompt generated yet. Type your idea in the chat below.</span>
            )}
          </div>
        ) : (
          <div className="relative min-h-full">
            {!value && (
              <div className="absolute inset-0 pointer-events-none text-stone-300 dark:text-slate-600 font-mono text-sm leading-relaxed select-none">
                // Prompt Architect Editor
                <br />
                // Type your prompt here or start a conversation in the chat...
              </div>
            )}
            <Editor
              value={value}
              onValueChange={handleValueChange}
              highlight={code => Prism.highlight(code || '', Prism.languages.prompt, 'prompt')}
              padding={0}
              className="font-mono text-sm text-stone-800 dark:text-slate-200 leading-relaxed outline-none min-h-[140px]"
              textareaClassName="outline-none"
              onKeyDown={(e: any) => handleKeyDown(e)}
              style={{
                fontFamily: 'var(--font-mono)',
                minHeight: '100%',
              }}
            />
          </div>
        )}

        {/* Bottom Spacer to ensure full scroll travel above floating dock */}
        <div className="h-16 lg:h-24 shrink-0 pointer-events-none" aria-hidden="true" />

        {/* Bracket Variable Autocomplete Dropdown */}
        {showAutocomplete && !isPreview && filteredSuggestions.length > 0 && (
          <div 
            className="absolute z-50 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl shadow-xl p-2 flex flex-col gap-1 max-h-48 overflow-y-auto"
            style={{ top: cursorPos.top, left: cursorPos.left }}
          >
            <div className="text-[10px] font-bold text-stone-400 uppercase px-2 mb-1 flex items-center gap-1">
              <Sparkles size={10} className="text-emerald-500" />
              <span>Variables</span>
            </div>
            {filteredSuggestions.map(s => (
              <button
                key={s}
                onClick={() => insertSuggestion(s)}
                className="text-left px-3 py-1.5 text-xs font-mono text-stone-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                [{s}]
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Custom CSS for Prism inside this component */}
      <style>{`
        .token.variable { color: #10b981; font-weight: bold; }
        .token.parameter { color: #8b5cf6; }
        .token.weight { color: #f59e0b; }
        .token.keyword { color: #3b82f6; font-weight: bold; }
        .token.punctuation { color: #94a3b8; }
        .dark .token.variable { color: #34d399; }
        .dark .token.parameter { color: #a78bfa; }
        .dark .token.weight { color: #fbbf24; }
        .dark .token.keyword { color: #60a5fa; }
      `}</style>
    </div>
  );
};
