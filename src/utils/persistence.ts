import { SavedPrompt, ChatSession } from '../types';

const STORAGE_KEYS = {
  SAVED_PROMPTS: 'prompt_architect_saved_prompts_v1',
  CHAT_SESSIONS: 'prompt_architect_chat_sessions_v1',
  GUEST_MILESTONE_SHOWN: 'prompt_architect_milestone_shown_v1',
  IS_AUTHENTICATED: 'prompt_architect_user_auth_state_v1'
};

const GUEST_PROMPT_MILESTONE_LIMIT = 5;

// Sanitization utility to strip dangerous HTML / script injection patterns
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/(union|select|insert|delete|update|drop|table|alter|exec|cast|declare|script)\b/gi, '')
    .replace(/['";\\=]/g, '')
    .slice(0, 100);
}

// -------------------------------------------------------------
// LOCAL STORAGE PERSISTENCE (Primary Device Storage)
// -------------------------------------------------------------

export function getLocalSavedPrompts(): SavedPrompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROMPTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: any) => {
      let resultHistory = p.resultHistory || p.result_history;
      if (typeof resultHistory === 'string') {
        try { resultHistory = JSON.parse(resultHistory); } catch (e) {}
      }
      let messages = p.messages;
      if (typeof messages === 'string') {
        try { messages = JSON.parse(messages); } catch (e) {}
      }
      return {
        ...p,
        messages: Array.isArray(messages) ? messages : [],
        resultHistory: Array.isArray(resultHistory) ? resultHistory : undefined
      };
    });
  } catch (err) {
    console.warn('Failed to load saved prompts from local device storage:', err);
    return [];
  }
}

export function saveLocalPrompts(prompts: SavedPrompt[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(prompts));
  } catch (err) {
    console.warn('Failed to save prompts to local device storage:', err);
  }
}

export function getLocalChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load chat sessions from local device storage:', err);
    return [];
  }
}

export function saveLocalChatSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save chat sessions to local device storage:', err);
  }
}

// -------------------------------------------------------------
// GUEST CELEBRATORY MILESTONE CHECKER
// -------------------------------------------------------------

export function getIsAuthenticated(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
  } catch {
    return false;
  }
}

export function setAuthenticatedState(isAuth: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, isAuth ? 'true' : 'false');
  } catch (err) {
    console.warn('Failed to set auth state:', err);
  }
}

export function shouldShowMilestoneCelebration(): boolean {
  if (getIsAuthenticated()) return false;

  const localPrompts = getLocalSavedPrompts();
  const localSessions = getLocalChatSessions();
  const totalArchitected = Math.max(localPrompts.length, localSessions.length);

  if (totalArchitected >= GUEST_PROMPT_MILESTONE_LIMIT) {
    const alreadyShown = localStorage.getItem(STORAGE_KEYS.GUEST_MILESTONE_SHOWN);
    if (!alreadyShown) {
      return true;
    }
  }
  return false;
}

export function markMilestoneCelebrationShown(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST_MILESTONE_SHOWN, 'true');
  } catch (err) {
    console.warn('Failed to mark milestone as shown:', err);
  }
}
