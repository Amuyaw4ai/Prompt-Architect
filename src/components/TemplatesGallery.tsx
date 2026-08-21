import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Template, PromptType } from '../types';
import { motion } from 'motion/react';
import { cn } from '../utils';
import { TemplateDetailModal } from './TemplateDetailModal';

interface Props {
  onSelect: (prompt: string, type: PromptType, autoSend: boolean) => void;
}

export const TemplatesGallery: React.FC<Props> = ({ onSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const displayedTemplates = showAll ? templates : templates.slice(0, 8);

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-stone-200/70 dark:border-slate-700/70 shadow-sm animate-pulse space-y-4">
                <div className="w-full h-44 bg-stone-100 dark:bg-slate-700/60 rounded-2xl" />
                <div className="flex justify-between items-center pt-2">
                  <div className="w-20 h-5 bg-stone-100 dark:bg-slate-700/60 rounded-full" />
                  <div className="w-16 h-5 bg-stone-100 dark:bg-slate-700/60 rounded-full" />
                </div>
                <div className="w-3/4 h-7 bg-stone-100 dark:bg-slate-700/60 rounded-xl" />
                <div className="w-full h-12 bg-stone-100 dark:bg-slate-700/60 rounded-xl" />
                <div className="w-36 h-5 bg-stone-100 dark:bg-slate-700/60 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayedTemplates.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setActiveTemplate(t)}
                className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-stone-200 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col"
              >
                {t.image && (
                  <div className="w-full h-48 mb-6 rounded-2xl overflow-hidden relative shrink-0">
                    <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20 transition-colors" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
                    {t.category}
                  </span>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    t.type === 'image' ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : 
                    t.type === 'video' ? "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  )}>
                    {t.type}
                  </div>
                </div>
                <h3 className="text-xl font-black text-stone-900 dark:text-slate-100 mb-3 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors relative z-10">{t.title}</h3>
                <p className="text-sm text-stone-500 dark:text-slate-400 mb-6 leading-relaxed flex-grow relative z-10">{t.description}</p>
                <div className="flex items-center gap-2 text-xs font-black text-stone-900 dark:text-slate-100 group-hover:gap-4 transition-all uppercase tracking-widest relative z-10">
                  Inspect Specification <ChevronRight size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!showAll && templates.length > 8 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAll(true)}
              className="px-8 py-4 bg-stone-100 dark:bg-slate-800 text-stone-900 dark:text-slate-100 rounded-full font-black text-xs uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              View More Templates <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Template Detail Overview Modal */}
      <TemplateDetailModal
        template={activeTemplate}
        isOpen={!!activeTemplate}
        onClose={() => setActiveTemplate(null)}
        onSelect={onSelect}
      />
    </div>
  );
};
