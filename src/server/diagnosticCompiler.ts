import { GoogleGenAI, Type } from '@google/genai';
import { PromptType } from '../types';
import { FrontlineAnalysisResult } from './frontlineFilter';

export interface FlawItem {
  parameter: string;
  critique: string;
  impact: string;
  flaggedSubstring?: string;
}

export interface DiagnosticCompilerResult {
  detectedModality: PromptType;
  supportingModalities: PromptType[];
  isMultiTask: boolean;
  overallScore: number;
  verdict: string;
  gradeBadge: 'S-Tier' | 'Production Ready' | 'Needs Optimization' | 'Weak Draft';
  gradeColor: 'emerald' | 'blue' | 'amber' | 'pink';
  flaws: FlawItem[];
  upgradedPrompt: string; // Architected Spec ✨
  simulatedOutputPreview: {
    rawOutputSnippet: string;
    upgradedOutputSnippet: string;
  };
}

/**
 * Single-Pass Gemini 1.5 Flash Diagnostic Engine
 * Supports Multi-Modal Routing (Primary Modality + Supporting Modalities).
 */
export async function compileDiagnosticTelemetry(
  rawInput: string,
  targetModality: PromptType = 'text',
  frontline: FrontlineAnalysisResult,
  apiKey?: string
): Promise<DiagnosticCompilerResult> {
  const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!activeKey) {
    console.warn('[DiagnosticCompiler] Missing GEMINI_API_KEY. Using deterministic fallback.');
    return generateDeterministicFallback(rawInput, targetModality, frontline);
  }

  const ai = new GoogleGenAI({ apiKey: activeKey });

  const systemInstruction = `
You are the core diagnostic engine for a high-conversion AI prompt optimizer website.
Analyze the user's raw input, detect its PRIMARY modality (Image, Video, Text, or Code) AND any SUPPORTING modalities (e.g. image + video, or code + text).
Calculate an authoritative Health Score (0-100), identify 2-4 critical structural flaws with output impacts, and output a master-level "Architected Spec" (upgraded prompt).

CRITICAL RULES:
1. Detect Primary Modality and any Supporting Modalities. If multi-task is detected, set "isMultiTask" to true.
2. Calculate "overallScore" out of 100 based on 5 core dimensions matching the primary modality.
3. Scanty inputs (1-3 words) should receive an authentic low score between 10 and 18.
4. Provide exactly 2 to 4 distinct flaws detailing missing parameters, critiques, and AI output impacts.
5. "upgradedPrompt": Expand the user's idea into a master-level prompt blueprint combining primary and supporting modality instructions if multi-task.
6. "simulatedOutputPreview": Provide a short 2-sentence side-by-side snippet comparing vanilla vs. architected frontier AI responses.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `RAW DRAFT INPUT: "${rawInput}"\nPREFERRED MODALITY: ${targetModality}\nDETECTED PRIMARY: ${frontline.detectedModality}\nSUPPORTING MODALITIES: ${frontline.supportingModalities.join(', ')}\nIS MULTI-TASK: ${frontline.isMultiTask}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedModality: { type: Type.STRING, description: 'primary modality: text, image, video, or code' },
            supportingModalities: { type: Type.ARRAY, items: { type: Type.STRING } },
            isMultiTask: { type: Type.BOOLEAN },
            overallScore: { type: Type.INTEGER, description: '0 to 100 integer score' },
            verdict: { type: Type.STRING, description: 'Short headline e.g. Low Impact Draft' },
            gradeBadge: { type: Type.STRING, description: 'S-Tier, Production Ready, Needs Optimization, or Weak Draft' },
            gradeColor: { type: Type.STRING, description: 'emerald, blue, amber, or pink' },
            flaws: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  parameter: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  flaggedSubstring: { type: Type.STRING },
                },
                required: ['parameter', 'critique', 'impact'],
              },
            },
            upgradedPrompt: { type: Type.STRING, description: 'Master-level architected prompt spec' },
            simulatedOutputPreview: {
              type: Type.OBJECT,
              properties: {
                rawOutputSnippet: { type: Type.STRING },
                upgradedOutputSnippet: { type: Type.STRING },
              },
              required: ['rawOutputSnippet', 'upgradedOutputSnippet'],
            },
          },
          required: [
            'detectedModality',
            'overallScore',
            'verdict',
            'gradeBadge',
            'gradeColor',
            'flaws',
            'upgradedPrompt',
            'simulatedOutputPreview',
          ],
        },
      },
    });

    const jsonText = response.text ? response.text.trim() : '';
    if (!jsonText) {
      throw new Error('Empty response from Gemini Flash');
    }

    const parsed = JSON.parse(jsonText) as DiagnosticCompilerResult;

    parsed.detectedModality = (['text', 'image', 'video', 'code'].includes(parsed.detectedModality)
      ? parsed.detectedModality
      : targetModality) as PromptType;

    parsed.supportingModalities = (parsed.supportingModalities || frontline.supportingModalities) as PromptType[];
    parsed.isMultiTask = parsed.isMultiTask ?? frontline.isMultiTask;
    parsed.overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore || frontline.estimatedBaselineScore)));

    if (parsed.overallScore >= 90) {
      parsed.gradeBadge = 'S-Tier';
      parsed.gradeColor = 'emerald';
      parsed.verdict = parsed.verdict || '💎 Elite S-Tier Spec';
    } else if (parsed.overallScore >= 66) {
      parsed.gradeBadge = 'Production Ready';
      parsed.gradeColor = 'blue';
      parsed.verdict = parsed.verdict || '🚀 Strong Foundation';
    } else if (parsed.overallScore >= 36) {
      parsed.gradeBadge = 'Needs Optimization';
      parsed.gradeColor = 'amber';
      parsed.verdict = parsed.verdict || '⚡ Medium Potential';
    } else {
      parsed.gradeBadge = 'Weak Draft';
      parsed.gradeColor = 'pink';
      parsed.verdict = parsed.verdict || '⚠️ Low Impact Draft';
    }

    return parsed;
  } catch (err) {
    console.error('[DiagnosticCompiler] LLM compilation error, using fallback:', err);
    return generateDeterministicFallback(rawInput, targetModality, frontline);
  }
}

