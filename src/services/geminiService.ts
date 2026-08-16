import { PromptType, PromptResult } from "../types";

export async function refinePrompt(
  initialPrompt: string,
  type: PromptType,
  previousContext: string = "",
  media?: { data: string, mimeType: string }
): Promise<PromptResult> {
  const response = await fetch("/api/refine", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      initialPrompt,
      type,
      previousContext,
      media
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to contact Prompt Architect engine.");
  }

  const result = await response.json();
  return {
    refinedPrompt: result.refinedPrompt || "",
    explanation: result.explanation || "",
    questions: result.questions || [],
    suggestedTitle: result.suggestedTitle || "Untitled Prompt",
    suggestedTags: result.suggestedTags || [],
    detectedType: result.detectedType
  };
}
