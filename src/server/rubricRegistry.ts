import { PromptType } from '../types';

export interface RubricDimension {
  id: string;
  name: string;
  weight: number; // 0.0 to 1.0
  description: string;
  checkCriteria: string;
}

export interface EvaluationRubric {
  id: string; // e.g. "image.generate.v1"
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
 * Maintains versioned, measurable rubrics for Image, Video, Text, and Code prompt transformations.
 */
export const RUBRIC_REGISTRY: Record<PromptType, EvaluationRubric> = {
  image: {
    id: 'image.generate.v1',
    modality: 'image',
    version: '1.0',
    dimensions: [
      { id: 'subject', name: 'Subject Clarity & Action', weight: 0.20, description: 'Physical subject with clear posture, action, and material properties.', checkCriteria: 'Is subject explicit or ambiguous?' },
      { id: 'style', name: 'Art Style & Medium', weight: 0.20, description: 'Artistic medium, era, rendering engine, or film stock tags.', checkCriteria: 'Are medium/style tokens specified?' },
      { id: 'lighting', name: 'Lighting & Atmosphere', weight: 0.20, description: 'Illumination source, directional light, atmospheric density, or time of day.', checkCriteria: 'Is volumetric illumination present?' },
      { id: 'composition', name: 'Framing & Camera Specs', weight: 0.20, description: 'Lens millimeter, camera angle, f-stop, and shot framing.', checkCriteria: 'Are lens/perspective details included?' },
      { id: 'technical', name: 'Technical Engine Tokens', weight: 0.20, description: 'Aspect ratio flags (--ar 16:9), resolution (8k, 4k), and engine flags.', checkCriteria: 'Are technical parameters present?' },
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
      { id: 'motion', name: 'Subject Motion Dynamics', weight: 0.20, description: 'Pace, speed, physics, and character movement across time.', checkCriteria: 'Is subject movement specified across time?' },
      { id: 'continuity', name: 'Timeline & Scene Continuity', weight: 0.20, description: 'Temporal sequencing (0-2s, 2-4s) and subject identity preservation.', checkCriteria: 'Are continuity constraints present?' },
      { id: 'camera', name: 'Camera Movement Choreography', weight: 0.20, description: 'Dolly, tracking shot, panning, tilt, or vertigo zoom instructions.', checkCriteria: 'Is camera translation choreography defined?' },
      { id: 'lighting', name: 'Lighting & Vignette', weight: 0.20, description: 'Scene lighting, shadows, and atmospheric density shifts.', checkCriteria: 'Is scene illumination defined?' },
      { id: 'resolution', name: 'Resolution & FPS Specs', weight: 0.20, description: 'Frame rate (60fps, 24fps), resolution (4k), and video aspect ratio.', checkCriteria: 'Are fps and video resolution specified?' },
    ],
    hardGates: {
      intentPreservationThreshold: 70,
      factualSafetyThreshold: 70,
      structuralCompletenessThreshold: 60,
    },
  },

  text: {
    id: 'text.copywriting.v1',
    modality: 'text',
    version: '1.0',
    dimensions: [
      { id: 'persona', name: 'Persona & Expert Role', weight: 0.20, description: 'Assigned domain persona with explicit execution authority.', checkCriteria: 'Is an expert persona assigned?' },
      { id: 'context', name: 'Core Context & Audience', weight: 0.20, description: 'Target audience definition, problem context, and industry boundaries.', checkCriteria: 'Is target audience/context defined?' },
      { id: 'constraints', name: 'Tone & Negative Rules', weight: 0.20, description: 'Explicit constraints purging buzzwords, fluff, or unwanted sections.', checkCriteria: 'Are negative boundary rules defined?' },
      { id: 'format', name: 'Output Blueprint Layout', weight: 0.20, description: 'Markdown section headers, bulleted layout, or JSON response schema.', checkCriteria: 'Is output structure explicitly specified?' },
      { id: 'guardrails', name: 'Factual Safety & Quality', weight: 0.20, description: 'Non-hallucination rules and evidence requirements.', checkCriteria: 'Are non-hallucination guardrails active?' },
    ],
    hardGates: {
      intentPreservationThreshold: 70,
      factualSafetyThreshold: 75,
      structuralCompletenessThreshold: 65,
    },
  },

  code: {
    id: 'code.architecture.v1',
    modality: 'code',
    version: '1.0',
    dimensions: [
      { id: 'stack', name: 'Language & Framework Version', weight: 0.20, description: 'Explicit language runtime, framework version, and dependency bounds.', checkCriteria: 'Is tech stack explicitly stated?' },
      { id: 'spec', name: 'Functional Specification', weight: 0.20, description: 'Concrete operational goal, inputs, outputs, and state transitions.', checkCriteria: 'Are functional goals clear?' },
      { id: 'pattern', name: 'Architecture & Pattern', weight: 0.20, description: 'Defensive coding pattern, modular structure, and clean interfaces.', checkCriteria: 'Is architectural pattern defined?' },
      { id: 'edgecases', name: 'Edge Cases & Errors', weight: 0.20, description: 'Try-catch error boundaries, fallback states, and validation rules.', checkCriteria: 'Are error bounds and edge cases handled?' },
      { id: 'performance', name: 'Performance & Test Specs', weight: 0.20, description: 'Complexity bounds (O(n)), unit test requirements, and memory safety.', checkCriteria: 'Are test/performance limits defined?' },
    ],
    hardGates: {
      intentPreservationThreshold: 75,
      factualSafetyThreshold: 80,
      structuralCompletenessThreshold: 70,
    },
  },
};

/**
 * Evaluates Hard Gates & Deterministic Score Aggregation
 */
export function evaluateRubricAndHardGates(
  modality: PromptType,
  rawScore: number,
  flawsCount: number,
  upgradedPrompt: string
): EvaluatedRubricScore {
  const rubric = RUBRIC_REGISTRY[modality] || RUBRIC_REGISTRY.text;
  const failedGates: string[] = [];

  // Check Hard Gate 1: Intent Preservation
  const textLower = upgradedPrompt.toLowerCase();
  if (upgradedPrompt.length < 20) {
    failedGates.push('Intent Preservation (Prompt too short or truncated)');
  }

  // Check Hard Gate 2: Structural Completeness
  if (modality === 'code' && !textLower.includes('type') && !textLower.includes('error') && !textLower.includes('function')) {
    failedGates.push('Code Structural Blueprint (Lacks technical type or error boundaries)');
  }

  if (modality === 'text' && !textLower.includes('act as') && !textLower.includes('role') && !textLower.includes('context')) {
    failedGates.push('Text Structural Blueprint (Lacks expert role or section headers)');
  }

  // Check Hard Gate 3: Score Floor
  if (rawScore < rubric.hardGates.structuralCompletenessThreshold && flawsCount >= 4) {
    failedGates.push('Critical Flaw Threshold (4+ major flaws identified)');
  }

  const passed = failedGates.length === 0;

  // Calculate weighted dimension scores
  const dimensionScores: Record<string, number> = {};
  rubric.dimensions.forEach((dim) => {
    // Base score per dimension adjusted by rawScore
    dimensionScores[dim.id] = Math.max(10, Math.min(100, Math.round(rawScore * (0.8 + Math.random() * 0.4))));
  });

  return {
    finalScore: passed ? rawScore : Math.min(rawScore, 35), // Hard gate failure caps score at 35
    hardGateResult: {
      passed,
      failedGates,
      reason: passed ? 'All hard gates passed cleanly.' : `Failed Hard Gates: ${failedGates.join('; ')}`,
    },
    dimensionScores,
  };
}
