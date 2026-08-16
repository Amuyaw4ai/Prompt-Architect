import { PromptType } from '../types';

export interface QuickAddSuggestion {
  id: string;
  label: string;
  tag: string;
  category: 'camera' | 'lighting' | 'motion' | 'style' | 'specs' | 'tone' | 'format' | 'context' | 'character';
  categoryName: string;
  active: boolean;
}

interface DomainRule {
  keywords: RegExp[];
  suggestions: Array<{
    label: string;
    tag: string;
    category: QuickAddSuggestion['category'];
    categoryName: string;
  }>;
}

const DOMAIN_RULES: DomainRule[] = [
  // Avatar / Character / Digital Human / Virtual Influencer
  {
    keywords: [/avatar/i, /digital human/i, /virtual influencer/i, /character/i, /face/i, /portrait/i, /talking/i, /headshot/i],
    suggestions: [
      { label: 'Drone Shot', tag: 'sweeping cinematic drone shot', category: 'camera', categoryName: 'Camera' },
      { label: 'Close-Up Face Tracking', tag: 'tight close-up with precise facial tracking', category: 'camera', categoryName: 'Camera' },
      { label: 'Natural Lipsync & Expressions', tag: 'photorealistic lipsync and subtle micro-expressions', category: 'character', categoryName: 'Character' },
      { label: 'Hyperrealistic Skin Texture', tag: 'subsurface skin scattering and pores texture', category: 'style', categoryName: 'Details' },
      { label: 'Studio Softbox Rim Light', tag: 'studio softbox with subtle edge rim lighting', category: 'lighting', categoryName: 'Lighting' },
      { label: 'Eye Contact & Gaze', tag: 'direct engaging eye contact with natural blink rate', category: 'character', categoryName: 'Character' },
      { label: 'Cinematic Depth of Field', tag: 'shallow depth of field with soft creamy bokeh', category: 'camera', categoryName: 'Camera' },
      { label: '4K 60FPS Fluid Motion', tag: 'crisp 4K 60fps ultra-fluid motion', category: 'specs', categoryName: 'Technical' },
      { label: 'Volumetric Studio Glow', tag: 'soft volumetric atmospheric backlight', category: 'lighting', categoryName: 'Lighting' },
    ]
  },
  // Video & Motion Production
  {
    keywords: [/video/i, /motion/i, /clip/i, /animation/i, /footage/i, /camera/i, /shot/i, /scene/i, /cinematic/i, /film/i, /b-roll/i],
    suggestions: [
      { label: 'Drone Shot', tag: 'high-altitude cinematic drone shot', category: 'camera', categoryName: 'Camera' },
      { label: 'Slow Motion 120fps', tag: 'smooth 120fps slow-motion capture', category: 'motion', categoryName: 'Motion' },
      { label: 'Orbital 360 Pan', tag: 'seamless 360-degree orbital camera rotation', category: 'camera', categoryName: 'Camera' },
      { label: 'First-Person POV', tag: 'dynamic first-person POV perspective', category: 'camera', categoryName: 'Camera' },
      { label: 'Hyperlapse Transition', tag: 'seamless hyperlapse motion transition', category: 'motion', categoryName: 'Motion' },
      { label: 'Golden Hour Lighting', tag: 'warm golden hour sunset lighting with lens flare', category: 'lighting', categoryName: 'Lighting' },
      { label: 'Moody Cinematic Fog', tag: 'volumetric atmospheric fog and cinematic smoke', category: 'lighting', categoryName: 'Atmosphere' },
      { label: 'Anamorphic Widescreen', tag: '2.39:1 anamorphic widescreen cinematic aspect ratio', category: 'specs', categoryName: 'Specs' },
      { label: 'Dutch Angle', tag: 'stylized dramatic Dutch tilt angle', category: 'camera', categoryName: 'Camera' },
    ]
  },
  // Product / Commercial / 3D Rendering
  {
    keywords: [/product/i, /showcase/i, /commercial/i, /packaging/i, /bottle/i, /gadget/i, /device/i, /car/i, /sneaker/i, /jewelry/i, /watch/i, /3d/i, /render/i],
    suggestions: [
      { label: 'Floating Macro Focus', tag: 'floating zero-gravity macro product focus', category: 'camera', categoryName: 'Camera' },
      { label: 'Studio Glossy Reflection', tag: 'glossy dark acrylic surface with clean reflections', category: 'lighting', categoryName: 'Environment' },
      { label: '360 Turntable Spin', tag: 'smooth continuous 360 turntable spin', category: 'motion', categoryName: 'Motion' },
      { label: 'Octane 8K Masterpiece', tag: 'rendered in Octane Render 8K photorealistic ray-tracing', category: 'specs', categoryName: 'Rendering' },
      { label: 'Dramatic Edge Neon', tag: 'dual-tone neon edge illumination', category: 'lighting', categoryName: 'Lighting' },
      { label: 'Exploded View Assembly', tag: 'exploded mechanical view showcasing internal components', category: 'style', categoryName: 'Style' },
      { label: 'Clean Minimalist Gradient', tag: 'seamless minimalist studio gradient backdrop', category: 'style', categoryName: 'Environment' },
    ]
  },
  // Architecture / Landscape / Nature / Drone
  {
    keywords: [/landscape/i, /mountain/i, /nature/i, /forest/i, /ocean/i, /beach/i, /architecture/i, /building/i, /city/i, /street/i, /interior/i],
    suggestions: [
      { label: 'Drone Flyover', tag: 'sweeping cinematic drone flyover', category: 'camera', categoryName: 'Camera' },
      { label: 'Golden Hour Sunset', tag: 'rich golden hour sunlight with long atmospheric shadows', category: 'lighting', categoryName: 'Lighting' },
      { label: 'Blue Hour Twilight', tag: 'ambient blue hour twilight with glowing interior windows', category: 'lighting', categoryName: 'Lighting' },
      { label: 'Ultra-Wide 14mm View', tag: 'ultra-wide 14mm architectural perspective', category: 'camera', categoryName: 'Camera' },
      { label: 'Reflective Wet Surfaces', tag: 'wet reflective ground with pristine puddle reflections', category: 'style', categoryName: 'Environment' },
      { label: 'Lush Atmospheric Haze', tag: 'dense atmospheric mountain mist and god-rays', category: 'lighting', categoryName: 'Atmosphere' },
    ]
  },
  // Anime / Concept Art / Illustration
  {
    keywords: [/anime/i, /manga/i, /illustration/i, /concept art/i, /ghibli/i, /cyberpunk/i, /fantasy/i, /drawing/i, /painting/i],
    suggestions: [
      { label: 'Studio Ghibli Aesthetic', tag: 'hand-painted Studio Ghibli inspired painterly aesthetic', category: 'style', categoryName: 'Style' },
      { label: 'Makoto Shinkai Sky', tag: 'vibrant Makoto Shinkai style hyper-detailed cloudscape', category: 'lighting', categoryName: 'Environment' },
      { label: 'Cyberpunk Neon Glow', tag: 'cyberpunk neon holograms with rain streaks', category: 'lighting', categoryName: 'Atmosphere' },
      { label: 'Dynamic Action Pose', tag: 'exaggerated dynamic keyframe action pose with wind motion', category: 'motion', categoryName: 'Motion' },
      { label: 'ArtStation Trending', tag: 'trending on ArtStation, award-winning concept art', category: 'specs', categoryName: 'Quality' },
      { label: 'Cel Shaded Lines', tag: 'crisp cel-shaded linework with rich watercolor textures', category: 'style', categoryName: 'Style' },
    ]
  },
  // Code / Software Architecture / Tech
  {
    keywords: [/code/i, /react/i, /typescript/i, /python/i, /function/i, /api/i, /database/i, /architecture/i, /refactor/i, /component/i, /backend/i, /frontend/i, /bug/i, /test/i],
    suggestions: [
      { label: 'Strict TypeScript Types', tag: 'Include full strict TypeScript type definitions with zero `any`', category: 'format', categoryName: 'Type Safety' },
      { label: 'Unit Tests (Jest/Vitest)', tag: 'Include comprehensive unit test suites covering edge cases', category: 'format', categoryName: 'Testing' },
      { label: 'Production Error Handling', tag: 'Implement resilient try-catch error boundaries and logging', category: 'context', categoryName: 'Reliability' },
      { label: 'Clean Architecture & JSDoc', tag: 'Follow SOLID principles, clean architecture, and complete JSDoc annotations', category: 'style', categoryName: 'Code Quality' },
      { label: 'Async/Await Performance', tag: 'Optimize with non-blocking async/await and memoization', category: 'specs', categoryName: 'Performance' },
      { label: 'Security & Sanitization', tag: 'Add input validation and OWASP-compliant security sanitization', category: 'specs', categoryName: 'Security' },
    ]
  },
  // Writing / Copywriting / Marketing / Business
  {
    keywords: [/copy/i, /email/i, /blog/i, /essay/i, /marketing/i, /sales/i, /ad/i, /article/i, /story/i, /script/i, /post/i, /seo/i, /pitch/i],
    suggestions: [
      { label: 'High-Converting CTA', tag: 'End with a compelling, irresistible Call to Action (CTA)', category: 'format', categoryName: 'Conversion' },
      { label: 'AIDA Framework Structure', tag: 'Structured cleanly using Attention, Interest, Desire, Action (AIDA)', category: 'format', categoryName: 'Structure' },
      { label: 'Magnetic Hook Headline', tag: 'Open with a scroll-stopping magnetic hook headline', category: 'style', categoryName: 'Engagement' },
      { label: 'Persuasive Emotional Tone', tag: 'Tone: Empathetic, persuasive, and emotionally resonant', category: 'tone', categoryName: 'Tone' },
      { label: 'SEO-Optimized Subheaders', tag: 'Include keyword-rich H2/H3 headers and bulleted takeaways', category: 'format', categoryName: 'SEO' },
      { label: 'Scannable Markdown Tables', tag: 'Format key comparisons in clean, scannable Markdown tables', category: 'format', categoryName: 'Formatting' },
    ]
  }
];

