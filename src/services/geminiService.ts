import { GoogleGenAI, Type } from "@google/genai";
import { PromptType, PromptResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTIONS = `You are a world-class Prompt Architect. Your goal is to transform simple, vague, or "scanty" user ideas into detailed, high-performance prompts for AI models.

### YOUR PROCESS:
1. **Analyze Intent**: Determine if the user wants an image, a video, or a text-based response.
2. **Expand Prompt**: Use domain-specific knowledge to add detail:
   - **IMAGE**: Add style (e.g., cinematic, oil painting), lighting (e.g., golden hour, rim lighting), composition (e.g., wide shot, macro), and technical details (e.g., 8k, highly detailed).
   - **VIDEO**: Add camera movement (e.g., slow pan, zoom in), lighting, mood, and temporal details (e.g., "the leaves rustle gently"). If an image is provided, focus on how to animate the static scene, describing the motion of subjects and the camera.
   - **TEXT/LLM**: Add persona, tone, constraints, and specific output format. If an image is provided, focus on what the LLM should extract, analyze, or write based on the visual context.
3. **Draft and Clarify**: ALWAYS provide a best-guess \`refinedPrompt\` based on the user's input, no matter how vague. Then, if needed, ask specific questions in the \`questions\` array to narrow down their vision for the next iteration. NEVER leave \`refinedPrompt\` empty.
   - For **IMAGE** prompts, specifically ask clarifying questions about: desired art style, composition, lighting, color palette, and any specific elements to include or avoid.
   - For **VIDEO** prompts, specifically ask clarifying questions about: desired video duration, key actions, camera movement, scene transitions, and overall mood or tone.
   - For **TEXT** prompts, specifically ask clarifying questions about: desired tone, format, length, and target audience.
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
    let imageInstructions = "";
    if (type === 'image') {
      imageInstructions = "Please analyze the provided image and generate a highly detailed prompt that would recreate it or something very similar in an image generation model.";
    } else if (type === 'video') {
      imageInstructions = "Please analyze the provided image and generate a highly detailed prompt that would animate this scene in a video generation model. Focus on how the camera should move, what elements in the scene should be in motion, and how the atmosphere or lighting might shift.";
    } else if (type === 'text') {
      imageInstructions = "Please analyze the provided image and generate a highly detailed prompt for an LLM to analyze, describe, or extract information from this image. If the user provided an idea, tailor the prompt to achieve their specific goal with this image.";
    }

    textPrompt = `
      Prompt Type: ${type.toUpperCase()}
      User's Initial Idea: "${initialPrompt || 'Analyze this image.'}"
      ${previousContext ? `Previous Context/Answers: ${previousContext}` : ""}
      
      ${imageInstructions}
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
          suggestedTitle: {
            type: Type.STRING,
            description: "A short, catchy title for this prompt (max 5 words).",
          },
          suggestedTags: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "3-5 relevant tags for this prompt (e.g., 'cinematic', 'portrait', 'code').",
          },
        },
        required: ["refinedPrompt", "explanation", "suggestedTitle", "suggestedTags"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      refinedPrompt: result.refinedPrompt || "",
      explanation: result.explanation || "",
      questions: result.questions || [],
      suggestedTitle: result.suggestedTitle || "Untitled Prompt",
      suggestedTags: result.suggestedTags || [],
    };
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    return {
      refinedPrompt: response.text || "Error refining prompt.",
      explanation: "Could not parse structured response.",
    };
  }
}
