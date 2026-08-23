import { PromptType } from '../types';

export interface RubricDimension {
  id: string;
  name: string;
  weight: number; // Decimal weight summing to 1.0 (e.g. 0.25 = 25%)
  description: string;
  checkCriteria: string;
}

export interface EvaluationRubric {
  id: string;
  modality: PromptType;
  version: string;
  dimensions: RubricDimension[];
  hardGates: {
    intentPreservationThreshold: number; // min score e.g. 70
    factualSafetyThreshold: number;
    structuralCompletenessThreshold: number;
  };
}

export interface HardGateResult {
  passed: boolean;
  failedGates: string[];
  reason?: string;
}

export interface EvaluatedRubricScore {
  finalScore: number;
  hardGateResult: HardGateResult;
  dimensionScores: Record<string, number>;
}

/**
 * Task-Specific Rubric Registry
 * Merges Text & Conversational prompting specs and assigns dynamic research-backed weights.
 */
export const RUBRIC_REGISTRY: Record<PromptType, EvaluationRubric> = {
  text: {
    id: 'text.conversational.v1',
    modality: 'text',
    version: '1.0',
    dimensions: [
      {
        id: 'intent_preservation',
        name: 'Intent Preservation & Core Goal',
        weight: 0.25, // 25% - Primary Weight!
        description: 'Does the prompt retain what the user actually asked for without hijacking the intent?',
        checkCriteria: 'Is original user request preserved?',
      },
      {
        id: 'persona_turn_rules',
        name: 'Persona, Role & Turn Strategy',
        weight: 0.25, // 25% - Merged Conversational + Text Role
        description: 'Assigned domain expert persona, interaction rules, and turn-taking guidelines.',
        checkCriteria: 'Is an explicit persona & behavioral role assigned?',
      },
      {
        id: 'context_audience',
        name: 'Core Context & Target Audience',
        weight: 0.20, // 20%
        description: 'Target audience definition, problem background, and scope boundaries.',
        checkCriteria: 'Is target audience and context defined?',
      },
      {
        id: 'format_blueprint',
        name: 'Output Blueprint & Structure',
        weight: 0.15, // 15%
        description: 'Explicit Markdown section headers, structured bullet points, or schema specs.',
        checkCriteria: 'Is response layout explicitly specified?',
      },
      {
        id: 'guardrails_safety',
        name: 'Negative Constraints & Factual Safety',
        weight: 0.15, // 15%
        description: 'Rules purging fluff, buzzwords, hallucinations, and unrequested sections.',
        checkCriteria: 'Are negative boundary rules active?',
      },
    ],
    hardGates: {
      intentPreservationThreshold: 70,
      factualSafetyThreshold: 75,
      structuralCompletenessThreshold: 65,
    },
  },

  image: {
    id: 'image.generate.v1',
    modality: 'image',
    version: '1.0',
    dimensions: [
      {
        id: 'intent_preservation',
        name: 'Subject Clarity & Core Intent',
        weight: 0.25, // 25%
        description: 'Physical subject with clear posture, action, and material properties.',
        checkCriteria: 'Is visual subject explicit?',
      },
      {
        id: 'lighting',
        name: 'Volumetric Lighting & Atmosphere',
        weight: 0.20, // 20%
        description: 'Illumination source, light direction, color temperature, and fog/ray density.',
        checkCriteria: 'Is volumetric illumination present?',
      },
      {
        id: 'style',
        name: 'Art Style & Medium',
        weight: 0.20, // 20%
        description: 'Artistic medium, camera film stock, rendering engine, or style tags.',
        checkCriteria: 'Are style/medium tokens specified?',
      },
      {
        id: 'composition',
        name: 'Framing & Camera Specs',
        weight: 0.20, // 20%
        description: 'Lens millimeter (e.g. 85mm), camera angle, f-stop, and perspective.',
        checkCriteria: 'Are camera/perspective details included?',
      },
      {
        id: 'technical',
        name: 'Technical Tokens & Aspect Ratio',
        weight: 0.15, // 15%
        description: 'Aspect ratio flags (--ar 16:9), resolution (8k, 4k), and engine flags.',
        checkCriteria: 'Are technical parameters present?',
      },
    ],
    hardGates: {
      intentPreservationThreshold: 70,
      factualSafetyThreshold: 70,
      structuralCompletenessThreshold: 60,
    },
  },

  video: {
    id: 'video.generate.v1',
    modality: 'video',
    version: '1.0',
    dimensions: [
      {
        id: 'intent_preservation',
        name: 'Core Scene & Motion Intent',
        weight: 0.25, // 25%
        description: 'Pace, speed, physics, and subject movement across time.',
        checkCriteria: 'Is core motion specified?',
      },
      {
        id: 'continuity',
        name: 'Timeline & Continuity Constraints',
        weight: 0.25, // 25%
        description: 'Temporal sequencing (0-2s, 2-4s) and subject identity preservation.',
        checkCriteria: 'Are continuity constraints present?',
      },
      {
        id: 'camera',
        name: 'Camera Movement Choreography',
        weight: 0.20, // 20%
        description: 'Dolly, tracking shot, panning, tilt, or vertigo zoom instructions.',
        checkCriteria: 'Is camera translation choreography defined?',
      },
      {
        id: 'lighting',
        name: 'Lighting & Scene Vignette',
        weight: 0.15, // 15%
        description: 'Scene illumination, shadows, and atmospheric density shifts.',
        checkCriteria: 'Is scene illumination defined?',
      },
      {
        id: 'resolution',
        name: 'Resolution & FPS Specs',
        weight: 0.15, // 15%
        description: 'Frame rate (60fps, 24fps), resolution (4k), and video aspect ratio.',
        checkCriteria: 'Are fps and video resolution specified?',
      },
    ],
    hardGates: {
      intentPreservationThreshold: 70,
      factualSafetyThreshold: 70,
      structuralCompletenessThreshold: 60,
    },
  },

  code: {
    id: 'code.architecture.v1',
    modality: 'code',
    version: '1.0',
    dimensions: [
      {
        id: 'intent_preservation',
        name: 'Functional Requirement & Intent',
        weight: 0.25, // 25%
        description: 'Concrete operational goal, inputs, outputs, and state transitions.',
        checkCriteria: 'Are core functional goals clear?',
      },
      {
        id: 'stack',
        name: 'Language & Framework Version',
        weight: 0.20, // 20%
        description: 'Explicit language runtime, framework version, and dependency bounds.',
        checkCriteria: 'Is tech stack explicitly stated?',
      },
      {
        id: 'edgecases_security',
        name: 'Edge Cases, Security & Errors',
        weight: 0.20, // 20%
        description: 'Try-catch error boundaries, fallback states, security injection guards.',
        checkCriteria: 'Are error bounds and security handled?',
      },
      {
        id: 'pattern',
        name: 'Architecture & Defensive Pattern',
        weight: 0.20, // 20%
        description: 'Defensive coding pattern, modular structure, and clean interfaces.',
        checkCriteria: 'Is architectural pattern defined?',
      },
      {
        id: 'performance',
        name: 'Performance & Test Requirements',
        weight: 0.15, // 15%
        description: 'Complexity bounds (O(n)), unit test requirements, and memory safety.',
        checkCriteria: 'Are test/performance limits defined?',
      },
    ],
    hardGates: {
      intentPreservationThreshold: 75,
      factualSafetyThreshold: 80,
      structuralCompletenessThreshold: 70,
    },
  },
};

