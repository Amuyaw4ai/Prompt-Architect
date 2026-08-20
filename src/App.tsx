import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SavedPrompts } from './components/SavedPrompts';
import { TemplatesGallery } from './components/TemplatesGallery';
import { ChatHistory } from './components/ChatHistory';
import { Home } from './components/Home';
import { PromptType, SavedPrompt, ChatSession } from './types';
import { Sparkles, Info, Bookmark, Layout, Terminal, History, PlusCircle, Moon, Sun, Home as HomeIcon, RefreshCw, MessageSquare, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils';

import { NavigationMenu } from './components/NavigationMenu';
import { PromptTypeSelector } from './components/PromptTypeSelector';

type View = 'home' | 'architect' | 'saved' | 'templates' | 'history';

export default function App() {
  const [promptType, setPromptType] = useState<PromptType>('image');
  const [currentView, setCurrentView] = useState<View>('home');
  const [prefilledPrompt, setPrefilledPrompt] = useState<{content: string, type: PromptType} | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | undefined>(undefined);
  const [currentSession, setCurrentSession] = useState<ChatSession | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('prompt_architect_theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [chatKey, setChatKey] = useState<number>(0);
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'editor' | 'output'>('chat');
  const [mobileStats, setMobileStats] = useState<{ messageCount: number; wordCount: number; charCount: number; score: number }>({
    messageCount: 0,
    wordCount: 0,
    charCount: 0,
    score: 0
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('prompt_architect_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('prompt_architect_theme', 'light');
    }
  }, [isDarkMode]);

  const handleTemplateSelect = (content: string, type: PromptType) => {
    setPrefilledPrompt({ content, type });
    setPromptType(type);
    setEditingPrompt(undefined);
    setCurrentSession(undefined);
    setCurrentView('architect');
    setActiveMobileTab('chat');
    setChatKey(prev => prev + 1);
  };

  const handleEditPrompt = (prompt: SavedPrompt) => {
    setEditingPrompt(prompt);
    setPromptType(prompt.type);
    setCurrentSession(undefined);
    setCurrentView('architect');
    setActiveMobileTab('editor');
    setChatKey(prev => prev + 1);
  };

  const handleNewArchitect = () => {
    setEditingPrompt(undefined);
    setPrefilledPrompt(null);
    setCurrentSession(undefined);
    setCurrentView('architect');
    setActiveMobileTab('chat');
    setChatKey(prev => prev + 1);
  };

  const handleSelectSession = async (session: ChatSession) => {
    setCurrentSession(session);
    setPromptType(session.currentType);
    setPrefilledPrompt(null);
    setCurrentView('architect');
    setActiveMobileTab('chat');
    
    if (session.editingPromptId) {
      try {
        const res = await fetch('/api/prompts');
        const prompts = await res.json();
        const prompt = prompts.find((p: SavedPrompt) => p.id === session.editingPromptId);
        setEditingPrompt(prompt || undefined);
      } catch (e) {
        setEditingPrompt(undefined);
      }
    } else {
      setEditingPrompt(undefined);
    }
    
    setChatKey(prev => prev + 1);
  };

  const handleClearSession = () => {
    setPrefilledPrompt(null);
    setCurrentSession(undefined);
    setEditingPrompt(undefined);
    setActiveMobileTab('chat');
    setChatKey(prev => prev + 1);
  };

  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-stone-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger menu button for <lg screens */}
            <div className="lg:hidden shrink-0">
              <NavigationMenu currentView={currentView} onViewChange={setCurrentView} />
            </div>

            {/* Clickable Brand Logo & Text */}
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 cursor-pointer group shrink-0 text-left"
              title="Go to Home"
              aria-label="Prompt Architect Home"
            >
              <div className="hidden lg:flex w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-xl items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 group-hover:scale-110 transition-transform shrink-0">
                <Sparkles className="w-5 h-5 text-white dark:text-slate-900" />
              </div>
              <h1 className="text-sm font-semibold sm:text-base lg:text-xl lg:font-bold tracking-tight text-stone-800 dark:text-slate-100 whitespace-nowrap hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Prompt Architect
              </h1>
            </button>
          </div>
          
          {/* Desktop Navigation links (>=lg) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <NavigationMenu currentView={currentView} onViewChange={setCurrentView} />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
            <div className="shrink-0">
              <PromptTypeSelector selected={promptType} onChange={(type) => {
                setPromptType(type);
                if (currentView !== 'architect') setCurrentView('architect');
              }} />
            </div>

            {currentView === 'architect' && (currentSession || editingPrompt || prefilledPrompt) && (
              <button 
                onClick={handleClearSession}
                className="hidden sm:flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 text-stone-400 dark:text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 rounded-lg lg:rounded-xl text-xs font-bold transition-all group shrink-0"
                title="Clear current session"
              >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden md:inline">CLEAR</span>
              </button>
            )}

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-8 w-8 p-0 sm:h-9 sm:w-9 lg:h-10 lg:w-10 flex items-center justify-center rounded-lg lg:rounded-xl border border-stone-200/60 dark:border-slate-700/60 bg-stone-100/30 dark:bg-slate-800/30 text-stone-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400 transition-all shrink-0"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />}
            </button>

            <button 
              onClick={handleNewArchitect}
              className="h-8 px-2 sm:h-9 sm:px-3 text-xs lg:h-auto lg:px-4 lg:py-2 lg:text-xs flex items-center gap-1.5 lg:gap-2 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-lg lg:rounded-xl font-bold shadow-md lg:shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all shrink-0 whitespace-nowrap"
              title="New Chat"
            >
              <PlusCircle size={15} />
              <span className="hidden sm:inline">NEW CHAT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Segmented Tab Switcher (Sticky below header on <lg screens in architect view) */}
      {currentView === 'architect' && (
        <div className="lg:hidden shrink-0 px-2 sm:px-4 py-1.5 bg-stone-100/95 dark:bg-slate-800/95 border-b border-stone-200/80 dark:border-slate-700/80 backdrop-blur-md z-40">
          <div className="flex items-center justify-between bg-stone-200/70 dark:bg-slate-900/70 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveMobileTab('chat')}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeMobileTab === 'chat'
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-stone-200/50 dark:border-slate-700/50"
                  : "text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200"
              )}
            >
              <MessageSquare size={13} />
              <span>Chat</span>
              {mobileStats.messageCount > 0 && (
                <span className="px-1.5 py-0.2 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 text-[10px] font-mono rounded-full font-bold">
                  {mobileStats.messageCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveMobileTab('editor')}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeMobileTab === 'editor'
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-stone-200/50 dark:border-slate-700/50"
                  : "text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200"
              )}
            >
              <FileCode size={13} />
              <span className="hidden xs:inline">Prompt</span>
              <span>Editor</span>
              {mobileStats.wordCount > 0 && (
                <span className="px-1.5 py-0.2 bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-slate-300 text-[10px] font-mono rounded-full font-bold">
                  {mobileStats.wordCount}w
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveMobileTab('output')}
              className={cn(
                "flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                activeMobileTab === 'output'
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-stone-200/50 dark:border-slate-700/50"
                  : "text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200"
              )}
            >
              <Sparkles size={13} />
              <span>Output</span>
              {mobileStats.score > 0 && (
                <span className={cn(
                  "px-1.5 py-0.2 text-[10px] font-mono rounded-full font-bold",
                  mobileStats.score >= 80 ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" :
                  mobileStats.score >= 50 ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400" :
                  "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400"
                )}>
                  {mobileStats.score}%
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'architect' ? (
        <main className="flex-1 h-[calc(100dvh-7.5rem)] lg:h-[calc(100dvh-4rem)] w-full max-w-[1800px] mx-auto px-2 sm:px-4 py-2 min-h-0 overflow-hidden flex flex-col">
          <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">
            <ChatInterface 
              key={chatKey}
              promptType={promptType} 
              onTypeChange={setPromptType}
              initialInput={prefilledPrompt?.content}
              initialMessages={currentSession?.messages || editingPrompt?.messages}
              initialResult={editingPrompt ? { refinedPrompt: editingPrompt.refinedPrompt, explanation: 'Loaded from library.' } : undefined}
              editingPrompt={editingPrompt}
              currentSession={currentSession}
              onSessionUpdate={setCurrentSession}
              onInputUsed={() => setPrefilledPrompt(null)}
              onSaveSuccess={(savedPrompt) => setEditingPrompt(savedPrompt)}
              onSwitchVersion={handleEditPrompt}
              activeMobileTab={activeMobileTab}
              onMobileTabChange={setActiveMobileTab}
              onStatsChange={setMobileStats}
            />
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Home 
                  onNavigate={setCurrentView}
                  onNewArchitect={(type) => {
                    setPromptType(type);
                    handleNewArchitect();
                  }}
                  onSelectTemplate={handleTemplateSelect}
                />
              </motion.div>
            )}

            {currentView === 'saved' && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-12">
                  <h2 className="text-4xl font-black text-stone-900 dark:text-slate-100 mb-3 tracking-tight">Prompt Library</h2>
                  <p className="text-lg text-stone-500 dark:text-slate-400">Your collection of refined architectural masterpieces.</p>
                </div>
                <SavedPrompts onEdit={handleEditPrompt} />
              </motion.div>
            )}

            {currentView === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-black text-stone-900 dark:text-slate-100 mb-3 tracking-tight">Chat History</h2>
                    <p className="text-lg text-stone-500 dark:text-slate-400">Pick up where you left off in your architectural journeys.</p>
                  </div>
                  <button 
                    onClick={handleNewArchitect}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-2xl text-sm font-bold hover:bg-stone-800 dark:hover:bg-emerald-400 transition-all shadow-xl shadow-stone-200 dark:shadow-none"
                  >
                    <PlusCircle size={20} />
                    NEW CHAT
                  </button>
                </div>
                <ChatHistory onSelect={handleSelectSession} currentSessionId={currentSession?.id} />
              </motion.div>
            )}

            {currentView === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-12">
                  <h2 className="text-4xl font-black text-stone-900 dark:text-slate-100 mb-3 tracking-tight">Architectural Blueprints</h2>
                  <p className="text-lg text-stone-500 dark:text-slate-400">Pre-designed templates to jumpstart your creative process.</p>
                </div>
                <TemplatesGallery onSelect={handleTemplateSelect} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it Works Section */}
          <section className="mt-24 border-t border-stone-200 dark:border-slate-800 pt-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-stone-900 dark:text-slate-100">How Prompt Architect Works</h2>
              <p className="text-stone-500 dark:text-slate-400">We use advanced AI to bridge the gap between your initial idea and the detailed technical language AI models crave.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "1. Select your target",
                  desc: "Choose whether you're building for Image, Video, or Text models. Each has its own 'language' of parameters.",
                  icon: <Sparkles className="text-emerald-600 dark:text-emerald-400" />
                },
                {
                  title: "2. Describe your idea",
                  desc: "Start with something simple. Our AI will analyze your intent and start expanding the details.",
                  icon: <Sparkles className="text-teal-600 dark:text-teal-400" />
                },
                {
                  title: "3. Refine with AI",
                  desc: "The Architect may ask you specific questions to narrow down the style, lighting, or tone for the perfect result.",
                  icon: <Sparkles className="text-stone-600 dark:text-stone-400" />
                }
              ].map((step, i) => (
                <div key={i} className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-stone-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-stone-900 dark:text-slate-100">{step.title}</h3>
                  <p className="text-sm text-stone-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 border-t border-stone-200 dark:border-slate-800 bg-transparent py-12">
            <div className="w-full">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-slate-100 mb-2">Ready for a new project?</h3>
                  <p className="text-stone-500 dark:text-slate-400">Start a fresh architectural discussion with our AI.</p>
                </div>
                <button 
                  onClick={handleNewArchitect}
                  className="flex items-center gap-3 px-8 py-4 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-2xl text-sm font-bold shadow-2xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 dark:hover:bg-emerald-400 hover:scale-105 transition-all"
                >
                  <PlusCircle size={20} />
                  START NEW CHAT
                </button>
              </div>
              
              <div className="pt-8 border-t border-stone-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-stone-500 dark:text-slate-500">
                  © 2024 Prompt Architect. Crafted for creators.
                </p>
                <div className="flex items-center gap-6">
                  <a href="#" className="text-sm text-stone-500 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-300">Privacy</a>
                  <a href="#" className="text-sm text-stone-500 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-300">Terms</a>
                  <a href="#" className="text-sm text-stone-500 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-300">Support</a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}

