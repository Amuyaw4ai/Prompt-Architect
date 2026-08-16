import { PromptType, PromptResult } from "../types";

// Dynamic dictionary for local template expansion
const KNOWLEDGE_BASE: Record<string, string> = {
  "negative prompt": `**Negative Prompts** are instructions on what *not* to include in AI image/video generation. Use them to filter out artifacts, bad shapes, or off-topic styles. 

**Pro-tip for Negative Prompts:**
- Instead of "no ugly faces", specify: \`mutated fingers, extra limbs, bad hands, low resolution, blurry facial features, deformed structure, text watermark, duplicate objects\`.
- Keep negative prompts focused on technical defects rather than style nuances unless desired.`,
  "system prompt": `A **System Prompt** (or Master Instruction) establishes the baseline constraints, personality, and format of an LLM.

**Best Practices for System Prompts:**
- Assign a clear specialist role (e.g. "Act as a Senior Database Architect").
- Set strict negative rules ("Do NOT mention internal DB structure").
- Specify the exact output scheme (such as JSON or Markdown blocks).`,
  "midjourney": `**Midjourney v6** excels at artistic photorealism, high detail, and creative cinematic framing.

**Best Core Syntax:**
- \`[Subject description], [Aesthetic modifiers], [Lighting parameters] --ar 16:9 --v 6.0 --style raw\`
- Rely heavily on literal nouns and adjectives instead of words like "photorealistic". Describe camera lenses (e.g., "85mm lens, f/1.8") for real depth.`,
  "sora": `**Sora & Veo** are highly temporal-aware video generation engines.

**Synthesis Tips for Video engines:**
- Prioritize clear, natural description of **motion and physical changes** over static styles.
- Specify camera movements clearly: "smooth panning tracking shot, steady camera, gradual zoom-in".`,
  "imagen": `**Imagen 3 & 4** are highly text-adherent image generation models built by Google.

**Core Rules:**
- Explain the layout naturally with spatial prepositions (e.g., "on the table to the left, under the glowing lantern").
- Avoid complex command jargon; write in natural, clear English.`,
  "default_help": `I can assist with all things prompt engineering! You can:
1. **Develop High-End Prompts** by giving me raw thoughts, sentences, or ideas.
2. **Reverse Engineer Media** by uploading files (images, videos, audio, PDF, etc.) directly.
3. **Toggle Modes**: You can switch between **Local Mode** (instant offline heuristics) and **Live AI Mode** (using Gemini) inside the header.

Just tell me what you are trying to write or upload, and I'll generate a world-class prompt!`
};

// Simple rules to clean up filenames/words
function cleanTopic(text: string): string {
  return text
    .replace(/\.[a-zA-Z0-9]+$/, "") // remove extension
    .replace(/[_-]/g, " ") // replace dashes
    .trim();
}

