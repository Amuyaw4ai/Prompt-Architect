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
import { PromptTypeSelector } from './PromptTypeSelector';
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

interface Props {
  promptType: PromptType;
  onTypeChange: (type: PromptType) => void;
  initialInput?: string;
  initialMessages?: Message[];
  initialResult?: PromptResult;
  editingPrompt?: SavedPrompt;
  currentSession?: ChatSession;
  onSessionUpdate?: (session: ChatSession) => void;
  onInputUsed?: () => void;
  onSaveSuccess?: (savedPrompt: SavedPrompt) => void;
  onSwitchVersion?: (prompt: SavedPrompt) => void;
}

export const ChatInterface: React.FC<Props> = ({ 
  promptType, 
  onTypeChange,
  initialInput, 
  initialMessages,
  initialResult,
  editingPrompt,
  currentSession,
  onSessionUpdate,
  onInputUsed,
  onSaveSuccess,
  onSwitchVersion
}) => {
  const [isLocalMode, setIsLocalMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('prompt_architect_engine_mode');
    return saved ? saved === 'local' : true; // Default is Local mode (Local Studio)
  });

  useEffect(() => {
    localStorage.setItem('prompt_architect_engine_mode', isLocalMode ? 'local' : 'live');
  }, [isLocalMode]);

  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultHistory, setResultHistory] = useState<PromptResult[]>(currentSession?.resultHistory || (initialResult ? [initialResult] : []));
  const [currentResultIndex, setCurrentResultIndex] = useState<number>(currentSession?.currentResultIndex ?? (initialResult ? 0 : -1));
  const lastResult = currentResultIndex >= 0 ? resultHistory[currentResultIndex] : null;
  const [copiedType, setCopiedType] = useState<'text' | 'markdown' | 'json' | 'download' | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string, url: string, name?: string } | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, content: string }[]>([]);
  const [showFrameworks, setShowFrameworks] = useState(false);
  const [isTransformingFramework, setIsTransformingFramework] = useState(false);
  const [transformingFrameworkName, setTransformingFrameworkName] = useState('');
  const [activeFrameworkCategory, setActiveFrameworkCategory] = useState<'current' | 'text' | 'image' | 'video' | 'all'>('current');
  const [rightPanelWidth, setRightPanelWidth] = useState(450);
  const isRightPanelCompact = rightPanelWidth <= 380;
  const [isDragging, setIsDragging] = useState(false);
  const [promptVersions, setPromptVersions] = useState<SavedPrompt[]>([]);
  const [showVersionsDropdown, setShowVersionsDropdown] = useState(false);
  const versionsDropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);
  const lastXRef = useRef<number | null>(null);

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

  const handleSend = async (overrideInput?: string) => {
    const textToUse = overrideInput !== undefined ? overrideInput : input;
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

  const copyAsMarkdownBlock = () => {
    const final = getFinalPrompt();
    navigator.clipboard.writeText(`\`\`\`markdown\n${final}\n\`\`\``);
    setCopiedType('markdown');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyAsJSON = () => {
    if (!lastResult) return;
    const jsonPayload = JSON.stringify({
      title: saveData.title || lastResult.suggestedTitle || 'Architected Prompt',
      prompt: getFinalPrompt(),
      type: promptType,
      variables: variables,
      tags: lastResult.suggestedTags || []
    }, null, 2);
    navigator.clipboard.writeText(jsonPayload);
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadJSON = () => {
    exportToJSON();
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

  const exportToJSON = () => {
    if (!lastResult) return;
    const data = JSON.stringify({
      title: saveData.title || 'Untitled Prompt',
      prompt: getFinalPrompt(),
      variables,
      type: promptType,
      originalIdea: messages.find(m => m.role === 'user')?.content || '',
      tags: saveData.tags.split(',').map(t => t.trim()).filter(Boolean)
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architected_prompt.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isExpired = currentSession && (Date.now() - currentSession.createdAt) > 3600000;

  return (
    <div className="flex flex-col h-auto lg:h-[750px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-stone-200 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
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

      {/* Header with Model Selector */}
      <div className="px-8 py-4 border-b border-stone-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/30 dark:bg-slate-800/50">
        <div className="flex flex-wrap items-center gap-4">
          <PromptTypeSelector selected={promptType} onChange={handleTypeChange} />
          
          {/* Active Mode selector */}
          <div className="flex items-center bg-stone-100 dark:bg-slate-700 p-1 rounded-2xl border border-stone-200 dark:border-slate-600 shadow-sm">
            <button
              onClick={() => setIsLocalMode(true)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                isLocalMode 
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-stone-400 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200"
              )}
              title="Completely private offline heuristic-based compiler"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Local Studio
            </button>
            <button
              onClick={() => setIsLocalMode(false)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                !isLocalMode 
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-stone-400 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200"
              )}
              title="Remote live Google Gemini-3.5-flash agent"
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", !isLocalMode ? "bg-blue-500 animate-pulse" : "bg-stone-300 dark:bg-slate-500")} />
              Live Google AI
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-700 border border-stone-100 dark:border-slate-600 rounded-full shadow-sm">
            <span className="text-[9px] font-bold text-stone-500 dark:text-slate-300 uppercase tracking-widest">
              Engine: {isLocalMode ? "Offline-Heuristic" : "Live-Gemini"}
            </span>
          </div>

          {currentSession && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-700 border border-stone-100 dark:border-slate-600 rounded-full shadow-sm">
              <Clock size={12} className="text-stone-400 dark:text-slate-400" />
              <span className="text-[10px] font-bold text-stone-500 dark:text-slate-300">
                ACTIVE
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {editingPrompt && (
             <div className="relative" ref={versionsDropdownRef}>
               <button 
                 onClick={() => setShowVersionsDropdown(!showVersionsDropdown)}
                 className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
               >
                 <span>Editing: {editingPrompt.title}</span>
                 {promptVersions.length > 1 && <ChevronDown size={12} />}
               </button>
               
               <AnimatePresence>
                 {showVersionsDropdown && promptVersions.length > 1 && (
                   <motion.div
                     initial={{ opacity: 0, y: 5, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 5, scale: 0.95 }}
                     className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-stone-200 dark:border-slate-700 overflow-hidden z-50"
                   >
                     <div className="p-2 border-b border-stone-100 dark:border-slate-700 bg-stone-50 dark:bg-slate-800/50">
                       <h3 className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider px-2">Versions</h3>
                     </div>
                     <div className="max-h-64 overflow-y-auto p-1">
                       {promptVersions.map((version) => (
                         <button
                           key={version.id}
                           onClick={() => {
                             setShowVersionsDropdown(false);
                             if (version.id !== editingPrompt.id) {
                               onSwitchVersion?.(version);
                             }
                           }}
                           className={cn(
                             "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex flex-col gap-1",
                             version.id === editingPrompt.id 
                               ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" 
                               : "hover:bg-stone-50 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-300"
                           )}
                         >
                           <div className="flex items-center justify-between">
                             <span className="font-semibold truncate">{version.title}</span>
                             <span className="text-[10px] opacity-60 shrink-0">
                               {new Date(version.createdAt).toLocaleDateString()}
                             </span>
                           </div>
                           {version.versionNotes && (
                             <span className="text-xs opacity-70 truncate block">
                               {version.versionNotes}
                             </span>
                           )}
                           {version.derivedFromId && (
                             <span className="text-[9px] text-amber-600/70 dark:text-amber-400/70 block mt-0.5">
                               ↳ Branched from {promptVersions.find(p => p.id === version.derivedFromId)?.title || 'previous version'}
                             </span>
                           )}
                         </button>
                       ))}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          )}
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="text-xs font-bold text-stone-400 dark:text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-2 group"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">CLEAR SESSION</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area - Split Pane on Tablet/Desktop */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Column: Chat & Input */}
        <div className="flex-1 flex flex-col min-h-[500px] lg:min-h-0 min-w-0 lg:border-r border-stone-100 dark:border-slate-700">
          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth bg-stone-50/20 dark:bg-slate-900/20"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
                  <Bot size={40} />
                </div>
                <div>
                  <p className="text-2xl font-black text-stone-900 dark:text-slate-100 tracking-tight">Ready to build your prompt?</p>
                  <p className="text-stone-500 dark:text-slate-400 max-w-xs mx-auto mt-2">Enter your basic idea below and I'll architect a detailed expansion for you.</p>
                </div>
              </div>
            )}
            
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`w-full max-w-[94%] sm:max-w-[90%] p-5 sm:p-6 rounded-[1.75rem] shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-emerald-600 dark:bg-emerald-600 text-white rounded-br-md' 
                      : 'bg-white dark:bg-slate-800 border border-stone-100 dark:border-slate-700/80 rounded-bl-md'
                  }`}>
                    {m.imageUrl && (
                      m.mediaType?.startsWith("video/") || m.imageUrl?.startsWith("data:video/") ? (
                        <video src={m.imageUrl} controls className="max-w-full h-auto max-h-64 rounded-xl mb-3 border border-emerald-500/30" />
                      ) : m.mediaType?.startsWith("image/") || m.imageUrl?.startsWith("data:image/") || !m.mediaType ? (
                        <img src={m.imageUrl} alt="Uploaded media" className="max-w-full h-auto max-h-64 object-contain rounded-xl mb-3 border border-emerald-500/30" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-stone-50 dark:bg-slate-900 border border-emerald-500/20 p-3 rounded-xl mb-3">
                          <Paperclip size={16} className="text-emerald-500" />
                          <span className="text-xs font-semibold text-stone-700 dark:text-slate-300">Attached Media file</span>
                        </div>
                      )
                    )}
                    {m.attachedFiles && m.attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {m.attachedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-emerald-700/50 dark:bg-emerald-800/50 px-2.5 py-1.5 rounded-lg border border-emerald-500/30">
                            <Paperclip size={12} className="text-emerald-100" />
                            <span className="text-[11px] font-medium text-emerald-50 max-w-[120px] truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {m.content && (
                      <div className={cn("markdown-body", m.role === 'user' ? "text-white" : "text-stone-800 dark:text-slate-200")}>
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                    {m.role === 'assistant' && (promptType === 'text' || m.content.toLowerCase().includes('format') || m.content.toLowerCase().includes('tone') || m.content.toLowerCase().includes('complexity')) && (
                      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-700/80 space-y-2.5">
                        <div className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>Quick Answer / Calibrate LLM Prompt:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 mr-1">Format:</span>
                          {['Bullet Points', 'Essay', 'Step-by-Step Code', 'JSON Schema', 'Markdown Table'].map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => handleSend(`Set preferred format to: "${fmt}"`)}
                              disabled={isLoading}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 rounded-md border border-emerald-200/50 dark:border-emerald-700/50 transition-colors disabled:opacity-50"
                            >
                              {fmt}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 mr-1">Tone:</span>
                          {['Formal & Professional', 'Casual & Friendly', 'Humorous & Witty', 'Authoritative & Concise'].map((tn) => (
                            <button
                              key={tn}
                              onClick={() => handleSend(`Set desired tone to: "${tn}"`)}
                              disabled={isLoading}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50 rounded-md border border-amber-200/50 dark:border-amber-700/50 transition-colors disabled:opacity-50"
                            >
                              {tn}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-stone-400 dark:text-slate-500 mr-1">Complexity:</span>
                          {['Beginner (ELI5)', 'Intermediate', 'Advanced Expert', 'Executive Summary'].map((cplx) => (
                            <button
                              key={cplx}
                              onClick={() => handleSend(`Set response complexity to: "${cplx}"`)}
                              disabled={isLoading}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/50 rounded-md border border-purple-200/50 dark:border-purple-700/50 transition-colors disabled:opacity-50"
                            >
                              {cplx}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1.5 items-center px-6 py-4 bg-white dark:bg-slate-800 rounded-[1.75rem] rounded-bl-md border border-stone-100 dark:border-slate-700/80 shadow-sm">
                  <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

            {/* Fixed Persistent Prompt Editor Area */}
            {lastResult?.refinedPrompt && (
              <div className="border-t border-emerald-100/60 dark:border-slate-700 bg-emerald-50/20 dark:bg-slate-900/40 p-4 shrink-0 flex flex-col gap-3 max-h-[46vh] overflow-y-auto">
                {/* Variable Blueprints (if any variables detected) */}
                {Object.keys(variables).length > 0 && (
                  <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 grid grid-cols-1 sm:grid-cols-2 gap-2.5 shadow-xs">
                    <div className="col-span-full flex items-center gap-1.5 mb-0.5">
                      <Sparkles size={13} className="text-emerald-500 dark:text-emerald-400" />
                      <span className="text-[10px] font-black text-stone-500 dark:text-slate-400 uppercase tracking-widest">Variable Blueprints</span>
                    </div>
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
                            className="w-full px-3 py-1 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-stone-300 dark:placeholder:text-slate-500 text-stone-900 dark:text-slate-100"
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
                )}

                {/* Prompt Editor with Live Framework Synthesizer Overlay */}
                <div className="relative">
                  <AnimatePresence>
                    {isTransformingFramework && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 z-30 rounded-2xl bg-stone-950/80 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center overflow-hidden border border-emerald-500/40 shadow-2xl"
                      >
                        {/* Animated Cybernetic Scan Line */}
                        <motion.div
                          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/50"
                          >
                            <RefreshCw size={18} className="animate-spin text-emerald-400" />
                          </motion.div>

                          <div className="space-y-0.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <h4 className="text-xs font-black text-white tracking-wide">
                                Transforming into {transformingFrameworkName}
                              </h4>
                            </div>
                            <p className="text-[10px] text-stone-300 dark:text-slate-400 max-w-xs leading-tight">
                              Restructuring prompt parameters into the {transformingFrameworkName} framework schema...
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <PromptEditor
                    value={lastResult.refinedPrompt}
                    onChange={(newVal) => {
                      setResultHistory(prev => {
                        const newHistory = [...prev];
                        newHistory[currentResultIndex] = { ...newHistory[currentResultIndex], refinedPrompt: newVal };
                        return newHistory;
                      });
                    }}
                    variables={variables}
                    currentVersionIndex={currentResultIndex}
                    totalVersions={resultHistory.length}
                    onPreviousVersion={() => handleResultIndexChange(Math.max(0, currentResultIndex - 1))}
                    onNextVersion={() => handleResultIndexChange(Math.min(resultHistory.length - 1, currentResultIndex + 1))}
                  />
                </div>
              </div>
            )}

            {/* Input Area */}
          <div className="p-6 border-t border-stone-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col gap-3 relative">
            
            {/* Frameworks Dropdown */}
            <AnimatePresence>
              {showFrameworks && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-6 mb-2 w-64 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-stone-100 dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Starter Prompt Frameworks</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {ALL_FRAMEWORKS.filter(f => f.category === promptType || f.category === 'text').map(fw => (
                      <button
                        key={fw.id}
                        onClick={() => {
                          setInput(fw.template);
                          setShowFrameworks(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors border-b border-stone-50 dark:border-slate-700/50 last:border-0"
                      >
                        <div className="font-bold mb-1 flex items-center justify-between">
                          <span>{fw.name}</span>
                          <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">{fw.domainName}</span>
                        </div>
                        <div className="text-xs text-stone-400 dark:text-slate-500 truncate">{fw.description || fw.template.replace(/\n/g, ' ')}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guidance Panel */}
            <div className="flex items-center justify-end">
              <button 
                onClick={() => setShowFrameworks(!showFrameworks)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <BookTemplate size={14} />
                Frameworks
              </button>
            </div>

            {/* Attachments Preview */}
            {(selectedImage || attachedFiles.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedImage && (
                  <div className="relative inline-block">
                    {selectedImage.mimeType?.startsWith("image/") ? (
                      <img src={selectedImage.url} alt="Selected" className="h-16 w-16 object-cover rounded-xl border-2 border-emerald-500 shadow-sm" referrerPolicy="no-referrer" />
                    ) : selectedImage.mimeType?.startsWith("video/") ? (
                      <video src={selectedImage.url} className="h-16 w-16 object-cover rounded-xl border-2 border-emerald-500 shadow-sm" muted playsInline autoPlay loop />
                    ) : (
                      <div className="h-16 w-16 bg-stone-100 dark:bg-slate-700 border-2 border-emerald-500 rounded-xl flex flex-col items-center justify-center p-1 text-center shadow-sm">
                        <Paperclip size={16} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-stone-500 dark:text-slate-400 truncate w-full">{selectedImage.name || 'File'}</span>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-stone-900 dark:bg-slate-700 text-white rounded-full p-1 shadow-md hover:bg-pink-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="relative flex items-center gap-2 bg-stone-100 dark:bg-slate-700 px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-600">
                    <Paperclip size={14} className="text-stone-500 dark:text-slate-400" />
                    <span className="text-xs font-medium text-stone-700 dark:text-slate-300 max-w-[150px] truncate">{file.name}</span>
                    <button
                      onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="ml-1 text-stone-400 hover:text-pink-600 transition-colors"
                    >
                      <X size={14} />
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
              <div className="absolute left-2 flex items-center gap-1 z-10">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-slate-900 rounded-full"
                  title="Upload image"
                >
                  <ImagePlus size={18} />
                </button>
                <button
                  onClick={() => textFileInputRef.current?.click()}
                  className="p-2 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-white dark:bg-slate-900 rounded-full"
                  title="Attach text context (.txt, .md, .csv)"
                >
                  <Paperclip size={18} />
                </button>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe your idea or attach context..."
                className={cn(
                  "w-full pl-24 py-5 bg-stone-50 dark:bg-slate-900 border-2 border-transparent rounded-[2rem] focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 outline-none transition-all text-sm font-medium shadow-inner text-stone-900 dark:text-slate-100 placeholder:text-stone-400 dark:placeholder:text-slate-500",
                  lastResult?.refinedPrompt ? "pr-28" : "pr-16"
                )}
                disabled={isLoading}
              />
              <div className="absolute right-3 flex gap-2">
                {lastResult?.refinedPrompt && (
                  <button
                    onClick={() => {
                      const final = getFinalPrompt();
                      handleSend(`Please refine this prompt further:\n\n${final}`);
                    }}
                    disabled={isLoading}
                    className="p-3 bg-stone-200 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-stone-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                    title="Refine Current Prompt"
                  >
                    <Sparkles size={20} />
                  </button>
                )}
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedImage && attachedFiles.length === 0) || isLoading}
                  className="p-3 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-900 rounded-2xl hover:bg-emerald-700 dark:hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95"
                  title="Send Message"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Result Area */}
        {lastResult?.refinedPrompt && (
          <>
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
              className="w-full lg:w-[var(--right-panel-width)] flex flex-col bg-emerald-50/50 dark:bg-emerald-900/10 border-t lg:border-t-0 border-emerald-100 dark:border-emerald-900/30 overflow-y-auto shrink-0 min-w-[280px]"
              style={{ '--right-panel-width': `${rightPanelWidth}px` } as React.CSSProperties}
            >
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn("transition-all", isRightPanelCompact ? "p-3.5 sm:p-4" : "p-6 lg:p-8")}
              >
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className={cn(
                    "font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 truncate",
                    isRightPanelCompact ? "text-[11px]" : "text-xs"
                  )}>
                    Architectural Output
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {getFinalPrompt().split(/\s+/).filter(Boolean).length} {isRightPanelCompact ? 'W' : 'WORDS'}
                    </div>
                    <div 
                      className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold group relative cursor-help",
                        calculatePromptScore(getFinalPrompt(), promptType).score >= 80 ? "bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                        calculatePromptScore(getFinalPrompt(), promptType).score >= 50 ? "bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                        "bg-pink-100/50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
                      )}
                      onClick={() => setShowScoreDetails(!showScoreDetails)}
                      onMouseLeave={() => setShowScoreDetails(false)}
                    >
                      SCORE: {calculatePromptScore(getFinalPrompt(), promptType).score}%
                      <div 
                        className={cn(
                          "fixed left-4 right-4 top-1/2 -translate-y-1/2 lg:absolute lg:top-full lg:left-0 lg:right-auto lg:translate-y-0 lg:mt-2 lg:w-72 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-xl z-[100]",
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
                </div>

                <div className={cn(
                  "grid gap-1.5 w-full",
                  isRightPanelCompact ? "grid-cols-5" : "grid-cols-2 sm:grid-cols-5"
                )}>
                  {/* 1. SAVE */}
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
                      "flex flex-col items-center justify-center bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-800/50 shadow-2xs hover:shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group",
                      isRightPanelCompact ? "h-9 p-0" : "py-2 px-2"
                    )}
                    title={editingPrompt ? "Update saved prompt" : "Save prompt to library"}
                    aria-label={editingPrompt ? "Update saved prompt" : "Save prompt to library"}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {editingPrompt ? <Save size={isRightPanelCompact ? 15 : 13} /> : <Plus size={isRightPanelCompact ? 15 : 13} />}
                      {!isRightPanelCompact && <span className="text-[11px] font-bold uppercase tracking-tight">{editingPrompt ? 'Update' : 'Save'}</span>}
                    </div>
                    {!isRightPanelCompact && (
                      <span className="text-[9px] text-stone-400 dark:text-slate-500 font-medium tracking-tight mt-0.5 leading-none">
                        Library
                      </span>
                    )}
                  </button>

                  {/* 2. COPY PROMPT */}
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all shadow-2xs group",
                      isRightPanelCompact ? "h-9 p-0" : "py-2 px-2",
                      copiedType === 'text'
                        ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                        : "bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-400"
                    )}
                    title={copiedType === 'text' ? "Copied prompt to clipboard!" : "Copy prompt text to clipboard"}
                    aria-label="Copy prompt"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {copiedType === 'text' ? <Check size={isRightPanelCompact ? 15 : 13} className="stroke-[3]" /> : <Copy size={isRightPanelCompact ? 15 : 13} />}
                      {!isRightPanelCompact && <span className="text-[11px] font-bold uppercase tracking-tight">{copiedType === 'text' ? 'Copied!' : 'Copy'}</span>}
                    </div>
                    {!isRightPanelCompact && (
                      <span className="text-[9px] text-emerald-100 dark:text-slate-900/80 font-medium tracking-tight mt-0.5 leading-none">
                        Prompt
                      </span>
                    )}
                  </button>

                  {/* 3. COPY AS MARKDOWN BLOCK */}
                  <button
                    onClick={copyAsMarkdownBlock}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border transition-all shadow-2xs group",
                      isRightPanelCompact ? "h-9 p-0" : "py-2 px-2",
                      copiedType === 'markdown'
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600"
                        : "bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-emerald-50/50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                    )}
                    title={copiedType === 'markdown' ? "Copied Markdown code block!" : "Copy formatted as Markdown code block (```)"}
                    aria-label="Copy formatted as Markdown"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {copiedType === 'markdown' ? <Check size={isRightPanelCompact ? 15 : 13} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" /> : <FileCode size={isRightPanelCompact ? 15 : 13} className="text-emerald-500" />}
                      {!isRightPanelCompact && <span className="text-[11px] font-bold uppercase tracking-tight">{copiedType === 'markdown' ? 'Copied' : 'Copy MD'}</span>}
                    </div>
                    {!isRightPanelCompact && (
                      <span className="text-[9px] font-mono font-medium text-stone-400 dark:text-slate-500 tracking-tight mt-0.5 leading-none">
                        Markdown
                      </span>
                    )}
                  </button>

                  {/* 4. COPY AS JSON */}
                  <button
                    onClick={copyAsJSON}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border transition-all shadow-2xs group",
                      isRightPanelCompact ? "h-9 p-0" : "py-2 px-2",
                      copiedType === 'json'
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600"
                        : "bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-emerald-50/50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                    )}
                    title={copiedType === 'json' ? "Copied JSON payload!" : "Copy prompt formatted as JSON payload"}
                    aria-label="Copy JSON payload"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {copiedType === 'json' ? <Check size={isRightPanelCompact ? 15 : 13} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" /> : <Braces size={isRightPanelCompact ? 15 : 13} className="text-amber-500" />}
                      {!isRightPanelCompact && <span className="text-[11px] font-bold uppercase tracking-tight">{copiedType === 'json' ? 'Copied' : 'Copy JSON'}</span>}
                    </div>
                    {!isRightPanelCompact && (
                      <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 tracking-tight mt-0.5 leading-none">
                        JSON
                      </span>
                    )}
                  </button>

                  {/* 5. DOWNLOAD AS JSON */}
                  <button
                    onClick={handleDownloadJSON}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border transition-all shadow-2xs group",
                      isRightPanelCompact ? "h-9 p-0 col-span-1" : "py-2 px-2 col-span-2 sm:col-span-1",
                      copiedType === 'download'
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600"
                        : "bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:bg-emerald-50/50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                    )}
                    title={copiedType === 'download' ? "Saved JSON file!" : "Download prompt and settings as .json file"}
                    aria-label="Download JSON file"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {copiedType === 'download' ? <Check size={isRightPanelCompact ? 15 : 13} className="text-emerald-600 dark:text-emerald-400 stroke-[3]" /> : <Download size={isRightPanelCompact ? 15 : 13} className="text-blue-500" />}
                      {!isRightPanelCompact && <span className="text-[11px] font-bold uppercase tracking-tight">{copiedType === 'download' ? 'Saved' : 'Download'}</span>}
                    </div>
                    {!isRightPanelCompact && (
                      <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 tracking-tight mt-0.5 leading-none">
                        JSON
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Contextual Suggestive Frameworks Bar */}
              <div className="mb-4 p-3 bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-emerald-100/60 dark:border-emerald-800/40 shadow-sm">
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
                            "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md transition-all",
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

                <div className="flex flex-wrap gap-1.5">
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
                          "text-[10px] font-bold rounded-xl border transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 group text-left",
                          isRightPanelCompact ? "px-2 py-1" : "px-2.5 py-1.5",
                          isTransformingThis
                            ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                            : isContextMatch
                              ? "bg-emerald-50/70 dark:bg-emerald-950/30 text-stone-800 dark:text-slate-100 border-emerald-300 dark:border-emerald-700/80 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 hover:border-emerald-400"
                              : "bg-white dark:bg-slate-700/80 text-stone-700 dark:text-slate-200 border-stone-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 disabled:opacity-50 disabled:pointer-events-none"
                        )}
                      >
                        <Sparkles size={10} className={cn("shrink-0", isTransformingThis ? "text-white animate-spin" : isContextMatch ? "text-emerald-500" : "text-stone-400 dark:text-slate-400 group-hover:text-emerald-500")} />
                        <span className="font-semibold">{fw.name}</span>
                        {fw.domainName && !isRightPanelCompact && (
                          <span className={cn(
                            "text-[8px] font-semibold px-1 py-0.2 rounded uppercase tracking-tighter shrink-0",
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
              <div className="mb-4 p-3 bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-emerald-100/60 dark:border-emerald-800/40 shadow-sm">
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

                <div className="flex flex-wrap gap-1.5">
                  {contextualQuickAddSuggestions.map(sug => {
                    return (
                      <button 
                        key={sug.id} 
                        onClick={() => handleToggleQuickAddSuggestion(sug)} 
                        title={sug.active ? `Remove "${sug.label}" from prompt` : `Insert "${sug.label}" into prompt`}
                        className={cn(
                          "text-[10px] font-bold rounded-lg border transition-all shadow-2xs active:scale-95 flex items-center gap-1.5",
                          isRightPanelCompact ? "px-2 py-0.5" : "px-2.5 py-1",
                          sug.active
                            ? "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-xs shadow-emerald-600/30 hover:bg-emerald-700 dark:hover:bg-emerald-600"
                            : "bg-white dark:bg-slate-700/80 text-stone-700 dark:text-slate-200 border-stone-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                        )}
                      >
                        {sug.active ? (
                          <>
                            <Check size={11} className="text-white stroke-[3]" />
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
          </>
        )}
      </div>
    </div>
  );
};
