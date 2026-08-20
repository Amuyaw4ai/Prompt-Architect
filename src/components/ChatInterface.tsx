import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Copy, Check, RefreshCw, Bot, Plus, Sparkles, Save, MessageSquare, Clock, ImagePlus, X, ChevronLeft, ChevronRight, Paperclip, Download, BookTemplate, ChevronDown, Wand2, Layers, Cpu, Zap, FileCode, Braces, FileJson } from 'lucide-react';
import { Message, PromptType, PromptResult, SavedPrompt, ChatSession } from '../types';
import { refinePrompt, transformPromptToFramework } from '../services/geminiService';
import { refinePromptLocally, transformPromptToFrameworkLocally } from '../services/localEngine';
import { getContextualSuggestions, toggleSuggestionInPrompt, QuickAddSuggestion } from '../utils/quickAdd';
import { getContextualFrameworks, ContextualFramework, ALL_FRAMEWORKS } from '../utils/contextualFrameworks';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn, calculatePromptScore } from '../utils';
import { PromptEditor } from './PromptEditor';

const ALL_VARIABLE_SUGGESTIONS: Record<string, string[]> = {
  'SUBJECT': [
    'A cyberpunk hacker', 'A serene landscape', 'A futuristic car', 'A cute alien', 'A majestic dragon',
    'A grizzled detective', 'An elven warrior', 'A wise old monk', 'A rogue AI', 'A time-traveling historian',
    'A neon samurai', 'A space explorer', 'A mythical beast', 'A steampunk inventor', 'A wandering merchant'
  ],
  'LIGHTING': [
    'Cinematic lighting', 'Golden hour', 'Volumetric fog', 'Neon glow', 'Harsh shadows', 'Soft studio lighting',
    'Bioluminescent', 'Moonlight', 'Candlelight', 'Lens flare', 'Chiaroscuro', 'Rim lighting'
  ],
  'STYLE': [
    'Photorealistic', 'Oil painting', 'Anime', '3D render', 'Pencil sketch', 'Watercolor', 'Pixel art',
    'Cyberpunk', 'Steampunk', 'Art Deco', 'Minimalist', 'Surrealism', 'Pop Art', 'Gothic'
  ],
  'CAMERA': [
    'Wide angle', 'Macro', 'Drone shot', 'Low angle', 'Fisheye', 'Telephoto',
    'Dutch angle', 'Bird\'s eye view', 'Worm\'s eye view', 'Over the shoulder', 'Point of view', 'Isometric'
  ],
  'MOOD': [
    'Dark and gritty', 'Uplifting', 'Ethereal', 'Mysterious', 'Energetic', 'Melancholic',
    'Whimsical', 'Ominous', 'Peaceful', 'Chaotic', 'Nostalgic', 'Romantic'
  ],
  'ROLE': [
    'Expert Copywriter', 'Senior Developer', 'Helpful Assistant', 'Creative Director', 'Data Scientist',
    'Financial Analyst', 'Marketing Guru', 'UX Designer', 'Product Manager', 'SEO Specialist'
  ],
  'TONE': [
    'Formal & Professional', 'Casual & Friendly', 'Humorous & Witty', 'Authoritative & Concise',
    'Empathetic & Warm', 'Persuasive', 'Academic & Rigorous', 'Inspirational'
  ],
  'DESIRED_TONE': [
    'Formal & Professional', 'Casual & Conversational', 'Humorous & Witty', 'Authoritative & Concise',
    'Empathetic & Supportive', 'Academic & Objective'
  ],
  'FORMAT': [
    'Bullet points', 'Structured Essay', 'Step-by-step code walkthrough', 'Markdown table', 'JSON schema',
    'Executive Summary', 'Email draft', 'Checklist'
  ],
  'OUTPUT_FORMAT': [
    'Bullet points', 'Detailed essay', 'Clean executable code', 'Markdown comparison table',
    'Strict JSON schema', 'Numbered step-by-step guide'
  ],
  'COMPLEXITY': [
    'Beginner-friendly (ELI5)', 'Intermediate practical', 'Advanced technical expert', 'Executive summary'
  ],
  'COMPLEXITY_LEVEL': [
    'Beginner-friendly (ELI5)', 'Intermediate practical', 'Advanced technical expert', 'Executive briefing'
  ],
  'AUDIENCE': [
    'Beginners', 'Executives', 'Children', 'Tech enthusiasts', 'General public',
    'Investors', 'Small business owners', 'Students', 'Gamers', 'Medical professionals'
  ],
  'PROBLEM': [
    'Low conversion rate', 'Slow performance', 'Lack of engagement', 'High churn rate',
    'Poor user retention', 'High bounce rate', 'Inefficient workflow', 'Communication breakdown'
  ],
  'TASK': [
    'Write a blog post', 'Debug this code', 'Create a marketing plan', 'Summarize this article',
    'Draft an email', 'Design a logo', 'Plan a workout', 'Write a script', 'Translate this text'
  ],
  'CONTEXT': [
    'E-commerce website', 'Mobile app launch', 'B2B software', 'Social media campaign',
    'Internal company newsletter', 'Job interview prep', 'Academic research', 'Personal blog'
  ],
  'ENVIRONMENT': [
    'Sci-fi metropolis', 'Enchanted forest', 'Abandoned factory', 'Cozy cafe',
    'Underwater city', 'Floating island', 'Desert wasteland', 'Space station', 'Medieval castle'
  ],
  'COLOR': [
    'Vibrant', 'Monochrome', 'Pastel', 'High contrast', 'Muted tones',
    'Neon cyberpunk', 'Earth tones', 'Black and white', 'Sepia', 'Iridescent'
  ],
  'RESOLUTION': [
    '8k', '4k', 'Highly detailed', 'Masterpiece',
    'Ultra-HD', 'Photorealistic', 'Crisp', 'Sharp focus'
  ],
  'PRODUCT_SERVICE': [
    'SaaS platform', 'Fitness app', 'Eco-friendly water bottle', 'Online course',
    'Smart home device', 'Subscription box', 'Consulting service', 'Mobile game'
  ],
  'ACTION': [
    'Running', 'Fighting', 'Flying', 'Dancing', 'Driving',
    'Jumping', 'Swimming', 'Climbing', 'Falling', 'Meditating'
  ],
  'MOTION': [
    'Slow motion', 'Fast-paced', 'Smooth pan', 'Handheld', 'Hyperlapse',
    'Time-lapse', 'Dolly zoom', 'Tracking shot', 'Whip pan', 'Static'
  ],
  'START_STATE': ['Day', 'Seed', 'Empty', 'Ruins', 'Chaos', 'Winter', 'Beginner'],
  'END_STATE': ['Night', 'Tree', 'Full', 'City', 'Order', 'Summer', 'Expert'],
  'TOPIC': ['Quantum computing', 'Machine learning', 'Climate change', 'Cryptocurrency', 'Healthy eating', 'Space exploration', 'Artificial Intelligence', 'Cybersecurity'],
  'LANGUAGE': ['Python', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'C++', 'Java', 'Ruby', 'Swift', 'Kotlin'],
  'FOCUS_AREA': ['Performance', 'Security', 'Readability', 'Best practices', 'Scalability', 'Maintainability', 'Accessibility'],
  'INDUSTRY': ['Tech startup', 'Coffee shop', 'Fitness brand', 'Eco-friendly', 'Gaming', 'Healthcare', 'Finance', 'Education', 'Real estate'],
  'EMOTION': ['Joy', 'Sadness', 'Surprise', 'Anger', 'Confusion', 'Excitement']
};

const getDailySuggestions = (suggestions: Record<string, string[]>, count: number = 5): Record<string, string[]> => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  const random = (s: number) => {
    let x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };

  const result: Record<string, string[]> = {};
  
  for (const [key, values] of Object.entries(suggestions)) {
    if (!values || values.length <= count) {
      result[key] = values;
      continue;
    }
    
    const shuffled = [...values].sort((a, b) => {
      const hashA = a.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = b.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return random(seed + hashA) - random(seed + hashB);
    });
    
    result[key] = shuffled.slice(0, count);
  }
  
  return result;
};

const VARIABLE_SUGGESTIONS = getDailySuggestions(ALL_VARIABLE_SUGGESTIONS);

interface CalibrationGroup {
  category: string;
  color: 'emerald' | 'amber' | 'purple';
  options: string[];
}

