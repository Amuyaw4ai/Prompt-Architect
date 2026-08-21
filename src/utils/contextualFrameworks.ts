import { PromptType } from '../types';

export interface ContextualFramework {
  id: string;
  name: string;
  description: string;
  category: PromptType;
  domain: 'avatar' | 'aerial' | 'cinema' | 'commercial' | 'cyberpunk' | 'anime' | 'nature' | 'code' | 'marketing' | 'reasoning' | 'general';
  domainName: string;
  keywords: RegExp[];
  template: string;
  isCinematic?: boolean;
  score?: number;
  isSuggested?: boolean;
}

export const ALL_FRAMEWORKS: ContextualFramework[] = [
  // ==========================================
  // AVATAR, CHARACTER & PERFORMANCE CINEMATICS
  // ==========================================
  {
    id: 'avatar-speech-performance',
    name: 'Cinematic Avatar Performance',
    description: 'Ultra-realistic digital human/avatar speech with natural micro-expressions, eye contact, and studio lighting.',
    category: 'video',
    domain: 'avatar',
    domainName: 'Avatar & Character',
    isCinematic: true,
    keywords: [/avatar/i, /digital human/i, /virtual influencer/i, /character/i, /talking/i, /speech/i, /lipsync/i, /facial/i, /headshot/i, /face/i, /spokesperson/i, /host/i],
    template: `Cinematic video of [AVATAR_CHARACTER] delivering a compelling speech to the camera.
- Character: [AVATAR_CHARACTER], photorealistic skin subsurface scattering, realistic eye darts and natural micro-expressions.
- Performance & Lipsync: Flawless speech synchronization, emotive cadence, natural gestures and gentle head tilts.
- Camera Framing: 85mm prime lens portrait framing, slow subtle dolly push-in, shallow depth of field with creamy bokeh.
- Studio Lighting: Three-point softbox key light, subtle warm hair rim light separation, catchlights in the eyes.
- Output Specs: 4K 60fps, high temporal consistency, crystal-clear audio-visual alignment.`
  },
  {
    id: 'character-cinematic-close-up',
    name: 'Hero Facial Close-Up',
    description: 'Intense, emotional cinematic close-up with pore-level skin texture, ocular reflections, and dramatic lighting.',
    category: 'video',
    domain: 'avatar',
    domainName: 'Avatar & Character',
    isCinematic: true,
    keywords: [/close-up/i, /close up/i, /face/i, /portrait/i, /eyes/i, /emotion/i, /gaze/i, /actor/i, /actress/i, /expression/i],
    template: `Hero cinematic close-up shot of [SUBJECT].
- Framing & Optics: Extreme close-up on [SUBJECT]'s face, 85mm f/1.2 lens, ultra-shallow depth of field focusing sharply on the eyes.
- Physical Details: Micro-pores, peach fuzz, realistic ocular reflections, subtle breathing and gentle blinking.
- Lighting: Chiaroscuro high-contrast rim lighting, soft diffuse fill, dramatic atmospheric color temperature.
- Motion: Slow-motion 60fps subtle head turn and gaze shift towards the camera lens, raw emotional intensity.`
  },
  {
    id: 'character-action-choreography',
    name: 'Kinetic Action Choreography',
    description: 'High-energy character movement, martial arts, athletic choreography, and dynamic camera tracking.',
    category: 'video',
    domain: 'avatar',
    domainName: 'Avatar & Character',
    isCinematic: true,
    keywords: [/fight/i, /martial arts/i, /combat/i, /jump/i, /run/i, /action/i, /choreography/i, /stunt/i, /ninja/i, /warrior/i, /kinetic/i],
    template: `Fast-paced kinetic action sequence featuring [SUBJECT] executing [ACTION_MOVE].
- Choreography: Fluid, weight-balanced physical motion with high kinetic impact and natural momentum.
- Camera Locomotion: Dynamic low-angle tracking steadicam, rapid whip pans matching character strikes, speed ramping.
- Environment & Physics: Reactive debris, dynamic dust kick-up, wind-swept clothing and realistic hair physics.
- Grading & Motion Blur: Shutter angle 90 degrees for crisp high-speed motion, high-contrast cinematic color grade.`
  },

  // ==========================================
  // DRONE, AERIAL & LANDSCAPE CINEMATICS
  // ==========================================
  {
    id: 'cinematic-drone-flyover',
    name: 'Cinematic Drone Flyover',
    description: 'Sweeping high-altitude aerial drone reveal flying over expansive landscapes or cityscapes.',
    category: 'video',
    domain: 'aerial',
    domainName: 'Drone & Aerial',
    isCinematic: true,
    keywords: [/drone/i, /aerial/i, /flyover/i, /landscape/i, /mountains/i, /coastline/i, /valley/i, /forest/i, /overhead/i, /bird's eye/i, /top down/i, /vista/i],
    template: `A breathtaking cinematic drone shot gliding smoothly over [ENVIRONMENT].
- Flight Path: Forward descending sweep transitioning into a panoramic horizon tilt-up reveal.
- Optics & Elevation: Ultra-wide 18mm cinema lens, smooth 3-axis gimbal stabilization, zero micro-jitter.
- Atmosphere & Lighting: [LIGHTING] with volumetric golden hour rays piercing through mist, rich atmospheric perspective.
- Environmental Scale: Vast geographic depth, natural wind ripples across the landscape, ultra-detailed 8K terrain textures.`
  },
  {
    id: 'fpv-proximity-flight',
    name: 'FPV High-Speed Proximity',
    description: 'Thrilling first-person view drone dive navigating tightly through obstacles at high velocity.',
    category: 'video',
    domain: 'aerial',
    domainName: 'Drone & Aerial',
    isCinematic: true,
    keywords: [/fpv/i, /dive/i, /high speed/i, /racing/i, /proximity/i, /chase/i, /canyon/i, /skyscraper/i, /velocity/i, /acrobatic/i],
    template: `High-velocity acrobatic FPV drone flight diving through [ENVIRONMENT].
- Flight Dynamics: Steep 90-degree vertical dive alongside [SUBJECT/STRUCTURE], sharp bank turns, razor-thin proximity clearance.
- Motion Feel: Intense kinetic velocity, slight motion blur on foreground edges, wide 150-degree field of view.
- Sound & Lighting: Roaring wind turbulence, dynamic exposure shifting as the drone breaches shadows into bright sunlight.`
  },
  {
    id: 'nature-documentary-telephoto',
    name: 'Nature Documentary Telephoto',
    description: 'BBC Earth-style high-telephoto wildlife and nature observation with natural behavioral pacing.',
    category: 'video',
    domain: 'nature',
    domainName: 'Nature & Wildlife',
    isCinematic: true,
    keywords: [/nature/i, /wildlife/i, /animal/i, /safari/i, /bird/i, /ocean/i, /rainforest/i, /documentary/i, /bbc/i, /natural history/i],
    template: `Nature documentary 4K footage of [ANIMAL_SUBJECT] in [NATURAL_HABITAT].
- Optics & Camera: 600mm extreme telephoto cinema prime, smooth slow pan following subject movement with organic handheld feel.
- Behavior & Action: [SUBJECT] naturally interacting with [ENVIRONMENT], unhurried documentary pacing.
- Lighting & Atmosphere: Pristine natural sunlight filtering through leaves, crisp water droplets and atmospheric haze.`
  },

  // ==========================================
  // COMMERCIAL, PRODUCT & 3D SHOWCASE
  // ==========================================
  {
    id: 'product-360-turntable',
    name: '360° Macro Product Showcase',
    description: 'Luxury commercial product turntable with motorized rotation, studio softboxes, and macro detail focus.',
    category: 'video',
    domain: 'commercial',
    domainName: 'Product & Commercial',
    isCinematic: true,
    keywords: [/product/i, /commercial/i, /bottle/i, /watch/i, /sneaker/i, /cosmetics/i, /gadget/i, /device/i, /jewelry/i, /turntable/i, /showcase/i, /luxury/i],
    template: `Commercial product showcase video of [PRODUCT_NAME].
- Rig & Motion: Smooth motorized 360-degree turntable rotation paired with a floating camera slider tracking across key branding elements.
- Lighting Setup: Dark studio aesthetic, dual softbox rim lights carving out clean reflections, subtle gradient backdrop glow.
- Focus & Optics: 100mm macro probe lens highlighting premium surface textures, brushed metals, and embossed typography.`
  },
  {
    id: 'exploded-view-3d-breakdown',
    name: '3D Exploded Component Breakdown',
    description: 'Futuristic product disassembly showing floating internal mechanical parts and precise engineering layers.',
    category: 'video',
    domain: 'commercial',
    domainName: 'Product & Commercial',
    isCinematic: true,
    keywords: [/exploded/i, /breakdown/i, /components/i, /internals/i, /disassembly/i, /mechanical/i, /hardware/i, /engine/i, /chip/i, /circuit/i],
    template: `High-tech 3D exploded view animation of [DEVICE/OBJECT].
- Assembly Motion: Clean pneumatic separation where each internal layer, microchip, and housing element floats outward in symmetrical alignment.
- Visual Style: Crisp CAD / Octane render, subtle glowing circuit traces, precision laser dimension indicators.
- Camera Movement: Orbital camera glide around the suspended components before snapping back together in seamless unison.`
  },

  // ==========================================
  // NARRATIVE CINEMA & FILM DIRECTING
  // ==========================================
  {
    id: 'hollywood-dramatic-dialogue',
    name: 'Hollywood Dramatic Dialogue',
    description: 'Fincher / Deakins style cinematic shot-reverse-shot dialogue coverage with chiaroscuro depth.',
    category: 'video',
    domain: 'cinema',
    domainName: 'Narrative Cinema',
    isCinematic: true,
    keywords: [/cinema/i, /film/i, /movie/i, /scene/i, /dialogue/i, /dramatic/i, /interrogation/i, /conversation/i, /hollywood/i, /cinematography/i],
    template: `Cinematic narrative film scene: [CHARACTER_A] and [CHARACTER_B] engaged in an intense conversation in [LOCATION].
- Direction Style: David Fincher / Roger Deakins measured pacing, slow creeping dolly push-in building psychological tension.
- Lighting Scheme: Low-key chiaroscuro lighting, practical lamps providing warm motivated pools of light amidst deep moody shadows.
- Composition: Precise 50mm framing, dirty single over-the-shoulder perspective, balanced negative space.`
  },
  {
    id: 'continuous-steadicam-longtake',
    name: 'One-Shot Steadicam Long Take',
    description: 'Choreographed single continuous take weaving smoothly through complex architectural environments.',
    category: 'video',
    domain: 'cinema',
    domainName: 'Narrative Cinema',
    isCinematic: true,
    keywords: [/steadicam/i, /one shot/i, /long take/i, /continuous/i, /tracking shot/i, /hallway/i, /walk and talk/i, /1917/i, /birdman/i],
    template: `A seamless, unbroken 60-second steadicam sequence following [SUBJECT] moving through [ENVIRONMENT].
- Camera Choreography: Glides from leading the subject from the front, revolving smoothly around them to reveal the grand environment, then settling into an over-the-shoulder tracking perspective.
- Environment & Ambient Life: Background extras actively reacting, seamless transition from interior lighting to outdoor daylight without visible cuts.`
  },
  {
    id: 'film-noir-shadows',
    name: 'Film Noir & Heavy Shadow',
    description: 'Moody, vintage noir atmosphere with Venetian blind silhouettes, rain-slicked asphalt, and cigarette haze.',
    category: 'image',
    domain: 'cinema',
    domainName: 'Narrative Cinema',
    isCinematic: true,
    keywords: [/noir/i, /vintage/i, /detective/i, /shadow/i, /silhouette/i, /1940s/i, /1950s/i, /venetian/i, /mystery/i, /monochrome/i, /black and white/i],
    template: `Film noir cinematic aesthetic: [SUBJECT] standing in [SETTING].
- Lighting: Harsh directional single-source light casting iconic horizontal Venetian blind shadows across the face and wall.
- Atmosphere: Wet reflective surfaces, subtle cigarette smoke wisps, dense misty air, dramatic silhouette composition.
- Color & Texture: Rich black-and-white tonal scale with deep blacks and sharp highlight rolloff, 35mm film grain.`
  },

  // ==========================================
  // SCI-FI & CYBERPUNK CINEMATICS
  // ==========================================
  {
    id: 'cyberpunk-anamorphic-night',
    name: 'Cyberpunk Anamorphic Night',
    description: 'Blade Runner-inspired nightscape with neon reflections in the rain, blue streak lens flares, and dense haze.',
    category: 'video',
    domain: 'cyberpunk',
    domainName: 'Sci-Fi & Cyberpunk',
    isCinematic: true,
    keywords: [/cyberpunk/i, /sci-fi/i, /scifi/i, /futuristic/i, /neon/i, /blade runner/i, /cyborg/i, /hologram/i, /night city/i, /tokyo night/i],
    template: `Cinematic cyberpunk sequence set in [FUTURISTIC_CITY] at night during heavy rainfall.
- Visual Elements: Towering holographic advertisements, neon signage glowing in electric cyan and magenta reflecting off wet asphalt.
- Lens & Aesthetics: Anamorphic lens with horizontal blue streak flares, oval bokeh, volumetric steam rising from street vents.
- Camera Locomotion: Slow low-angle tracking glide following [SUBJECT/VEHICLE] moving through crowded futuristic alleyways.`
  },
  {
    id: 'deep-space-celestial-scale',
    name: 'Deep Space Celestial Scale',
    description: 'Interstellar-style hard sci-fi orbital cinematic showcasing cosmic scale and harsh directional star light.',
    category: 'video',
    domain: 'cyberpunk',
    domainName: 'Sci-Fi & Cyberpunk',
    isCinematic: true,
    keywords: [/space/i, /spaceship/i, /orbit/i, /planet/i, /galaxy/i, /black hole/i, /astronaut/i, /interstellar/i, /station/i, /cosmos/i],
    template: `Hard sci-fi cinematic sequence of [SPACECRAFT/ASTRONAUT] orbiting [PLANET/CELESTIAL_BODY].
- Scale & Physics: Immense astronomical scale, silent vacuum drifting motion, pitch-black void contrasted against brilliant planetary rings.
- Lighting: Harsh, unfiltered single-point sunlight producing stark highlights and crisp geometric cast shadows.
- Optics: 70mm IMAX composition, ultra-sharp detail on hull plating, solar panels, and thermal blankets.`
  },

  // ==========================================
  // ANIME & STYLIZED ART
  // ==========================================
  {
    id: 'studio-ghibli-pastoral',
    name: 'Studio Ghibli Pastoral Animation',
    description: 'Hand-painted watercolor aesthetic with lush greenery, golden sunbeams, fluffy clouds, and nostalgic warmth.',
    category: 'image',
    domain: 'anime',
    domainName: 'Anime & Animation',
    isCinematic: true,
    keywords: [/ghibli/i, /miyazaki/i, /anime/i, /hand-painted/i, /watercolor/i, /pastoral/i, /meadow/i, /nostalgic/i, /cozy/i, /cottage/i],
    template: `Studio Ghibli style masterwork illustration of [SUBJECT] in [PASTORAL_ENVIRONMENT].
- Artistic Style: Hand-painted gouache background, soft cell-shaded characters, gentle naturalistic color palette.
- Atmosphere: Golden afternoon sunlight piercing through lush tree canopies, massive blooming cumulus clouds in a cerulean sky.
- Emotional Tone: Nostalgic, peaceful, overflowing with wonder and organic warmth.`
  },
  {
    id: 'shonen-action-impact',
    name: 'Shonen Dynamic Action Impact',
    description: 'High-octane anime combat moment with explosive speed lines, stylized energy VFX, and extreme forced perspective.',
    category: 'image',
    domain: 'anime',
    domainName: 'Anime & Animation',
    isCinematic: true,
    keywords: [/shonen/i, /anime fight/i, /energy/i, /aura/i, /powers/i, /impact/i, /manga/i, /explosive/i, /epic/i, /attack/i],
    template: `High-octane anime action illustration: [CHARACTER] unleashing [POWERFUL_ATTACK].
- Perspective: Extreme dynamic forced perspective with clenched fist / weapon bursting towards the foreground.
- Visual Effects: Crackling elemental aura VFX, radiating impact speed lines, shattering ground fragments suspended in mid-air.
- Color & Inking: Bold expressive ink outlines, high-contrast cel shading, vibrant neon energy highlights.`
  },

  // ==========================================
  // CODE & SOFTWARE ARCHITECTURE
  // ==========================================
  {
    id: 'clean-architecture-solid',
    name: 'Clean Architecture & SOLID Pattern',
    description: 'Enterprise software architecture blueprint enforcing separation of concerns, domain entities, and type safety.',
    category: 'text',
    domain: 'code',
    domainName: 'Software Architecture',
    keywords: [/code/i, /typescript/i, /javascript/i, /python/i, /react/i, /backend/i, /architecture/i, /refactor/i, /api/i, /solid/i, /clean code/i],
    template: `You are a Principal Software Architect. Design a production-grade implementation for:
[MODULE_OR_FEATURE]

### Requirements & Principles:
1. **Clean Architecture Separation**: Strictly isolate Domain Entities, Use Cases / Interactors, Repositories, and Presentation layers.
2. **SOLID Principles**: Adhere to Single Responsibility, Open/Closed, and Dependency Inversion patterns.
3. **Type Safety & Validation**: Provide complete, strict TypeScript interfaces with runtime schema validation (e.g. Zod).
4. **Error Handling & Resilience**: Implement defensive boundary guards, typed error hierarchies, and graceful degradation.
5. **Executable Code**: Provide clean, modular, self-contained code snippets without placeholder comments.

Context & Implementation Scope:
[CONTEXT]`
  },
  {
    id: 'defensive-security-guard',
    name: 'Defensive Security & Edge-Case Guard',
    description: 'Hardened security framework targeting sanitization, auth boundaries, rate limiting, and zero-trust validations.',
    category: 'text',
    domain: 'code',
    domainName: 'Software Architecture',
    keywords: [/security/i, /sanitize/i, /auth/i, /guard/i, /vulnerability/i, /validation/i, /rate limit/i, /owasp/i, /injection/i, /token/i],
    template: `Act as a Senior Application Security Engineer. Conduct a rigorous defensive security audit and hardened implementation for:
[FEATURE_OR_ENDPOINT]

### Required Security Checklist:
1. **Input Sanitization & Injection Prevention**: SQL, XSS, Command Injection, and Path Traversal guards.
2. **Authentication & Authorization**: Strict token verification, role-based permissions (RBAC), and session expiration.
3. **Rate Limiting & DoS Protection**: Request throttling and payload size boundaries.
4. **Comprehensive Error Masking**: Ensure zero internal stack traces or database schema disclosures to clients.
5. **Audited Before vs. Hardened After Code Comparison**.`
  },
  {
    id: 'test-driven-development-tdd',
    name: 'Test-Driven Development (TDD) Blueprint',
    description: 'Comprehensive test suites covering unit test matrices, edge-case permutations, and integration mock fixtures.',
    category: 'text',
    domain: 'code',
    domainName: 'Software Architecture',
    keywords: [/test/i, /tdd/i, /unit test/i, /jest/i, /vitest/i, /mock/i, /coverage/i, /fixtures/i, /integration/i, /assert/i],
    template: `You are a QA & Test Engineering Lead. Create a comprehensive Test-Driven Development (TDD) suite for:
[FEATURE_UNDER_TEST]

### Required Test Suite:
1. **Happy Path Specifications**: Clear assertions validating expected core inputs and state transitions.
2. **Edge Case & Boundary Matrix**: Null/undefined inputs, boundary integer thresholds, network latency timeouts, corrupt payloads.
3. **Mocking & Isolation**: Self-contained mock factories and spies without external dependency coupling.
4. **Executable Test Code**: Formatted in standard Vitest / Jest with descriptive 'describe' / 'it' blocks.`
  },

  // ==========================================
  // PERSUASIVE COPYWRITING & MARKETING
  // ==========================================
  {
    id: 'aida-copywriting',
    name: 'AIDA Marketing Conversion',
    description: 'Classic Attention-Interest-Desire-Action sales copy framework optimized for high click-through rates.',
    category: 'text',
    domain: 'marketing',
    domainName: 'Persuasive Copywriting',
    keywords: [/copy/i, /copywriting/i, /marketing/i, /sales/i, /landing page/i, /ad/i, /campaign/i, /product launch/i, /email/i, /conversion/i, /cta/i],
    template: `Write high-converting marketing copy using the classic AIDA framework for:
[PRODUCT_OR_OFFERING]

### Structure:
- **Attention (Hook)**: Arresting, benefit-driven headline that disrupts scrolling and targets the core desire.
- **Interest (Engagement)**: Compelling storytelling that articulates the audience's urgent pain point and reveals an intriguing mechanism.
- **Desire (Transformation)**: Vividly showcase the emotional and tangible transformation with irresistible social proof and benefits.
- **Action (CTA)**: Clear, frictionless, high-urgency call to action eliminating all risk.`
  },
  {
    id: 'pas-problem-agitate-solve',
    name: 'PAS (Problem-Agitate-Solve)',
    description: 'High-impact persuasion framework highlighting the customer pain point, agitating the cost of inaction, and presenting the solution.',
    category: 'text',
    domain: 'marketing',
    domainName: 'Persuasive Copywriting',
    keywords: [/problem/i, /pain point/i, /persuasive/i, /pitch/i, /newsletter/i, /sales pitch/i, /customer/i, /agitate/i, /solution/i],
    template: `Craft persuasive copy using the Problem-Agitate-Solve (PAS) methodology for:
[OFFERING_TOPIC]

1. **Problem**: Pinpoint the exact, frustrating roadblock your audience faces right now.
2. **Agitate**: Deepen the emotional and financial cost of leaving this problem unsolved; make the status quo unacceptable.
3. **Solve**: Introduce [OFFERING_TOPIC] as the definitive, frictionless antidote that permanently fixes the issue.`
  },
  {
    id: 'storybrand-hero-journey',
    name: 'StoryBrand 7-Part Narrative',
    description: 'Framework placing the customer as the hero, your brand as the trusted guide with a clear plan.',
    category: 'text',
    domain: 'marketing',
    domainName: 'Persuasive Copywriting',
    keywords: [/brand/i, /story/i, /storybrand/i, /narrative/i, /hero/i, /messaging/i, /founder/i, /positioning/i],
    template: `Architect brand messaging using the Donald Miller StoryBrand 7-Part framework for:
[BRAND_OR_PRODUCT]

1. **The Hero (Customer)**: What does the customer want?
2. **The Problem**: What external, internal, and philosophical villains are blocking them?
3. **The Guide (Your Brand)**: How do you demonstrate genuine empathy and established authority?
4. **The Plan**: What simple 3-step path makes working with you effortless?
5. **Call to Action**: What direct action must they take today?
6. **Failure Staved Off**: What disaster or regret do they avoid?
7. **Success Realized**: What does life look like when they succeed?`
  },

  // ==========================================
  // REASONING, STRATEGY & EXPLANATION
  // ==========================================
  {
    id: 'calibrated-master-prompt',
    name: 'Calibrated Master Prompt',
    description: 'Comprehensive role, task, format, tone, complexity, and negative constraint specification for LLMs.',
    category: 'text',
    domain: 'reasoning',
    domainName: 'Master LLM Spec',
    keywords: [/prompt/i, /expert/i, /role/i, /instructions/i, /persona/i, /task/i, /specs/i, /llm/i, /calibrated/i],
    template: `Act as a world-class expert [ROLE].
- Objective: [TASK]
- Target Output Format: [OUTPUT_FORMAT]
- Tone & Voice: [DESIRED_TONE]
- Complexity Level: [COMPLEXITY_LEVEL]
- Strict Constraints: Avoid generic filler, provide concrete examples, and verify all assertions.

Context & Source Material:
[CONTEXT]`
  },
  {
    id: 'chain-of-thought-reasoning',
    name: 'Chain of Thought & Step Reasoning',
    description: 'Structured step-by-step logical decomposition to solve complex analytical or mathematical problems.',
    category: 'text',
    domain: 'reasoning',
    domainName: 'Analytical Reasoning',
    keywords: [/reason/i, /step by step/i, /math/i, /analyze/i, /solve/i, /logic/i, /complex/i, /break down/i, /thought/i],
    template: `Approach this problem using rigorous Chain-of-Thought step-by-step reasoning:
[PROBLEM_STATEMENT]

### Methodological Process:
1. **Deconstruct Assumptions**: State all given facts, constraints, and implicit variables.
2. **Step-by-Step Proof**: Trace each logical transformation methodically without skipping arithmetic or inferences.
3. **Edge Case Verification**: Test counter-examples and boundary conditions.
4. **Definitive Conclusion**: Synthesize the validated final answer in clear notation.`
  },
  {
    id: 'executive-brief-bluf',
    name: 'Executive Brief & Decision Matrix (BLUF)',
    description: 'Bottom-Line-Up-Front executive briefing with strategic trade-off matrix and actionable recommendations.',
    category: 'text',
    domain: 'reasoning',
    domainName: 'Executive Strategy',
    keywords: [/executive/i, /brief/i, /management/i, /strategy/i, /summary/i, /decision/i, /tradeoff/i, /recommendation/i, /bluf/i, /ceo/i, /stakeholder/i],
    template: `Provide an Executive Strategy Brief for:
[STRATEGIC_INITIATIVE]

### Required Format:
1. **Bottom Line Up Front (BLUF)**: 2-sentence summary of the core finding and direct recommendation.
2. **Strategic Context & Key Drivers**: Why this matters right now.
3. **Comparative Decision Matrix**: Markdown table comparing Option A vs. Option B vs. Status Quo across Cost, Time to Value, and Risk.
4. **Resource Allocation & Immediate Next Steps**.`
  },
  {
    id: 'socratic-first-principles',
    name: 'Socratic First-Principles Inquiry',
    description: 'Deep inquiry methodology that deconstructs assumptions and guides profound conceptual understanding.',
    category: 'text',
    domain: 'reasoning',
    domainName: 'Educational & Inquiry',
    keywords: [/socratic/i, /teach/i, /tutor/i, /learn/i, /first principles/i, /question/i, /understand/i, /concept/i, /why/i],
    template: `Act as a master Socratic mentor. Help me deconstruct and deeply understand:
[CONCEPT_OR_TOPIC]

### Guiding Rules:
- Do not feed me pre-digested answers.
- Ask 2-3 focused, fundamental questions that force me to examine my baseline assumptions.
- Challenge logical fallacies constructively and encourage derivation from first principles.`
  },
  {
    id: 'eli5-analogy-explanation',
    name: 'ELI5 Analogy & Intuition',
    description: 'Explains complex, high-level technical subjects through delightful real-world metaphors and zero jargon.',
    category: 'text',
    domain: 'reasoning',
    domainName: 'Educational & Inquiry',
    keywords: [/eli5/i, /simple/i, /explain/i, /beginner/i, /analogy/i, /children/i, /plain english/i, /jargon/i],
    template: `Explain [COMPLEX_TOPIC] to someone with no prior background, as if explaining to a curious 5-year-old.
- Ground the entire explanation in an intuitive, physical metaphor (e.g. baking cookies, playing with LEGO bricks, traffic lights).
- Strictly avoid all technical buzzwords and formal nomenclature.
- Conclude with a memorable 1-sentence takeaway.`
  }
];

/**
 * Computes contextually ranked frameworks based on the prompt in the editor.
 * Returns the top suggested frameworks first, categorized and scored.
 */
export function getContextualFrameworks(
  promptText: string,
  promptType: PromptType,
  categoryFilter: 'current' | 'text' | 'image' | 'video' | 'all' = 'current'
): {
  suggested: ContextualFramework[];
  allFiltered: ContextualFramework[];
  topCount: number;
} {
  const raw = (promptText || '').trim();
  const activeCategory = categoryFilter === 'current' ? promptType : categoryFilter;

  // Filter candidates by category if requested (unless 'all')
  const candidates = ALL_FRAMEWORKS.filter(fw => {
    if (activeCategory === 'all') return true;
    return fw.category === activeCategory;
  });

  // Calculate score for each framework
  const scoredList = candidates.map(fw => {
    let score = 0;

    // 1. Modality exact match
    if (fw.category === promptType) {
      score += 2;
    }

    // 2. Keyword regex matches against current prompt
    if (raw.length > 0) {
      for (const rx of fw.keywords) {
        if (rx.test(raw)) {
          score += 3;
        }
      }

      // Check if domain name or framework name appears in prompt
      if (raw.toLowerCase().includes(fw.name.toLowerCase())) {
        score += 5;
      }
      if (raw.toLowerCase().includes(fw.domain.toLowerCase())) {
        score += 3;
      }
    }

    return {
      ...fw,
      score,
      isSuggested: score >= 4 || (score >= 2 && raw.length === 0)
    };
  });

  // Sort: highest score first, then cinematic/popular ones
  scoredList.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Top suggestions (between 4 and 8 most relevant)
  const suggested = scoredList.slice(0, 8);

  return {
    suggested,
    allFiltered: scoredList,
    topCount: suggested.length
  };
}
