export type PromptType = 'image' | 'video' | 'text';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  imageUrl?: string;
  attachedFiles?: { name: string, content: string }[];
}

export interface PromptResult {
  refinedPrompt: string;
  explanation: string;
  questions?: string[];
  suggestedTitle?: string;
  suggestedTags?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  currentType: PromptType;
  resultHistory?: PromptResult[];
  currentResultIndex?: number;
  updatedAt: number;
  createdAt: number;
}

export interface SavedPrompt {
  id: number;
  parentId?: number;
  title: string;
  originalIdea: string;
  refinedPrompt: string;
  type: PromptType;
  tags: string[];
  messages: Message[];
  isFavorite?: boolean;
  versionNotes?: string;
  createdAt: number;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  type: PromptType;
  category: string;
  template: string; // e.g. "A [subject] in the style of [style]"
  placeholders: string[]; // ["subject", "style"]
  suggestions?: Record<string, string[]>;
  image?: string;
}

export interface Feedback {
  id?: number;
  promptId?: number;
  rating: number;
  comment?: string;
  refinedPrompt: string;
  type: PromptType;
  createdAt?: number;
}
