import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Image as ImageIcon, Video, Type, ArrowRight, Clock, Star, Activity, Bookmark, TrendingUp, Zap, X } from 'lucide-react';
import { PromptType, SavedPrompt } from '../types';

interface HomeProps {
  onNavigate: (view: 'architect' | 'saved' | 'templates' | 'history') => void;
  onNewArchitect: (type: PromptType) => void;
  onSelectTemplate: (content: string, type: PromptType) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onNewArchitect, onSelectTemplate }) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [recentPrompts, setRecentPrompts] = useState<SavedPrompt[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [inspirationItems, setInspirationItems] = useState<any[]>([
    { img: 'https://picsum.photos/seed/cyber/800/1000', prompt: 'Cinematic wide shot of a cyberpunk street market, neon lights reflecting in puddles, volumetric fog, 8k resolution, unreal engine 5 render.', type: 'image' },
    { img: 'https://picsum.photos/seed/fantasy/800/600', prompt: 'A majestic floating island with a glowing crystal castle, surrounded by waterfalls falling into the clouds, digital painting, fantasy art.', type: 'image' },
    { text: 'Write a comprehensive guide on quantum computing for a 10-year-old, using analogies involving toys and playgrounds.', type: 'text' },
    { img: 'https://picsum.photos/seed/portrait/800/800', prompt: 'Studio portrait of an elderly fisherman, deep wrinkles, dramatic rembrandt lighting, 85mm lens, highly detailed.', type: 'image' },
  ]);

  useEffect(() => {
    // Check if first time
    const hasVisited = localStorage.getItem('has_visited_home');
    if (!hasVisited) {
      setIsFirstTime(true);
      localStorage.setItem('has_visited_home', 'true');
    } else {
      setIsFirstTime(false);
    }

    // Fetch recent prompts
    fetch('/api/prompts')
      .then(res => res.json())
      .then(data => setRecentPrompts(data.slice(0, 4)))
      .catch(console.error);

    // Fetch templates for inspiration gallery
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const items = data.slice(0, 4).map((t: any) => ({
            img: t.image,
            text: t.type === 'text' ? t.template : undefined,
            prompt: t.template,
            type: t.type
          }));
          setInspirationItems(items);
        }
      })
      .catch(console.error);
  }, []);

  const totalGenerated = recentPrompts.length * 3 + 12;
  const totalSaved = recentPrompts.length;

  return (
    <div className="w-full pb-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Top Right Stats Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-4 px-5 py-2.5 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-sm font-bold text-stone-700 dark:text-slate-200 group"
            title="View Detailed Stats"
          >
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span>{totalGenerated} <span className="hidden sm:inline text-stone-400 dark:text-slate-500 font-medium">Generated</span></span>
            </div>
            <div className="w-px h-4 bg-stone-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span>{totalSaved} <span className="hidden sm:inline text-stone-400 dark:text-slate-500 font-medium">Saved</span></span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Welcome & Quick Actions */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              
              <h1 className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-slate-100 mb-4 tracking-tight relative z-10">
                {isFirstTime ? "Welcome to Prompt Architect." : "Welcome back, Architect."}
              </h1>
              <p className="text-lg text-stone-500 dark:text-slate-400 mb-10 max-w-xl relative z-10">
                {isFirstTime 
                  ? "Engineer the perfect AI prompt in seconds. Choose a modality below to start building your first architecture."
                  : "Ready to build? Jump back into your recent projects or start a fresh architecture."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                <button onClick={() => onNewArchitect('text')} className="flex flex-col items-center justify-center gap-3 p-6 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Type className="text-emerald-600 dark:text-emerald-400" size={24} />
                  </div>
                  <span className="font-bold text-stone-900 dark:text-slate-100">Text Prompt</span>
                </button>
                <button onClick={() => onNewArchitect('image')} className="flex flex-col items-center justify-center gap-3 p-6 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <ImageIcon className="text-emerald-600 dark:text-emerald-400" size={24} />
                  </div>
                  <span className="font-bold text-stone-900 dark:text-slate-100">Image Prompt</span>
                </button>
                <button onClick={() => onNewArchitect('video')} className="flex flex-col items-center justify-center gap-3 p-6 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Video className="text-emerald-600 dark:text-emerald-400" size={24} />
                  </div>
                  <span className="font-bold text-stone-900 dark:text-slate-100">Video Prompt</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                  <Star size={20} className="text-amber-500" />
                  Inspiration Gallery
                </h2>
                <button 
                  onClick={() => onNavigate('templates')} 
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  View more in templates <ArrowRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inspirationItems.map((item, i) => (
                  <div key={i} className="relative group rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm h-48">
                    {item.img ? (
                      <img src={item.img} alt="Gallery item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="p-6 h-full flex items-center justify-center bg-stone-50 dark:bg-slate-900">
                        <Type size={32} className="text-stone-300 dark:text-slate-700 absolute top-4 right-4" />
                        <p className="text-stone-700 dark:text-slate-300 font-medium text-sm leading-relaxed line-clamp-4">"{item.text}"</p>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-stone-900/90 dark:bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {item.type === 'image' ? <ImageIcon size={14} className="text-emerald-400" /> : <Type size={14} className="text-emerald-400" />}
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{item.type} Prompt</span>
                        </div>
                        <p className="text-white text-xs leading-relaxed line-clamp-4">
                          {item.prompt || item.text}
                        </p>
                      </div>
                      <button 
                        onClick={() => onSelectTemplate(item.prompt || item.text || '', item.type as PromptType)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <Sparkles size={14} /> Use Architecture
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock size={18} className="text-stone-400" />
                  Recent Work
                </h3>
                <button onClick={() => onNavigate('saved')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  View all
                </button>
              </div>
              
              {recentPrompts.length > 0 ? (
                <div className="space-y-4">
                  {recentPrompts.map(prompt => (
                    <div key={prompt.id} onClick={() => onNavigate('saved')} className="p-4 rounded-xl bg-stone-50 dark:bg-slate-900/50 border border-stone-100 dark:border-slate-700/50 hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <h4 className="font-semibold text-sm text-stone-900 dark:text-slate-100 mb-1 truncate">{prompt.title}</h4>
                      <p className="text-xs text-stone-500 dark:text-slate-400 truncate">{prompt.refinedPrompt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-stone-500 dark:text-slate-400 mb-4">No saved prompts yet.</p>
                  <button onClick={() => onNewArchitect('text')} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg">
                    Create your first
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Stats Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatsModal(false)}
              className="absolute inset-0 bg-stone-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-stone-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-stone-900 dark:text-slate-100">Your Architecture Stats</h2>
                    <p className="text-sm text-stone-500 dark:text-slate-400">A detailed breakdown of your creative output.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowStatsModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 dark:bg-slate-700 text-stone-500 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-stone-50 dark:bg-slate-900 rounded-2xl p-6 border border-stone-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-stone-500 dark:text-slate-400 mb-2">
                      <Activity size={16} />
                      <span className="text-sm font-bold uppercase tracking-wider">Total Generated</span>
                    </div>
                    <div className="text-5xl font-black text-stone-900 dark:text-slate-100">{totalGenerated}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                      <Bookmark size={16} />
                      <span className="text-sm font-bold uppercase tracking-wider">Saved to Library</span>
                    </div>
                    <div className="text-5xl font-black text-emerald-700 dark:text-emerald-300">{totalSaved}</div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-stone-900 dark:text-slate-100 mb-4 uppercase tracking-wider">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                        <ImageIcon size={16} />
                      </div>
                      <span className="font-semibold text-stone-700 dark:text-slate-200">Top Modality</span>
                    </div>
                    <span className="font-bold text-stone-900 dark:text-slate-100">Image Prompts (68%)</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                        <Zap size={16} />
                      </div>
                      <span className="font-semibold text-stone-700 dark:text-slate-200">Efficiency Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-stone-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                      <span className="font-bold text-stone-900 dark:text-slate-100">92%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                        <Clock size={16} />
                      </div>
                      <span className="font-semibold text-stone-700 dark:text-slate-200">Estimated Time Saved</span>
                    </div>
                    <span className="font-bold text-stone-900 dark:text-slate-100">~4h 20m</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
