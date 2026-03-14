import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css'; // Or a custom theme
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
}

export const PromptEditor: React.FC<Props> = ({ value, onChange, variables, className }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [cursorPos, setCursorPos] = useState({ top: 0, left: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
      
      // Rough estimation of pixel position (assuming ~14px line height and ~8px char width)
      const top = Math.min(currentLine * 20, 200); 
      const left = Math.min(currentColumn * 8, 300);

      setCursorPos({ top, left });
      setSuggestions(['SUBJECT', 'STYLE', 'LIGHTING', 'MOOD', 'CAMERA', 'RESOLUTION', 'ASPECT_RATIO']);
      setShowAutocomplete(true);
    } else if (e.key === 'Escape' || e.key === 'Enter') {
      setShowAutocomplete(false);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    onChange(value + suggestion + ']');
    setShowAutocomplete(false);
  };

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
        <button
          onClick={() => setIsPreview(!isPreview)}
          className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
        >
          {isPreview ? 'Show Code' : 'Show Preview'}
        </button>
      </div>
      
      <div className="relative p-4 max-h-60 overflow-y-auto">
        {isPreview ? (
          <div className="font-mono text-sm text-stone-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {getFinalPrompt()}
          </div>
        ) : (
          <Editor
            value={value}
            onValueChange={onChange}
            highlight={code => Prism.highlight(code, Prism.languages.prompt, 'prompt')}
            padding={0}
            className="font-mono text-sm text-stone-800 dark:text-slate-200 leading-relaxed outline-none"
            textareaClassName="outline-none"
            onKeyDown={handleKeyDown}
            style={{
              fontFamily: 'var(--font-mono)',
              minHeight: '100px',
            }}
          />
        )}

        {showAutocomplete && !isPreview && (
          <div 
            className="absolute z-50 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl shadow-xl p-2 flex flex-col gap-1"
            style={{ top: cursorPos.top, left: cursorPos.left }}
          >
            <div className="text-[10px] font-bold text-stone-400 uppercase px-2 mb-1">Suggestions</div>
            {suggestions.map(s => (
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