// Fallback suggestions based solely on general modality when text is very short or generic
const MODALITY_FALLBACKS: Record<PromptType, Array<{ label: string; tag: string; category: QuickAddSuggestion['category']; categoryName: string }>> = {
  video: [
    { label: 'Drone Shot', tag: 'sweeping cinematic drone shot', category: 'camera', categoryName: 'Camera' },
    { label: 'Slow Motion 60fps', tag: 'smooth 60fps slow-motion motion', category: 'motion', categoryName: 'Motion' },
    { label: 'Cinematic Pan', tag: 'smooth horizontal cinematic camera pan', category: 'camera', categoryName: 'Camera' },
    { label: 'Golden Hour Light', tag: 'warm golden hour ambient lighting', category: 'lighting', categoryName: 'Lighting' },
    { label: 'Hyperlapse Flow', tag: 'seamless hyperlapse flow transition', category: 'motion', categoryName: 'Motion' },
    { label: 'Moody Atmosphere', tag: 'volumetric atmospheric mood and mist', category: 'lighting', categoryName: 'Atmosphere' },
    { label: '4K Master Footage', tag: 'ultra-sharp 4K cinematic master video', category: 'specs', categoryName: 'Quality' },
  ],
  image: [
    { label: 'Photorealistic 8K', tag: 'photorealistic 8K ultra-detailed render', category: 'specs', categoryName: 'Quality' },
    { label: 'Dramatic Rim Light', tag: 'dramatic rim lighting and soft shadows', category: 'lighting', categoryName: 'Lighting' },
    { label: '85mm Portrait Lens', tag: 'shot on 85mm f/1.4 prime lens with shallow depth of field', category: 'camera', categoryName: 'Camera' },
    { label: 'Cinematic Color Grade', tag: 'cinematic teal and orange color grading', category: 'style', categoryName: 'Color' },
    { label: 'Studio Backdrop', tag: 'seamless minimalist studio backdrop', category: 'style', categoryName: 'Environment' },
    { label: 'Volumetric God Rays', tag: 'ethereal volumetric god rays and dust motes', category: 'lighting', categoryName: 'Lighting' },
  ],
  text: [
    { label: 'Structured Markdown', tag: 'Output Format: Structured Markdown with bullet points and code blocks', category: 'format', categoryName: 'Format' },
    { label: 'Executive Tone', tag: 'Tone: Authoritative, executive, and concise', category: 'tone', categoryName: 'Tone' },
    { label: 'Step-by-Step Reasoning', tag: 'Include step-by-step chain-of-thought breakdown before conclusions', category: 'format', categoryName: 'Reasoning' },
    { label: 'Concrete Examples', tag: 'Provide 2-3 real-world practical examples with before/after comparisons', category: 'context', categoryName: 'Examples' },
    { label: 'Pros & Cons Matrix', tag: 'Include a balanced Pros & Cons evaluation matrix', category: 'format', categoryName: 'Analysis' },
    { label: 'Key Takeaways Summary', tag: 'Conclude with a high-impact Key Takeaways executive summary', category: 'format', categoryName: 'Summary' },
  ]
};

