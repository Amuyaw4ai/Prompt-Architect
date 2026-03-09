import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SavedPrompts } from './components/SavedPrompts';
import { TemplatesGallery } from './components/TemplatesGallery';
import { ChatHistory } from './components/ChatHistory';
import { PromptType, SavedPrompt, ChatSession } from './types';
import { Sparkles, Info, Bookmark, Layout, Terminal, History, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'architect' | 'saved' | 'templates' | 'history';

export default function App() {
  const [promptType, setPromptType] = useState<PromptType>('image');
  const [currentView, setCurrentView] = useState<View>('architect');
  const [prefilledPrompt, setPrefilledPrompt] = useState<{content: string, type: PromptType} | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | undefined>(undefined);
  const [currentSession, setCurrentSession] = useState<ChatSession | undefined>(undefined);

  const handleTemplateSelect = (content: string, type: PromptType) => {
    setPrefilledPrompt({ content, type });
    setPromptType(type);
    setEditingPrompt(undefined);
    setCurrentSession(undefined);
    setCurrentView('architect');
  };

  const handleEditPrompt = (prompt: SavedPrompt) => {
    setEditingPrompt(prompt);
    setPromptType(prompt.type);
    setCurrentSession(undefined);
    setCurrentView('architect');
  };

  const handleNewArchitect = () => {
    setEditingPrompt(undefined);
    setPrefilledPrompt(null);
    setCurrentSession(undefined);
    setCurrentView('architect');
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setPromptType(session.currentType);
    setEditingPrompt(undefined);
    setPrefilledPrompt(null);
    setCurrentView('architect');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleNewArchitect}>
            <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight gradient-text">Prompt Architect</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
            {[
              { id: 'architect', label: 'Architect', icon: <Terminal size={16} /> },
              { id: 'templates', label: 'Templates', icon: <Layout size={16} /> },
              { id: 'history', label: 'History', icon: <History size={16} /> },
              { id: 'saved', label: 'Library', icon: <Bookmark size={16} /> },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  if (v.id === 'architect' && currentView !== 'architect') {
                    handleNewArchitect();
                  } else {
                    setCurrentView(v.id as View);
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === v.id 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {v.icon}
                {v.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleNewArchitect}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              title="New Chat"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">NEW CHAT</span>
            </button>
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              title="How it works"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <AnimatePresence mode="wait">
          {currentView === 'architect' && (
            <motion.div
              key="architect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <ChatInterface 
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
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Prompt Library</h2>
                <p className="text-lg text-slate-500">Your collection of refined architectural masterpieces.</p>
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
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Chat History</h2>
                  <p className="text-lg text-slate-500">Pick up where you left off in your architectural journeys.</p>
                </div>
                <button 
                  onClick={handleNewArchitect}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
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
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Architectural Blueprints</h2>
                <p className="text-lg text-slate-500">Pre-designed templates to jumpstart your creative process.</p>
              </div>
              <TemplatesGallery onSelect={handleTemplateSelect} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it Works Section */}
        <section className="mt-24 border-t border-slate-200 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-semibold mb-4">How Prompt Architect Works</h2>
            <p className="text-slate-500">We use advanced AI to bridge the gap between your initial idea and the detailed technical language AI models crave.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "1. Select your target",
                desc: "Choose whether you're building for Image, Video, or Text models. Each has its own 'language' of parameters.",
                icon: <Sparkles className="text-indigo-500" />
              },
              {
                title: "2. Describe your idea",
                desc: "Start with something simple. Our AI will analyze your intent and start expanding the details.",
                icon: <Sparkles className="text-emerald-500" />
              },
              {
                title: "3. Refine with AI",
                desc: "The Architect may ask you specific questions to narrow down the style, lighting, or tone for the perfect result.",
                icon: <Sparkles className="text-amber-500" />
              }
            ].map((step, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready for a new project?</h3>
              <p className="text-slate-500">Start a fresh architectural discussion with our AI.</p>
            </div>
            <button 
              onClick={handleNewArchitect}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
            >
              <PlusCircle size={20} />
              START NEW CHAT
            </button>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2024 Prompt Architect. Crafted for creators.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-slate-900">Privacy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-900">Terms</a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-900">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
