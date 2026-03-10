export type PromptType = 'image' | 'video' | 'text';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  imageUrl?: string;
}

export interface PromptResult {
  refinedPrompt: string;
  explanation: string;
  questions?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  currentType: PromptType;
  updatedAt: number;
  createdAt: number;
}

export interface SavedPrompt {
  id: number;
  title: string;
  originalIdea: string;
  refinedPrompt: string;
  type: PromptType;
  tags: string[];
  messages: Message[];
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
