import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Image as ImageIcon, Video, Type, ArrowRight, Clock, Star, Activity, Bookmark, TrendingUp, Zap, X } from 'lucide-react';
import { PromptType, SavedPrompt, Template } from '../types';
import { TemplateDetailModal } from './TemplateDetailModal';

interface HomeProps {
  onNavigate: (view: 'architect' | 'saved' | 'templates' | 'history') => void;
  onNewArchitect: (type: PromptType) => void;
  onSelectTemplate: (content: string, type: PromptType, autoSend?: boolean) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onNewArchitect, onSelectTemplate }) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [recentPrompts, setRecentPrompts] = useState<SavedPrompt[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedTemplateForModal, setSelectedTemplateForModal] = useState<Template | null>(null);
  
  const [inspirationTemplates, setInspirationTemplates] = useState<Template[]>([
    {
      id: 'cyberpunk-street',
      title: 'Cyberpunk Street Market',
      description: 'Cinematic wide-shot visual blueprint capturing neon-lit futuristic alleyways, reflective wet street textures, volumetric atmosphere, and high-contrast ambient lighting.',
      category: 'Visual Design',
      type: 'image',
      template: 'Cinematic wide shot of a cyberpunk street market, neon lights reflecting in puddles, volumetric fog, 8k resolution, unreal engine 5 render.',
      image: 'https://picsum.photos/seed/cyber/800/1000',
      placeholders: ['location_style', 'lighting', 'render_engine'],
      suggestions: {
        location_style: ['Cyberpunk Alley', 'Sci-Fi Bazaar', 'Neo-Tokyo Rooftop'],
        lighting: ['Neon Reflections', 'Volumetric Fog', 'Chiaroscuro Night'],
        render_engine: ['Unreal Engine 5', 'Octane Render', 'Ray-Traced Realism']
      }
    },
    {
      id: 'floating-island',
      title: 'Floating Fantasy Castle',
      description: 'High-concept fantasy environment prompt featuring mythical floating islands, glowing crystal spires, and cascading cloud-level waterfalls.',
      category: 'Fantasy & Environment',
      type: 'image',
      template: 'A majestic floating island with a glowing crystal castle, surrounded by waterfalls falling into the clouds, digital painting, fantasy art.',
      image: 'https://picsum.photos/seed/fantasy/800/600',
      placeholders: ['castle_type', 'environment_element', 'art_style'],
      suggestions: {
        castle_type: ['Crystal Spire', 'Ancient Stone Citadel', 'Ethereal Palace'],
        environment_element: ['Cloud Waterfalls', 'Mystic Aurora', 'Celestial Sunset'],
        art_style: ['Digital Painting', 'Matte Painting', 'Epic Fantasy Concept']
      }
    },
    {
      id: 'quantum-computing',
      title: 'Quantum Computing ELI5 Guide',
      description: 'Educational prompt framework designed to break down ultra-complex scientific topics into clear, engaging metaphors for young learners.',
      category: 'Educational & Inquiry',
      type: 'text',
      template: 'Write a comprehensive guide on quantum computing for a 10-year-old, using analogies involving toys and playgrounds.',
      placeholders: ['topic', 'target_age', 'metaphor_theme'],
      suggestions: {
        topic: ['Quantum Computing', 'Artificial Intelligence', 'Relativity'],
        target_age: ['10-year-old', 'High School Student', 'Beginner Adult'],
        metaphor_theme: ['Toys & Playgrounds', 'Cooking & Baking', 'Sports & Games']
      }
    },
    {
      id: 'studio-portrait',
      title: 'Rembrandt Studio Portrait',
      description: 'Photorealistic character portrait prompt with 85mm optical depth, fine skin texture detailing, and classic studio lighting setup.',
      category: 'Portrait Photography',
      type: 'image',
      template: 'Studio portrait of an elderly fisherman, deep wrinkles, dramatic rembrandt lighting, 85mm lens, highly detailed.',
      image: 'https://picsum.photos/seed/portrait/800/800',
      placeholders: ['subject_description', 'lighting_style', 'lens_choice'],
      suggestions: {
        subject_description: ['Elderly Fisherman', 'Cybernetic Scholar', 'Vintage Artist'],
        lighting_style: ['Rembrandt Lighting', 'Soft Studio Diffusion', 'High Contrast Side Light'],
        lens_choice: ['85mm Lens', '50mm Prime', '35mm Street Lens']
      }
    }
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
          setInspirationTemplates(data.slice(0, 4));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 sm:p-12 border border-stone-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <h1 className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-slate-100 mb-4 tracking-tight relative z-10">
              {isFirstTime ? "Welcome to Prompt Architect." : "Welcome back, Architect."}
            </h1>
            <p className="text-lg text-stone-500 dark:text-slate-400 mb-10 max-w-xl relative z-10">
              {isFirstTime 
                ? "Engineer the perfect AI prompt in seconds. Choose a modality below to start building your first architecture."
                : "Ready to build? Jump back into your recent projects or start a fresh architecture."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
              <button onClick={() => onNewArchitect('text')} className="flex flex-col items-center justify-center gap-3 p-6 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Type className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <span className="font-bold text-stone-900 dark:text-slate-100">Text Prompt</span>
              </button>
              <button onClick={() => onNewArchitect('image')} className="flex flex-col items-center justify-center gap-3 p-6 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ImageIcon className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <span className="font-bold text-stone-900 dark:text-slate-100">Image Prompt</span>
              </button>
              <button onClick={() => onNewArchitect('video')} className="flex flex-col items-center justify-center gap-3 p-6 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Video className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <span className="font-bold text-stone-900 dark:text-slate-100">Video Prompt</span>
              </button>
            </div>
          </div>

          {/* Inspiration Gallery */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                <Star size={20} className="text-amber-500" />
                Inspiration Gallery & Featured Blueprints
              </h2>
              <button 
                onClick={() => onNavigate('templates')} 
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all in templates <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inspirationTemplates.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedTemplateForModal(item)}
                  className="relative group rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm h-52 cursor-pointer transition-all hover:shadow-xl hover:border-emerald-500/50"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="p-6 h-full flex items-center justify-center bg-stone-50 dark:bg-slate-900">
                      <Type size={32} className="text-stone-300 dark:text-slate-700 absolute top-4 right-4" />
                      <p className="text-stone-700 dark:text-slate-300 font-medium text-sm leading-relaxed line-clamp-4">"{item.template}"</p>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-stone-900/90 dark:bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {item.type === 'image' ? <ImageIcon size={14} className="text-emerald-400" /> : <Type size={14} className="text-emerald-400" />}
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{item.title || `${item.type} Prompt`}</span>
                        </div>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/40">
                          {item.category || item.type}
                        </span>
                      </div>
                      <p className="text-white text-xs leading-relaxed line-clamp-3">
                        {item.description || item.template}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplateForModal(item);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      <Sparkles size={14} /> Inspect Blueprint Specifications
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: History & Studio Features */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                <Clock size={18} className="text-stone-400" />
                Recent Work
              </h3>
              <button onClick={() => onNavigate('saved')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                View all
              </button>
            </div>

            {recentPrompts.length === 0 ? (
              <div className="text-center py-8 text-stone-400 dark:text-slate-500">
                <Bookmark size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">No saved architectures yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrompts.map((prompt) => (
                  <div 
                    key={prompt.id} 
                    onClick={() => onNavigate('saved')}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-900 border border-stone-200/60 dark:border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate max-w-[180px]">
                        {prompt.title}
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800/40">
                        {prompt.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 dark:text-slate-500 line-clamp-2">
                      {prompt.refinedPrompt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Detail Overview Modal on Home Page */}
      <TemplateDetailModal
        template={selectedTemplateForModal}
        isOpen={!!selectedTemplateForModal}
        onClose={() => setSelectedTemplateForModal(null)}
        onSelect={(prompt, type, autoSend) => {
          onSelectTemplate(prompt, type, autoSend);
          setSelectedTemplateForModal(null);
        }}
      />
    </div>
  );
};
