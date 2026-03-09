import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, RefreshCw, User, Bot, Plus, Sparkles, Save, MessageSquare, Clock } from 'lucide-react';
import { Message, PromptType, PromptResult, SavedPrompt, ChatSession } from '../types';
import { refinePrompt } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils';
import { PromptTypeSelector } from './PromptTypeSelector';

interface Props {
  promptType: PromptType;
  onTypeChange: (type: PromptType) => void;
  initialInput?: string;
  initialMessages?: Message[];
  initialResult?: PromptResult;
  editingPrompt?: SavedPrompt;
  currentSession?: ChatSession;
  onSessionUpdate?: (session: ChatSession) => void;
  onInputUsed?: () => void;
  onSaveSuccess?: () => void;
}

export const ChatInterface: React.FC<Props> = ({ 
  promptType, 
  onTypeChange,
  initialInput, 
  initialMessages,
  initialResult,
  editingPrompt,
  currentSession,
  onSessionUpdate,
  onInputUsed,
  onSaveSuccess
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<PromptResult | null>(initialResult || null);
  const [copied, setCopied] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Session Management
  const saveSession = async (msgs: Message[], type: PromptType) => {
    if (msgs.length === 0) return;
    
    const sessionData = {
      id: currentSession?.id || Date.now().toString(),
      title: currentSession?.title || msgs[0].content.slice(0, 30) + (msgs[0].content.length > 30 ? '...' : ''),
      messages: msgs,
      currentType: type,
    };

    try {
      const method = currentSession ? 'PUT' : 'POST';
      const url = currentSession ? `/api/sessions/${currentSession.id}` : '/api/sessions';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (onSessionUpdate) {
        onSessionUpdate({
          ...sessionData,
          updatedAt: Date.now(),
          createdAt: currentSession?.createdAt || Date.now()
        });
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  // Extract variables from prompt like [STYLE] or [SUBJECT]
  useEffect(() => {
    if (lastResult?.refinedPrompt) {
      const matches = lastResult.refinedPrompt.match(/\[[A-Z_]+\]/g);
      if (matches) {
        const uniqueVars = Array.from(new Set(matches));
        const newVars: Record<string, string> = {};
        uniqueVars.forEach(v => {
          const name = v.slice(1, -1);
          newVars[name] = variables[name] || '';
        });
        setVariables(newVars);
      } else {
        setVariables({});
      }
    }
  }, [lastResult?.refinedPrompt]);

  const getFinalPrompt = () => {
    if (!lastResult?.refinedPrompt) return '';
    let final = lastResult.refinedPrompt;
    Object.entries(variables).forEach(([name, value]) => {
      if (value.trim()) {
        final = final.replace(new RegExp(`\\[${name}\\]`, 'g'), value);
      }
    });
    return final;
  };

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
      onInputUsed?.();
    }
  }, [initialInput]);

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
    if (initialResult) setLastResult(initialResult);
  }, [initialMessages, initialResult]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const result = await refinePrompt(input, promptType, context);
      setLastResult(result);

      let assistantContent = result.explanation;
      if (result.questions && result.questions.length > 0) {
        assistantContent += "\n\n**To make this even better, could you tell me:**\n" + 
          result.questions.map(q => `- ${q}`).join('\n');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      };

      const finalMessages = [...messages, userMessage, assistantMessage];
      setMessages(finalMessages);
      saveSession(finalMessages, promptType);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error while refining your prompt. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const finalPrompt = getFinalPrompt();
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    setLastResult(null);
    if (onSessionUpdate) onSessionUpdate(undefined as any);
  };

  const handleTypeChange = (type: PromptType) => {
    onTypeChange(type);
    if (messages.length > 0) {
      saveSession(messages, type);
    }
  };

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveData, setSaveData] = useState({ title: '', tags: '' });
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    if (editingPrompt) {
      setSaveData({
        title: editingPrompt.title,
        tags: editingPrompt.tags.join(', ')
      });
    } else {
      setSaveData({ title: '', tags: '' });
    }
  }, [editingPrompt]);

  const handleSave = async () => {
    if (!lastResult || !saveData.title) return;
    try {
      const url = editingPrompt ? `/api/prompts/${editingPrompt.id}` : '/api/prompts';
      const method = editingPrompt ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveData.title,
          originalIdea: messages.find(m => m.role === 'user')?.content || '',
          refinedPrompt: lastResult.refinedPrompt,
          type: promptType,
          tags: saveData.tags.split(',').map(t => t.trim()).filter(Boolean),
          messages: messages
        })
      });
      setShowSaveModal(false);
      if (!editingPrompt) setSaveData({ title: '', tags: '' });
      onSaveSuccess?.();
      alert(editingPrompt ? 'Prompt updated successfully!' : 'Prompt saved successfully!');
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const submitFeedback = async (rating: number) => {
    if (!lastResult) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: feedbackData.comment,
          refinedPrompt: lastResult.refinedPrompt,
          type: promptType
        })
      });
      setFeedbackData({ rating, comment: '' });
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const isExpired = currentSession && (Date.now() - currentSession.createdAt) > 3600000;

  return (
    <div className="flex flex-col h-[750px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
      {isExpired && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center animate-pulse">
          Session Expired (1 Hour Limit) - Please start a new chat for fresh context
        </div>
      )}
      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-md"
            >
              <h3 className="text-3xl font-black mb-2 tracking-tight">{editingPrompt ? 'Update' : 'Save'} Prompt</h3>
              <p className="text-slate-500 mb-8">{editingPrompt ? 'Modify your saved architecture.' : 'Add this masterpiece to your library.'}</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" 
                    value={saveData.title}
                    onChange={e => setSaveData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. Cyberpunk Portrait"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={saveData.tags}
                    onChange={e => setSaveData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. neon, portrait, cinematic"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  {editingPrompt ? 'Update' : 'Save'} Prompt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Model Selector */}
      <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-4">
          <PromptTypeSelector selected={promptType} onChange={handleTypeChange} />
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Architect Active</span>
          </div>
          {currentSession && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
              <Clock size={12} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500">
                SESSION: {new Date(currentSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {editingPrompt && (
             <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
               Editing: {editingPrompt.title}
             </div>
          )}
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="text-xs font-bold text-slate-400 hover:text-pink-600 transition-colors flex items-center gap-2 group"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">CLEAR SESSION</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-slate-50/20"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500 animate-bounce">
              <Bot size={40} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">Ready to build your prompt?</p>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Enter your basic idea below and I'll architect a detailed expansion for you.</p>
            </div>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                m.role === 'user' 
                  ? 'bg-linear-to-br from-slate-800 to-slate-900 text-white' 
                  : 'bg-white border border-slate-200 text-indigo-600'
              }`}>
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm ${
                m.role === 'user' 
                  ? 'bg-linear-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 rounded-tl-none'
              }`}>
                <div className={cn("markdown-body", m.role === 'user' ? "text-white" : "text-slate-800")}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Bot size={20} className="text-indigo-600 animate-pulse" />
            </div>
            <div className="flex gap-1.5 items-center p-6 bg-white rounded-[2rem] rounded-tl-none border border-slate-100">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Result Area */}
      {lastResult?.refinedPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-8 py-6 bg-indigo-50/50 border-t border-indigo-100 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Architectural Output</span>
              <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 bg-indigo-100/50 rounded-md text-[10px] font-bold text-indigo-500">
                {getFinalPrompt().split(/\s+/).filter(Boolean).length} WORDS
              </div>
              <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 bg-emerald-100/50 rounded-md text-[10px] font-bold text-emerald-600">
                SCORE: {Math.min(100, Math.floor(getFinalPrompt().length / 10 + 40))}%
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all border border-indigo-100"
              >
                {editingPrompt ? <Save size={14} /> : <Plus size={14} />}
                {editingPrompt ? 'UPDATE' : 'SAVE'}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'COPIED!' : 'COPY FINAL'}
              </button>
              <button
                onClick={() => {
                  const final = getFinalPrompt();
                  navigator.clipboard.writeText(`\`\`\`\n${final}\n\`\`\``);
                  alert('Copied as Markdown block!');
                }}
                className="flex items-center justify-center w-10 h-10 bg-white text-slate-400 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100"
                title="Copy as Markdown Block"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Variable Filler */}
          {Object.keys(variables).length > 0 && (
            <div className="mb-6 p-4 bg-white/60 rounded-2xl border border-indigo-100/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variable Blueprints</span>
              </div>
              {Object.entries(variables).map(([name, value]) => (
                <div key={name} className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{name}</label>
                  <input 
                    type="text"
                    value={value}
                    onChange={e => setVariables(prev => ({ ...prev, [name]: e.target.value }))}
                    placeholder={`Enter ${name.toLowerCase()}...`}
                    className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-5 bg-white rounded-2xl border border-indigo-100 font-mono text-sm text-slate-800 break-words max-h-40 overflow-y-auto shadow-inner leading-relaxed">
            {getFinalPrompt()}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Rate this architecture</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitFeedback(star)}
                  className={cn(
                    "p-1 transition-all duration-300 hover:scale-125",
                    feedbackData.rating >= star ? "text-amber-400" : "text-slate-300"
                  )}
                >
                  <Sparkles size={18} fill={feedbackData.rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your idea (e.g., 'a futuristic city at night')"
            className="w-full pl-6 pr-16 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-medium shadow-inner"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