/**
 * Deterministic fallback generator
 */
function generateDeterministicFallback(
  rawInput: string,
  targetModality: PromptType,
  frontline: FrontlineAnalysisResult
): DiagnosticCompilerResult {
  const score = frontline.estimatedBaselineScore;

  let gradeBadge: 'S-Tier' | 'Production Ready' | 'Needs Optimization' | 'Weak Draft' = 'Weak Draft';
  let gradeColor: 'emerald' | 'blue' | 'amber' | 'pink' = 'pink';
  let verdict = '⚠️ Low Impact Draft — Lacks Critical Guardrails';

  if (score >= 90) {
    gradeBadge = 'S-Tier';
    gradeColor = 'emerald';
    verdict = '💎 Elite S-Tier Spec — Maximum AI Precision';
  } else if (score >= 66) {
    gradeBadge = 'Production Ready';
    gradeColor = 'blue';
    verdict = '🚀 Strong Foundation — Ready for Fine-Tuning';
  } else if (score >= 36) {
    gradeBadge = 'Needs Optimization';
    gradeColor = 'amber';
    verdict = '⚡ Medium Potential — Missing Output Blueprint';
  }

  const flaws: FlawItem[] = [
    {
      parameter: 'Persona & Role Spec',
      critique: 'No explicit expert persona or domain role assigned.',
      impact: 'The AI model defaults to generic baseline knowledge without domain authority.',
    },
    {
      parameter: 'Execution Guardrails',
      critique: 'Missing explicit negative rules or boundary constraints.',
      impact: 'Increases hallucination risk and introduces unwanted fluff or conversational filler.',
    },
  ];

  const upgradedPrompt = targetModality === 'code'
    ? `Write a secure, robust ${rawInput || 'application component'} using React 19, TypeScript, and Tailwind CSS. Enforce defensive programming with strict typing, Zod schema validation, try-catch error boundaries, and accessible ARIA attributes.`
    : targetModality === 'image'
    ? `A breathtaking, cinematic shot of ${rawInput || 'your subject'}, captured on 35mm film stock, 85mm f/1.8 prime lens. Illuminated by golden hour volumetric lighting, soft atmospheric perspective, dramatic contrast, photorealistic Octane Render 8k.`
    : `Act as a Senior AI Solutions Architect. Create a master-level deliverable based on: "${rawInput || 'your objective'}".\n\n[CONTEXT & GOALS]\nDetail target audience, primary problem statement, and key success metrics.\n\n[CONSTRAINTS]\n- Exclude generic buzzwords.\n- Enforce strict Markdown section headers.`;

  return {
    detectedModality: targetModality,
    supportingModalities: frontline.supportingModalities,
    isMultiTask: frontline.isMultiTask,
    overallScore: score,
    verdict,
    gradeBadge,
    gradeColor,
    flaws,
    upgradedPrompt,
    simulatedOutputPreview: {
      rawOutputSnippet: `Vanilla AI Response: Here is a basic overview of ${rawInput || 'your request'}. It provides generic points without explicit structure or technical depth.`,
      upgradedOutputSnippet: `Architected Spec Response:\n1. EXECUTIVE SUMMARY: Precise domain strategy tailored to specifications.\n2. ARCHITECTURAL SCOPE: Enforced guardrails, zero hallucinations, structured Markdown output.`,
    },
  };
}
