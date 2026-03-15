import React, { useEffect, useState } from 'react';
import { ChatSession } from '../types';
import { Clock, MessageSquare, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface Props {
  onSelect: (session: ChatSession) => void;
  currentSessionId?: string;
}

export const ChatHistory: React.FC<Props> = ({ onSelect, currentSessionId }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
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
      setSessions(prev => prev.filter(s => s.id !== confirmDeleteId));
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
      setConfirmDeleteAll(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-100 dark:border-emerald-900/30 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-stone-400 dark:text-slate-500 font-medium">Loading your history...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-stone-100 dark:border-slate-700 shadow-sm">
        <div className="w-16 h-16 bg-stone-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-slate-500">
          <Clock size={32} />
        </div>
        <h3 className="text-xl font-bold text-stone-900 dark:text-slate-100 mb-2">No history yet</h3>
        <p className="text-stone-500 dark:text-slate-400">Your architectural discussions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={clearAllHistory}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 rounded-xl transition-colors"
        >
          <Trash2 size={14} />
          CLEAR ALL HISTORY
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => onSelect(session)}
          className={cn(
            "group relative bg-white dark:bg-slate-800 p-6 rounded-[2rem] border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1",
            currentSessionId === session.id 
              ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/10 dark:ring-emerald-400/10 shadow-lg" 
              : "border-stone-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800/50"
          )}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              session.currentType === 'image' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
              session.currentType === 'video' ? "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" :
              "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            )}>
              <MessageSquare size={20} />
            </div>
            <button
              onClick={(e) => deleteSession(e, session.id)}
              className="p-2 text-stone-300 dark:text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <h3 className="font-bold text-stone-900 dark:text-slate-100 mb-2 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {session.title || 'Untitled Session'}
          </h3>
          
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(session.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              {session.messages.length} MSGS
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-50 dark:border-slate-700/50 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <span>Continue Discussion</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      ))}
      </div>

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
