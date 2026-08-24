import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Terminal, Layout, History, Bookmark, X, Home as HomeIcon, 
  ChevronRight, Sparkles, Cpu, Zap, RefreshCw, Moon, Sun,
  Sliders, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { Tooltip } from './Tooltip';

type View = 'home' | 'architect' | 'templates' | 'history';

interface NavigationMenuProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isLocalMode: boolean;
  onToggleLocalMode: (isLocal: boolean) => void;
  onClearSession: () => void;
  onNewChat: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  hasActiveSession: boolean;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  currentView,
  onViewChange,
  isLocalMode,
  onToggleLocalMode,
  onClearSession,
  onNewChat,
  isDarkMode,
  onToggleDarkMode,
  hasActiveSession,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const navItems: { id: View; label: string; description: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', description: 'Overview & quick start', icon: <HomeIcon size={18} /> },
    { id: 'architect', label: 'Architect Workspace', description: '3-Column prompt studio', icon: <Terminal size={18} /> },
    { id: 'templates', label: 'Templates', description: 'Pre-designed blueprints', icon: <Layout size={18} /> },
    { id: 'history', label: 'History & Workspace', description: 'Past sessions, versions & favorites', icon: <History size={18} /> },
  ];

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = (view: View) => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Trigger Button */}
      <Tooltip content="Open Studio Navigation & Controls" position="right">
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-2.5 rounded-xl border border-stone-200/80 dark:border-slate-800 bg-stone-100/60 dark:bg-slate-800/60 text-stone-700 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-slate-700/80 dark:hover:text-emerald-400 transition-all shadow-xs shrink-0 flex items-center gap-2 cursor-pointer"
          aria-label="Open Studio Menu"
        >
          <Sliders size={18} className="group-hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline-block text-xs font-bold text-stone-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            MENU
          </span>
        </button>
      </Tooltip>

      {/* Slide-Over Left Navigation Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Dark Overlay Backdrop */}
              <motion.div
                key="nav-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-stone-950/70 backdrop-blur-md z-[9998] cursor-pointer"
                aria-hidden="true"
              />

              {/* Left Drawer Panel */}
              <motion.aside
                key="nav-drawer-aside"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 left-0 w-80 max-w-[85vw] z-[9999] bg-stone-900 dark:bg-slate-950 text-stone-100 border-r border-stone-800 dark:border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                role="dialog"
                aria-label="Studio Navigation & Controls"
              >
                {/* Upper Section */}
                <div className="space-y-6">
                  
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-stone-800 dark:border-slate-800 pb-4">
                    <button
                      onClick={() => handleNavClick('home')}
                      className="flex items-center gap-3 text-left group"
                    >
                      <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform shrink-0">
                        <Sparkles className="w-5 h-5 text-slate-950" />
                      </div>
                      <div>
                        <span className="text-base font-black tracking-tight text-white block leading-tight">
                          Prompt Architect
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">
                          Studio v2.0
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Close Navigation Menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Section 1: TOP APPEARANCE & THEME CONTROL */}
                  <div className="space-y-2">
                    {onOpenDiagnostic && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onOpenDiagnostic();
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900/80 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck size={18} />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-black text-white">Instant Prompt Audit</div>
                            <div className="text-[10px] text-emerald-400/80 font-medium">5-Point Industry Diagnostic Scoring</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 font-bold">
                          Free
                        </span>
                      </button>
                    )}

                    <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-400 px-1 pt-1">
                      Appearance & Theme
                    </div>

                    <button
                      onClick={onToggleDarkMode}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-stone-800/80 dark:bg-slate-900/80 border border-stone-700/80 dark:border-slate-800 text-stone-200 hover:text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Appearance Mode</div>
                          <div className="text-[10px] text-stone-400 font-medium">Toggle Light / Dark theme</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 font-bold">
                        {isDarkMode ? "Dark" : "Light"}
                      </span>
                    </button>
                  </div>

                  {/* Section 2: AI Engine Switcher */}
                  <div className="space-y-2 pt-2 border-t border-stone-800 dark:border-slate-800">
                    <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-400 px-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cpu size={12} className="text-emerald-400" />
                        <span>AI Engine Selector</span>
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                        isLocalMode ? "bg-amber-950 text-amber-400 border border-amber-800/50" : "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      )}>
                        {isLocalMode ? "Offline Local" : "Cloud Gemini"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-800/50 dark:bg-slate-900/60 border border-stone-800 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => onToggleLocalMode(false)}
                          className={cn(
                            "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
                            !isLocalMode
                              ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                              : "bg-stone-800/60 dark:bg-slate-800 text-stone-400 border-transparent hover:text-white"
                          )}
                        >
                          <Zap size={13} />
                          <span>Cloud Intelligence</span>
                        </button>

                        <button
                          onClick={() => onToggleLocalMode(true)}
                          className={cn(
                            "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
                            isLocalMode
                              ? "bg-amber-600 text-white border-amber-400 shadow-md"
                              : "bg-stone-800/60 dark:bg-slate-800 text-stone-400 border-transparent hover:text-white"
                          )}
                        >
                          <Cpu size={13} />
                          <span>Local Core</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Navigation Views */}
                  <div className="space-y-2 pt-2 border-t border-stone-800 dark:border-slate-800">
                    <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-400 px-1 flex items-center gap-1.5">
                      <Sliders size={12} className="text-emerald-400" />
                      <span>Studio Views</span>
                    </div>

                    <nav className="space-y-1.5" aria-label="Main Views">
                      {navItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all group border",
                              isActive
                                ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/40 font-bold shadow-md"
                                : "bg-stone-800/40 dark:bg-slate-900/40 border-stone-800/60 dark:border-slate-850 text-stone-300 hover:bg-stone-800 hover:text-white hover:border-stone-700"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                isActive
                                  ? "bg-emerald-500 text-slate-950 font-bold"
                                  : "bg-stone-800/80 dark:bg-slate-800 text-stone-400 group-hover:text-emerald-400"
                              )}>
                                {item.icon}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{item.label}</div>
                                <div className="text-[10px] text-stone-400 dark:text-slate-400 leading-tight">{item.description}</div>
                              </div>
                            </div>
                            <ChevronRight size={14} className={cn("transition-transform text-stone-500 group-hover:text-emerald-400", isActive ? "text-emerald-400 opacity-100" : "opacity-40")} />
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Section 4: Clear Active Session */}
                  {hasActiveSession && (
                    <div className="space-y-2 pt-2 border-t border-stone-800 dark:border-slate-800">
                      {!showClearConfirm ? (
                        <button
                          onClick={() => setShowClearConfirm(true)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-800/60 hover:bg-pink-950/40 text-stone-300 hover:text-pink-300 border border-stone-800 hover:border-pink-800/50 text-xs font-bold transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <RefreshCw size={14} className="text-pink-400" />
                            <span>Clear Current Chat Context</span>
                          </div>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-pink-950 text-pink-400 border border-pink-800/40">
                            Reset
                          </span>
                        </button>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-pink-950/60 border border-pink-800/60 space-y-2">
                          <p className="text-[11px] text-pink-200 font-semibold">Clear active chat context?</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onClearSession();
                                setShowClearConfirm(false);
                                setIsOpen(false);
                              }}
                              className="flex-1 py-1 px-2 bg-pink-600 text-white text-xs font-bold rounded-lg hover:bg-pink-500 transition-colors"
                            >
                              Yes, Clear
                            </button>
                            <button
                              onClick={() => setShowClearConfirm(false)}
                              className="py-1 px-2.5 bg-stone-800 text-stone-300 text-xs font-bold rounded-lg hover:bg-stone-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Clean Simple Footer */}
                <div className="pt-4 border-t border-stone-800 dark:border-slate-800 mt-6 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>Security Protected</span>
                  </span>
                  <span className="font-mono text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">
                    v2.0
                  </span>
                </div>

              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
