import React, { useState, useEffect } from 'react';
import { Edit3, Save, Trash2, Copy, Check } from 'lucide-react';

export const Scratchpad: React.FC = () => {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('prompt_architect_scratchpad');
    if (saved) setContent(saved);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('prompt_architect_scratchpad', content);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your scratchpad?')) {
      setContent('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50/30 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Edit3 size={16} />
          </div>
          <span className="text-sm font-bold text-stone-800 dark:text-slate-200">Scratchpad</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Copy all"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button 
            onClick={handleClear}
            className="p-2 text-stone-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            title="Clear scratchpad"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-6 bg-stone-50/20 dark:bg-slate-900/20">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Jot down ideas, paste reference links, or manually tweak your prompts here. This space is yours and saves automatically..."
          className="w-full h-full resize-none bg-transparent border-none outline-none text-sm text-stone-700 dark:text-slate-300 placeholder:text-stone-400 dark:placeholder:text-slate-600 leading-relaxed font-mono"
        />
      </div>
    </div>
  );
};
