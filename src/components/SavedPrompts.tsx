import React, { useState, useEffect } from 'react';
import { Search, Tag, Calendar, Trash2, Edit3, Star, GitBranch, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

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
    setConfirmDeleteId(id);
  };

  const confirmDeletePrompt = async () => {
    if (confirmDeleteId === null) return;
    try {
      await fetch(`/api/prompts/${confirmDeleteId}`, { method: 'DELETE' });
      setPrompts(prev => prev.filter(p => p.id !== confirmDeleteId));
      setConfirmDeleteId(null);
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

  const toggleGroup = (groupId: number) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Group prompts by parentId
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    const groupId = prompt.parentId || prompt.id;
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(prompt);
    return acc;
  }, {} as Record<number, SavedPrompt[]>);

  // Sort groups by the most recent prompt in the group
  const sortedGroups = Object.values(groupedPrompts).sort((a, b) => {
    const maxA = Math.max(...a.map(p => p.createdAt));
    const maxB = Math.max(...b.map(p => p.createdAt));
    return maxB - maxA;
  });

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
          {sortedGroups.map((group) => {
            // Sort versions within a group (newest first)
            const sortedVersions = [...group].sort((a, b) => b.createdAt - a.createdAt);
            const mainPrompt = sortedVersions[0]; // Most recent is the "main" one shown
            const hasVersions = sortedVersions.length > 1;
            const groupId = mainPrompt.parentId || mainPrompt.id;
            const isExpanded = expandedGroups[groupId];

            return (
              <motion.div
                key={`group-${groupId}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-stone-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all group relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-stone-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight">{mainPrompt.title}</h3>
                      {hasVersions && (
                        <span className="px-2 py-0.5 bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-slate-400 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <GitBranch size={10} />
                          {sortedVersions.length} Versions
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(mainPrompt.createdAt).toLocaleDateString()}
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded border",
                        mainPrompt.type === 'image' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50" : 
                        mainPrompt.type === 'video' ? "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-800/50" : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50"
                      )}>
                        {mainPrompt.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleFavorite(mainPrompt.id, !!mainPrompt.isFavorite)}
                      className={cn(
                        "p-2 rounded-xl transition-all shadow-sm",
                        mainPrompt.isFavorite 
                          ? "bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50" 
                          : "bg-stone-50 dark:bg-slate-700 text-stone-400 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-500 dark:hover:text-amber-400"
                      )}
                      title={mainPrompt.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Star size={16} className={mainPrompt.isFavorite ? "fill-current" : ""} />
                    </button>
                    <button 
                      onClick={() => onEdit(mainPrompt)}
                      className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-slate-900 transition-all shadow-sm"
                      title="Edit/Reiterate"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(mainPrompt.id)}
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
                    <p className="text-sm text-stone-600 dark:text-slate-400 line-clamp-2 italic mt-1 leading-relaxed">"{mainPrompt.originalIdea}"</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-400 dark:text-emerald-500 uppercase tracking-widest">Refined Architecture</span>
                    <div className="mt-2 p-4 bg-stone-50 dark:bg-slate-900 rounded-2xl text-xs font-mono text-stone-700 dark:text-slate-300 line-clamp-4 border border-stone-100 dark:border-slate-700 shadow-inner leading-relaxed">
                      {mainPrompt.refinedPrompt}
                    </div>
                  </div>
                  {mainPrompt.versionNotes && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Version Notes</span>
                      <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">{mainPrompt.versionNotes}</p>
                    </div>
                  )}
                </div>

                {mainPrompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {mainPrompt.tags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-700 border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Version History Toggle */}
                {hasVersions && (
                  <div className="mt-6 pt-4 border-t border-stone-100 dark:border-slate-700">
                    <button 
                      onClick={() => toggleGroup(groupId)}
                      className="flex items-center justify-between w-full text-xs font-bold text-stone-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <GitBranch size={14} />
                        {isExpanded ? 'Hide Version History' : 'View Version History'}
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-stone-200 dark:border-slate-700">
                            {sortedVersions.slice(1).map((version, idx) => (
                              <div key={version.id} className="p-3 bg-stone-50 dark:bg-slate-900/50 rounded-xl border border-stone-100 dark:border-slate-700/50 group/version relative">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="text-[10px] font-black text-stone-400 dark:text-slate-500 uppercase tracking-widest">
                                    Version {sortedVersions.length - idx - 1} • {new Date(version.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover/version:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => onEdit(version)}
                                      className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-slate-900 transition-all"
                                      title="Load this version"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(version.id)}
                                      className="p-1.5 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-600 dark:hover:bg-pink-500 hover:text-white dark:hover:text-slate-900 transition-all"
                                      title="Delete version"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs font-mono text-stone-600 dark:text-slate-400 line-clamp-2">
                                  {version.refinedPrompt}
                                </div>
                                {version.versionNotes && (
                                  <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 italic">
                                    Note: {version.versionNotes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {!isLoading && prompts.length === 0 && (
        <div className="text-center py-20 bg-stone-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-stone-200 dark:border-slate-700">
          <p className="text-stone-400 dark:text-slate-500 font-medium">No saved prompts found.</p>
        </div>
      )}

      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-stone-200 dark:border-slate-700 shadow-2xl w-full max-w-sm text-center"
            >
              <h3 className="text-2xl font-black mb-2 text-stone-900 dark:text-slate-100">Are you sure?</h3>
              <p className="text-stone-500 dark:text-slate-400 mb-8">
                This will delete this saved prompt permanently.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3 text-sm font-bold text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeletePrompt}
                  className="flex-1 py-3 bg-pink-600 text-white rounded-xl text-sm font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 dark:shadow-none"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