const getDynamicCalibrationOptions = (
  type: PromptType,
  promptContent: string,
  messageContent: string
): CalibrationGroup[] => {
  const combined = `${promptContent} ${messageContent}`.toLowerCase();

  if (type === 'image') {
    const isPortrait = combined.includes('portrait') || combined.includes('person') || combined.includes('character') || combined.includes('face') || combined.includes('model') || combined.includes('woman') || combined.includes('man');
    const isLandscape = combined.includes('landscape') || combined.includes('environment') || combined.includes('city') || combined.includes('nature') || combined.includes('room') || combined.includes('building') || combined.includes('cyberpunk') || combined.includes('scenery');
    const isAnimeOrArt = combined.includes('anime') || combined.includes('illustration') || combined.includes('art') || combined.includes('vector') || combined.includes('painting') || combined.includes('cartoon') || combined.includes('studio ghibli');

    return [
      {
        category: 'Lighting & Mood',
        color: 'emerald',
        options: isLandscape 
          ? ['Cinematic Golden Hour', 'Moody Fog & Mist', 'Dramatic Sunbeams', 'Night Cyberpunk Neon']
          : isPortrait 
            ? ['Soft Studio Portrait Keylight', 'Dramatic Rim Lighting', 'Warm Sunset Bokeh', 'High-Key Fashion Clean']
            : ['Volumetric Lighting', 'Warm Cinematic Glow', 'Moody Chiaroscuro', 'Studio Softbox']
      },
      {
        category: 'Style & Medium',
        color: 'amber',
        options: isAnimeOrArt
          ? ['Makoto Shinkai Anime Style', 'Vibrant Concept Digital Art', 'Minimalist Flat Vector', 'Watercolor & Ink']
          : ['35mm Film Grain (Kodak Portra)', 'Hyperrealistic 8K Octane Render', 'Editorial Photography', 'Cinematic Panavision 70mm']
      },
      {
        category: 'Composition & Framing',
        color: 'purple',
        options: isPortrait
          ? ['Close-Up Shot with 85mm Lens', 'Medium Waist-Up Shot', 'Low-Angle Heroic Stance', 'Centered Symmetric Framing']
          : isLandscape
            ? ['Wide Angle Pan (16:9)', 'Aerial Drone Top-Down', 'Rule-of-Thirds Dynamic Lines', 'Deep Depth of Field']
            : ['16:9 Cinematic Aspect Ratio', 'Macro Detail Close-Up', 'Symmetrical Center Framing', 'Low-Angle Hero Shot']
      }
    ];
  }

  if (type === 'video') {
    const isAction = combined.includes('action') || combined.includes('run') || combined.includes('car') || combined.includes('fight') || combined.includes('fast') || combined.includes('sport');
    return [
      {
        category: 'Camera Motion',
        color: 'emerald',
        options: isAction
          ? ['Dynamic Fast Orbit Tracking', 'High-Speed FPV Drone Chase', 'Whip Pan Action Snap', 'Dynamic Low Steadycam']
          : ['Slow Cinematic Dolly Push-In', 'Dynamic Drone Orbit 360°', 'Smooth Steadycam Tracking', 'Subtle Organic Handheld Pan']
      },
      {
        category: 'Pacing & Speed',
        color: 'amber',
        options: ['Slow Motion 60fps Smooth Flow', 'Fast-Paced Action Cut', 'Hyperlapse Time-Compression', 'Real-Time Natural Cadence']
      },
      {
        category: 'Atmosphere & Grade',
        color: 'purple',
        options: ['Teal & Orange Cinematic Grade', 'Vintage 70s Warm Film Glow', 'High-Contrast Moody Noir', 'Vibrant Natural Sunlight']
      }
    ];
  }

  // Text / Chatbot modality
  const isCoding = combined.includes('code') || combined.includes('react') || combined.includes('python') || combined.includes('sql') || combined.includes('api') || combined.includes('function') || combined.includes('developer') || combined.includes('software');
  const isMarketing = combined.includes('marketing') || combined.includes('copy') || combined.includes('seo') || combined.includes('campaign') || combined.includes('email') || combined.includes('brand') || combined.includes('sales') || combined.includes('ad');
  const isAnalysis = combined.includes('analys') || combined.includes('data') || combined.includes('report') || combined.includes('business') || combined.includes('strategy') || combined.includes('review') || combined.includes('metrics');

  return [
    {
      category: 'Format',
      color: 'emerald',
      options: isCoding 
        ? ['Step-by-Step Code with Comments', 'Production-Ready TypeScript', 'Minimalist Code Only', 'Markdown Table Breakdown']
        : isMarketing 
          ? ['High-Converting Hook + Body + CTA', 'Bullet Points with Key Benefits', 'Multi-Variant Ad Copies', 'Punchy Social Post']
          : isAnalysis
            ? ['Executive Summary + Key Takeaways', 'Markdown Comparison Table', 'Structured JSON Schema', 'Numbered Action Plan']
            : ['Bullet Points with Key Takeaways', 'Step-by-Step Guide', 'JSON Schema', 'Markdown Table', 'In-Depth Essay']
    },
    {
      category: 'Tone',
      color: 'amber',
      options: isCoding
        ? ['Senior Principal Engineer', 'Concise & Authoritative', 'Instructional Tutorial', 'Direct & Minimal']
        : isMarketing
          ? ['High-Energy & Persuasive', 'Warm & Friendly', 'Urgent & Compelling', 'Witty & Relatable']
          : isAnalysis
            ? ['Executive & Strategic', 'Objective & Data-Driven', 'Analytical & Thorough', 'Pragmatic & Clear']
            : ['Formal & Professional', 'Casual & Friendly', 'Authoritative & Concise', 'Socratic & Educational']
    },
    {
      category: 'Depth',
      color: 'purple',
      options: isCoding
        ? ['Production Edge Cases Included', 'Beginner-Friendly Explanation (ELI5)', 'Strict Typings & Error Handling', 'Quick Snippet Only']
        : isAnalysis
          ? ['Comprehensive C-Level Brief', 'Actionable 5-Step Checklist', 'Deep-Dive Risk Assessment', 'Quick 3-Bullet Summary']
          : ['Beginner (ELI5)', 'Intermediate Practical', 'Advanced Expert Level', 'Actionable Checklist Only']
    }
  ];
};

interface Props {
  promptType: PromptType;
  onTypeChange: (type: PromptType) => void;
  isLocalMode?: boolean;
  onLocalModeChange?: (isLocal: boolean) => void;
  initialInput?: string;
  initialMessages?: Message[];
  initialResult?: PromptResult;
  editingPrompt?: SavedPrompt;
  currentSession?: ChatSession;
  onSessionUpdate?: (session: ChatSession) => void;
  onInputUsed?: () => void;
  onSaveSuccess?: (savedPrompt: SavedPrompt) => void;
  onSwitchVersion?: (prompt: SavedPrompt) => void;
  activeMobileTab?: 'chat' | 'editor' | 'output';
  onMobileTabChange?: (tab: 'chat' | 'editor' | 'output') => void;
  onStatsChange?: (stats: { messageCount: number; wordCount: number; charCount: number; score: number }) => void;
}

