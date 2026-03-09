import React, { useState, useEffect } from 'react';
import { Search, Tag, Calendar, Trash2, Edit3 } from 'lucide-react';
import { SavedPrompt, PromptType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface Props {
  onEdit: (prompt: SavedPrompt) => void;
}

export const SavedPrompts: React.FC<Props> = ({ onEdit }) => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<PromptType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType !== 'all') params.append('type', filterType);
      
      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
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

  useEffect(() => {
    const debounce = setTimeout(fetchPrompts, 300);
    return () => clearTimeout(debounce);
  }, [search, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, tag, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 transition-all text-sm"
          />
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          {['all', 'image', 'video', 'text'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                filterType === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
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
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{p.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded border",
                      p.type === 'image' ? "bg-purple-50 text-purple-600 border-purple-100" : 
                      p.type === 'video' ? "bg-pink-50 text-pink-600 border-pink-100" : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {p.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(p)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Edit/Reiterate"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Original Idea</span>
                  <p className="text-sm text-slate-600 line-clamp-2 italic mt-1 leading-relaxed">"{p.originalIdea}"</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Refined Architecture</span>
                  <div className="mt-2 p-4 bg-slate-50 rounded-2xl text-xs font-mono text-slate-700 line-clamp-4 border border-slate-100 shadow-inner leading-relaxed">
                    {p.refinedPrompt}
                  </div>
                </div>
              </div>

              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {p.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
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
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No saved prompts found.</p>
        </div>
      )}
    </div>
  );
};
