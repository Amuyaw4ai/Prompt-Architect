import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculatePromptScore(promptText: string): { score: number; feedback: string[] } {
  if (!promptText || promptText.trim().length === 0) {
    return { score: 0, feedback: ['Prompt is empty.'] };
  }

  let score = 0;
  const feedback: string[] = [];
  const words = promptText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Base Score (Length & Detail)
  if (wordCount >= 30 && wordCount <= 150) {
    score += 40;
    feedback.push('Good length (30-150 words).');
  } else if (wordCount > 150 && wordCount <= 500) {
    score += 30;
    feedback.push('A bit long, but detailed.');
  } else if (wordCount > 500) {
    score += 20;
    feedback.push('Very long prompt. Consider being more concise.');
  } else if (wordCount >= 10 && wordCount < 30) {
    score += 20;
    feedback.push('A bit short. Adding more context might help.');
  } else {
    score += 10;
    feedback.push('Too short. Needs more detail.');
  }

  const lowerPrompt = promptText.toLowerCase();

  // 2. Role/Persona Assignment (+10 points)
  if (/(act as|you are|imagine you are|role of|expert in)/i.test(lowerPrompt)) {
    score += 10;
    feedback.push('Great use of persona/role assignment.');
  } else {
    feedback.push('Consider assigning a role (e.g., "Act as an expert...").');
  }

  // 3. Clear Action Verbs (+10 points)
  if (/^(write|generate|analyze|create|summarize|translate|explain|list|provide|describe)/i.test(lowerPrompt) || 
      /(please write|please generate|please analyze|please create|please summarize|please translate|please explain|please list|please provide|please describe)/i.test(lowerPrompt)) {
    score += 10;
    feedback.push('Clear action verbs used.');
  } else {
    feedback.push('Start with a strong action verb (e.g., "Write", "Generate").');
  }

  // 4. Constraints & Boundaries (+10 points)
  if (/(must|only|do not|avoid|maximum of|exactly|at least|no more than)/i.test(lowerPrompt)) {
    score += 10;
    feedback.push('Good use of constraints and boundaries.');
  } else {
    feedback.push('Add constraints to guide the AI (e.g., "Do not include...", "Maximum of...").');
  }

  // 5. Formatting & Structure (+10 points)
  if (/(#|- |\*\*|:)/.test(promptText)) {
    score += 10;
    feedback.push('Good structural formatting.');
  } else {
    feedback.push('Use formatting like bullet points or bold text to organize the prompt.');
  }

  // 6. Variables & Templates (+10 points)
  if (/(\[[A-Z_]+\]|\{[a-zA-Z_]+\})/.test(promptText)) {
    score += 10;
    feedback.push('Excellent use of variables/placeholders.');
  } else {
    feedback.push('Use placeholders (e.g., [SUBJECT]) to make the prompt reusable.');
  }

  // 7. Output Examples / Few-Shot Prompting (+10 points)
  if (/(for example|example output|here is an example|like this:)/i.test(lowerPrompt)) {
    score += 10;
    feedback.push('Helpful use of examples.');
  } else {
    feedback.push('Provide an example of the desired output format.');
  }

  return { score: Math.min(100, score), feedback };
}
