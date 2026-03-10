import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Layout, History, Bookmark, ChevronDown, Menu } from 'lucide-react';
import { cn } from '../utils';

type View = 'architect' | 'saved' | 'templates' | 'history';

interface Props {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const NavigationMenu: React.FC<Props> = ({ currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const views: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'architect', label: 'Architect', icon: <Terminal size={16} /> },
    { id: 'templates', label: 'Templates', icon: <Layout size={16} /> },
    { id: 'history', label: 'History', icon: <History size={16} /> },
    { id: 'saved', label: 'Library', icon: <Bookmark size={16} /> },
  ];

  const current = views.find(v => v.id === currentView) || views[0];

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
        className="flex items-center gap-2 px-4 py-2 bg-stone-100/80 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 rounded-xl hover:bg-stone-200 dark:hover:bg-slate-700 transition-all shadow-sm"
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm">
          {current.icon}
        </div>
        <span className="text-sm font-bold text-stone-700 dark:text-slate-200">{current.label}</span>
        <ChevronDown size={14} className={cn("text-stone-400 dark:text-slate-500 transition-transform ml-2", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-56 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => {
                  onViewChange(view.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  currentView === view.id
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "text-stone-500 dark:text-slate-400 hover:bg-stone-50 dark:hover:bg-slate-700 hover:text-stone-900 dark:hover:text-slate-200"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  currentView === view.id ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-stone-100 dark:bg-slate-700"
                )}>
                  {view.icon}
                </div>
                {view.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