/**
 * Checks whether a tag or its key identifier is currently included inside the prompt text.
 */
export function isTagInPrompt(promptText: string, tag: string, label: string): boolean {
  if (!promptText || !tag) return false;
  const pLower = promptText.toLowerCase();
  const tLower = tag.toLowerCase();
  const lLower = label.toLowerCase();

  // Direct exact match
  if (pLower.includes(tLower)) return true;

  // Key phrase match for compound tags (e.g. "drone shot", "hyperrealistic", "slow motion")
  if (lLower.length > 3 && pLower.includes(lLower)) return true;

  // Sub-phrase match
  const words = lLower.split(/\s+/).filter(w => w.length > 3);
  if (words.length >= 2) {
    const allPresent = words.every(w => pLower.includes(w));
    if (allPresent) return true;
  }

  return false;
}

/**
 * Dynamically computes contextual suggestions tailored to the current prompt in the editor.
 */
export function getContextualSuggestions(promptText: string, promptType: PromptType): QuickAddSuggestion[] {
  const suggestionsMap = new Map<string, QuickAddSuggestion>();
  const raw = promptText.trim();

  // 1. Scan against domain rules
  for (const rule of DOMAIN_RULES) {
    const matches = rule.keywords.some(rx => rx.test(raw));
    if (matches) {
      for (const item of rule.suggestions) {
        if (!suggestionsMap.has(item.label)) {
          const active = isTagInPrompt(raw, item.tag, item.label);
          suggestionsMap.set(item.label, {
            id: `sug-${item.label.toLowerCase().replace(/\s+/g, '-')}`,
            label: item.label,
            tag: item.tag,
            category: item.category,
            categoryName: item.categoryName,
            active
          });
        }
      }
    }
  }

  // 2. Add modality fallbacks if we have fewer than 6 suggestions
  if (suggestionsMap.size < 6) {
    const fallbacks = MODALITY_FALLBACKS[promptType] || MODALITY_FALLBACKS.text;
    for (const item of fallbacks) {
      if (!suggestionsMap.has(item.label)) {
        const active = isTagInPrompt(raw, item.tag, item.label);
        suggestionsMap.set(item.label, {
          id: `sug-${item.label.toLowerCase().replace(/\s+/g, '-')}`,
          label: item.label,
          tag: item.tag,
          category: item.category,
          categoryName: item.categoryName,
          active
        });
      }
    }
  }

  return Array.from(suggestionsMap.values());
}

