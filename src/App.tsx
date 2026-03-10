import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SavedPrompts } from './components/SavedPrompts';
import { TemplatesGallery } from './components/TemplatesGallery';
import { ChatHistory } from './components/ChatHistory';
import { PromptType, SavedPrompt, ChatSession } from './types';
import { Sparkles, Info, Bookmark, Layout, Terminal, History, PlusCircle, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { NavigationMenu } from './components/NavigationMenu';
import { Scratchpad } from './components/Scratchpad';

type View = 'architect' | 'saved' | 'templates' | 'history';

export default function App() {
  const [promptType, setPromptType] = useState<PromptType>('image');
  const [currentView, setCurrentView] = useState<View>('architect');
  const [prefilledPrompt, setPrefilledPrompt] = useState<{content: string, type: PromptType} | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | undefined>(undefined);
  const [currentSession, setCurrentSession] = useState<ChatSession | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatKey, setChatKey] = useState<number>(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleTemplateSelect = (content: string, type: PromptType) => {
    setPrefilledPrompt({ content, type });
    setPromptType(type);
    setEditingPrompt(undefined);
    setCurrentSession(undefined);
    setCurrentView('architect');
    setChatKey(prev => prev + 1);
  };

  const handleEditPrompt = (prompt: SavedPrompt) => {
    setEditingPrompt(prompt);
    setPromptType(prompt.type);
    setCurrentSession(undefined);
    setCurrentView('architect');
    setChatKey(prev => prev + 1);
  };

  const handleNewArchitect = () => {
    setEditingPrompt(undefined);
    setPrefilledPrompt(null);
    setCurrentSession(undefined);
    setCurrentView('architect');
    setChatKey(prev => prev + 1);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setPromptType(session.currentType);
    setEditingPrompt(undefined);
    setPrefilledPrompt(null);
    setCurrentView('architect');
    setChatKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-auto py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={handleNewArchitect}>
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 group-hover:scale-110 transition-transform">
                <Sparkles size={20} className="text-white dark:text-slate-900" />
              </div>
              <h1 className="font-bold text-xl tracking-tight text-stone-800 dark:text-slate-100">Prompt Architect</h1>
            </div>
            
            <div className="flex sm:hidden items-center gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400 transition-all"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={handleNewArchitect}
                className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"
              >
                <PlusCircle size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NavigationMenu currentView={currentView} onViewChange={setCurrentView} />
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400 transition-all"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={handleNewArchitect}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all"
              title="New Chat"
            >
              <PlusCircle size={16} />
              <span>NEW CHAT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {currentView === 'architect' && (
            <motion.div
              key="architect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col lg:flex-row gap-6"
            >
              <div className="flex-1 min-w-0">
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
                  onSaveSuccess={() => {}}
                />
              </div>
              <div className="w-full lg:w-80 xl:w-96 shrink-0 h-[750px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
                <Scratchpad />
              </div>
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
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
    </div>
  );
}

