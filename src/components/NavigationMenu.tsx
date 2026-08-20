import React, { useState, useEffect } from 'react';
import { Terminal, Layout, History, Bookmark, Menu, X, Home as HomeIcon, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

type View = 'home' | 'architect' | 'saved' | 'templates' | 'history';

interface Props {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const NavigationMenu: React.FC<Props> = ({ currentView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { id: View; label: string; description: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', description: 'Overview & quick start', icon: <HomeIcon size={18} /> },
    { id: 'architect', label: 'Architect Workspace', description: 'Prompt studio & refinement', icon: <Terminal size={18} /> },
    { id: 'templates', label: 'Templates', description: 'Pre-designed blueprints', icon: <Layout size={18} /> },
    { id: 'history', label: 'History', description: 'Past prompt iterations', icon: <History size={18} /> },
    { id: 'saved', label: 'Saved Library', description: 'Your saved collections', icon: <Bookmark size={18} /> },
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

  return (
    <>
      {/* Desktop Navigation (>=lg) */}
      <nav className="hidden lg:flex items-center gap-1.5" aria-label="Desktop Navigation">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 shadow-2xs"
                  : "text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-100/70 dark:hover:bg-slate-800/70 border border-transparent"
              )}
            >
              {item.icon}
              <span>{item.label === 'Architect Workspace' ? 'Architect' : item.label === 'Saved Library' ? 'Library' : item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile & Tablet Hamburger Button (<lg) */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="h-8 w-8 p-0 shrink-0 flex items-center justify-center rounded-lg border border-stone-200/60 dark:border-slate-700/60 bg-stone-100/30 dark:bg-slate-800/30 text-stone-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400 transition-all shadow-2xs"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu size={16} />
        </button>

        {/* Full-Screen Portal Stacking: Slide-Over Drawer & Blurred Backdrop Overlay */}
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[990] overflow-hidden">
              {/* True Viewport Overlay: Backdrop Blur with Outside Click Dismissal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[995] cursor-pointer"
                aria-hidden="true"
              />

              {/* Drawer Content - 100% Solid Dark Surface sitting above Backdrop */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-[1000] bg-[#090d16] text-white border-r border-slate-800 p-5 shadow-2xl flex flex-col justify-between"
                role="dialog"
                aria-label="Mobile Navigation"
              >
                {/* Drawer Header */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <button
                      onClick={() => {
                        onViewChange('home');
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2.5 text-left group"
                    >
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform shrink-0">
                        <Sparkles className="w-4 h-4 text-slate-950" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block leading-none">Prompt Architect</span>
                        <span className="text-[10px] text-slate-400 font-medium">Prompt Engineering Studio</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      aria-label="Close Navigation Menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Navigation Items */}
                  <nav className="space-y-1.5" aria-label="Drawer Links">
                    {navItems.map((item) => {
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onViewChange(item.id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all group",
                            isActive
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 shadow-xs font-bold"
                              : "text-slate-200 hover:bg-slate-800/90 hover:text-white font-medium"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                              isActive
                                ? "bg-slate-800 text-emerald-400 shadow-xs"
                                : "bg-slate-800 text-slate-400 group-hover:text-emerald-400"
                            )}>
                              {item.icon}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-100">{item.label}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{item.description}</div>
                            </div>
                          </div>
                          <ChevronRight size={14} className={cn("transition-transform text-slate-500 opacity-40 group-hover:opacity-100", isActive ? "text-emerald-400 opacity-100" : "")} />
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Drawer Footer */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-center">
                    <p className="text-[11px] font-semibold text-slate-200">Prompt Architect v2.0</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Optimized for Image, Video & Text models</p>
                  </div>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
