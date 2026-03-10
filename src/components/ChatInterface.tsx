import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, RefreshCw, User, Bot, Plus, Sparkles, Save, MessageSquare, Clock, ImagePlus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Message, PromptType, PromptResult, SavedPrompt, ChatSession } from '../types';
import { refinePrompt } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn, calculatePromptScore } from '../utils';
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
  const [resultHistory, setResultHistory] = useState<PromptResult[]>(currentSession?.resultHistory || (initialResult ? [initialResult] : []));
  const [currentResultIndex, setCurrentResultIndex] = useState<number>(currentSession?.currentResultIndex ?? (initialResult ? 0 : -1));
  const lastResult = currentResultIndex >= 0 ? resultHistory[currentResultIndex] : null;
  const [copied, setCopied] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string, url: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Session Management
  const saveSession = async (msgs: Message[], type: PromptType, history?: PromptResult[], index?: number) => {
    if (msgs.length === 0) return;
    
    const sessionData = {
      id: currentSession?.id || Date.now().toString(),
      title: currentSession?.title || msgs[0].content.slice(0, 30) + (msgs[0].content.length > 30 ? '...' : ''),
      messages: msgs,
      currentType: type,
      resultHistory: history || resultHistory,
      currentResultIndex: index !== undefined ? index : currentResultIndex,
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        url: base64String // Store full base64 for persistence
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    let userContent = input;
    if (selectedImage && !input.trim()) {
      userContent = "Analyze this image and generate a highly detailed prompt that would recreate it.";
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
      imageUrl: selectedImage?.url,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const imageToSend = selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const context = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const result = await refinePrompt(userContent, promptType, context, imageToSend);
      const newHistory = [...resultHistory.slice(0, currentResultIndex + 1), result];
      const newIndex = newHistory.length - 1;
      
      setResultHistory(newHistory);
      setCurrentResultIndex(newIndex);

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
      saveSession(finalMessages, promptType, newHistory, newIndex);
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
    setResultHistory([]);
    setCurrentResultIndex(-1);
    if (onSessionUpdate) onSessionUpdate(undefined as any);
  };

  const handleResultIndexChange = (newIndex: number) => {
    setCurrentResultIndex(newIndex);
    if (messages.length > 0) {
      saveSession(messages, promptType, resultHistory, newIndex);
    }
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
    <div className="flex flex-col h-[750px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
      {isExpired && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500 dark:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center animate-pulse">
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
            className="absolute inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-stone-200 dark:border-slate-700 shadow-2xl w-full max-w-md"
            >
              <h3 className="text-3xl font-black mb-2 tracking-tight text-stone-900 dark:text-slate-100">{editingPrompt ? 'Update' : 'Save'} Prompt</h3>
              <p className="text-stone-500 dark:text-slate-400 mb-8">{editingPrompt ? 'Modify your saved architecture.' : 'Add this masterpiece to your library.'}</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" 
                    value={saveData.title}
                    onChange={e => setSaveData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-5 py-3 bg-stone-50 dark:bg-slate-900 border border-stone-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                    placeholder="e.g. Cyberpunk Portrait"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={saveData.tags}
                    onChange={e => setSaveData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-5 py-3 bg-stone-50 dark:bg-slate-900 border border-stone-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                    placeholder="e.g. neon, portrait, cinematic"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-stone-900 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-2xl text-sm font-bold hover:bg-stone-800 dark:hover:bg-emerald-400 transition-all shadow-lg shadow-stone-200 dark:shadow-none"
                >
                  {editingPrompt ? 'Update' : 'Save'} Prompt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Model Selector */}
      <div className="px-8 py-4 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50/30 dark:bg-slate-800/50">
        <div className="flex items-center gap-4">
          <PromptTypeSelector selected={promptType} onChange={handleTypeChange} />
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-stone-400 dark:text-slate-500 uppercase tracking-widest">AI Architect Active</span>
          </div>
          {currentSession && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-700 border border-stone-100 dark:border-slate-600 rounded-full shadow-sm">
              <Clock size={12} className="text-stone-400 dark:text-slate-400" />
              <span className="text-[10px] font-bold text-stone-500 dark:text-slate-300">
                SESSION: {new Date(currentSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {editingPrompt && (
             <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800/50">
               Editing: {editingPrompt.title}
             </div>
          )}
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="text-xs font-bold text-stone-400 dark:text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-2 group"
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
        className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-stone-50/20 dark:bg-slate-900/20"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
              <Bot size={40} />
            </div>
            <div>
              <p className="text-2xl font-black text-stone-900 dark:text-slate-100 tracking-tight">Ready to build your prompt?</p>
              <p className="text-stone-500 dark:text-slate-400 max-w-xs mx-auto mt-2">Enter your basic idea below and I'll architect a detailed expansion for you.</p>
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
                  ? 'bg-stone-800 dark:bg-emerald-500 text-white dark:text-slate-900' 
                  : 'bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400'
              }`}>
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm ${
                m.role === 'user' 
                  ? 'bg-emerald-600 dark:bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700 rounded-tl-none'
              }`}>
                {m.imageUrl && (
                  <img src={m.imageUrl} alt="Uploaded" className="max-w-full h-auto max-h-64 object-contain rounded-xl mb-3 border border-emerald-500/30" referrerPolicy="no-referrer" />
                )}
                <div className={cn("markdown-body", m.role === 'user' ? "text-white" : "text-stone-800 dark:text-slate-200")}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
              <Bot size={20} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <div className="flex gap-1.5 items-center p-6 bg-white dark:bg-slate-800 rounded-[2rem] rounded-tl-none border border-stone-100 dark:border-slate-700">
              <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Result Area */}
      {lastResult?.refinedPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-8 py-6 bg-emerald-50/50 dark:bg-emerald-900/10 border-t border-emerald-100 dark:border-emerald-900/30 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Architectural Output</span>
              {resultHistory.length > 1 && (
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-emerald-100 dark:border-emerald-800/50">
                  <button 
                    onClick={() => handleResultIndexChange(Math.max(0, currentResultIndex - 1))}
                    disabled={currentResultIndex === 0}
                    className="p-1 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                    title="Previous Version"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-slate-400 px-1">
                    {currentResultIndex + 1} / {resultHistory.length}
                  </span>
                  <button 
                    onClick={() => handleResultIndexChange(Math.min(resultHistory.length - 1, currentResultIndex + 1))}
                    disabled={currentResultIndex === resultHistory.length - 1}
                    className="p-1 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                    title="Next Version"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {getFinalPrompt().split(/\s+/).filter(Boolean).length} WORDS
              </div>
              <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold group relative cursor-help",
                calculatePromptScore(getFinalPrompt()).score >= 80 ? "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                calculatePromptScore(getFinalPrompt()).score >= 50 ? "bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                "bg-pink-100/50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
              )}>
                SCORE: {calculatePromptScore(getFinalPrompt()).score}%
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-50">
                  <div className="font-bold mb-1">Score Breakdown:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {calculatePromptScore(getFinalPrompt()).feedback.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full">
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex-1 justify-center flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all border border-emerald-100 dark:border-emerald-800/50 min-w-[100px]"
              >
                {editingPrompt ? <Save size={14} /> : <Plus size={14} />}
                {editingPrompt ? 'UPDATE' : 'SAVE'}
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-1 justify-center flex items-center gap-2 px-3 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all min-w-[100px]"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'COPIED!' : 'COPY'}
              </button>
              <button
                onClick={() => {
                  const final = getFinalPrompt();
                  navigator.clipboard.writeText(`\`\`\`\n${final}\n\`\`\``);
                  alert('Copied as Markdown block!');
                }}
                className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 text-stone-400 dark:text-slate-400 rounded-xl hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all border border-stone-100 dark:border-slate-700 shrink-0"
                title="Copy as Markdown Block"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>

          {/* Variable Filler */}
          {Object.keys(variables).length > 0 && (
            <div className="mb-6 p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-emerald-500 dark:text-emerald-400" />
                <span className="text-[10px] font-black text-stone-400 dark:text-slate-400 uppercase tracking-widest">Variable Blueprints</span>
              </div>
              {Object.entries(variables).map(([name, value]) => (
                <div key={name} className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider ml-1">{name}</label>
                  <input 
                    type="text"
                    value={value}
                    onChange={e => setVariables(prev => ({ ...prev, [name]: e.target.value }))}
                    placeholder={`Enter ${name.toLowerCase()}...`}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-stone-100 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-stone-300 dark:placeholder:text-slate-500 text-stone-900 dark:text-slate-100"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 font-mono text-sm text-stone-800 dark:text-slate-200 break-words max-h-40 overflow-y-auto shadow-inner leading-relaxed">
            {getFinalPrompt()}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-400 dark:text-emerald-500 uppercase tracking-widest">Rate this architecture</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitFeedback(star)}
                  className={cn(
                    "p-1 transition-all duration-300 hover:scale-125",
                    feedbackData.rating >= star ? "text-amber-400" : "text-stone-300 dark:text-slate-600"
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
      <div className="p-6 border-t border-stone-100 dark:border-slate-700 bg-white dark:bg-slate-800">
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img src={selectedImage.url} alt="Selected" className="h-24 w-24 object-cover rounded-xl border-2 border-emerald-500 shadow-sm" referrerPolicy="no-referrer" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-stone-900 dark:bg-slate-700 text-white rounded-full p-1 shadow-md hover:bg-pink-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="relative flex items-center group">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-3 p-2 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors z-10"
            title="Upload image for reverse engineering"
          >
            <ImagePlus size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your idea or upload an image..."
            className="w-full pl-12 pr-16 py-5 bg-stone-50 dark:bg-slate-900 border-2 border-transparent rounded-[2rem] focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition-all text-sm font-medium shadow-inner text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="absolute right-3 p-3 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-2xl hover:bg-emerald-700 dark:hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
