import { PromptType } from '../types';

export interface CriterionResult {
  score: number;
  maxScore: number;
  status: 'pass' | 'warning' | 'fail';
  title: string;
  description: string;
  suggestion: string;
}

export interface DiagnosticResult {
  overallScore: number;
  gradeLabel: string;
  gradeBadge: 'S-Tier' | 'Production Ready' | 'Needs Optimization' | 'Weak Draft';
  gradeColor: 'emerald' | 'blue' | 'amber' | 'pink';
  wordCount: number;
  characterCount: number;
  criteria: {
    role: CriterionResult;
    context: CriterionResult;
    task: CriterionResult;
    constraints: CriterionResult;
    outputFormat: CriterionResult;
  };
  missingElements: string[];
  recommendations: string[];
  suggestedFrameworkId?: string;
  optimizedBlueprint: string;
}

/**
 * Analyzes a raw prompt or idea against 5 industry-grade prompt engineering standards.
 */
export function analyzePromptDiagnostic(rawPrompt: string, targetModality: PromptType = 'text'): DiagnosticResult {
  const text = rawPrompt.trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const characterCount = text.length;

  if (!text || wordCount < 2) {
    return {
      overallScore: 12,
      gradeLabel: 'Blank / Incomplete',
      gradeBadge: 'Weak Draft',
      gradeColor: 'pink',
      wordCount: 0,
      characterCount: 0,
      criteria: {
        role: { score: 0, maxScore: 20, status: 'fail', title: 'Role & Persona', description: 'No persona or expert role assigned.', suggestion: 'Define a specific role (e.g. "Act as a Senior Marketing Strategist...").' },
        context: { score: 0, maxScore: 20, status: 'fail', title: 'Context & Background', description: 'Missing background framing.', suggestion: 'Explain the context, goal, or target audience.' },
        task: { score: 0, maxScore: 20, status: 'fail', title: 'Task & Objective', description: 'No clear deliverable specified.', suggestion: 'Use explicit action verbs specifying the desired output.' },
        constraints: { score: 0, maxScore: 20, status: 'fail', title: 'Constraints & Rules', description: 'No negative constraints or limits.', suggestion: 'Define what to avoid and boundaries to respect.' },
        outputFormat: { score: 12, maxScore: 20, status: 'fail', title: 'Output Specs', description: 'Unspecified output format.', suggestion: 'Request Markdown, JSON, bullet points, or step-by-step layout.' }
      },
      missingElements: ['Defined Expert Persona', 'Problem Context', 'Actionable Task Objective', 'Boundary Constraints', 'Output Structural Blueprint'],
      recommendations: [
        'Assign an expert persona to ground the AI model in domain authority.',
        'Provide background context explaining the problem or target audience.',
        'Define explicit negative constraints to prevent generic or off-target AI responses.',
        'Specify structural output expectations (e.g., bulleted list, Markdown, or JSON).'
      ],
      optimizedBlueprint: `[ROLE & PERSONA]\nAct as an expert AI Specialist in [YOUR_DOMAIN].\n\n[CONTEXT & BACKGROUND]\n${text || 'Describe your project background and target goals here...'}\n\n[OBJECTIVES]\nCreate a high-impact, professional deliverable covering the key requirements.\n\n[CONSTRAINTS & RULES]\n- Avoid generic buzzwords.\n- Maintain high professional standards.\n\n[OUTPUT BLUEPRINT]\nStructure response using Markdown headings, concise paragraphs, and bullet points.`
    };
  }

  // 1. ROLE & PERSONA EVALUATION (0-20)
  const roleRegex = /\b(act as|you are|persona|role|expert|specialist|consultant|architect|senior|director|lead|engineer|copywriter|designer|manager|advisor)\b/i;
  const hasRoleMatch = roleRegex.test(lower);
  let roleScore = 0;
  let roleStatus: 'pass' | 'warning' | 'fail' = 'fail';
  let roleDesc = 'No explicit role or persona defined.';
  let roleSugg = 'Add an expert persona prefix like: "Act as a Senior AI Architect..."';

  if (hasRoleMatch) {
    roleScore = 20;
    roleStatus = 'pass';
    roleDesc = 'Clear expert role/persona established.';
    roleSugg = 'Persona is well-defined and grounds AI authority.';
  } else if (lower.includes('i need') || lower.includes('please') || lower.includes('help me')) {
    roleScore = 10;
    roleStatus = 'warning';
    roleDesc = 'Implicit request detected, but no expert persona assigned.';
    roleSugg = 'Explicitly state the AI persona to elevate response depth.';
  }

  // 2. CONTEXT & BACKGROUND EVALUATION (0-20)
  let contextScore = 0;
  let contextStatus: 'pass' | 'warning' | 'fail' = 'fail';
  let contextDesc = 'Minimal or missing background context.';
  let contextSugg = 'Add 1-2 sentences explaining background, target audience, or goal.';

  const contextKeywords = /\b(context|background|audience|target|for|because|goal|scenario|industry|market|purpose|problem|use case)\b/i;
  const hasContextKeywords = contextKeywords.test(lower);

  if (wordCount >= 35 || (hasContextKeywords && wordCount >= 15)) {
    contextScore = 20;
    contextStatus = 'pass';
    contextDesc = 'Sufficient context and domain background provided.';
    contextSugg = 'Context gives clear directional framing.';
  } else if (wordCount >= 12) {
    contextScore = 12;
    contextStatus = 'warning';
    contextDesc = 'Brief context provided, but additional detail will improve accuracy.';
    contextSugg = 'Expand on target audience, platform, or intended outcome.';
  }

  // 3. TASK & OBJECTIVE EVALUATION (0-20)
  let taskScore = 0;
  let taskStatus: 'pass' | 'warning' | 'fail' = 'fail';
  let taskDesc = 'Vague task statement.';
  let taskSugg = 'Use strong action verbs (e.g., "Draft", "Generate", "Synthesize", "Build").';

  const taskVerbs = /\b(create|write|generate|design|build|develop|draft|explain|analyze|summarize|list|formulate|construct|outline|audit|refine|compose)\b/i;
  if (taskVerbs.test(lower)) {
    if (wordCount >= 10) {
      taskScore = 20;
      taskStatus = 'pass';
      taskDesc = 'Clear action verb and actionable task objective.';
      taskSugg = 'Task deliverable is clearly articulated.';
    } else {
      taskScore = 14;
      taskStatus = 'warning';
      taskDesc = 'Action verb present, but scope is very brief.';
      taskSugg = 'Detail the specific deliverables required.';
    }
  } else if (wordCount >= 8) {
    taskScore = 10;
    taskStatus = 'warning';
    taskDesc = 'Implied objective, missing explicit action verb.';
    taskSugg = 'Start with an imperative verb like "Create...", "Write...", or "Analyze...".';
  }

  // 4. CONSTRAINTS & NEGATIVE CRITERIA EVALUATION (0-20)
  let constraintScore = 0;
  let constraintStatus: 'pass' | 'warning' | 'fail' = 'fail';
  let constraintDesc = 'No rules or negative constraints defined.';
  let constraintSugg = 'Include explicit constraints (e.g., "Do not use generic buzzwords", "Keep under 300 words").';

  const constraintKeywords = /\b(do not|don't|avoid|no |not |without|limit|must not|never|exclude|rule|constraint|guideline|keep under|max|tone|style)\b/i;
  if (constraintKeywords.test(lower)) {
    constraintScore = 20;
    constraintStatus = 'pass';
    constraintDesc = 'Negative constraints or stylistic boundaries defined.';
    constraintSugg = 'Constraints prevent generic AI outputs.';
  } else if (lower.includes('short') || lower.includes('concise') || lower.includes('professional') || lower.includes('detailed')) {
    constraintScore = 10;
    constraintStatus = 'warning';
    constraintDesc = 'Basic tone descriptor found, but negative constraints are missing.';
    constraintSugg = 'Add negative constraints ("Do not...", "Avoid...") to refine precision.';
  }

  // 5. OUTPUT FORMAT & BLUEPRINT EVALUATION (0-20)
  let formatScore = 0;
  let formatStatus: 'pass' | 'warning' | 'fail' = 'fail';
  let formatDesc = 'Output format is unspecified.';
  let formatSugg = 'Request a structural blueprint (e.g., "Format as Markdown with headers and bullet points").';

  const formatKeywords = /\b(format|structure|markdown|json|table|bullet|list|sections|template|schema|code block|output|steps|html|csv)\b/i;
  if (formatKeywords.test(lower)) {
    formatScore = 20;
    formatStatus = 'pass';
    formatDesc = 'Explicit structural output format requested.';
    formatSugg = 'Structural spec guarantees high readability.';
  } else if (lower.includes('heading') || lower.includes('step') || lower.includes('example')) {
    formatScore = 10;
    formatStatus = 'warning';
    formatDesc = 'Partial formatting requirement mentioned.';
    formatSugg = 'Explicitly state the exact layout structure desired.';
  }

  // Calculate Overall Health Score
  const totalScore = Math.min(100, Math.max(0, roleScore + contextScore + taskScore + constraintScore + formatScore));

  let gradeLabel = '';
  let gradeBadge: 'S-Tier' | 'Production Ready' | 'Needs Optimization' | 'Weak Draft' = 'Weak Draft';
  let gradeColor: 'emerald' | 'blue' | 'amber' | 'pink' = 'pink';

  if (totalScore >= 90) {
    gradeLabel = 'S-Tier Architectural Spec';
    gradeBadge = 'S-Tier';
    gradeColor = 'emerald';
  } else if (totalScore >= 75) {
    gradeLabel = 'Production Ready Prompt';
    gradeBadge = 'Production Ready';
    gradeColor = 'blue';
  } else if (totalScore >= 50) {
    gradeLabel = 'Needs Structure Optimization';
    gradeBadge = 'Needs Optimization';
    gradeColor = 'amber';
  } else {
    gradeLabel = 'Weak Draft - Missing Key Elements';
    gradeBadge = 'Weak Draft';
    gradeColor = 'pink';
  }

  // Collect missing elements & actionable recommendations
  const missingElements: string[] = [];
  const recommendations: string[] = [];

  if (roleScore < 15) {
    missingElements.push('Expert Persona & Role Definition');
    recommendations.push('Add an expert persona (e.g., "Act as a Senior Copywriter") to ground AI reasoning.');
  }
  if (contextScore < 15) {
    missingElements.push('Background & Domain Context');
    recommendations.push('Provide context regarding the project goal, industry, or target audience.');
  }
  if (taskScore < 15) {
    missingElements.push('Actionable Deliverable Objective');
    recommendations.push('State the exact task using strong action verbs (e.g., "Develop a 5-step strategy").');
  }
  if (constraintScore < 15) {
    missingElements.push('Negative Constraints & Guardrails');
    recommendations.push('Add negative constraints (e.g., "Do not use clichéd buzzwords or passive voice").');
  }
  if (formatScore < 15) {
    missingElements.push('Structural Output Specifications');
    recommendations.push('Specify the output format (e.g., "Present as Markdown with bold headers and bullet points").');
  }

  // Generate an auto-architected prompt blueprint based on user input
  const extractedRole = hasRoleMatch ? '' : 'Act as an expert AI Specialist and domain authority.\n\n';
  const extractedContext = contextScore >= 15 ? '' : `[CONTEXT & GOAL]\nTarget Objective: ${text.slice(0, 120)}...\n\n`;
  const extractedTask = `[ACTIONABLE TASK]\n${text}\n\n`;
  const extractedConstraints = constraintScore >= 15 ? '' : `[CONSTRAINTS & GUARDRAILS]\n- Maintain professional, high-converting tone.\n- Avoid generic fillers and superficial summaries.\n- Ensure high accuracy and logical consistency.\n\n`;
  const extractedFormat = formatScore >= 15 ? '' : `[OUTPUT BLUEPRINT]\nFormat response with clean Markdown headings, bullet points, and actionable key takeaways.`;

  const optimizedBlueprint = `${extractedRole}${extractedContext}${extractedTask}${extractedConstraints}${extractedFormat}`.trim();

  return {
    overallScore: totalScore,
    gradeLabel,
    gradeBadge,
    gradeColor,
    wordCount,
    characterCount,
    criteria: {
      role: { score: roleScore, maxScore: 20, status: roleStatus, title: 'Role & Persona', description: roleDesc, suggestion: roleSugg },
      context: { score: contextScore, maxScore: 20, status: contextStatus, title: 'Context & Background', description: contextDesc, suggestion: contextSugg },
      task: { score: taskScore, maxScore: 20, status: taskStatus, title: 'Task Objective', description: taskDesc, suggestion: taskSugg },
      constraints: { score: constraintScore, maxScore: 20, status: constraintStatus, title: 'Constraints & Guardrails', description: constraintDesc, suggestion: constraintSugg },
      outputFormat: { score: formatScore, maxScore: 20, status: formatStatus, title: 'Output Blueprint', description: formatDesc, suggestion: formatSugg }
    },
    missingElements,
    recommendations,
    optimizedBlueprint
  };
}