export const ChatInterface: React.FC<Props> = ({ 
  promptType, 
  onTypeChange,
  isLocalMode: externalIsLocalMode,
  onLocalModeChange,
  initialInput, 
  initialMessages,
  initialResult,
  editingPrompt,
  currentSession,
  onSessionUpdate,
  onInputUsed,
  onSaveSuccess,
  onSwitchVersion,
  activeMobileTab = 'chat',
  onMobileTabChange,
  onStatsChange
}) => {
  const currentMobileTab = activeMobileTab;
  const [internalLocalMode, setInternalLocalMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('prompt_architect_engine_mode');
    return saved ? saved === 'local' : true;
  });

  const isLocalMode = externalIsLocalMode !== undefined ? externalIsLocalMode : internalLocalMode;

  const setIsLocalMode = (val: boolean) => {
    setInternalLocalMode(val);
    localStorage.setItem('prompt_architect_engine_mode', val ? 'local' : 'live');
    if (onLocalModeChange) {
      onLocalModeChange(val);
    }
  };

  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultHistory, setResultHistory] = useState<PromptResult[]>(currentSession?.resultHistory || (initialResult ? [initialResult] : []));
  const [currentResultIndex, setCurrentResultIndex] = useState<number>(currentSession?.currentResultIndex ?? (initialResult ? 0 : -1));
  const lastResult = currentResultIndex >= 0 ? resultHistory[currentResultIndex] : null;
  const [copiedType, setCopiedType] = useState<'text' | 'markdown' | 'json' | 'download' | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string, url: string, name?: string } | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, content: string }[]>([]);
  const [showFrameworks, setShowFrameworks] = useState(false);
  const [isTransformingFramework, setIsTransformingFramework] = useState(false);
  const [transformingFrameworkName, setTransformingFrameworkName] = useState('');
  const [activeFrameworkCategory, setActiveFrameworkCategory] = useState<'current' | 'text' | 'image' | 'video' | 'all'>('current');
  const [rightPanelWidth, setRightPanelWidth] = useState(450);
  const isRightPanelCompact = rightPanelWidth <= 380;
  const isRightPanelUltraCompact = rightPanelWidth <= 340;
  const isRightPanelWide = rightPanelWidth >= 520;
  const [isDragging, setIsDragging] = useState(false);
  const [promptVersions, setPromptVersions] = useState<SavedPrompt[]>([]);
  const [showVersionsDropdown, setShowVersionsDropdown] = useState(false);
  const versionsDropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const lastXRef = useRef<number | null>(null);

  // Auto-expand input textarea height with content volume up to mid-screen (~220px max height cap)
  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
      const scrollH = chatInputRef.current.scrollHeight;
      const maxHeight = 220; // max cap around mid screen height
      chatInputRef.current.style.height = `${Math.min(scrollH, maxHeight)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (editingPrompt) {
      fetch(`/api/prompts/${editingPrompt.id}/versions`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPromptVersions(data);
          }
        })
        .catch(console.error);
    } else {
      setPromptVersions([]);
    }
  }, [editingPrompt]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (versionsDropdownRef.current && !versionsDropdownRef.current.contains(event.target as Node)) {
        setShowVersionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle dragging for resizable pane
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      
      const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      
      if (lastXRef.current !== null) {
        const deltaX = currentX - lastXRef.current;
        setRightPanelWidth(prev => {
          const newWidth = prev - deltaX;
          return Math.min(Math.max(newWidth, 280), 850);
        });
      }
      lastXRef.current = currentX;
    };

    const handleUp = () => {
      setIsDragging(false);
      lastXRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchend', handleUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      lastXRef.current = null;
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchend', handleUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  // Session Management
  const saveSession = async (msgs: Message[], type: PromptType, history?: PromptResult[], index?: number) => {
    if (msgs.length === 0) return;
    
    const sessionData = {
      id: currentSession?.id || Date.now().toString(),
      title: currentSession?.title || msgs[0].content.slice(0, 30) + (msgs[0].content.length > 30 ? '...' : ''),
      messages: msgs,
      currentType: type,
      resultHistory: history || resultHistory,
      currentResultIndex: index !== undefined ? index : currentResultIndex,
      editingPromptId: editingPrompt?.id
    };

    try {
      const method = currentSession ? 'PUT' : 'POST';
      const url = currentSession ? `/api/sessions/${currentSession.id}` : '/api/sessions';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (onSessionUpdate) {
        onSessionUpdate({
          ...sessionData,
          updatedAt: Date.now(),
          createdAt: currentSession?.createdAt || Date.now()
        });
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  // Extract variables from prompt like [STYLE] or [SUBJECT]
  useEffect(() => {
    if (lastResult?.refinedPrompt) {
      const matches = lastResult.refinedPrompt.match(/\[[A-Z_]+\]/g);
      if (matches) {
        const uniqueVars = Array.from(new Set(matches));
        const newVars: Record<string, string> = {};
        uniqueVars.forEach(v => {
          const name = v.slice(1, -1);
          newVars[name] = variables[name] || '';
        });
        setVariables(newVars);
      } else {
        setVariables({});
      }
    }
  }, [lastResult?.refinedPrompt]);

  const getFinalPrompt = () => {
    if (!lastResult?.refinedPrompt) return '';
    let final = lastResult.refinedPrompt;
    Object.entries(variables).forEach(([name, value]) => {
      if (value.trim()) {
        final = final.replace(new RegExp(`\\[${name}\\]`, 'g'), value);
      }
    });
    return final;
  };

  useEffect(() => {
    if (onStatsChange) {
      const finalPrompt = getFinalPrompt();
      const words = finalPrompt.trim() ? finalPrompt.split(/\s+/).filter(Boolean).length : 0;
      const chars = finalPrompt.length;
      const scoreObj = calculatePromptScore(finalPrompt, promptType);
      onStatsChange({
        messageCount: messages.length,
        wordCount: words,
        charCount: chars,
        score: scoreObj.score
      });
    }
  }, [messages.length, lastResult?.refinedPrompt, variables, promptType, onStatsChange]);

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
      handleSend(initialInput);
      onInputUsed?.();
    }
  }, [initialInput]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        url: base64String, // Store full base64 for persistence & preview
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFiles(prev => [...prev, { name: file.name, content: reader.result as string }]);
      };
      reader.readAsText(file);
    });
    
    if (textFileInputRef.current) {
      textFileInputRef.current.value = '';
    }
  };

  const handleToggleOption = (category: string, opt: string) => {
    const tag = `[${category}: ${opt}]`;
    setSelectedOptions(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleSend = async (overrideInput?: string) => {
    let textToUse = overrideInput !== undefined ? overrideInput : input;
    if (overrideInput === undefined && selectedOptions.length > 0) {
      const stagedTags = selectedOptions.join(' ');
      textToUse = textToUse.trim() ? `${textToUse.trim()}\n\nApplied Calibrations:\n${stagedTags}` : `Please calibrate prompt with:\n${stagedTags}`;
    }
    if ((!textToUse.trim() && !selectedImage && attachedFiles.length === 0) || isLoading) return;

    let userContent = textToUse;
    if (selectedImage && !textToUse.trim()) {
      if (selectedImage.mimeType.startsWith("image/")) {
        userContent = "Analyze this image and generate a highly detailed prompt that would recreate its style and details.";
      } else if (selectedImage.mimeType.startsWith("video/")) {
        userContent = "Analyze this video and generate a highly detailed video generation prompt detailing the actions, camera motion, and cinematic composition.";
      } else if (selectedImage.mimeType.startsWith("audio/")) {
        userContent = "Analyze this audio and generate a highly detailed descriptive summary and transcript-based prompt.";
      } else {
        userContent = "Analyze this media file and generate a high-end detailed prompt based on its context and instructions.";
      }
    }

    let fullContentForAI = userContent;
    if (attachedFiles.length > 0) {
      fullContentForAI += '\n\nContext from attached files:\n' + attachedFiles.map(f => `--- ${f.name} ---\n${f.content}\n---`).join('\n\n');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: Date.now(),
      imageUrl: selectedImage?.url,
      mediaType: selectedImage?.mimeType,
      attachedFiles: attachedFiles.length > 0 ? attachedFiles : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedOptions([]);

    let result: PromptResult;
    let isFallback = false;

    try {
      const imageToSend = selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType, url: selectedImage.url, name: selectedImage.name } : undefined;
      setSelectedImage(null);
      setAttachedFiles([]);
      setIsLoading(true);

      const context = messages
         .map(m => {
          let msgContent = m.content;
          if (m.attachedFiles && m.attachedFiles.length > 0) {
            msgContent += '\n\nContext from attached files:\n' + m.attachedFiles.map(f => `--- ${f.name} ---\n${f.content}\n---`).join('\n\n');
          }
          return `${m.role === 'user' ? 'User' : 'Assistant'}: ${msgContent}`;
        })
        .join('\n');

      if (isLocalMode) {
        // Run completely local offline builder
        result = refinePromptLocally(fullContentForAI, promptType, imageToSend);
      } else {
        try {
          result = await refinePrompt(fullContentForAI, promptType, context, imageToSend);
        } catch (apiError) {
          console.error("Live AI mode error, falling back to local studio:", apiError);
          result = refinePromptLocally(fullContentForAI, promptType, imageToSend);
          isFallback = true;
        }
      }
      
      // Auto-switch modality tab if the system detected a different, more appropriate target type!
      if (result.detectedType && result.detectedType !== promptType) {
        onTypeChange(result.detectedType);
      }

      const newHistory = [...resultHistory.slice(0, currentResultIndex + 1), result];
      const newIndex = newHistory.length - 1;
      
      setResultHistory(newHistory);
      setCurrentResultIndex(newIndex);

      let assistantContent = "";
      const lowerUserQuery = fullContentForAI.trim().toLowerCase();
      const isConversationalQuery =
        lowerUserQuery.endsWith("?") ||
        /^(hello|hi|hey|greetings|yo|how|why|what|who|where|explain|describe|tell|show|can you|could you|is there|are there|tips|help|support|tutorial|instructions|how to|what is)/i.test(lowerUserQuery);

      if (isConversationalQuery) {
        assistantContent = result.refinedPrompt;
      } else {
        assistantContent = result.explanation;
      }

      if (isFallback) {
        assistantContent = "⚠️ **Live Google AI is currently unconfigured or unavailable.** I have automatically processed your prompt instantly using our high-precision **Local Studio Engine** to prevent session breakages!\n\n" + assistantContent;
      }
      if (result.questions && result.questions.length > 0) {
        assistantContent += "\n\n**To make this even better, could you tell me:**\n" + 
          result.questions.map(q => `- ${q}`).join('\n');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      };

      const finalMessages = [...messages, userMessage, assistantMessage];
      setMessages(finalMessages);
      saveSession(finalMessages, promptType, newHistory, newIndex);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error while refining your prompt. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const finalPrompt = getFinalPrompt();
    navigator.clipboard.writeText(finalPrompt);
    setCopiedType('text');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const final = getFinalPrompt();
    if (!final) return;

    const title = saveData.title || lastResult?.suggestedTitle || 'Architected Prompt';
    const cleanFileName = (title || 'architected_prompt')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'architected_prompt';

    const tagsLine = lastResult?.suggestedTags && lastResult.suggestedTags.length > 0
      ? `**Tags:** ${lastResult.suggestedTags.join(', ')}\n`
      : '';
    const varsEntries = Object.entries(variables).filter(([_, v]) => v.trim());
    const varsLine = varsEntries.length > 0
      ? `**Variables:**\n${varsEntries.map(([k, v]) => `- \`[${k}]\`: ${v}`).join('\n')}\n`
      : '';

    const mdContent = `# ${title}\n\n**Modality:** ${promptType.toUpperCase()}\n${tagsLine}${varsLine}\n---\n\n${final}\n`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFileName}.md`;
    a.click();
    URL.revokeObjectURL(url);

    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const getPromptJSONData = () => {
    if (!lastResult) return null;
    const userTags = saveData.tags ? saveData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const tags = userTags.length > 0 ? userTags : (lastResult.suggestedTags || []);
    const title = saveData.title || lastResult.suggestedTitle || 'Architected Prompt';

    return {
      title,
      prompt: getFinalPrompt(),
      type: promptType,
      variables,
      tags,
      originalIdea: messages.find(m => m.role === 'user')?.content || ''
    };
  };

  const copyAsJSON = () => {
    const data = getPromptJSONData();
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadJSON = () => {
    const data = getPromptJSONData();
    if (!data) return;

    const cleanFileName = (data.title || 'architected_prompt')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'architected_prompt';

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFileName}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setCopiedType('download');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const contextualQuickAddSuggestions = useMemo(() => {
    if (!lastResult?.refinedPrompt) return [];
    return getContextualSuggestions(lastResult.refinedPrompt, promptType);
  }, [lastResult?.refinedPrompt, promptType]);

  const contextualFrameworksData = useMemo(() => {
    const currentPrompt = lastResult?.refinedPrompt || '';
    return getContextualFrameworks(currentPrompt, promptType, activeFrameworkCategory);
  }, [lastResult?.refinedPrompt, promptType, activeFrameworkCategory]);

  const handleToggleQuickAddSuggestion = (suggestion: QuickAddSuggestion) => {
    if (!lastResult) return;
    const currentPrompt = lastResult.refinedPrompt;
    const updatedPrompt = toggleSuggestionInPrompt(currentPrompt, suggestion, promptType);
    
    setResultHistory(prev => {
      const newHistory = [...prev];
      newHistory[currentResultIndex] = { ...newHistory[currentResultIndex], refinedPrompt: updatedPrompt };
      return newHistory;
    });
  };

  const handleApplyFramework = async (fw: { name: string; template: string }) => {
    if (!lastResult || isTransformingFramework) return;
    const currentPrompt = lastResult.refinedPrompt;
    if (!currentPrompt || !currentPrompt.trim()) return;

    setIsTransformingFramework(true);
    setTransformingFrameworkName(fw.name);

    try {
      let transformedResult: PromptResult;
      if (!isLocalMode) {
        try {
          transformedResult = await transformPromptToFramework(
            currentPrompt,
            fw.name,
            fw.template,
            promptType
          );
        } catch (err) {
          console.warn('Live AI framework transformation failed, falling back to local studio heuristics:', err);
          transformedResult = transformPromptToFrameworkLocally(
            currentPrompt,
            fw.name,
            fw.template,
            promptType
          );
        }
      } else {
        // Subtle delay so cinematic scanning experience is clearly observable
        await new Promise(res => setTimeout(res, 550));
        transformedResult = transformPromptToFrameworkLocally(
          currentPrompt,
          fw.name,
          fw.template,
          promptType
        );
      }

      // Smooth completion buffer for cinematic feel
      await new Promise(res => setTimeout(res, 450));

      setResultHistory(prev => {
        const newHistory = [...prev, transformedResult];
        const newIndex = newHistory.length - 1;
        setCurrentResultIndex(newIndex);
        if (messages.length > 0) {
          saveSession(messages, promptType, newHistory, newIndex);
        }
        return newHistory;
      });
    } catch (error) {
      console.error('Error applying framework:', error);
    } finally {
      setIsTransformingFramework(false);
      setTransformingFrameworkName('');
    }
  };

  const clearChat = () => {
    setMessages([]);
    setResultHistory([]);
    setCurrentResultIndex(-1);
    if (onSessionUpdate) onSessionUpdate(undefined as any);
  };

  const handleResultIndexChange = (newIndex: number) => {
    setCurrentResultIndex(newIndex);
    if (messages.length > 0) {
      saveSession(messages, promptType, resultHistory, newIndex);
    }
  };

  const handleTypeChange = (type: PromptType) => {
    onTypeChange(type);
    if (messages.length > 0) {
      saveSession(messages, type);
    }
  };

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveData, setSaveData] = useState({ title: '', tags: '', versionNotes: '' });
  const [saveMode, setSaveMode] = useState<'update' | 'new_version' | 'new_prompt'>('new_prompt');
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: '' });
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  useEffect(() => {
    if (editingPrompt) {
      setSaveData({
        title: editingPrompt.title,
        tags: editingPrompt.tags.join(', '),
        versionNotes: ''
      });
      setSaveMode('new_version');
    } else {
      setSaveData({ title: '', tags: '', versionNotes: '' });
      setSaveMode('new_prompt');
    }
  }, [editingPrompt]);

  const handleSave = async () => {
    if (!lastResult || !saveData.title) return;
    try {
      let url = '/api/prompts';
      let method = 'POST';
      let parentId = null;

      if (editingPrompt) {
        if (saveMode === 'update') {
          url = `/api/prompts/${editingPrompt.id}`;
          method = 'PUT';
          parentId = editingPrompt.parentId; // Keep existing parent if updating
        } else if (saveMode === 'new_version') {
          // Saving as a new version means the current editing prompt becomes the parent
          // OR if the editing prompt already has a parent, they share the same parent
          parentId = editingPrompt.parentId || editingPrompt.id;
        }
        // If saveMode === 'new_prompt', it remains POST to /api/prompts with parentId = null
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveData.title,
          originalIdea: messages.find(m => m.role === 'user')?.content || '',
          refinedPrompt: lastResult.refinedPrompt,
          type: promptType,
          tags: saveData.tags.split(',').map(t => t.trim()).filter(Boolean),
          messages: messages,
          parentId: parentId,
          versionNotes: saveData.versionNotes,
          derivedFromId: saveMode === 'new_version' ? editingPrompt?.id : undefined
        })
      });
      
      const data = await res.json();
      
      const savedPrompt: SavedPrompt = {
        id: method === 'POST' ? data.id : editingPrompt?.id,
        title: saveData.title,
        originalIdea: messages.find(m => m.role === 'user')?.content || '',
        refinedPrompt: lastResult.refinedPrompt,
        type: promptType,
        tags: saveData.tags.split(',').map(t => t.trim()).filter(Boolean),
        messages: messages,
        parentId: parentId,
        versionNotes: saveData.versionNotes,
        derivedFromId: saveMode === 'new_version' ? editingPrompt?.id : undefined,
        createdAt: method === 'POST' ? Date.now() : (editingPrompt?.createdAt || Date.now()),
        isFavorite: method === 'POST' ? false : (editingPrompt?.isFavorite || false)
      };

      setShowSaveModal(false);
      if (!editingPrompt) setSaveData({ title: '', tags: '', versionNotes: '' });
      onSaveSuccess?.(savedPrompt);
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const submitFeedback = async (rating: number) => {
    if (!lastResult) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: feedbackData.comment,
          refinedPrompt: lastResult.refinedPrompt,
          type: promptType
        })
      });
      setFeedbackData({ rating, comment: '' });
      // Visual feedback could be added here instead of alert
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const isExpired = currentSession && (Date.now() - currentSession.createdAt) > 3600000;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
      {isExpired && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500 dark:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center animate-pulse">
          Session Expired (1 Hour Limit) - Please start a new chat for fresh context
        </div>
      )}
      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-stone-200 dark:border-slate-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-3xl font-black mb-2 tracking-tight text-stone-900 dark:text-slate-100">Save Prompt</h3>
              <p className="text-stone-500 dark:text-slate-400 mb-8">Add this masterpiece to your library.</p>
              
              <div className="space-y-6">
                {editingPrompt && (
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Save Mode</label>
                    <div className="grid grid-cols-1 gap-2">
                      <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${saveMode === 'new_version' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-700'}`}>
                        <input type="radio" name="saveMode" value="new_version" checked={saveMode === 'new_version'} onChange={() => setSaveMode('new_version')} className="hidden" />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-stone-900 dark:text-slate-100">Branch Sub-version</span>
                          <span className="text-xs text-stone-500 dark:text-slate-400">Creates a new version derived from the current one</span>
                        </div>
                      </label>
                      <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${saveMode === 'update' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-700'}`}>
                        <input type="radio" name="saveMode" value="update" checked={saveMode === 'update'} onChange={() => setSaveMode('update')} className="hidden" />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-stone-900 dark:text-slate-100">Update Current</span>
                          <span className="text-xs text-stone-500 dark:text-slate-400">Overwrite the existing prompt</span>
                        </div>
                      </label>
                      <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${saveMode === 'new_prompt' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-700'}`}>
                        <input type="radio" name="saveMode" value="new_prompt" checked={saveMode === 'new_prompt'} onChange={() => setSaveMode('new_prompt')} className="hidden" />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-stone-900 dark:text-slate-100">Save as New Prompt</span>
                          <span className="text-xs text-stone-500 dark:text-slate-400">Completely separate entry</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" 
                    value={saveData.title}
                    onChange={e => setSaveData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-5 py-3 bg-stone-50 dark:bg-slate-900 border border-stone-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                    placeholder="e.g. Cyberpunk Portrait"
                  />
                </div>
                
                {(saveMode === 'new_version' || saveMode === 'update') && (
                  <div>
                    <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Version Notes (Optional)</label>
                    <input 
                      type="text" 
                      value={saveData.versionNotes}
                      onChange={e => setSaveData(prev => ({ ...prev, versionNotes: e.target.value }))}
                      className="w-full px-5 py-3 bg-stone-50 dark:bg-slate-900 border border-stone-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                      placeholder="e.g. Adjusted lighting to be more cinematic"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={saveData.tags}
                    onChange={e => setSaveData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-5 py-3 bg-stone-50 dark:bg-slate-900 border border-stone-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                    placeholder="e.g. neon, portrait, cinematic"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-stone-900 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-2xl text-sm font-bold hover:bg-stone-800 dark:hover:bg-emerald-400 transition-all shadow-lg shadow-stone-200 dark:shadow-none"
                >
                  {saveMode === 'update' ? 'Update' : 'Save'} Prompt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - 3 Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* Joint Container for Left Column (Chat) & Middle Column (Prompt Editor) with floating input bar */}
        <div className={cn(
          "relative flex-col lg:flex-row flex-1 min-w-0 h-full min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-100 dark:border-slate-700",
          currentMobileTab === 'output' ? 'hidden lg:flex' : 'flex'
        )}>
          
          {/* Left Column: Chat conversation without avatars, faint opaque user bubble, no box for AI */}
          <div className={cn(
            "flex-col min-w-0 h-full min-h-0 border-b lg:border-b-0 lg:border-r border-stone-100 dark:border-slate-700/80 overflow-hidden",
            currentMobileTab === 'chat' ? 'flex flex-1 w-full' : 'hidden lg:flex lg:w-1/2 lg:flex-1'
          )}>
            <div 
              ref={scrollRef}
              className="flex-1 h-full min-h-0 overflow-y-auto p-5 sm:p-6 pb-20 lg:pb-28 space-y-6 scroll-smooth bg-stone-50/20 dark:bg-slate-900/20 no-scrollbar [mask-image:linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent_100%)]"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="w-14 h-14 bg-stone-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-stone-900 dark:text-slate-100 tracking-tight">Prompt Architect</p>
                    <p className="text-xs text-stone-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                      Describe your vision below to build an optimized prompt with parameters and formatting.
                    </p>
                  </div>
                </div>
              )}
              
              <AnimatePresence initial={false}>
                {messages.map((m, index) => {
                  const isLatestAssistantMessage = index === messages.length - 1 && m.role === 'assistant';
                  const currentPromptText = getFinalPrompt();
                  const dynamicSuggestions = isLatestAssistantMessage 
                    ? getDynamicCalibrationOptions(promptType, currentPromptText, m.content)
                    : [];

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`w-full flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`w-full ${
                        m.role === 'user' 
                          ? 'max-w-[94%] sm:max-w-[90%] bg-stone-200/70 dark:bg-slate-700/70 text-stone-900 dark:text-slate-100 rounded-2xl p-4 sm:p-5 border border-stone-300/50 dark:border-slate-600/50 shadow-xs' 
                          : 'bg-transparent text-stone-800 dark:text-slate-200 p-0 sm:p-1 border-0 shadow-none'
                      }`}>
                        {m.imageUrl && (
                          m.mediaType?.startsWith("video/") || m.imageUrl?.startsWith("data:video/") ? (
                            <video src={m.imageUrl} controls className="max-w-full h-auto max-h-56 rounded-xl mb-3 border border-emerald-500/30" />
                          ) : m.mediaType?.startsWith("image/") || m.imageUrl?.startsWith("data:image/") || !m.mediaType ? (
                            <img src={m.imageUrl} alt="Uploaded media" className="max-w-full h-auto max-h-56 object-contain rounded-xl mb-3 border border-emerald-500/30" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="inline-flex items-center gap-2 bg-stone-100 dark:bg-slate-800 border border-emerald-500/20 p-2.5 rounded-xl mb-3">
                              <Paperclip size={15} className="text-emerald-500" />
                              <span className="text-xs font-semibold text-stone-700 dark:text-slate-300">Attached Media file</span>
                            </div>
                          )
                        )}
                        {m.attachedFiles && m.attachedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {m.attachedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-stone-300/60 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-stone-400/30 dark:border-slate-600/40">
                                <Paperclip size={12} className="text-stone-600 dark:text-slate-300" />
                                <span className="text-[11px] font-medium text-stone-800 dark:text-slate-200 max-w-[120px] truncate">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {m.content && (
                          <div className={cn("markdown-body", m.role === 'user' ? "text-stone-900 dark:text-slate-100 font-medium" : "text-stone-800 dark:text-slate-200")}>
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        )}
                        {isLatestAssistantMessage && dynamicSuggestions.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-stone-200/60 dark:border-slate-700/60 space-y-2.5">
                            <div className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                              <Sparkles size={11} />
                              <span>Quick Answer / Calibrate:</span>
                            </div>
                            {dynamicSuggestions.map((group, gIdx) => (
                              <div key={gIdx} className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 mr-1 min-w-[50px]">{group.category}:</span>
                                {group.options.map((opt) => {
                                  const tag = `[${group.category}: ${opt}]`;
                                  const isSelected = selectedOptions.includes(tag);
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => handleToggleOption(group.category, opt)}
                                      disabled={isLoading}
                                      className={cn(
                                        "px-2 py-0.5 text-[10px] font-semibold rounded-md border transition-all disabled:opacity-50 active:scale-95 shadow-2xs flex items-center gap-1",
                                        isSelected
                                          ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 border-emerald-600 dark:border-emerald-500 shadow-sm ring-1 ring-emerald-400 font-bold"
                                          : group.color === 'emerald'
                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-200/50 dark:border-emerald-800/40"
                                            : group.color === 'amber'
                                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-200/50 dark:border-amber-800/40"
                                              : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-200/50 dark:border-purple-800/40"
                                      )}
                                    >
                                      {isSelected && <Check size={10} className="stroke-[3]" />}
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isLoading && (
                <div className="flex justify-start py-2">
                  <div className="flex gap-1.5 items-center px-4 py-2.5 bg-stone-100 dark:bg-slate-800 rounded-full border border-stone-200/60 dark:border-slate-700">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {/* Bottom Spacer to ensure full scroll travel above floating dock */}
              <div className="h-16 lg:h-24 shrink-0 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Middle Column: The prompt editor */}
          <div className={cn(
            "flex-col min-w-0 h-full p-4 sm:p-5 bg-stone-50/40 dark:bg-slate-900/30 overflow-hidden",
            currentMobileTab === 'editor' ? 'flex flex-1 w-full min-h-0' : 'hidden lg:flex lg:w-1/2 lg:flex-1 lg:min-h-0'
          )}>
            <div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden">
              <PromptEditor
                value={lastResult?.refinedPrompt || ''}
                onChange={(newVal) => {
                  if (lastResult) {
                    setResultHistory(prev => {
                      const newHistory = [...prev];
                      newHistory[currentResultIndex] = { ...newHistory[currentResultIndex], refinedPrompt: newVal };
                      return newHistory;
                    });
                  } else {
                    const newRes: PromptResult = {
                      refinedPrompt: newVal,
                      explanation: 'Drafted in editor.',
                      suggestedTitle: 'Architected Prompt'
                    };
                    setResultHistory([newRes]);
                    setCurrentResultIndex(0);
                  }
                }}
                variables={variables}
                currentVersionIndex={currentResultIndex >= 0 ? currentResultIndex : 0}
                totalVersions={Math.max(1, resultHistory.length)}
                onPreviousVersion={() => handleResultIndexChange(Math.max(0, currentResultIndex - 1))}
                onNextVersion={() => handleResultIndexChange(Math.min(resultHistory.length - 1, currentResultIndex + 1))}
                isTransforming={isTransformingFramework}
                transformingName={transformingFrameworkName}
              />
            </div>
          </div>

          {/* Bottom Gradient Scrim Overlay across Columns 1 & 2 */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 lg:h-20 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-900/90 dark:via-slate-900/40 z-10" />

          {/* Mobile Floating Action Button (FAB) on non-chat tabs */}
          {currentMobileTab !== 'chat' && (
            <div className="lg:hidden fixed bottom-4 right-4 z-40">
              <button
                onClick={() => {
                  onMobileTabChange?.('chat');
                  setTimeout(() => {
                    chatInputRef.current?.focus();
                  }, 100);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-full font-bold text-xs shadow-xl shadow-emerald-900/20 active:scale-95 transition-all min-h-[44px]"
              >
                <MessageSquare size={16} />
                <span>Refine / Chat</span>
              </button>
            </div>
          )}

          {/* Responsive Persistent Chat Input Bar (Pinned dock on mobile, floating capsule on desktop) */}
          <div className={cn(
            "fixed bottom-0 inset-x-0 w-full z-40 lg:absolute lg:bottom-5 lg:left-1/2 lg:-translate-x-1/2 lg:w-[92%] lg:max-w-xl lg:z-30 pointer-events-none",
            currentMobileTab !== 'chat' && "hidden lg:block"
          )}>
            <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-slate-700/80 rounded-none shadow-lg px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:bg-white/80 lg:dark:bg-slate-900/80 lg:backdrop-blur-lg lg:border lg:border-stone-200/60 lg:dark:border-slate-700/60 lg:rounded-2xl lg:shadow-2xl lg:p-3.5 sm:lg:p-4 flex flex-col gap-2.5 transition-all">
              
              {/* Starter Frameworks Drawer / Popover (Mobile Block 3A Redesign) */}
              <AnimatePresence>
                {showFrameworks && (
                  <>
                    {/* Mobile Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowFrameworks(false)}
                      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[998] lg:hidden pointer-events-auto cursor-pointer"
                    />

                    {/* Mobile Floating Bottom Card (<lg) / Desktop Full-Width Side-to-Side Popover (lg:) */}
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      className="fixed inset-x-3 bottom-3 max-h-[70vh] sm:inset-x-6 sm:bottom-6 sm:max-h-[65vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 flex flex-col z-[999] pointer-events-auto lg:static lg:absolute lg:bottom-full lg:inset-x-0 lg:w-full lg:mb-3 lg:max-h-[205px] lg:rounded-2xl lg:border lg:border-stone-200/80 lg:dark:border-slate-800 lg:bg-white/95 lg:dark:bg-slate-900/95 lg:backdrop-blur-2xl lg:shadow-2xl lg:p-3.5 overflow-hidden"
                    >
                      {/* Top Drag Pill Indicator (<lg) */}
                      <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3 shrink-0 lg:hidden" />
                      
                      {/* Modal Header */}
                      <div className="pb-2 mb-2 border-b border-stone-200/60 dark:border-slate-800/80 shrink-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookTemplate size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Starter Prompt Frameworks
                          </span>
                        </div>
                        <button
                          onClick={() => setShowFrameworks(false)}
                          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-full transition-colors"
                          aria-label="Close Frameworks Modal"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Modal Body: Side-to-Side Entries, 2-Card Viewport, Hidden Scrollbar */}
                      <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-2 pr-0.5">
                        {ALL_FRAMEWORKS.filter(f => {
                          if (promptType === 'code') return f.category === 'code' || f.domain === 'code';
                          if (promptType === 'audio') return f.category === 'audio' || f.domain === 'audio';
                          return f.category === promptType;
                        }).map(fw => (
                          <button
                            key={fw.id}
                            onClick={() => {
                              setInput(fw.template);
                              setShowFrameworks(false);
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-stone-200/80 dark:border-slate-800/80 bg-stone-50/70 dark:bg-slate-800/40 text-xs hover:border-emerald-500/50 hover:bg-emerald-50/60 dark:hover:bg-slate-800/90 transition-all active:scale-[0.99] group flex flex-col gap-1 cursor-pointer"
                          >
                            <div className="font-bold flex items-center justify-between gap-2">
                              <span className="text-stone-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-xs font-bold truncate">{fw.name}</span>
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 px-2 py-0.5 rounded-full shrink-0">{fw.domainName}</span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{fw.description || fw.template.replace(/\n/g, ' ')}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Mobile Quick-Add Suggestions Carousel (Horizontally scrollable pills above docked input on <lg) */}
              {contextualQuickAddSuggestions.length > 0 && (
                <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 shrink-0 pr-1">
                    <Zap size={12} />
                    <span>Quick Add:</span>
                  </div>
                  {contextualQuickAddSuggestions.map(sug => (
                    <button
                      key={sug.id}
                      onClick={() => handleToggleQuickAddSuggestion(sug)}
                      className={cn(
                        "text-[11px] font-bold rounded-full border transition-all shrink-0 min-h-[38px] px-3.5 flex items-center gap-1.5 active:scale-95",
                        sug.active
                          ? "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 shadow-xs"
                          : "bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 border-stone-200 dark:border-slate-700 hover:border-emerald-300"
                      )}
                    >
                      {sug.active ? (
                        <>
                          <Check size={12} className="text-white stroke-[3]" />
                          <span>{sug.label}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-emerald-500 font-bold">+</span>
                          <span>{sug.label}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Top Row in Input Bar: Guidance / Quick Frameworks button */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500">
                  {promptType.toUpperCase()} ARCHITECT
                </span>
                <button 
                  onClick={() => setShowFrameworks(!showFrameworks)}
                  className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/50 dark:border-emerald-800/40 transition-colors"
                >
                  <BookTemplate size={14} />
                  <span>Starter Frameworks</span>
                </button>
              </div>

              {/* Staged Multi-Select Calibration Badges */}
              {selectedOptions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mr-1 shrink-0">
                    <Sparkles size={11} />
                    <span>Staged Options:</span>
                  </div>
                  {selectedOptions.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 shadow-2xs shrink-0"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedOptions(prev => prev.filter(t => t !== tag))}
                        className="hover:opacity-75 p-0.5 ml-0.5"
                        title="Remove option"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedOptions([])}
                    className="text-[10px] font-semibold text-stone-400 hover:text-pink-600 dark:hover:text-pink-400 ml-auto px-1.5 py-0.5 rounded transition-colors shrink-0"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Attachments Preview */}
              {(selectedImage || attachedFiles.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {selectedImage && (
                    <div className="relative inline-block">
                      {selectedImage.mimeType?.startsWith("image/") ? (
                        <img src={selectedImage.url} alt="Selected" className="h-14 w-14 object-cover rounded-xl border-2 border-emerald-500 shadow-sm" referrerPolicy="no-referrer" />
                      ) : selectedImage.mimeType?.startsWith("video/") ? (
                        <video src={selectedImage.url} className="h-14 w-14 object-cover rounded-xl border-2 border-emerald-500 shadow-sm" muted playsInline autoPlay loop />
                      ) : (
                        <div className="h-14 w-14 bg-stone-100 dark:bg-slate-700 border-2 border-emerald-500 rounded-xl flex flex-col items-center justify-center p-1 text-center shadow-sm">
                          <Paperclip size={14} className="text-emerald-500" />
                          <span className="text-[8px] font-black text-stone-500 dark:text-slate-400 truncate w-full">{selectedImage.name || 'File'}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-1.5 -right-1.5 bg-stone-900 dark:bg-slate-700 text-white rounded-full p-1 shadow-md hover:bg-pink-600 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="relative flex items-center gap-1.5 bg-stone-100 dark:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-slate-600">
                      <Paperclip size={13} className="text-stone-500 dark:text-slate-400" />
                      <span className="text-xs font-medium text-stone-700 dark:text-slate-300 max-w-[140px] truncate">{file.name}</span>
                      <button
                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="ml-1 p-1 text-stone-400 hover:text-pink-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative flex items-center group">
                <input
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json"
                  multiple
                  className="hidden"
                  ref={textFileInputRef}
                  onChange={handleTextFileUpload}
                />
                <div className="absolute left-1.5 bottom-1.5 flex items-center gap-1 z-10">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-[38px] min-w-[38px] p-2 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center border border-stone-200/60 dark:border-slate-700/60"
                    title="Upload image or media"
                  >
                    <ImagePlus size={16} />
                  </button>
                  <button
                    onClick={() => textFileInputRef.current?.click()}
                    className="min-h-[38px] min-w-[38px] p-2 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-center border border-stone-200/60 dark:border-slate-700/60"
                    title="Attach text context (.txt, .md, .csv)"
                  >
                    <Paperclip size={16} />
                  </button>
                </div>

                <textarea
                  ref={chatInputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Describe your idea or request prompt refinements... (Shift+Enter for line break)"
                  className={cn(
                    "w-full pl-24 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition-all text-sm font-medium shadow-inner text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500 min-h-[44px] max-h-[220px] resize-none overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden leading-relaxed",
                    lastResult?.refinedPrompt ? "pr-24" : "pr-14"
                  )}
                  disabled={isLoading}
                />

                <div className="absolute right-1.5 bottom-1.5 flex gap-1.5 z-10">
                  {lastResult?.refinedPrompt && (
                    <button
                      onClick={() => {
                        const final = getFinalPrompt();
                        handleSend(`Please refine this prompt further:\n\n${final}`);
                      }}
                      disabled={isLoading}
                      className="min-h-[38px] min-w-[38px] p-2 bg-stone-200 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-stone-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs active:scale-95 flex items-center justify-center"
                      title="Refine Current Prompt"
                    >
                      <Sparkles size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && selectedOptions.length === 0 && !selectedImage && attachedFiles.length === 0) || isLoading}
                    className="min-h-[38px] min-w-[38px] p-2 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-200 dark:shadow-none active:scale-95 flex items-center justify-center"
                    title="Send Message (Enter)"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Architectural Output */}
        <div 
          className="hidden lg:flex w-1.5 cursor-col-resize bg-stone-200 dark:bg-slate-700 hover:bg-emerald-500 active:bg-emerald-600 z-20 items-center justify-center group transition-colors"
          onMouseDown={(e) => {
            setIsDragging(true);
            lastXRef.current = e.clientX;
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            lastXRef.current = e.touches[0].clientX;
          }}
        >
          <div className="h-8 w-0.5 bg-stone-400 dark:bg-slate-500 rounded-full group-hover:bg-white" />
        </div>

        <div 
          className={cn(
            "w-full lg:w-[var(--right-panel-width)] flex-col bg-emerald-50/40 dark:bg-emerald-900/10 border-t lg:border-t-0 border-emerald-100 dark:border-emerald-900/30 overflow-y-auto shrink-0 min-w-[280px]",
            currentMobileTab === 'output' ? 'flex flex-1 h-full min-h-0' : 'hidden lg:flex'
          )}
          style={{ '--right-panel-width': `${rightPanelWidth}px` } as React.CSSProperties}
        >
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("transition-all pb-24 lg:pb-6", isRightPanelCompact ? "p-3.5 sm:p-4" : "p-5 lg:p-6")}
          >
            {/* Header: Stats & Quality Score */}
            <div className="flex flex-col gap-2.5 mb-4">
              <div className="w-full flex items-center justify-between gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-1 px-2 py-1 bg-stone-100/80 dark:bg-slate-800/80 border border-stone-200/50 dark:border-slate-700/50 rounded-lg text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono shrink-0 shadow-2xs">
                    {getFinalPrompt().length} <span className="text-stone-400 dark:text-slate-500 font-sans font-medium text-[9px]">CHARS</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-stone-100/80 dark:bg-slate-800/80 border border-stone-200/50 dark:border-slate-700/50 rounded-lg text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                    {getFinalPrompt().split(/\s+/).filter(Boolean).length} <span className="text-stone-400 dark:text-slate-500 font-sans font-medium text-[9px]">WORDS</span>
                  </div>
                </div>

                <div 
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0 cursor-help transition-all shadow-2xs group relative",
                    calculatePromptScore(getFinalPrompt(), promptType).score >= 80 
                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50" 
                      : calculatePromptScore(getFinalPrompt(), promptType).score >= 50 
                        ? "bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/50" 
                        : "bg-pink-50/80 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-pink-200/60 dark:border-pink-800/50"
                  )}
                  onClick={() => setShowScoreDetails(!showScoreDetails)}
                  onMouseLeave={() => setShowScoreDetails(false)}
                >
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">SCORE:</span>
                  <span>{calculatePromptScore(getFinalPrompt(), promptType).score}%</span>
                  <div 
                    className={cn(
                      "fixed left-4 right-4 top-1/2 -translate-y-1/2 lg:absolute lg:top-full lg:right-0 lg:left-auto lg:translate-y-0 lg:mt-2 lg:w-72 max-w-[calc(100vw-2rem)] p-4 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-[100]",
                      showScoreDetails ? "block" : "hidden lg:group-hover:block"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Mobile close button */}
                    <div className="flex justify-between items-center mb-3 lg:hidden">
                      <span className="font-bold text-slate-200 text-sm">Score Details</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowScoreDetails(false);
                        }}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    {calculatePromptScore(getFinalPrompt(), promptType).strengths.length > 0 && (
                      <>
                        <div className="font-bold mb-2 text-emerald-400">Strengths:</div>
                        <ul className="list-disc pl-4 space-y-1 mb-3 text-emerald-100/90 whitespace-normal">
                          {calculatePromptScore(getFinalPrompt(), promptType).strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {calculatePromptScore(getFinalPrompt(), promptType).improvements.length > 0 && (
                      <>
                        <div className="font-bold mb-2 text-amber-400">Suggestions to Improve:</div>
                        <ul className="list-disc pl-4 space-y-1 text-amber-100/90 whitespace-normal">
                          {calculatePromptScore(getFinalPrompt(), promptType).improvements.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  
                  {/* Mobile overlay */}
                  {showScoreDetails && (
                    <div 
                      className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowScoreDetails(false);
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Dynamic Responsive Action Toolbar (5 Columns) */}
              <div className="grid grid-cols-5 gap-1.5 w-full min-w-0">
                {/* 1. SAVE / UPDATE */}
                <button
                  onClick={() => {
                    if (!editingPrompt && lastResult) {
                      setSaveData({
                        title: lastResult.suggestedTitle || '',
                        tags: lastResult.suggestedTags ? lastResult.suggestedTags.join(', ') : '',
                        versionNotes: ''
                      });
                    }
                    setShowSaveModal(true);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold border border-emerald-100 dark:border-emerald-800/50 shadow-2xs hover:shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group min-w-0 overflow-hidden",
                    isRightPanelUltraCompact ? "h-9 p-1" : isRightPanelWide ? "py-2 px-1.5" : "py-1.5 px-1"
                  )}
                  title={editingPrompt ? "Update saved prompt" : "Save prompt to library"}
                  aria-label={editingPrompt ? "Update saved prompt" : "Save prompt to library"}
                >
                  <div className="flex items-center justify-center gap-1 w-full min-w-0 px-0.5">
                    {editingPrompt ? <Save size={isRightPanelUltraCompact ? 15 : 13} className="shrink-0" /> : <Plus size={isRightPanelUltraCompact ? 15 : 13} className="shrink-0" />}
                    {!isRightPanelUltraCompact && (
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight truncate min-w-0">
                        {editingPrompt ? 'Update' : 'Save'}
                      </span>
                    )}
                  </div>
                  {isRightPanelWide && (
                    <span className="text-[9px] text-stone-400 dark:text-slate-500 font-medium tracking-tight mt-0.5 leading-none truncate min-w-0">
                      Library
                    </span>
                  )}
                </button>

                {/* 2. COPY PROMPT */}
                <button
                  onClick={copyToClipboard}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl font-bold transition-all shadow-2xs group min-w-0 overflow-hidden",
                    isRightPanelUltraCompact ? "h-9 p-1" : isRightPanelWide ? "py-2 px-1.5" : "py-1.5 px-1",
                    copiedType === 'text'
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                      : "bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-400"
                  )}
                  title={copiedType === 'text' ? "Copied prompt to clipboard!" : "Copy prompt text to clipboard"}
                  aria-label="Copy prompt"
                >
                  <div className="flex items-center justify-center gap-1 w-full min-w-0 px-0.5">
                    {copiedType === 'text' ? <Check size={isRightPanelUltraCompact ? 15 : 13} className="stroke-[3] shrink-0" /> : <Copy size={isRightPanelUltraCompact ? 15 : 13} className="shrink-0" />}
                    {!isRightPanelUltraCompact && (
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight truncate min-w-0">
                        {copiedType === 'text' ? 'Copied!' : 'Copy'}
                      </span>
                    )}
                  </div>
                  {isRightPanelWide && (
                    <span className="text-[9px] text-emerald-100 dark:text-slate-900/80 font-medium tracking-tight mt-0.5 leading-none truncate min-w-0">
                      Prompt
                    </span>
                  )}
                </button>

                {/* 3. DOWNLOAD MARKDOWN */}
                <button
                  onClick={handleDownloadMarkdown}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border transition-all shadow-2xs group min-w-0 overflow-hidden",
                    isRightPanelUltraCompact ? "h-9 p-1" : isRightPanelWide ? "py-2 px-1.5" : "py-1.5 px-1",
                    copiedType === 'markdown'
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600"
                      : "bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-emerald-50/50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                  )}
                  title={copiedType === 'markdown' ? "Saved Markdown file!" : "Download prompt as Markdown (.md) document"}
                  aria-label="Download prompt as Markdown"
                >
                  <div className="flex items-center justify-center gap-1 w-full min-w-0 px-0.5">
                    {copiedType === 'markdown' ? <Check size={isRightPanelUltraCompact ? 15 : 13} className="text-emerald-600 dark:text-emerald-400 stroke-[3] shrink-0" /> : <FileCode size={isRightPanelUltraCompact ? 15 : 13} className="text-emerald-500 shrink-0" />}
                    {!isRightPanelUltraCompact && (
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight truncate min-w-0">
                        {copiedType === 'markdown' ? 'Saved' : 'MD'}
                      </span>
                    )}
                  </div>
                  {isRightPanelWide && (
                    <span className="text-[9px] font-mono font-medium text-stone-400 dark:text-slate-500 tracking-tight mt-0.5 leading-none truncate min-w-0">
                      Markdown
                    </span>
                  )}
                </button>

                {/* 4. COPY JSON */}
                <button
                  onClick={copyAsJSON}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border transition-all shadow-2xs group min-w-0 overflow-hidden",
                    isRightPanelUltraCompact ? "h-9 p-1" : isRightPanelWide ? "py-2 px-1.5" : "py-1.5 px-1",
                    copiedType === 'json'
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600"
                      : "bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-emerald-50/50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                  )}
                  title={copiedType === 'json' ? "Copied JSON structure!" : "Copy prompt formatted as JSON structure"}
                  aria-label="Copy JSON structure"
                >
                  <div className="flex items-center justify-center gap-1 w-full min-w-0 px-0.5">
                    {copiedType === 'json' ? <Check size={isRightPanelUltraCompact ? 15 : 13} className="text-emerald-600 dark:text-emerald-400 stroke-[3] shrink-0" /> : <Braces size={isRightPanelUltraCompact ? 15 : 13} className="text-amber-500 shrink-0" />}
                    {!isRightPanelUltraCompact && (
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight truncate min-w-0">
                        {copiedType === 'json' ? 'Copied' : isRightPanelWide ? 'Copy JSON' : 'JSON'}
                      </span>
                    )}
                  </div>
                  {isRightPanelWide && (
                    <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 tracking-tight mt-0.5 leading-none truncate min-w-0">
                      JSON Data
                    </span>
                  )}
                </button>

                {/* 5. DOWNLOAD JSON */}
                <button
                  onClick={handleDownloadJSON}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border transition-all shadow-2xs group min-w-0 overflow-hidden",
                    isRightPanelUltraCompact ? "h-9 p-1" : isRightPanelWide ? "py-2 px-1.5" : "py-1.5 px-1",
                    copiedType === 'download'
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600"
                      : "bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-emerald-50/50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                  )}
                  title={copiedType === 'download' ? "Saved JSON file!" : "Download prompt and settings as .json file"}
                  aria-label="Download JSON file"
                >
                  <div className="flex items-center justify-center gap-1 w-full min-w-0 px-0.5">
                    {copiedType === 'download' ? <Check size={isRightPanelUltraCompact ? 15 : 13} className="text-emerald-600 dark:text-emerald-400 stroke-[3] shrink-0" /> : <FileJson size={isRightPanelUltraCompact ? 15 : 13} className="text-blue-500 shrink-0" />}
                    {!isRightPanelUltraCompact && (
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight truncate min-w-0">
                        {copiedType === 'download' ? 'Saved' : isRightPanelWide ? 'Download' : 'Down'}
                      </span>
                    )}
                  </div>
                  {isRightPanelWide && (
                    <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 tracking-tight mt-0.5 leading-none truncate min-w-0">
                      JSON File
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Variable Blueprints (when variables are present in the prompt) */}
            {Object.keys(variables).length > 0 && (
              <div className="mb-4 p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={13} className="text-emerald-500 dark:text-emerald-400" />
                  <span className="text-[10px] font-black text-stone-500 dark:text-slate-400 uppercase tracking-widest">Variable Blueprints</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {Object.entries(variables).map(([name, value]) => {
                    const suggestions = VARIABLE_SUGGESTIONS[name.toUpperCase()] || [];
                    return (
                      <div key={name} className="space-y-1">
                        <label className="block text-[9px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider ml-1">{name}</label>
                        <input 
                          type="text"
                          value={value}
                          onChange={e => setVariables(prev => ({ ...prev, [name]: e.target.value }))}
                          placeholder={`Enter ${name.toLowerCase()}...`}
                          className="w-full px-3 py-1.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-stone-300 dark:placeholder:text-slate-500 text-stone-900 dark:text-slate-100"
                        />
                        {suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {suggestions.map(suggestion => (
                              <button
                                key={suggestion}
                                onClick={() => setVariables(prev => ({ ...prev, [name]: suggestion }))}
                                className="px-1.5 py-0.5 text-[8px] font-bold bg-stone-100 dark:bg-slate-700/50 text-stone-500 dark:text-slate-400 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contextual Suggestive Frameworks Bar */}
            <div className="mb-4 p-3.5 bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-emerald-100/60 dark:border-emerald-800/40 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BookTemplate size={13} className="text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-slate-400 truncate">
                    {isRightPanelCompact ? 'Frameworks:' : 'Contextual Frameworks:'}
                  </span>
                  {contextualFrameworksData.suggested.some(f => (f.score || 0) > 2) && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                      {isRightPanelCompact ? 'Matched' : 'Prompt Matched'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 bg-stone-100/80 dark:bg-slate-900/60 p-0.5 rounded-lg border border-stone-200/50 dark:border-slate-700/50">
                  {[
                    { id: 'current', label: isRightPanelCompact ? 'Top' : 'Suggested' },
                    { id: 'video', label: isRightPanelCompact ? 'Vid' : 'Video' },
                    { id: 'image', label: isRightPanelCompact ? 'Img' : 'Image' },
                    { id: 'text', label: isRightPanelCompact ? 'Txt' : 'Text/Code' },
                    { id: 'all', label: 'All' },
                  ].map(tab => {
                    const isActive = activeFrameworkCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveFrameworkCategory(tab.id as any)}
                        className={cn(
                          "text-[10px] font-bold uppercase px-2 py-1 rounded-md transition-all min-h-[32px] flex items-center justify-center",
                          isActive
                            ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs"
                            : "text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200"
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horizontal carousel on mobile, flex-wrap on desktop */}
              <div className="flex overflow-x-auto lg:overflow-visible lg:flex-wrap no-scrollbar gap-2 py-1 -mx-1 px-1 lg:mx-0 lg:px-0">
                {contextualFrameworksData.suggested.map((fw: ContextualFramework) => {
                  const isTransformingThis = isTransformingFramework && transformingFrameworkName === fw.name;
                  const isContextMatch = (fw.score || 0) > 2;

                  return (
                    <button 
                      key={fw.id} 
                      disabled={isTransformingFramework}
                      onClick={() => handleApplyFramework(fw)} 
                      title={`${fw.name} — ${fw.description}`}
                      className={cn(
                        "text-[11px] font-bold rounded-xl border transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 group text-left shrink-0 min-h-[38px] px-3.5",
                        isTransformingThis
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                          : isContextMatch
                            ? "bg-emerald-50/70 dark:bg-emerald-950/30 text-stone-800 dark:text-slate-100 border-emerald-300 dark:border-emerald-700/80 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 hover:border-emerald-400"
                            : "bg-white dark:bg-slate-700/80 text-stone-700 dark:text-slate-200 border-stone-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 disabled:opacity-50 disabled:pointer-events-none"
                      )}
                    >
                      <Sparkles size={12} className={cn("shrink-0", isTransformingThis ? "text-white animate-spin" : isContextMatch ? "text-emerald-500" : "text-stone-400 dark:text-slate-400 group-hover:text-emerald-500")} />
                      <span className="font-semibold">{fw.name}</span>
                      {fw.domainName && !isRightPanelCompact && (
                        <span className={cn(
                          "text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0",
                          isTransformingThis
                            ? "bg-emerald-700/50 text-emerald-100"
                            : isContextMatch
                              ? "bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                              : "bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400"
                        )}>
                          {fw.domainName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contextual Suggestive Quick Add */}
            <div className="mb-4 p-3.5 bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-emerald-100/60 dark:border-emerald-800/40 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Zap size={13} className="text-amber-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-slate-400 truncate">
                    {isRightPanelCompact ? 'Quick Add:' : 'Contextual Quick Add:'}
                  </span>
                </div>
                {!isRightPanelCompact && (
                  <span className="text-[9px] font-medium text-stone-400 dark:text-slate-500 truncate">
                    Click to insert • Click active to remove
                  </span>
                )}
              </div>

              {/* Horizontal carousel on mobile, flex-wrap on desktop */}
              <div className="flex overflow-x-auto lg:overflow-visible lg:flex-wrap no-scrollbar gap-2 py-1 -mx-1 px-1 lg:mx-0 lg:px-0">
                {contextualQuickAddSuggestions.map(sug => {
                  return (
                    <button 
                      key={sug.id} 
                      onClick={() => handleToggleQuickAddSuggestion(sug)} 
                      title={sug.active ? `Remove "${sug.label}" from prompt` : `Insert "${sug.label}" into prompt`}
                      className={cn(
                        "text-[11px] font-bold rounded-xl border transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 shrink-0 min-h-[38px] px-3.5",
                        sug.active
                          ? "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-xs shadow-emerald-600/30 hover:bg-emerald-700 dark:hover:bg-emerald-600"
                          : "bg-white dark:bg-slate-700/80 text-stone-700 dark:text-slate-200 border-stone-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                      )}
                    >
                      {sug.active ? (
                        <>
                          <Check size={12} className="text-white stroke-[3]" />
                          <span>{sug.label}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-emerald-500 font-bold">+</span>
                          <span>{sug.label}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
