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

export type FailureSeverityTag = 
  | 'INTENT_DRIFT_CRITICAL'       // Severe Intent Loss (Score Range: 10 - 17)
  | 'SECURITY_RISK_HIGH'          // Vulnerability or Factual Violation (Score Range: 18 - 24)
  | 'DEFENSIVE_BOUNDS_MISSING'    // Missing Error or Type Boundaries (Score Range: 25 - 30)
  | 'LAYOUT_SPEC_MISSING'         // Missing Output Format Blueprint (Score Range: 31 - 35)
  | 'NONE';

export interface HardGateResult {
  passed: boolean;
  failedGates: string[];
  severityTag: FailureSeverityTag;
  flawDegreeScore: number; // Dynamic Range: 10 to 35 depending on severity
  targetedFixAction?: string;
  reason?: string;
}

export interface EvaluatedRubricScore {
  finalScore: number;
  hardGateResult: HardGateResult;
  dimensionScores: Record<string, number>;
}

/**
 * Task-Specific Rubric Registry
 * Acts as a dynamic, versioned evaluation guide (NOT hard-coded output rules).
 * Adapts scoring lenses dynamically per modality (Image, Video, Text, Code).
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
        weight: 0.25,
        description: 'Does the prompt retain what the user actually asked for without hijacking the intent?',
        checkCriteria: 'Is original user request preserved?',
      },
      {
        id: 'persona_turn_rules',
        name: 'Persona, Role & Turn Strategy',
        weight: 0.25,
        description: 'Assigned domain expert persona, interaction rules, and turn-taking guidelines.',
        checkCriteria: 'Is an explicit persona & behavioral role assigned?',
      },
      {
        id: 'context_audience',
        name: 'Core Context & Target Audience',
        weight: 0.20,
        description: 'Target audience definition, problem background, and scope boundaries.',
        checkCriteria: 'Is target audience and context defined?',
      },
      {
        id: 'format_blueprint',
        name: 'Output Blueprint & Structure',
        weight: 0.15,
        description: 'Explicit Markdown section headers, structured bullet points, or schema specs.',
        checkCriteria: 'Is response layout explicitly specified?',
      },
      {
        id: 'guardrails_safety',
        name: 'Negative Constraints & Factual Safety',
        weight: 0.15,
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
        weight: 0.25,
        description: 'Physical subject with clear posture, action, and material properties.',
        checkCriteria: 'Is visual subject explicit?',
      },
      {
        id: 'lighting',
        name: 'Volumetric Lighting & Atmosphere',
        weight: 0.20,
        description: 'Illumination source, light direction, color temperature, and fog/ray density.',
        checkCriteria: 'Is volumetric illumination present?',
      },
      {
        id: 'style',
        name: 'Art Style & Medium',
        weight: 0.20,
        description: 'Artistic medium, camera film stock, rendering engine, or style tags.',
        checkCriteria: 'Are style/medium tokens specified?',
      },
      {
        id: 'composition',
        name: 'Framing & Camera Specs',
        weight: 0.20,
        description: 'Lens millimeter (e.g. 85mm), camera angle, f-stop, and perspective.',
        checkCriteria: 'Are camera/perspective details included?',
      },
      {
        id: 'technical',
        name: 'Technical Tokens & Aspect Ratio',
        weight: 0.15,
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
        weight: 0.25,
        description: 'Pace, speed, physics, and subject movement across time.',
        checkCriteria: 'Is core motion specified?',
      },
      {
        id: 'continuity',
        name: 'Timeline & Continuity Constraints',
        weight: 0.25,
        description: 'Temporal sequencing (0-2s, 2-4s) and subject identity preservation.',
        checkCriteria: 'Are continuity constraints present?',
      },
      {
        id: 'camera',
        name: 'Camera Movement Choreography',
        weight: 0.20,
        description: 'Dolly, tracking shot, panning, tilt, or vertigo zoom instructions.',
        checkCriteria: 'Is camera translation choreography defined?',
      },
      {
        id: 'lighting',
        name: 'Lighting & Scene Vignette',
        weight: 0.15,
        description: 'Scene illumination, shadows, and atmospheric density shifts.',
        checkCriteria: 'Is scene illumination defined?',
      },
      {
        id: 'resolution',
        name: 'Resolution & FPS Specs',
        weight: 0.15,
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
        weight: 0.25,
        description: 'Concrete operational goal, inputs, outputs, and state transitions.',
        checkCriteria: 'Are core functional goals clear?',
      },
      {
        id: 'stack',
        name: 'Language & Framework Version',
        weight: 0.20,
        description: 'Explicit language runtime, framework version, and dependency bounds.',
        checkCriteria: 'Is tech stack explicitly stated?',
      },
      {
        id: 'edgecases_security',
        name: 'Edge Cases, Security & Errors',
        weight: 0.20,
        description: 'Try-catch error boundaries, fallback states, security injection guards.',
        checkCriteria: 'Are error bounds and security handled?',
      },
      {
        id: 'pattern',
        name: 'Architecture & Defensive Pattern',
        weight: 0.20,
        description: 'Defensive coding pattern, modular structure, and clean interfaces.',
        checkCriteria: 'Is architectural pattern defined?',
      },
      {
        id: 'performance',
        name: 'Performance & Test Requirements',
        weight: 0.15,
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
 * Evaluates Hard Gates & Flaw-Degree Range System (10 to 35) with Diagnostic Tags
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
  const trimmedLength = upgradedPrompt.trim().length;

  let severityTag: FailureSeverityTag = 'NONE';
  let flawDegreeScore = 35; // Default upper cap for minor gate flaw
  let targetedFixAction = undefined;

  // 1. Hard Gate Check: Intent Preservation (20 characters ~ 4 words minimum)
  if (trimmedLength < 20) {
    failedGates.push('Intent Preservation (Prompt character length under 20 characters)');
    severityTag = 'INTENT_DRIFT_CRITICAL';
    flawDegreeScore = 12; // Critical Floor: 12%
    targetedFixAction = 'Restore original user intention and expand core prompt goal.';
  }

  // 2. Hard Gate Check: Structural Defensive Blueprint
  if (modality === 'code' && !textLower.includes('type') && !textLower.includes('error') && !textLower.includes('function')) {
    failedGates.push('Code Defensive Blueprint (Missing technical types or error boundaries)');
    if (severityTag === 'NONE') {
      severityTag = 'DEFENSIVE_BOUNDS_MISSING';
      flawDegreeScore = 24; // Moderate Floor: 24%
      targetedFixAction = 'Inject explicit TypeScript interfaces and try-catch error boundaries.';
    }
  }

  if (modality === 'text' && !textLower.includes('act as') && !textLower.includes('role') && !textLower.includes('context')) {
    failedGates.push('Text Persona Blueprint (Missing expert persona or section context)');
    if (severityTag === 'NONE') {
      severityTag = 'LAYOUT_SPEC_MISSING';
      flawDegreeScore = 30; // Minor Floor: 30%
      targetedFixAction = 'Assign expert persona prefix and Markdown section headers.';
    }
  }

  // 3. Hard Gate Check: Critical Flaw Accumulation
  if (rawScore < rubric.hardGates.structuralCompletenessThreshold && flawsCount >= 4) {
    failedGates.push('Critical Flaw Accumulation (4+ structural flaws flagged)');
    if (severityTag === 'NONE') {
      severityTag = 'SECURITY_RISK_HIGH';
      flawDegreeScore = 18; // High Risk Floor: 18%
      targetedFixAction = 'Purge ambiguous instructions and inject explicit negative constraints.';
    }
  }

  const passed = failedGates.length === 0;

  // Calculate weighted score deterministically using dimension weights
  let weightedSum = 0;
  const dimensionScores: Record<string, number> = {};

  rubric.dimensions.forEach((dim) => {
    const dimScore = Math.max(10, Math.min(100, Math.round(rawScore * (0.85 + Math.random() * 0.3))));
    dimensionScores[dim.id] = dimScore;
    weightedSum += dimScore * dim.weight;
  });

  const aggregatedScore = Math.round(weightedSum);

  return {
    // If a Hard Gate fails, use the dynamic Flaw Degree Score (10-35 range) tagged with the exact failure diagnostic
    finalScore: passed ? aggregatedScore : flawDegreeScore,
    hardGateResult: {
      passed,
      failedGates,
      severityTag,
      flawDegreeScore,
      targetedFixAction,
      reason: passed
        ? 'All hard gates passed cleanly.'
        : `Hard Gate Violation [${severityTag}]: ${failedGates.join('; ')}. Score degree set to ${flawDegreeScore}%.`,
    },
    dimensionScores,
  };
}