/**
 * Toggles a suggestion inside the prompt:
 * - If present, cleanly removes it and clears surrounding commas/spaces.
 * - If not present, finds the most natural location in the prompt to insert it.
 */
export function toggleSuggestionInPrompt(currentPrompt: string, suggestion: QuickAddSuggestion, promptType: PromptType): string {
  const raw = currentPrompt.trim();
  const { tag, label, category } = suggestion;

  // Check if currently present
  if (isTagInPrompt(raw, tag, label)) {
    // REMOVAL LOGIC
    return removeTagFromPrompt(raw, tag, label);
  } else {
    // INSERTION LOGIC (Intelligent placement)
    return insertTagSmartly(raw, tag, label, category, promptType);
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Cleanly removes a tag from the prompt text, cleaning up commas, extra spaces, and orphaned lines.
 */
function removeTagFromPrompt(prompt: string, tag: string, label: string): string {
  let result = prompt;

  // Try exact tag removal first (with surrounding punctuation)
  const escapedTag = escapeRegExp(tag);
  const tagPatterns = [
    new RegExp(`,\\s*${escapedTag}`, 'gi'),
    new RegExp(`${escapedTag}\\s*,`, 'gi'),
    new RegExp(`\\n\\s*${escapedTag}`, 'gi'),
    new RegExp(`${escapedTag}\\s*\\n`, 'gi'),
    new RegExp(escapedTag, 'gi')
  ];

  let removed = false;
  for (const pat of tagPatterns) {
    if (pat.test(result)) {
      result = result.replace(pat, '');
      removed = true;
      break;
    }
  }

  // If exact tag was not matched, try matching label variations (e.g. "drone shot")
  if (!removed) {
    const escapedLabel = escapeRegExp(label);
    const labelPatterns = [
      new RegExp(`,\\s*[^,\\n]*${escapedLabel}[^,\\n]*`, 'gi'),
      new RegExp(`[^,\\n]*${escapedLabel}[^,\\n]*,\\s*`, 'gi'),
      new RegExp(`\\n[^\\n]*${escapedLabel}[^\\n]*`, 'gi'),
      new RegExp(`[^,\\n]*${escapedLabel}[^,\\n]*`, 'gi')
    ];

    for (const pat of labelPatterns) {
      if (pat.test(result)) {
        result = result.replace(pat, '');
        break;
      }
    }
  }

  // Cleanup cleanup artifacts:
  // - Double commas ", ," -> ", "
  // - Leading/trailing commas
  // - Multi-space cleanup
  result = result
    .replace(/,\s*,+/g, ',')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/^,\s*/, '')
    .replace(/,\s*$/, '')
    .trim();

  return result;
}

/**
 * Smartly inserts the tag into the most natural location based on category and prompt structure.
 */
function insertTagSmartly(
  prompt: string,
  tag: string,
  label: string,
  category: QuickAddSuggestion['category'],
  promptType: PromptType
): string {
  if (!prompt) return tag;

  // Check if prompt is a single paragraph or comma-delimited list (typical of image/video prompts)
  const isCommaSeparated = prompt.includes(',') && !prompt.includes('\n\n');
  const isStructuredMarkdown = prompt.includes('#') || prompt.includes('###') || prompt.includes('Task:') || prompt.includes('Format:');

  if (isStructuredMarkdown) {
    // 1. Structured Prompt Handling
    if (category === 'format' || category === 'tone') {
      // Look for Format or Tone line
      const formatMatch = prompt.match(/(Format:[^\n]*)/i);
      const toneMatch = prompt.match(/(Tone:[^\n]*)/i);

      if (category === 'format' && formatMatch) {
        return prompt.replace(formatMatch[1], `${formatMatch[1]}, ${tag.replace(/^Output Format:\s*/i, '')}`);
      } else if (category === 'tone' && toneMatch) {
        return prompt.replace(toneMatch[1], `${toneMatch[1]}, ${tag.replace(/^Tone:\s*/i, '')}`);
      } else {
        // Add as a clean directive line
        return `${prompt}\n- ${tag}`;
      }
    } else if (category === 'camera' || category === 'lighting' || category === 'motion' || category === 'specs') {
      // Look for Visual Specs or Context section
      const contextMatch = prompt.match(/(### Context & Details|Context:|Execution Instructions:|### Visual Specifications)/i);
      if (contextMatch) {
        return prompt.replace(contextMatch[1], `${contextMatch[1]}\n- ${tag}`);
      } else {
        return `${prompt}\n\n**Visual Directive**: ${tag}`;
      }
    } else {
      return `${prompt}\n\n- ${tag}`;
    }
  }

  // 2. Video / Image / Natural Language Prompt Handling
  if (category === 'camera') {
    // If prompt has camera mentions, place near them, or after initial subject clause
    const cameraMatch = prompt.match(/(shot|camera|angle|lens|view|pan|tracking)/i);
    if (cameraMatch && cameraMatch.index !== undefined) {
      // Place right after the sentence or comma clause
      const nextComma = prompt.indexOf(',', cameraMatch.index);
      if (nextComma !== -1) {
        return `${prompt.slice(0, nextComma)}, with ${tag}${prompt.slice(nextComma)}`;
      }
    }
  }

  if (category === 'lighting') {
    // Place near lighting terms if found
    const lightMatch = prompt.match(/(lighting|light|glow|shadow|illumination)/i);
    if (lightMatch && lightMatch.index !== undefined) {
      const nextComma = prompt.indexOf(',', lightMatch.index);
      if (nextComma !== -1) {
        return `${prompt.slice(0, nextComma)}, featuring ${tag}${prompt.slice(nextComma)}`;
      }
    }
  }

  // Default clean concatenation
  if (prompt.endsWith('.')) {
    return `${prompt.slice(0, -1)}, ${tag}.`;
  } else if (isCommaSeparated || promptType === 'image' || promptType === 'video') {
    return `${prompt}, ${tag}`;
  } else {
    return `${prompt}\n\n${tag}`;
  }
}
