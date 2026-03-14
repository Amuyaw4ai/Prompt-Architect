import React, { useState, useEffect } from 'react';
import { Search, Tag, Calendar, Trash2, Edit3, Star } from 'lucide-react';
import { SavedPrompt, PromptType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface Props {
  onEdit: (prompt: SavedPrompt) => void;
}

export const SavedPrompts: React.FC<Props> = ({ onEdit }) => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<PromptType | 'all' | 'favorites'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType !== 'all' && filterType !== 'favorites') params.append('type', filterType);
      
      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        let filteredData = data;
        if (filterType === 'favorites') {
          filteredData = data.filter(p => p.isFavorite);
        }
        setPrompts(filteredData);
      } else {
        setPrompts([]);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      setPrompts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const toggleFavorite = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/prompts/${id}/favorite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentStatus })
      });
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !currentStatus } : p));
      if (filterType === 'favorites' && currentStatus) {
        setPrompts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchPrompts, 300);
    return () => clearTimeout(debounce);
  }, [search, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by title, tag, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500"
          />
        </div>
        
        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-slate-800 rounded-lg overflow-x-auto hide-scrollbar w-full md:w-auto">
          {['all', 'favorites', 'image', 'video', 'text'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all whitespace-nowrap ${
                filterType === t ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
              }`}
            >
              {t === 'favorites' ? <span className="flex items-center gap-1"><Star size={12} className="fill-current" /> Favorites</span> : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {prompts.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-stone-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20 transition-colors" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-stone-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">{p.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded border",
                      p.type === 'image' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50" : 
                      p.type === 'video' ? "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-800/50" : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50"
                    )}>
                      {p.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleFavorite(p.id, !!p.isFavorite)}
                    className={cn(
                      "p-2 rounded-xl transition-all shadow-sm",
                      p.isFavorite 
                        ? "bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50" 
                        : "bg-stone-50 dark:bg-slate-700 text-stone-400 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-500 dark:hover:text-amber-400"
                    )}
                    title={p.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Star size={16} className={p.isFavorite ? "fill-current" : ""} />
                  </button>
                  <button 
                    onClick={() => onEdit(p)}
                    className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-slate-900 transition-all shadow-sm"
                    title="Edit/Reiterate"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl hover:bg-pink-600 dark:hover:bg-pink-500 hover:text-white dark:hover:text-slate-900 transition-all shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] font-black text-emerald-400 dark:text-emerald-500 uppercase tracking-widest">Original Idea</span>
                  <p className="text-sm text-stone-600 dark:text-slate-400 line-clamp-2 italic mt-1 leading-relaxed">"{p.originalIdea}"</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-400 dark:text-emerald-500 uppercase tracking-widest">Refined Architecture</span>
                  <div className="mt-2 p-4 bg-stone-50 dark:bg-slate-900 rounded-2xl text-xs font-mono text-stone-700 dark:text-slate-300 line-clamp-4 border border-stone-100 dark:border-slate-700 shadow-inner leading-relaxed">
                    {p.refinedPrompt}
                  </div>
                </div>
              </div>

              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {p.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-700 border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isLoading && prompts.length === 0 && (
        <div className="text-center py-20 bg-stone-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-stone-200 dark:border-slate-700">
          <p className="text-stone-400 dark:text-slate-500 font-medium">No saved prompts found.</p>
        </div>
      )}
    </div>
  );
};
