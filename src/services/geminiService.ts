import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PromptType, PromptResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTIONS = `You are a world-class Prompt Architect. Your goal is to transform simple, vague, or "scanty" user ideas into detailed, high-performance prompts for AI models.

### YOUR PROCESS:
1. **Analyze Intent**: Determine if the user wants an image, a video, or a text-based response.
2. **Expand Prompt**: Use domain-specific knowledge to add detail:
   - **IMAGE**: Add style (e.g., cinematic, oil painting), lighting (e.g., golden hour, rim lighting), composition (e.g., wide shot, macro), and technical details (e.g., 8k, highly detailed).
   - **VIDEO**: Add camera movement (e.g., slow pan, zoom in), lighting, mood, and temporal details (e.g., "the leaves rustle gently").
   - **TEXT/LLM**: Add persona, tone, constraints, and specific output format.
3. **Clarify if Needed**: If the prompt is too vague (e.g., "a cat"), ask 2-3 specific, high-impact questions to narrow down the vision BEFORE providing the final prompt.
4. **Output Format**: Always provide the final prompt clearly.

### RESPONSE FORMAT:
You must respond in a valid JSON format with the following structure:
{
  "refinedPrompt": "The full, expanded prompt for the AI model",
  "explanation": "A brief explanation of why you added certain details",
  "questions": ["Question 1", "Question 2"] // Only include if more info is needed to make it perfect
}

### DOMAIN SPECIFICS:
- **Image**: Focus on visual descriptors. Use "Imagen 3" or "Midjourney" style logic.
- **Video**: Focus on motion and atmosphere. Use "Veo" or "Sora" style logic.
- **Text**: Focus on logic, persona, and structure. Use "Gemini" or "GPT-4" style logic.

Always be professional, helpful, and creative.`;

export async function refinePrompt(
  initialPrompt: string,
  type: PromptType,
  previousContext: string = ""
): Promise<PromptResult> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Prompt Type: ${type.toUpperCase()}
    User's Initial Idea: "${initialPrompt}"
    ${previousContext ? `Previous Context/Answers: ${previousContext}` : ""}
    
    Please refine this prompt or ask clarifying questions.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      refinedPrompt: result.refinedPrompt || "",
      explanation: result.explanation || "",
      questions: result.questions || [],
    };
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return {
      refinedPrompt: response.text || "Error refining prompt.",
      explanation: "Could not parse structured response.",
    };
  }
}
