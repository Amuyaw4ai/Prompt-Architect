import React, { useState, useEffect } from 'react';
import { Layout, Plus, ChevronRight, Sparkles } from 'lucide-react';
import { Template, PromptType } from '../types';
import { motion } from 'motion/react';
import { cn } from '../utils';

interface Props {
  onSelect: (prompt: string, type: PromptType) => void;
}

export const TemplatesGallery: React.FC<Props> = ({ onSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(setTemplates);
  }, []);

  const handleTemplateClick = (t: Template) => {
    setSelectedTemplate(t);
    const initialValues: Record<string, string> = {};
    t.placeholders.forEach(p => initialValues[p] = '');
    setFormValues(initialValues);
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    let result = selectedTemplate.template;
    Object.entries(formValues).forEach(([key, val]) => {
      result = result.replace(`[${key}]`, val || `[${key}]`);
    });
    onSelect(result, selectedTemplate.type);
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-12">
      {!selectedTemplate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => handleTemplateClick(t)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  {t.category}
                </span>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  t.type === 'image' ? "bg-purple-50 text-purple-600" : 
                  t.type === 'video' ? "bg-pink-50 text-pink-600" : "bg-amber-50 text-amber-600"
                )}>
                  {t.type}
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">{t.title}</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{t.description}</p>
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 group-hover:gap-4 transition-all uppercase tracking-widest">
                Architect Blueprint <ChevronRight size={16} className="text-indigo-600" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl max-w-3xl mx-auto relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -ml-32 -mt-32" />
          
          <button 
            onClick={() => setSelectedTemplate(null)}
            className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-10 hover:text-slate-900 transition-colors group"
          >
            <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Blueprints
          </button>
          
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                {selectedTemplate.category}
              </span>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{selectedTemplate.type}</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{selectedTemplate.title}</h2>
            <p className="text-lg text-slate-500 leading-relaxed">{selectedTemplate.description}</p>
          </div>

          <div className="space-y-8">
            {selectedTemplate.placeholders.map((p) => (
              <div key={p}>
                <label className="block text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">
                  {p.replace('_', ' ')}
                </label>
                <input
                  type="text"
                  value={formValues[p] || ''}
                  onChange={(e) => setFormValues(prev => ({ ...prev, [p]: e.target.value }))}
                  placeholder={`Define the ${p.replace('_', ' ')}...`}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-medium shadow-inner"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="w-full mt-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 hover:shadow-indigo-200 active:scale-95 uppercase tracking-widest"
          >
            <Sparkles size={24} />
            Architect Prompt
          </button>
        </motion.div>
      )}
    </div>
  );
};
