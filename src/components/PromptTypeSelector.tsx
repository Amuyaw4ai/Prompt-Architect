import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, MessageSquare, ChevronDown } from 'lucide-react';
import { PromptType } from '../types';
import { cn } from '../utils';

interface Props {
  selected: PromptType;
  onChange: (type: PromptType) => void;
}

export const PromptTypeSelector: React.FC<Props> = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const types: { id: PromptType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'image', label: 'Image', icon: <Image size={16} />, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'video', label: 'Video', icon: <Video size={16} />, color: 'text-pink-600 dark:text-pink-400' },
    { id: 'text', label: 'Chatbot', icon: <MessageSquare size={16} />, color: 'text-amber-600 dark:text-amber-400' },
  ];

  const currentType = types.find(t => t.id === selected) || types[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm"
      >
        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center bg-stone-50 dark:bg-slate-700", currentType.color)}>
          {currentType.icon}
        </div>
        <span className="text-xs font-bold text-stone-700 dark:text-slate-300 uppercase tracking-widest">{currentType.label}</span>
        <ChevronDown size={14} className={cn("text-stone-400 dark:text-slate-500 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  onChange(type.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  selected === type.id
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "text-stone-500 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-700 hover:text-stone-900 dark:hover:text-slate-200"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selected === type.id ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-stone-100 dark:bg-slate-700"
                )}>
                  {type.icon}
                </div>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
