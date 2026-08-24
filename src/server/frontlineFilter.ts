import { PromptType } from '../types';

export interface FrontlineAnalysisResult {
  detectedModality: PromptType;
  supportingModalities: PromptType[];
  isMultiTask: boolean;
  wordCount: number;
  characterCount: number;
  isScantyInput: boolean;
  estimatedBaselineScore: number;
  detectedTokens: string[];
  suggestedAssistPills: string[];
}

/**
 * Sub-10ms Server-Side Front-Line Tokenizer & Pre-Classifier
 * Analyzes raw input for Primary Modality, Supporting Modalities, and Multi-Task requests.
 */
export function analyzeFrontlineInput(rawInput: string, preferredModality?: PromptType): FrontlineAnalysisResult {
  const text = rawInput.trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const characterCount = text.length;
  const isScantyInput = wordCount <= 4;

  // 1. Regex Modality Classification Heuristics
  let detectedModality: PromptType = preferredModality || 'text';
  const supportingModalitiesSet = new Set<PromptType>();

  const codeKeywords = /\b(function|const|let|var|import|export|class|interface|type|return|async|await|select|from|where|react|typescript|python|html|css|json|sql|api|bug|error|refactor)\b/i;
  const videoKeywords = /\b(video|clip|movie|film|animation|b-roll|drone shot|panning|tracking shot|zooming|fps|slow-motion|cinematic scene|runway|kling|sora)\b/i;
  const imageKeywords = /\b(photo|picture|image|draw|paint|illustration|logo|poster|portrait|landscape|rendering|midjourney|sdxl|flux|photorealistic|cinematic|lighting|35mm)\b/i;
  const textKeywords = /\b(copywriting|marketing|article|headline|essay|resume|script|story|blog|email|summary|bullet points)\b/i;

  const hasCode = codeKeywords.test(lower);
  const hasVideo = videoKeywords.test(lower);
  const hasImage = imageKeywords.test(lower);
  const hasText = textKeywords.test(lower);

  // Determine Primary vs Supporting Modalities
  if (hasCode) {
    detectedModality = preferredModality || 'code';
    if (hasImage) supportingModalitiesSet.add('image');
    if (hasText) supportingModalitiesSet.add('text');
  } else if (hasVideo) {
    detectedModality = preferredModality || 'video';
    if (hasImage) supportingModalitiesSet.add('image');
    if (hasText) supportingModalitiesSet.add('text');
  } else if (hasImage) {
    detectedModality = preferredModality || 'image';
    if (hasText) supportingModalitiesSet.add('text');
  } else {
    detectedModality = preferredModality || 'text';
  }

  const supportingModalities = Array.from(supportingModalitiesSet).filter((m) => m !== detectedModality);
  const isMultiTask = supportingModalities.length > 0;

  // 2. Token Matching Engine
  const detectedTokens: string[] = [];

  const tokenPatterns = [
    { name: 'Lighting Specs', regex: /\b(golden hour|cinematic lighting|volumetric|rim light|diffused light|studio light|neon)\b/i },
    { name: 'Camera Specs', regex: /\b(35mm|85mm|wide-angle|macro|dolly|tracking|tilt|depth of field|f\/2\.8)\b/i },
    { name: 'Resolution & Engine', regex: /\b(4k|8k|photorealistic|unreal engine 5|octane render|hdr)\b/i },
    { name: 'Code Architecture', regex: /\b(typescript|defensive|error handling|try-catch|unit test|zod|clean code)\b/i },
    { name: 'Format Specs', regex: /\b(markdown|json|table|bullet points|step-by-step)\b/i },
  ];

  tokenPatterns.forEach(({ name, regex }) => {
    if (regex.test(lower)) {
      detectedTokens.push(name);
    }
  });

  // 3. Estimated Baseline Score
  let estimatedBaselineScore = 12;

  if (wordCount === 0) {
    estimatedBaselineScore = 0;
  } else if (wordCount === 1) {
    estimatedBaselineScore = 10;
  } else if (wordCount === 2) {
    estimatedBaselineScore = 14;
  } else if (wordCount <= 4) {
    estimatedBaselineScore = 18;
  } else {
    estimatedBaselineScore = Math.min(85, 20 + wordCount * 2 + detectedTokens.length * 15);
  }

  // 4. Dynamic Smart Assist Pills
  const suggestedAssistPills = generateAssistPillsForModality(detectedModality, lower);

  return {
    detectedModality,
    supportingModalities,
    isMultiTask,
    wordCount,
    characterCount,
    isScantyInput,
    estimatedBaselineScore,
    detectedTokens,
    suggestedAssistPills,
  };
}

function generateAssistPillsForModality(modality: PromptType, lowerText: string): string[] {
  const pills: string[] = [];

  if (modality === 'image') {
    if (!lowerText.includes('light')) pills.push('+ Add Golden Hour Lighting');
    if (!lowerText.includes('lens') && !lowerText.includes('camera') && !lowerText.includes('shot')) pills.push('+ Add 85mm Lens');
    if (!lowerText.includes('style') && !lowerText.includes('render') && !lowerText.includes('photo')) pills.push('+ Add Cinematic Atmosphere');
  } else if (modality === 'video') {
    if (!lowerText.includes('camera') && !lowerText.includes('dolly')) pills.push('+ Add Slow Dolly Zoom');
    if (!lowerText.includes('fps') && !lowerText.includes('4k')) pills.push('+ Add 4K 60fps');
    if (!lowerText.includes('motion') && !lowerText.includes('movement')) pills.push('+ Add Dynamic Motion Blur');
  } else if (modality === 'code') {
    if (!lowerText.includes('type') && !lowerText.includes('ts')) pills.push('+ Add TypeScript Types');
    if (!lowerText.includes('error') && !lowerText.includes('catch')) pills.push('+ Add Error Handling');
    if (!lowerText.includes('test') && !lowerText.includes('zod')) pills.push('+ Add Validation Rules');
  } else {
    if (!lowerText.includes('act as') && !lowerText.includes('role')) pills.push('+ Add Expert Persona');
    if (!lowerText.includes('audience') && !lowerText.includes('for')) pills.push('+ Add Target Audience');
    if (!lowerText.includes('format') && !lowerText.includes('markdown')) pills.push('+ Add Markdown Blueprint');
  }

  return pills.slice(0, 3);
}
