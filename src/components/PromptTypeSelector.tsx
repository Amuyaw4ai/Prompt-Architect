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
    { id: 'image', label: 'Image', icon: <Image size={16} />, color: 'text-indigo-600' },
    { id: 'video', label: 'Video', icon: <Video size={16} />, color: 'text-pink-600' },
    { id: 'text', label: 'Chatbot', icon: <MessageSquare size={16} />, color: 'text-amber-600' },
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
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm"
      >
        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center bg-slate-50", currentType.color)}>
          {currentType.icon}
        </div>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{currentType.label}</span>
        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selected === type.id ? "bg-white shadow-sm" : "bg-slate-100"
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
