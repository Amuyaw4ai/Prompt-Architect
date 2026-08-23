import { PromptType } from '../types';

export interface SmartPillOption {
  id: string;
  label: string;
  tokenToAppend: string;
  modality: PromptType;
}

/**
 * 300ms Debounced Client-Side Assist Pills Generator
 * Generates dynamic high-impact completion chips when the user pauses typing.
 */
export function getSmartAssistPills(text: string, modality: PromptType = 'text'): SmartPillOption[] {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    // Idle suggestions
    if (modality === 'image') {
      return [
        { id: 'img-1', label: '+ Add Golden Hour Lighting', tokenToAppend: 'shot in golden hour volumetric lighting', modality: 'image' },
        { id: 'img-2', label: '+ Add 85mm Portrait Lens', tokenToAppend: 'captured on 85mm f/1.8 prime lens with shallow depth of field', modality: 'image' },
        { id: 'img-3', label: '+ Add Cinematic Atmosphere', tokenToAppend: 'dramatic atmosphere, 4k resolution, photorealistic rendering', modality: 'image' },
      ];
    }
    if (modality === 'code') {
      return [
        { id: 'code-1', label: '+ Add TypeScript Strictness', tokenToAppend: 'using TypeScript with strict type definitions and zero any types', modality: 'code' },
        { id: 'code-2', label: '+ Add Error Handling', tokenToAppend: 'include robust try-catch error handling and clear error states', modality: 'code' },
        { id: 'code-3', label: '+ Add Zod Validation', tokenToAppend: 'implement client-side form validation using Zod schemas', modality: 'code' },
      ];
    }
    if (modality === 'video') {
      return [
        { id: 'vid-1', label: '+ Add Slow Dolly Zoom', tokenToAppend: 'slow continuous lateral dolly right with eye-level tracking', modality: 'video' },
        { id: 'vid-2', label: '+ Add 4K 60fps Motion', tokenToAppend: '4k resolution, 60fps fluid motion, cinematic color grading', modality: 'video' },
        { id: 'vid-3', label: '+ Add Volumetric Fog', tokenToAppend: 'heavy volumetric fog drift, dramatic lighting, time-lapse sequencing', modality: 'video' },
      ];
    }
    return [
      { id: 'txt-1', label: '+ Add Expert Persona', tokenToAppend: 'Act as a Senior GTM Marketing Strategist with 10+ years experience.', modality: 'text' },
      { id: 'txt-2', label: '+ Add Target Audience', tokenToAppend: 'Targeted specifically for direct-to-consumer B2B SaaS founders.', modality: 'text' },
      { id: 'txt-3', label: '+ Add Markdown Blueprint', tokenToAppend: 'Format response using clean Markdown headers, executive bullet points, and actionable steps.', modality: 'text' },
    ];
  }

  const options: SmartPillOption[] = [];

  if (modality === 'image') {
    if (!lower.includes('light') && !lower.includes('sun') && !lower.includes('shadow')) {
      options.push({ id: 'img-light', label: '+ Add Volumetric Lighting', tokenToAppend: 'illuminated by warm golden volumetric sunlight', modality: 'image' });
    }
    if (!lower.includes('lens') && !lower.includes('camera') && !lower.includes('angle')) {
      options.push({ id: 'img-cam', label: '+ Add 35mm Film Grain', tokenToAppend: 'captured on 35mm film stock, low angle shot', modality: 'image' });
    }
    if (!lower.includes('8k') && !lower.includes('render') && !lower.includes('detail')) {
      options.push({ id: 'img-qual', label: '+ Add Octane 8K Spec', tokenToAppend: 'photorealistic Octane Render 8k, highly detailed textures', modality: 'image' });
    }
  } else if (modality === 'code') {
    if (!lower.includes('ts') && !lower.includes('typescript') && !lower.includes('type')) {
      options.push({ id: 'code-ts', label: '+ Add React & TypeScript', tokenToAppend: 'built with React 19, TypeScript, and Tailwind CSS', modality: 'code' });
    }
    if (!lower.includes('error') && !lower.includes('catch') && !lower.includes('valid')) {
      options.push({ id: 'code-err', label: '+ Add Error Boundaries', tokenToAppend: 'with full error boundaries, fallback UI, and input validation', modality: 'code' });
    }
    if (!lower.includes('test') && !lower.includes('jest') && !lower.includes('vitest')) {
      options.push({ id: 'code-test', label: '+ Add Unit Test Suite', tokenToAppend: 'include unit tests covering success and edge case failure flows', modality: 'code' });
    }
  } else if (modality === 'video') {
    if (!lower.includes('dolly') && !lower.includes('pan') && !lower.includes('tracking')) {
      options.push({ id: 'vid-track', label: '+ Add Smooth Drone Tracking', tokenToAppend: 'cinematic high-speed drone tracking shot', modality: 'video' });
    }
    if (!lower.includes('fps') && !lower.includes('slow')) {
      options.push({ id: 'vid-fps', label: '+ Add 60fps Motion Blur', tokenToAppend: '60fps stable motion blur, high-speed cinematic rendering', modality: 'video' });
    }
  } else {
    if (!lower.includes('act as') && !lower.includes('persona')) {
      options.push({ id: 'txt-persona', label: '+ Assign Expert Role', tokenToAppend: 'Act as a Senior AI Solutions Architect.', modality: 'text' });
    }
    if (!lower.includes('avoid') && !lower.includes('do not') && !lower.includes('no ')) {
      options.push({ id: 'txt-rules', label: '+ Add Negative Constraints', tokenToAppend: 'Do not use generic buzzwords. Keep instructions concise and actionable.', modality: 'text' });
    }
    if (!lower.includes('format') && !lower.includes('markdown') && !lower.includes('json')) {
      options.push({ id: 'txt-fmt', label: '+ Require JSON & Markdown', tokenToAppend: 'Output response strictly formatted with Markdown section headers.', modality: 'text' });
    }
  }

  return options.slice(0, 3);
}

/**
 * Helper to append a selected assist pill token into an existing prompt text
 */
export function appendPillTokenToPrompt(currentPrompt: string, tokenToAppend: string): string {
  const trimmed = currentPrompt.trim();
  if (!trimmed) return tokenToAppend;
  // If ends with punctuation or letter, add space or period
  const endsWithPeriod = /[.!?]$/.test(trimmed);
  return `${trimmed}${endsWithPeriod ? ' ' : '. '}${tokenToAppend}.`;
}
