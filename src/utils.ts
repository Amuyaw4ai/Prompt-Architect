import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PromptType } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePromptScore(promptText: string, type: PromptType): { score: number; strengths: string[]; improvements: string[] } {
  if (!promptText || promptText.trim().length === 0) {
    return { score: 0, strengths: [], improvements: ['Prompt is empty.'] };
  }

  let score = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const words = promptText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lowerPrompt = promptText.toLowerCase();

  // 1. Base Score (Length & Detail) - 30 points max
  if (wordCount >= 20 && wordCount <= 150) {
    score += 30;
    strengths.push('Optimal length for detailed generation.');
  } else if (wordCount > 150) {
    score += 20;
    improvements.push('Very long prompt. Consider being more concise to avoid confusing the model.');
  } else {
    score += 10;
    improvements.push('Too short. Add more descriptive details.');
  }

  if (type === 'text') {
    // Text-specific scoring (70 points total)
    if (/(act as|you are|imagine you are|role of|expert in)/i.test(lowerPrompt)) {
      score += 15;
      strengths.push('Great use of persona/role assignment.');
    } else {
      improvements.push('Assign a role (e.g., "Act as an expert...") to set the tone.');
    }

    if (/(must|only|do not|avoid|maximum of|exactly|at least|no more than)/i.test(lowerPrompt)) {
      score += 15;
      strengths.push('Clear constraints and boundaries.');
    } else {
      improvements.push('Add constraints (e.g., "Do not include...", "Maximum of...") to guide the output.');
    }

    if (/(#|- |\*\*|:)/.test(promptText)) {
      score += 15;
      strengths.push('Good structural formatting.');
    } else {
      improvements.push('Use formatting (bullet points, bold text, headers) to organize instructions.');
    }

    if (/(for example|example output|here is an example|like this:)/i.test(lowerPrompt)) {
      score += 15;
      strengths.push('Helpful use of examples (few-shot prompting).');
    } else {
      improvements.push('Provide an example of the desired output format.');
    }

    if (/(\[[A-Z_]+\]|\{[a-zA-Z_]+\})/.test(promptText)) {
      score += 10;
      strengths.push('Excellent use of variables/placeholders.');
    } else {
      improvements.push('Use placeholders (e.g., [SUBJECT]) to make the prompt reusable.');
    }

  } else if (type === 'image') {
    // Image-specific scoring (70 points total)
    if (/(style of|in the style of|cinematic|photorealistic|illustration|painting|sketch|3d render|anime)/i.test(lowerPrompt)) {
      score += 20;
      strengths.push('Art style is clearly defined.');
    } else {
      improvements.push('Specify an art style (e.g., "photorealistic", "oil painting", "cinematic").');
    }

    if (/(lighting|lit|sunlight|shadows|golden hour|neon|rim lighting|volumetric)/i.test(lowerPrompt)) {
      score += 15;
      strengths.push('Lighting conditions specified.');
    } else {
      improvements.push('Describe the lighting (e.g., "golden hour", "dramatic shadows", "neon lights").');
    }

    if (/(shot|angle|view|close up|wide shot|macro|perspective|lens)/i.test(lowerPrompt)) {
      score += 15;
      strengths.push('Camera angle/composition included.');
    } else {
      improvements.push('Add camera/composition details (e.g., "wide shot", "low angle", "macro").');
    }

    if (/(8k|4k|highly detailed|masterpiece|trending on artstation|unreal engine)/i.test(lowerPrompt)) {
      score += 10;
      strengths.push('Quality modifiers used.');
    } else {
      improvements.push('Include quality modifiers (e.g., "highly detailed", "masterpiece", "8k").');
    }

    if (/(colors|palette|vibrant|muted|monochrome|pastel)/i.test(lowerPrompt)) {
      score += 10;
      strengths.push('Color palette mentioned.');
    } else {
      improvements.push('Suggest a color palette (e.g., "vibrant colors", "muted tones").');
    }

  } else if (type === 'video') {
    // Video-specific scoring (70 points total)
    if (/(pan|zoom|tracking|dolly|tilt|crane|static|handheld|motion|movement)/i.test(lowerPrompt)) {
      score += 20;
      strengths.push('Camera movement specified.');
    } else {
      improvements.push('Describe camera movement (e.g., "slow pan to the right", "zoom in on...").');
    }

    if (/(cinematic|photorealistic|animation|style|look)/i.test(lowerPrompt)) {
      score += 15;
      strengths.push('Visual style/look defined.');
    } else {
      improvements.push('Specify the visual style (e.g., "cinematic", "3D animation", "photorealistic").');
    }

    if (/(lighting|lit|sunlight|shadows|golden hour|neon|atmosphere|mood)/i.test(lowerPrompt)) {
      score += 15;
      strengths.push('Lighting and atmosphere included.');
    } else {
      improvements.push('Describe the lighting and mood (e.g., "moody atmosphere", "bright sunlight").');
    }

    if (/(transition|morph|fade|cut to|suddenly|gradually)/i.test(lowerPrompt)) {
      score += 10;
      strengths.push('Temporal/transition elements mentioned.');
    } else {
      improvements.push('Consider adding temporal elements or transitions (e.g., "gradually turns into...").');
    }

    if (/(fps|slow motion|timelapse|hyperlapse|speed)/i.test(lowerPrompt)) {
      score += 10;
      strengths.push('Playback speed/framerate specified.');
    } else {
      improvements.push('Mention playback speed if relevant (e.g., "slow motion", "timelapse").');
    }
  }

  return { score: Math.min(100, score), strengths, improvements };
}
