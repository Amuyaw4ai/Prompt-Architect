import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SavedPrompts } from './components/SavedPrompts';
import { TemplatesGallery } from './components/TemplatesGallery';
import { ChatHistory } from './components/ChatHistory';
import { Home } from './components/Home';
import { PromptType, SavedPrompt, ChatSession } from './types';
import { Sparkles, Moon, Sun, PlusCircle, RefreshCw, MessageSquare, FileCode } from 'lucide-react';
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
  
  const [isLocalMode, setIsLocalMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('prompt_architect_engine_mode');
    return saved ? saved === 'local' : true;
  });

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

  const handleToggleLocalMode = (isLocal: boolean) => {
    setIsLocalMode(isLocal);
    localStorage.setItem('prompt_architect_engine_mode', isLocal ? 'local' : 'live');
  };

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
      {/* Professional Studio Header */}
      <header className="border-b border-stone-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shrink-0 z-50 shadow-xs">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left Cluster: Hamburger Menu + Brand Logo + View Badge */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Hamburger button (Left side, opens left slide drawer) */}
            <NavigationMenu 
              currentView={currentView} 
              onViewChange={setCurrentView} 
              isLocalMode={isLocalMode}
              onToggleLocalMode={handleToggleLocalMode}
              onClearSession={handleClearSession}
              onNewChat={handleNewArchitect}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              hasActiveSession={Boolean(currentSession || editingPrompt || prefilledPrompt)}
            />

            {/* Clickable Brand Logo & Title */}
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0 text-left"
              title="Go to Home"
              aria-label="Prompt Architect Home"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-400 dark:from-emerald-500 dark:to-teal-300 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-5 h-5 text-white dark:text-slate-950" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black sm:text-base tracking-tight text-stone-900 dark:text-slate-100 whitespace-nowrap group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Prompt Architect
                  </h1>
                  <span className="hidden md:inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                    {currentView === 'architect' ? 'Studio' : currentView === 'saved' ? 'Library' : currentView.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 dark:text-slate-400 font-medium -mt-0.5 hidden sm:inline-block">
                  Multimodal Engineering Platform
                </span>
              </div>
            </button>
          </div>

          {/* Center Cluster: Target Modality Selector */}
          <div className="flex items-center justify-center shrink-0">
            <PromptTypeSelector 
              selected={promptType} 
              onChange={(type) => {
                setPromptType(type);
                if (currentView !== 'architect') setCurrentView('architect');
              }} 
            />
          </div>

          {/* Right Cluster: AI Engine Badge + Theme Toggle + New Chat Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Active AI Engine Badge Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100/70 dark:bg-slate-800/70 border border-stone-200/60 dark:border-slate-700/60 text-xs font-semibold text-stone-700 dark:text-slate-300">
              <span className={cn("w-2 h-2 rounded-full animate-pulse", isLocalMode ? "bg-amber-500" : "bg-emerald-500")} />
              <span className="text-[11px] font-bold">
                {isLocalMode ? "Offline Engine" : "Gemini Live"}
              </span>
            </div>

            {/* Clear session button on desktop header */}
            {currentView === 'architect' && (currentSession || editingPrompt || prefilledPrompt) && (
              <button 
                onClick={handleClearSession}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-stone-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 bg-stone-100/40 dark:bg-slate-800/40 hover:bg-pink-50 dark:hover:bg-pink-950/30 rounded-xl text-xs font-bold transition-all border border-stone-200/50 dark:border-slate-700/50 shrink-0"
                title="Clear current session"
              >
                <RefreshCw size={13} className="hover:rotate-180 transition-transform duration-500" />
                <span>CLEAR</span>
              </button>
            )}

            {/* Dark/Light Mode Switcher */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-stone-200/80 dark:border-slate-700/80 bg-stone-100/60 dark:bg-slate-800/60 text-stone-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400 transition-all shrink-0 shadow-2xs"
              title="Toggle Appearance Theme"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-stone-600" />}
            </button>

            {/* New Chat Primary CTA */}
            <button 
              onClick={handleNewArchitect}
              className="h-9 px-3 sm:px-3.5 text-xs flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white dark:text-slate-950 rounded-xl font-extrabold shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 dark:hover:from-emerald-400 dark:hover:to-teal-400 transition-all shrink-0 whitespace-nowrap active:scale-95"
              title="Start New Architect Session"
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

      {/* Main Content Area */}
      {currentView === 'architect' ? (
        <main className="flex-1 h-[calc(100dvh-7.5rem)] lg:h-[calc(100dvh-4rem)] w-full max-w-[1800px] mx-auto px-2 sm:px-4 py-2 min-h-0 overflow-hidden flex flex-col">
          <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">
            <ChatInterface 
              key={chatKey}
              promptType={promptType} 
              onTypeChange={setPromptType}
              isLocalMode={isLocalMode}
              onLocalModeChange={handleToggleLocalMode}
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
                  © 2026 Prompt Architect Studio. Crafted for creators.
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
