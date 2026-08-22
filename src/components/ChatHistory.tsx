import React, { useEffect, useState } from 'react';
import { ChatSession, PromptType } from '../types';
import { Clock, MessageSquare, Trash2, ChevronRight, Calendar, Search, Star, Edit2, Check, X, Image as ImageIcon, Video, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { getLocalChatSessions, saveLocalChatSessions } from '../utils/persistence';

interface Props {
  onSelect: (session: ChatSession) => void;
  currentSessionId?: string;
}

export const ChatHistory: React.FC<Props> = ({ onSelect, currentSessionId }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Search, Filter & Editing States
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | PromptType>('all');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  const fetchSessions = async () => {
    // Hydrate instantly from persistent local device storage first!
    const localSessions = getLocalChatSessions();
    if (localSessions.length > 0) {
      setSessions(localSessions);
    }

    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (Array.isArray(data)) {
        if (data.length > 0) {
          setSessions(data);
          saveLocalChatSessions(data);
        } else if (localSessions.length > 0) {
          // Keep local sessions if server returned empty on container restart
          setSessions(localSessions);
        } else {
          setSessions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions, using local device storage:', error);
      if (localSessions.length > 0) {
        setSessions(localSessions);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const confirmDeleteSession = async () => {
    if (!confirmDeleteId) return;
    try {
      await fetch(`/api/sessions/${confirmDeleteId}`, { method: 'DELETE' });
      setSessions(prev => {
        const updated = prev.filter(s => s.id !== confirmDeleteId);
        saveLocalChatSessions(updated);
        return updated;
      });
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const clearAllHistory = async () => {
    setConfirmDeleteAll(true);
  };

  const confirmClearAllHistory = async () => {
    try {
      await fetch('/api/sessions', { method: 'DELETE' });
      setSessions([]);
      saveLocalChatSessions([]);
      setConfirmDeleteAll(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, id: string, currentFavoriteStatus?: boolean) => {
    e.stopPropagation();
    const nextStatus = !currentFavoriteStatus;
    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, isFavorite: nextStatus } : s);
      saveLocalChatSessions(updated);
      return updated;
    });

    try {
      await fetch(`/api/sessions/${id}/favorite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: nextStatus })
      });
    } catch (error) {
      console.error('Error toggling session favorite status:', error);
    }
  };

  const startTitleEditing = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingTitleId(id);
    setEditingTitleText(currentTitle);
  };

  const handleSaveTitle = async (id: string) => {
    const trimmed = editingTitleText.trim();
    if (!trimmed) {
      setEditingTitleId(null);
      return;
    }

    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, title: trimmed } : s);
      saveLocalChatSessions(updated);
      return updated;
    });
    setEditingTitleId(null);

    try {
      await fetch(`/api/sessions/${id}/title`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed })
      });
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  };

  // Search & Filter Logic
  const filteredSessions = sessions.filter(s => {
    if (filterType === 'favorites' && !s.isFavorite) return false;
    if (filterType !== 'all' && filterType !== 'favorites' && s.currentType !== filterType) return false;
    
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = s.title.toLowerCase().includes(q);
      const msgMatch = s.messages.some(m => m.content.toLowerCase().includes(q));
      if (!titleMatch && !msgMatch) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-stone-200/70 dark:border-slate-700/70 shadow-sm animate-pulse space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-700/60" />
                <div className="w-24 h-4 rounded-md bg-stone-100 dark:bg-slate-700/60" />
              </div>
              <div className="w-3/4 h-6 rounded-lg bg-stone-100 dark:bg-slate-700/60" />
              <div className="w-full h-10 rounded-lg bg-stone-100 dark:bg-slate-700/60" />
              <div className="flex justify-between items-center pt-2">
                <div className="w-16 h-4 rounded-md bg-stone-100 dark:bg-slate-700/60" />
                <div className="w-20 h-4 rounded-md bg-stone-100 dark:bg-slate-700/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Search, Filter & Action Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[2.5rem] border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" size={18} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history by title, prompts, or messages..."
              className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-stone-900 dark:text-slate-100 font-medium"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <button
              onClick={clearAllHistory}
              disabled={sessions.length === 0}
              className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 disabled:opacity-40 disabled:pointer-events-none rounded-2xl transition-colors shrink-0"
            >
              <Trash2 size={15} />
              <span>CLEAR ALL</span>
            </button>
          </div>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All History', icon: Clock },
            { id: 'favorites', label: 'Favorites', icon: Star },
            { id: 'text', label: 'Text / Chat', icon: MessageSquare },
            { id: 'image', label: 'Image Prompts', icon: ImageIcon },
            { id: 'video', label: 'Video Motion', icon: Video },
            { id: 'code', label: 'Code Dev', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                    : "bg-stone-50 dark:bg-slate-900 text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700/50"
                )}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-stone-400 dark:text-slate-500"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid View */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-stone-100 dark:border-slate-700 shadow-sm">
          <div className="w-16 h-16 bg-stone-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-slate-500">
            <Clock size={32} />
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-slate-100 mb-2">
            {search ? 'No matching history found' : filterType === 'favorites' ? 'No favorite sessions starred' : 'No history yet'}
          </h3>
          <p className="text-stone-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
            {search ? 'Try clearing your search terms or filter selections.' : filterType === 'favorites' ? 'Star your favorite sessions to find them quickly here.' : 'Your architectural discussions will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onSelect(session)}
              className={cn(
                "group relative bg-white dark:bg-slate-800 p-6 rounded-[2rem] border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between",
                currentSessionId === session.id 
                  ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/10 dark:ring-emerald-400/10 shadow-lg" 
                  : "border-stone-200/80 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800/50"
              )}
            >
              <div>
                {/* Header row: Modality icon, favorites star, delete button */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      session.currentType === 'image' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                      session.currentType === 'video' ? "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" :
                      session.currentType === 'code' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {session.currentType === 'image' ? <ImageIcon size={20} /> :
                       session.currentType === 'video' ? <Video size={20} /> :
                       session.currentType === 'code' ? <Code size={20} /> :
                       <MessageSquare size={20} />}
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-stone-100 dark:bg-slate-700/60 text-stone-600 dark:text-slate-300">
                      {session.currentType || 'text'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Favorite Star Toggle */}
                    <button
                      onClick={(e) => toggleFavorite(e, session.id, session.isFavorite)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        session.isFavorite
                          ? "text-amber-500 fill-amber-500 bg-amber-50 dark:bg-amber-900/30 opacity-100"
                          : "text-stone-300 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400 opacity-0 group-hover:opacity-100"
                      )}
                      title={session.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star size={18} fill={session.isFavorite ? "currentColor" : "none"} />
                    </button>

                    {/* Delete Session */}
                    <button
                      onClick={(e) => deleteSession(e, session.id)}
                      className="p-2 text-stone-300 dark:text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Session Title (with inline editor) */}
                {editingTitleId === session.id ? (
                  <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(session.id);
                        if (e.key === 'Escape') setEditingTitleId(null);
                      }}
                      autoFocus
                      className="flex-1 w-full px-3 py-1.5 bg-stone-50 dark:bg-slate-900 border-2 border-emerald-500 rounded-xl text-sm font-bold text-stone-900 dark:text-slate-100 outline-none shadow-sm"
                    />
                    <button
                      onClick={() => handleSaveTitle(session.id)}
                      className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 mb-3 group/title">
                    <h3 className="font-bold text-stone-900 dark:text-slate-100 text-base line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {session.title || 'Untitled Session'}
                    </h3>
                    <button
                      onClick={(e) => startTitleEditing(e, session.id, session.title || 'Untitled Session')}
                      className="p-1 text-stone-300 hover:text-stone-600 dark:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity"
                      title="Rename title"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}

                {/* Last Message Snippet */}
                <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                  {session.messages.length > 0 ? session.messages[session.messages.length - 1].content : 'No messages'}
                </p>
              </div>

              <div>
                {/* Meta details & count badge */}
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-500 pt-3 border-t border-stone-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {session.messages.length} MSGS
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <span>Open Session Workspace</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Modals */}
      <AnimatePresence>
        {(confirmDeleteAll || confirmDeleteId) && (
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
                {confirmDeleteAll ? 'This will delete ALL chat history. This action cannot be undone.' : 'This will delete this session permanently.'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setConfirmDeleteAll(false); setConfirmDeleteId(null); }}
                  className="flex-1 py-3 text-sm font-bold text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => confirmDeleteAll ? confirmClearAllHistory() : confirmDeleteSession()}
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
