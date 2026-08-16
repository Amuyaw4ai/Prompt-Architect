import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css'; // Or a custom theme
import { Pencil, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
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
}

export const PromptEditor: React.FC<Props> = ({
  value,
  onChange,
  variables,
  className,
  currentVersionIndex = 0,
  totalVersions = 1,
  onPreviousVersion,
  onNextVersion
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

  // Simple auto-complete logic for variables
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '[') {
      // Trigger autocomplete
      const target = e.target as HTMLTextAreaElement;
      
      // Calculate approximate cursor position
      const textBeforeCursor = target.value.substring(0, target.selectionStart);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      const currentColumn = lines[lines.length - 1].length;
      
      // Rough estimation of pixel position (assuming ~21px line height and ~8px char width)
      const top = Math.min(currentLine * 21, 200); 
      const left = Math.min(currentColumn * 8, 300);

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
      if (val.trim()) {
        final = final.replace(new RegExp(`\\[${name}\\]`, 'g'), val);
      }
    });
    return final;
  };

  return (
    <div className={cn("relative flex flex-col rounded-2xl border border-emerald-100 dark:border-emerald-800/50 bg-white dark:bg-slate-800 shadow-inner overflow-hidden", className)}>
      <div className="flex justify-between items-center px-4 py-2 bg-stone-50 dark:bg-slate-900 border-b border-stone-100 dark:border-slate-700">
        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          {isPreview ? 'Real-time Preview' : 'Editor'}
        </span>
        <div className="flex items-center gap-2">
          {totalVersions > 1 && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-emerald-100 dark:border-emerald-800/50 shadow-2xs">
              <button 
                type="button"
                onClick={onPreviousVersion}
                disabled={currentVersionIndex === 0}
                className="p-1 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                title="Previous Version"
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
                title="Next Version"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors flex items-center gap-1.5"
            title={isPreview ? "Switch to Edit Mode" : "Switch to Preview Mode"}
          >
            {isPreview ? (
              <>
                <Pencil size={11} />
                Edit
              </>
            ) : (
              <>
                <Eye size={11} />
                Show Preview
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="relative p-4 max-h-60 overflow-y-auto">
        {isPreview ? (
          <div className="font-mono text-sm text-stone-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {getFinalPrompt()}
          </div>
        ) : (
          <Editor
            value={value}
            onValueChange={handleValueChange}
            highlight={code => Prism.highlight(code, Prism.languages.prompt, 'prompt')}
            padding={0}
            className="font-mono text-sm text-stone-800 dark:text-slate-200 leading-relaxed outline-none"
            textareaClassName="outline-none"
            onKeyDown={(e: any) => handleKeyDown(e)}
            style={{
              fontFamily: 'var(--font-mono)',
              minHeight: '100px',
            }}
          />
        )}

        {showAutocomplete && !isPreview && filteredSuggestions.length > 0 && (
          <div 
            className="absolute z-50 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl shadow-xl p-2 flex flex-col gap-1 max-h-48 overflow-y-auto"
            style={{ top: cursorPos.top, left: cursorPos.left }}
          >
            <div className="text-[10px] font-bold text-stone-400 uppercase px-2 mb-1">Suggestions</div>
            {filteredSuggestions.map(s => (
              <button
                key={s}
                onClick={() => insertSuggestion(s)}
                className="text-left px-3 py-1.5 text-xs font-mono text-stone-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {s}
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