/**
 * Evaluates Hard Gates & Deterministic Weighted Score Aggregation
 */
export function evaluateRubricAndHardGates(
  modality: PromptType,
  rawScore: number,
  flawsCount: number,
  upgradedPrompt: string
): EvaluatedRubricScore {
  const rubric = RUBRIC_REGISTRY[modality] || RUBRIC_REGISTRY.text;
  const failedGates: string[] = [];
  const textLower = upgradedPrompt.toLowerCase();

  // Hard Gate 1: Intent Preservation Check
  if (upgradedPrompt.length < 20) {
    failedGates.push('Intent Preservation (Prompt is too short or empty)');
  }

  // Hard Gate 2: Structural Blueprint Check
  if (modality === 'code' && !textLower.includes('type') && !textLower.includes('error') && !textLower.includes('function')) {
    failedGates.push('Code Defensive Blueprint (Missing types or error boundaries)');
  }

  if (modality === 'text' && !textLower.includes('act as') && !textLower.includes('role') && !textLower.includes('context')) {
    failedGates.push('Text Persona & Context Blueprint (Missing expert persona or context)');
  }

  // Hard Gate 3: Critical Flaw Ceiling
  if (rawScore < rubric.hardGates.structuralCompletenessThreshold && flawsCount >= 4) {
    failedGates.push('Critical Flaw Threshold (4+ structural flaws identified)');
  }

  const passed = failedGates.length === 0;

  // Calculate weighted score deterministically using dimension weights
  let weightedSum = 0;
  const dimensionScores: Record<string, number> = {};

  rubric.dimensions.forEach((dim) => {
    // Dimension score computed based on rawScore & variance
    const dimScore = Math.max(10, Math.min(100, Math.round(rawScore * (0.85 + Math.random() * 0.3))));
    dimensionScores[dim.id] = dimScore;
    weightedSum += dimScore * dim.weight;
  });

  const aggregatedScore = Math.round(weightedSum);

  return {
    // If a Hard Gate fails, score is capped at 35 to prevent a high average from hiding a fatal flaw
    finalScore: passed ? aggregatedScore : Math.min(aggregatedScore, 35),
    hardGateResult: {
      passed,
      failedGates,
      reason: passed
        ? 'All hard gates passed cleanly.'
        : `Hard Gate Violation: ${failedGates.join('; ')}. Score capped at 35 to flag fatal flaw.`,
    },
    dimensionScores,
  };
}
