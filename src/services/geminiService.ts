import { GoogleGenAI, Type } from "@google/genai";
import { PromptType, PromptResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTIONS = `You are a world-class Prompt Architect. Your goal is to transform simple, vague, or "scanty" user ideas into detailed, high-performance prompts for AI models.

### YOUR PROCESS:
1. **Analyze Intent**: Determine if the user wants an image, a video, or a text-based response.
2. **Expand Prompt**: Use domain-specific knowledge to add detail:
   - **IMAGE**: Add style (e.g., cinematic, oil painting), lighting (e.g., golden hour, rim lighting), composition (e.g., wide shot, macro), and technical details (e.g., 8k, highly detailed).
   - **VIDEO**: Add camera movement (e.g., slow pan, zoom in), lighting, mood, and temporal details (e.g., "the leaves rustle gently").
   - **TEXT/LLM**: Add persona, tone, constraints, and specific output format.
3. **Draft and Clarify**: ALWAYS provide a best-guess \`refinedPrompt\` based on the user's input, no matter how vague. Then, if needed, ask 1-2 specific questions in the \`questions\` array to narrow down their vision for the next iteration. NEVER leave \`refinedPrompt\` empty.
4. **Output Format**: Always provide the final prompt clearly in the JSON structure.

### DOMAIN SPECIFICS:
- **Image**: Focus on visual descriptors. Use "Imagen 3" or "Midjourney" style logic.
- **Video**: Focus on motion and atmosphere. Use "Veo" or "Sora" style logic.
- **Text**: Focus on logic, persona, and structure. Use "Gemini" or "GPT-4" style logic.

Always be professional, helpful, and creative.`;

export async function refinePrompt(
  initialPrompt: string,
  type: PromptType,
  previousContext: string = "",
  image?: { data: string, mimeType: string }
): Promise<PromptResult> {
  const model = "gemini-3.1-pro-preview";
  
  const contents: any = [];
  
  let textPrompt = `
    Prompt Type: ${type.toUpperCase()}
    User's Initial Idea: "${initialPrompt}"
    ${previousContext ? `Previous Context/Answers: ${previousContext}` : ""}
    
    Please refine this prompt or ask clarifying questions.
  `;

  if (image) {
    textPrompt = `
      Prompt Type: ${type.toUpperCase()}
      User's Initial Idea: "${initialPrompt || 'Analyze this image and generate a highly detailed prompt that would recreate it.'}"
      ${previousContext ? `Previous Context/Answers: ${previousContext}` : ""}
      
      Please analyze the provided image and generate a highly detailed prompt that would recreate it or something very similar.
    `;
    contents.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  contents.push({ text: textPrompt });

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refinedPrompt: {
            type: Type.STRING,
            description: "The full, expanded prompt for the AI model. MUST NOT BE EMPTY.",
          },
          explanation: {
            type: Type.STRING,
            description: "A brief explanation of why you added certain details",
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "Only include if more info is needed to make it perfect",
          },
        },
        required: ["refinedPrompt", "explanation"],
      },
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