export function refinePromptLocally(
  initialPrompt: string,
  type: PromptType,
  media?: { data: string; mimeType: string; url: string; name?: string }
): PromptResult {
  const rawInput = initialPrompt.trim();
  const lowerInput = rawInput.toLowerCase();

  // 1. Detect Conversational/Help-seeking Mode
  const isQuestion = 
    lowerInput.endsWith("?") || 
    /^(how|why|what|who|where|explain|describe|tell|show|can you|could you|is there|are there|tips|help|support|tutorial|instructions|how to|what is)/i.test(lowerInput);
  
  const isGreeting = 
    /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|yo|sup\?)/i.test(lowerInput);

  if (isGreeting) {
    return {
      refinedPrompt: "Hello! Ready to transform simple ideas into professional-grade AI prompts? Feel free to write down a simple thought, insert placeholders, or upload a media file.",
      explanation: "Warm local greetings. Provided introduction to system capabilities.",
      suggestedTitle: "Hello Developer!",
      suggestedTags: ["Greeting", "Local Engine", "Introduction"],
      detectedType: type
    };
  }

  if (isQuestion && type !== "text") {
    // Try to match specific words in our knowledge base
    let answer = "";
    let matchedTopic = "General Help Query";

    if (lowerInput.includes("negative")) {
      answer = KNOWLEDGE_BASE["negative prompt"];
      matchedTopic = "Negative Prompts Guide";
    } else if (lowerInput.includes("system") && lowerInput.includes("prompt")) {
      answer = KNOWLEDGE_BASE["system prompt"];
      matchedTopic = "System Prompts Blueprint";
    } else if (lowerInput.includes("midjourney")) {
      answer = KNOWLEDGE_BASE["midjourney"];
      matchedTopic = "Midjourney Style Guide";
    } else if (lowerInput.includes("sora") || lowerInput.includes("veo") || lowerInput.includes("video")) {
      answer = KNOWLEDGE_BASE["sora"];
      matchedTopic = "Video Engineering Heuristics";
    } else if (lowerInput.includes("imagen") || lowerInput.includes("google")) {
      answer = KNOWLEDGE_BASE["imagen"];
      matchedTopic = "Google Imagen Formatting";
    } else {
      answer = `**Direct Inquiry Answer:**\n\nBased on your question: *"${rawInput}"*, here is a quick, straight-to-the-point response:\n\n- To get high-end results, ensure your input contains a clear **Subject**, **Style**, and **Framing/Constraints**.\n- This Local engine uses rule-based heuristic templates to construct structural prompts locally instantly.\n- Adjust the parameters/variables of the generated prompt in the editor on the right to personalize it!\n\n${KNOWLEDGE_BASE["default_help"]}`;
    }

    return {
      refinedPrompt: answer,
      explanation: "Detected query format. Redirected to the offline technical knowledge library rather than writing a prompt template.",
      suggestedTitle: matchedTopic,
      suggestedTags: ["Tutorial", "Q&A", "Parameters"],
      detectedType: type
    };
  }

  // 2. Base Heuristic-based Prompt Synthesizer
  // Robustly determine subject and filter out default dummy phrases
  const isGenericMediaPrompt = 
    rawInput === "" || 
    /analyze this (image|video|audio|media|file) and generate/i.test(rawInput) ||
    /generate a highly detailed prompt/i.test(rawInput);

  let detectedSubject = "";
  if (isGenericMediaPrompt && media?.name) {
    detectedSubject = cleanTopic(media.name);
  } else {
    detectedSubject = cleanTopic(rawInput);
  }

  if (!detectedSubject || detectedSubject.toLowerCase() === "analyze this image and generate a highly detailed prompt that would recreate its style and details.") {
    detectedSubject = "A stunning visual focus displaying a joyful subject";
  }

  // Scan text and subject to choose the best visual theme
  const scanText = (detectedSubject + " " + rawInput).toLowerCase();
  let theme: "cyber" | "nature" | "portrait" | "fantasy" | "general" = "general";
  
  if (scanText.match(/(cyber|cyberpunk|hacker|neon|sci-fi|scifi|future|futuristic|retro|synthwave|technology|tech|computer|robot|machine|matrix)/i)) {
    theme = "cyber";
  } else if (scanText.match(/(nature|mountain|river|forest|lake|landscape|serene|ocean|sea|tree|sky|sunset|sun|sunrise|cloud|beach|valley)/i)) {
    theme = "nature";
  } else if (scanText.match(/(person|portrait|face|monk|warrior|detective|man|woman|character|girl|boy|model|selfie|human|joy|expression|smile)/i)) {
    theme = "portrait";
  } else if (scanText.match(/(magic|dragon|elven|myth|dream|surreal|sketch|paint|watercolor|galaxy|cosmic|stars|nebulas|monster|wizard)/i)) {
    theme = "fantasy";
  }

  // Handle default theme adjustment for fallback scenarios
  if (theme === "general" && media?.mimeType?.startsWith("image/")) {
    theme = "portrait"; // default to high-end photography styling for image lookups
  }

  let finalPrompt = "";
  let explanation = "";
  let tags: string[] = [];

  if (type === "image") {
    let style = "Photorealistic masterwork";
    let lighting = "Dramatic cinematic side-lighting";
    let camera = "85mm portrait telephoto lens, wide aperture f/1.4";
    let mood = "Mysterious and deep";
    let palette = "Vivid natural colors with rich shadows";
    let details = "Intricate detailing, sharp focus, 8k UHD resolution";

    switch (theme) {
      case "cyber":
        style = "Cyberpunk digital illustration / high-end scifi concept art";
        lighting = "Vivid neon lighting, damp asphalt reflections, volumetric smog haze";
        camera = "Wide anamorphic lens, low composition";
        mood = "Futuristic, chaotic, energetic night vibe";
        palette = "Electric pink, neon teal, deep obsidian backdrops";
        details = "Unreal Engine 5 level textures, glowing wires, microscopic chip focus";
        break;
      case "nature":
        style = "Breathtaking national geographic style landscape photography";
        lighting = "Warm, soft golden hour sun rays piercing through clouds";
        camera = "Ultra-wide angle 24mm lens, high-dynamic-range f/11 infinity focus";
        mood = "Serene, quiet, atmospheric and ethereal";
        palette = "Organic earthy browns, deep forest greens, soft sunbeam yellow";
        details = "Crisp dew drops, fine bark texture, hyper-detailed leaves, UHD 4k quality";
        break;
      case "portrait":
        style = "Fine-art editorial portrait photography with beautiful facial focus";
        lighting = "Chiaroscuro rim light, premium three-point softbox studio lighting with a warm sparkle";
        camera = "85mm prime portrait lens, tight face shot, ultra-shallow depth of field, f/1.2";
        mood = "Expressive, bright, radiating warm and genuine joy";
        palette = "Subtle desaturated skin tones with balanced highlights and deep eye glints";
        details = "Pore-level physical detail, sharp eye glint reflection, gorgeous aesthetic composition";
        break;
      case "fantasy":
        style = "Majestic surreal concept painting in the style of dynamic realism";
        lighting = "Magical bioluminescent glow with mystical glowing floating embers";
        camera = "Wide composition, dramatic tilt-shift focus";
        mood = "Dreamlike, whimsical, majestic";
        palette = "Pastel iridescence, glowing amethyst violet, celestial cobalt blue";
        details = "Soft watercolor strokes blending into hyper-sharp magic runes, masterpiece";
        break;
    }

    finalPrompt = `${detectedSubject}, ${style}. Illuminated by ${lighting}. Captured on a ${camera}. Atmosphere is ${mood}, featuring a ${palette} color theme. Enhanced with ${details}.`;
    explanation = `Synthesized a pristine local IMAGE reconstruction prompt using "${theme.toUpperCase()}" presets. Balanced layout: camera lens settings, lighting orientation, ambiance mood, color palette, and detail density.`;
    tags = ["Image", theme.toUpperCase(), "Local Studio", "Heuristics"];

    return {
      refinedPrompt: finalPrompt,
      explanation,
      questions: [],
      suggestedTitle: cleanTopic(detectedSubject).slice(0, 30),
      suggestedTags: tags,
      detectedType: "image"
    };

  } else if (type === "video") {
    let action = "Dynamic sequence moving slowly";
    let speed = "Steady 24fps panning";
    let atmosphere = "Cinematic volumetric haze";

    switch (theme) {
      case "cyber":
        action = "Slow kinetic crawl along the neon-drenched futuristic avenue";
        speed = "Smooth side-tracking dolly shot at 60fps, gradual camera tilt-up";
        atmosphere = "Grimy cybernetic underbelly glowing with flickering neon signboards";
        break;
      case "nature":
        action = "Time-lapse transition showing clouds sweeping dramatically over mountains";
        speed = "Continuous 120fps ultra-slow-motion pan over the glistening valley below";
        atmosphere = "Majestic crisp twilight atmosphere with sunbeams slowly fading";
        break;
      case "portrait":
        action = "Slow-motion head turn of the character looking directly at the camera, blinking gently with a joyful expression";
        speed = "Macro lens steady slider shot at 24fps cinematic pacing";
        atmosphere = "Soft warm backlighting, dramatic hair light separation";
        break;
      case "fantasy":
        action = "Mystical objects rising gracefully from a glowing pool, rotating slowly";
        speed = "Ethereal handheld crane descending, floating movement";
        atmosphere = "Shimmering particle effects, heavy dreamlike fog layer";
        break;
    }

    finalPrompt = `Video prompt: Cinematic scene showing ${detectedSubject}. ${action}. Camera executes a ${speed}. Visual style is highly realistic, set in a ${atmosphere}. Output in ultra-sharp 4K resolution, gorgeous temporal coherence.`;
    explanation = `Designed high-temporal VIDEO generation structure. Focused on camera locomotion, action transitions, pacing speeds, and background physics.`;
    tags = ["Video", theme.toUpperCase(), "Veo Spec", "Smooth Motion"];

    return {
      refinedPrompt: finalPrompt,
      explanation,
      questions: [],
      suggestedTitle: cleanTopic(detectedSubject).slice(0, 30),
      suggestedTags: tags,
      detectedType: "video"
    };

  } else {
    // TEXT prompt - General LLM Prompt
    // Detect custom format, tone, and complexity preferences if already provided by the user
    let detectedFormat = "[OUTPUT_FORMAT]";
    let detectedTone = "[DESIRED_TONE]";
    let detectedComplexity = "[COMPLEXITY_LEVEL]";

    if (/bullet\s*points?|bulleted|list\b/i.test(scanText)) {
      detectedFormat = "Bullet points with concise explanations";
    } else if (/essay|long[\s-]form|article|paper/i.test(scanText)) {
      detectedFormat = "Well-structured comprehensive essay with descriptive section headings";
    } else if (/code|script|program|function|snippet/i.test(scanText)) {
      detectedFormat = "Clean, production-grade code with inline comments and clear usage instructions";
    } else if (/json|schema|json\s*object/i.test(scanText)) {
      detectedFormat = "Strict, valid JSON schema without extraneous Markdown commentary";
    } else if (/table|tabular|grid/i.test(scanText)) {
      detectedFormat = "Structured Markdown comparison table";
    } else if (/step[\s-]by[\s-]step|guide|walkthrough|tutorial/i.test(scanText)) {
      detectedFormat = "Numbered step-by-step instructional walkthrough";
    }

    if (/formal|professional|academic|corporate|business/i.test(scanText)) {
      detectedTone = "Formal, objective, and professional";
    } else if (/casual|conversational|friendly|chatty/i.test(scanText)) {
      detectedTone = "Casual, approachable, and conversational";
    } else if (/humor|humorous|funny|witty|playful|satirical/i.test(scanText)) {
      detectedTone = "Humorous, witty, and engaging";
    } else if (/authoritative|direct|concise|no[\s-]nonsense|assertive/i.test(scanText)) {
      detectedTone = "Authoritative, direct, and concise";
    } else if (/inspirational|motivational|encouraging/i.test(scanText)) {
      detectedTone = "Inspirational and encouraging";
    }

    if (/beginner|eli5|simple|starter|basic|novice|child|5[\s-]year[\s-]old/i.test(scanText)) {
      detectedComplexity = "Beginner-friendly (ELI5) with intuitive real-world analogies";
    } else if (/intermediate|practical|balanced/i.test(scanText)) {
      detectedComplexity = "Intermediate level with a practical balance of conceptual clarity and applied examples";
    } else if (/expert|advanced|deep[\s-]dive|technical|specialist|master|rigorous/i.test(scanText)) {
      detectedComplexity = "Advanced technical expert depth with comprehensive analytical rigor";
    } else if (/executive|summary|c-level|briefing/i.test(scanText)) {
      detectedComplexity = "High-level executive briefing focusing on strategic insights and ROI";
    }

    finalPrompt = `You are a high-level specialist AI assistant with deep expertise in ${detectedSubject || "this domain"}.

### Core Objective
Provide a thorough, top-tier response addressing the following task or topic:
${detectedSubject}

### Target Specifications
- **Preferred Output Format**: ${detectedFormat}
- **Desired Tone & Voice**: ${detectedTone}
- **Response Complexity Level**: ${detectedComplexity}

### Execution Instructions
1. Structure and organize the response strictly according to the **${detectedFormat}** specification.
2. Maintain a consistent **${detectedTone}** voice throughout the entire output.
3. Calibrate technical depth, terminology, and explanations to match the **${detectedComplexity}** standard.
4. Ensure all information is factual, directly actionable, and free from repetitive filler.

### Boundaries & Constraints
- Do NOT begin with conversational greetings (e.g., "Certainly!", "Sure thing!"). Jump directly into the content.
- Adhere strictly to the requested format, tone, and complexity level.`;

    explanation = `Architected a well-defined general LLM prompt featuring explicit parameters for Output Format (${detectedFormat}), Desired Tone (${detectedTone}), and Complexity Level (${detectedComplexity}).`;
    tags = ["LLM Prompt", "Format Guided", "Tone Calibrated", "Complexity Scoped"];

    return {
      refinedPrompt: finalPrompt,
      explanation,
      questions: [
        "What is your preferred output format? (e.g., bullet points, essay, step-by-step code, Markdown table, JSON schema)",
        "What is the desired tone? (e.g., formal & professional, casual & conversational, humorous & witty, authoritative)",
        "What level of complexity would you like for the response? (e.g., beginner-friendly / ELI5, intermediate, advanced technical expert, executive summary)"
      ],
      suggestedTitle: cleanTopic(detectedSubject).slice(0, 30),
      suggestedTags: tags,
      detectedType: "text"
    };
  }
}

