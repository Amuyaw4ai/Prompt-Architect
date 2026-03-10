import React, { useEffect, useState } from 'react';
import { ChatSession } from '../types';
import { Clock, MessageSquare, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils';

interface Props {
  onSelect: (session: ChatSession) => void;
  currentSessionId?: string;
}

export const ChatHistory: React.FC<Props> = ({ onSelect, currentSessionId }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting session:', error);
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
  );
};