export function transformPromptToFrameworkLocally(
  currentPrompt: string,
  frameworkName: string,
  frameworkTemplate: string,
  promptType: PromptType
): PromptResult {
  const raw = currentPrompt.trim();
  
  // Extract core topic / subject from raw prompt
  let subject = "";
  const taskMatch = raw.match(/Task:\s*([^\n]+)/i) || raw.match(/Core Objective\s*\n+([^\n#]+)/i) || raw.match(/subject:\s*([^\n,]+)/i);
  if (taskMatch && taskMatch[1]) {
    subject = taskMatch[1].trim();
  } else {
    // First non-empty, non-header line
    const lines = raw.split('\n').map(l => l.replace(/^#+\s*/, '').trim()).filter(Boolean);
    subject = lines[0] || "your selected topic";
    if (subject.length > 120) {
      subject = subject.slice(0, 115) + '...';
    }
  }

  // Extract variables or fill intelligent fallbacks
  let transformed = frameworkTemplate;

  // Modality & Subject specific fills
  const fwLower = frameworkName.toLowerCase();

  if (fwLower.includes('product showcase')) {
    transformed = `Smooth 360-degree commercial product showcase video of ${subject}, studio softbox rim lighting, cinematic macro slider camera motion, 4k 60fps resolution, ultra-clean aesthetic presentation.`;
  } else if (fwLower.includes('cinematic drone')) {
    transformed = `A sweeping cinematic drone shot flying majestically over ${subject}, warm golden hour lighting, peaceful atmospheric mood, ultra-high-definition 4k resolution with gentle forward acceleration.`;
  } else if (fwLower.includes('action sequence')) {
    transformed = `Fast-paced dynamic action sequence of ${subject} in rapid motion, handheld tracking camera with kinetic blur, cinematic action style, vibrant grading and high frame rate.`;
  } else if (fwLower.includes('time-lapse')) {
    transformed = `Seamless cinematic time-lapse video of ${subject} transitioning smoothly from initial state to full completion, dynamic shifts in natural lighting, ultra-sharp 4k resolution.`;
  } else if (fwLower.includes('character animation')) {
    transformed = `High-fidelity 3D character animation of ${subject} expressing vivid emotion, Pixar/DreamWorks stylized aesthetic, soft volumetric lighting, fluid organic motion.`;
  } else if (fwLower.includes('nature documentary')) {
    transformed = `BBC Planet Earth style nature documentary footage showcasing ${subject} in its natural environment, telephoto wildlife lens, smooth slow-motion panning, pristine 4k clarity.`;
  } else if (fwLower.includes('music video')) {
    transformed = `Stylized high-energy music video visual featuring ${subject}, pulsating neon lighting, dynamic rhythmic camera zooms, avant-garde editorial color grading.`;
  } else if (fwLower.includes('vlog style')) {
    transformed = `Vlog style handheld 4k footage exploring ${subject}, natural ambient sunlight, casual immersive atmosphere, authentic first-person perspective.`;
  } else if (fwLower.includes('cinematic portrait')) {
    transformed = `A cinematic portrait of ${subject}, dramatic chiaroscuro soft rim lighting, photorealistic editorial style, shot on 85mm f/1.4 prime lens, evocative mood, 8k resolution masterwork.`;
  } else if (fwLower.includes('product photography')) {
    transformed = `Commercial high-end product photography of ${subject}, balanced studio strobe lighting, seamless minimalist backdrop, Hasselblad 100mm macro lens, ultra-sharp 8k resolution.`;
  } else if (fwLower.includes('concept art')) {
    transformed = `Detailed concept art of ${subject}, featuring rich atmospheric depth, cohesive cinematic color palette, dynamic brushwork, trending on ArtStation.`;
  } else if (fwLower.includes('isometric 3d')) {
    transformed = `Isometric 3D clay-render of ${subject}, vibrant pastel color palette, soft ambient occlusion lighting, intricate micro-details, cute modern aesthetic.`;
  } else if (fwLower.includes('logo design')) {
    transformed = `Minimalist vector logo symbol for a brand focused on ${subject}, clean geometric forms, bold modern color palette, flat vector design, isolated on clean white background.`;
  } else if (fwLower.includes('anime style')) {
    transformed = `Anime illustration of ${subject}, Studio Ghibli inspired aesthetic, lush environmental lighting, rich hand-painted textures, vibrant expressive colors.`;
  } else if (fwLower.includes('cyberpunk street')) {
    transformed = `Cyberpunk urban night scene featuring ${subject}, volumetric fog, glowing neon holographic signs, wet reflective pavement, cinematic 8k rendering.`;
  } else if (fwLower.includes('watercolor painting')) {
    transformed = `Expressive watercolor painting of ${subject}, dreamy aesthetic mood, organic paint bleed edges, delicate pastel washes, textured cold-press paper background.`;
  } else if (fwLower.includes('calibrated master') || fwLower.includes('master prompt')) {
    transformed = `Act as an expert specialist in this domain.
Task: ${subject}
Output Format: Structured Markdown with actionable bullet points and code/tables where relevant
Tone: Clear, professional, and authoritative
Complexity: Advanced technical rigor with practical examples
Context: ${raw}`;
  } else if (fwLower.includes('chain of thought')) {
    transformed = `Think step-by-step to solve this task thoroughly:

Problem Statement:
${subject}

### Execution Instructions:
1. **Analyze & Deconstruct**: Break down the core objectives and underlying requirements.
2. **Step-by-Step Reasoning**: Walk through the logical solution methodically before stating conclusions.
3. **Synthesis & Solution**: Provide the definitive output with all supporting rationale.
4. **Verification**: Double-check assumptions and edge cases.

Context:
${raw}`;
  } else if (fwLower.includes('roleplay')) {
    transformed = `Act as an elite expert specialist. Your task is to execute: ${subject}.

Context & Background:
${raw}

Please provide an in-depth, masterful response embodying this persona completely without generic boilerplate.`;
  } else if (fwLower.includes('few-shot')) {
    transformed = `You are a high-precision AI processor. Review these reference examples:

Input: [EXAMPLE_1_INPUT]
Output: [EXAMPLE_1_OUTPUT]

Input: [EXAMPLE_2_INPUT]
Output: [EXAMPLE_2_OUTPUT]

Now process this target task following the exact same schema and quality standard:
Input: ${subject}
Context Details: ${raw}`;
  } else if (fwLower.includes('aida')) {
    transformed = `Write compelling copy using the AIDA framework (Attention, Interest, Desire, Action) for:
${subject}

### Structure:
- **Attention**: Hook the audience with a powerful headline and striking opening.
- **Interest**: Highlight fascinating aspects, key pain points, and intriguing possibilities.
- **Desire**: Illustrate the transformative benefits, emotional appeal, and unique value.
- **Action**: Provide a clear, irresistible Call to Action (CTA).

Context:
${raw}`;
  } else if (fwLower.includes('eli5')) {
    transformed = `Explain ${subject} to me like I am a 5-year-old.
- Use simple, everyday analogies (like toys, playgrounds, or animals).
- Avoid all technical jargon and complicated terms.
- Keep the explanation engaging, warm, and easy to understand.`;
  } else if (fwLower.includes('pros & cons') || fwLower.includes('pros and cons')) {
    transformed = `Provide a comprehensive, balanced Pros & Cons analysis for:
${subject}

### Required Structure:
1. **Executive Summary**
2. **Key Advantages (Pros)**: Detailed breakdown with impact severity.
3. **Key Drawbacks & Risks (Cons)**: Potential pitfalls and trade-offs.
4. **Comparative Markdown Matrix**
5. **Final Strategic Recommendation**

Context:
${raw}`;
  } else if (fwLower.includes('socratic')) {
    transformed = `Act as a master Socratic tutor. Help me deeply understand:
${subject}

Guidelines:
- Do NOT give away direct answers immediately.
- Ask thoughtful, probing questions that guide me to discover the principles on my own.
- Challenge assumptions constructively and validate good reasoning.`;
  } else if (fwLower.includes('code review')) {
    transformed = `Review the implementation for ${subject}.
Focus Areas: Performance, Security, Clean Code & Maintainability, Edge-Case Resilience.

Please provide:
1. **High-Level Assessment**
2. **Specific Code Improvements** (with Before vs. After code snippets)
3. **Security & Performance Notes**
4. **Refactored Clean Code Recommendation**`;
  } else {
    // Generic bracket replacement
    transformed = frameworkTemplate
      .replace(/\[SUBJECT\]/g, subject)
      .replace(/\[TOPIC\]/g, subject)
      .replace(/\[TASK\]/g, subject)
      .replace(/\[PROBLEM\]/g, subject)
      .replace(/\[PRODUCT_SERVICE\]/g, subject)
      .replace(/\[CONTEXT\]/g, raw);
  }

  return {
    refinedPrompt: transformed,
    explanation: `Successfully restructured prompt into the ${frameworkName} framework, preserving core topic focus ("${subject}") and calibrating all structural parameters.`,
    questions: [],
    suggestedTitle: `${frameworkName} - ${cleanTopic(subject).slice(0, 24)}`,
    suggestedTags: [frameworkName, promptType, "Transformed Framework"],
    detectedType: promptType
  };
}

