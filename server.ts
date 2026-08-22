import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const _filename = typeof __filename !== "undefined" ? __filename : "";
const _dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(_filename);

let db: any;
if (process.env.NODE_ENV !== "production") {
  try {
    const Database = require("better-sqlite3");
    const dbPath = process.env.DB_PATH || "prompts.db";
    db = new Database(dbPath);
  } catch (err) {
    db = null;
  }
}

if (!db) {
  console.log("Using zero-dependency pure JS in-memory database engine for production runtime.");
  const savedPrompts = new Map<number, any>();
  const chatSessions = new Map<string, any>();
  const feedbackList: any[] = [];
  let autoPromptId = 1;

  db = {
    exec: () => {},
    prepare: (sql: string) => {
      const s = sql.trim();
      return {
        run: (...params: any[]) => {
          if (s.includes("INSERT INTO saved_prompts")) {
            const id = autoPromptId++;
            const now = Math.floor(Date.now() / 1000);
            const record = {
              id,
              title: params[0],
              original_idea: params[1],
              refined_prompt: params[2],
              type: params[3],
              tags: params[4],
              messages: params[5],
              is_favorite: params[6],
              version_notes: params[7],
              result_history: params[8],
              current_result_index: params[9],
              created_at: now
            };
            savedPrompts.set(id, record);
            return { lastInsertRowid: id };
          }
          if (s.includes("UPDATE saved_prompts SET title = ? WHERE id = ?")) {
            const id = Number(params[1]);
            const existing = savedPrompts.get(id);
            if (existing) existing.title = params[0];
            return { changes: 1 };
          }
          if (s.includes("UPDATE saved_prompts") && s.includes("SET title = ?")) {
            const id = Number(params[10] !== undefined ? params[10] : params[1]);
            const existing = savedPrompts.get(id);
            if (existing && params.length > 2) {
              existing.title = params[0];
              existing.original_idea = params[1];
              existing.refined_prompt = params[2];
              existing.type = params[3];
              existing.tags = params[4];
              existing.messages = params[5];
              existing.is_favorite = params[6];
              existing.version_notes = params[7];
              existing.result_history = params[8];
              existing.current_result_index = params[9];
            }
            return { changes: 1 };
          }
          if (s.includes("SET is_favorite = ?")) {
            const id = Number(params[1]);
            const existing = savedPrompts.get(id);
            if (existing) existing.is_favorite = params[0];
            return { changes: 1 };
          }
          if (s.includes("DELETE FROM saved_prompts WHERE id = ?")) {
            savedPrompts.delete(Number(params[0]));
            return { changes: 1 };
          }
          if (s.includes("INSERT INTO feedback")) {
            feedbackList.push({ id: feedbackList.length + 1, params });
            return { lastInsertRowid: feedbackList.length };
          }
          if (s.includes("INSERT INTO chat_sessions")) {
            const now = Math.floor(Date.now() / 1000);
            const record = {
              id: params[0],
              title: params[1],
              messages: params[2],
              current_type: params[3],
              result_history: params[4],
              current_result_index: params[5],
              editing_prompt_id: params[6],
              created_at: now,
              updated_at: now
            };
            chatSessions.set(params[0], record);
            return { lastInsertRowid: params[0] };
          }
          if (s.includes("UPDATE chat_sessions")) {
            const id = params[6];
            const existing = chatSessions.get(id);
            const now = Math.floor(Date.now() / 1000);
            if (existing) {
              existing.title = params[0];
              existing.messages = params[1];
              existing.current_type = params[2];
              existing.result_history = params[3];
              existing.current_result_index = params[4];
              existing.editing_prompt_id = params[5];
              existing.updated_at = now;
            } else {
              chatSessions.set(id, {
                id,
                title: params[0],
                messages: params[1],
                current_type: params[2],
                result_history: params[3],
                current_result_index: params[4],
                editing_prompt_id: params[5],
                created_at: now,
                updated_at: now
              });
            }
            return { changes: 1 };
          }
          if (s.includes("DELETE FROM chat_sessions WHERE id = ?")) {
            chatSessions.delete(params[0]);
            return { changes: 1 };
          }
          if (s.includes("DELETE FROM chat_sessions")) {
            chatSessions.clear();
            return { changes: 1 };
          }
          return { lastInsertRowid: 1, changes: 0 };
        },
        all: (...params: any[]) => {
          if (s.includes("FROM saved_prompts")) {
            let list = Array.from(savedPrompts.values());
            if (params.length > 0 && params[0]) {
              const type = params[0];
              list = list.filter(p => p.type === type);
            }
            return list.sort((a, b) => b.created_at - a.created_at);
          }
          if (s.includes("FROM chat_sessions")) {
            return Array.from(chatSessions.values()).sort((a, b) => b.updated_at - a.updated_at);
          }
          return [];
        },
        get: (...params: any[]) => {
          if (s.includes("FROM saved_prompts WHERE id = ?")) {
            return savedPrompts.get(Number(params[0])) || null;
          }
          if (s.includes("FROM chat_sessions WHERE id = ?")) {
            return chatSessions.get(params[0]) || null;
          }
          return null;
        }
      };
    }
  };
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS saved_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    original_idea TEXT NOT NULL,
    refined_prompt TEXT NOT NULL,
    type TEXT NOT NULL,
    tags TEXT,
    messages TEXT,
    result_history TEXT,
    current_result_index INTEGER,
    is_favorite INTEGER DEFAULT 0,
    version_notes TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER,
    rating INTEGER NOT NULL,
    comment TEXT,
    refined_prompt TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    messages TEXT NOT NULL,
    current_type TEXT NOT NULL,
    result_history TEXT,
    current_result_index INTEGER,
    editing_prompt_id INTEGER,
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
`);

try {
  db.exec("ALTER TABLE saved_prompts ADD COLUMN result_history TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE saved_prompts ADD COLUMN current_result_index INTEGER;");
} catch (e) {}
try {
  db.exec("ALTER TABLE chat_sessions ADD COLUMN result_history TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE chat_sessions ADD COLUMN current_result_index INTEGER;");
} catch (e) {}
try {
  db.exec("ALTER TABLE chat_sessions ADD COLUMN editing_prompt_id INTEGER;");
} catch (e) {}
try {
  db.exec("ALTER TABLE saved_prompts ADD COLUMN is_favorite INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE saved_prompts ADD COLUMN version_notes TEXT;");
} catch (e) {}

async function generateContentWithFallback(ai: GoogleGenAI, params: {
  contents: any;
  config: any;
  models?: string[];
}) {
  const candidateModels = params.models || [
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;

  for (const modelName of candidateModels) {
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || "").toLowerCase();
        const errStatus = err?.status || err?.code || "";
        const isTransient = 
          errMsg.includes("503") || 
          errMsg.includes("unavailable") || 
          errMsg.includes("high demand") || 
          errMsg.includes("resource_exhausted") || 
          errMsg.includes("429") || 
          errMsg.includes("overloaded") ||
          errStatus === 503 ||
          errStatus === "UNAVAILABLE" ||
          errStatus === 429;

        if (isTransient && attempt < maxRetries) {
          const delayMs = (attempt + 1) * 800;
          console.warn(`Gemini model ${modelName} returned transient error (${err.message}). Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }

        // If not transient or retries exhausted for this model, log and try next candidate
        console.warn(`Gemini model ${modelName} call did not succeed, checking next candidate model... Error:`, err?.message || err);
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini models are currently experiencing high demand. Please try again in a few moments.");
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

  // Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // Basic API Rate Limiting Middleware
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  app.use("/api/", (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 120;

    const current = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > current.resetTime) {
      current.count = 1;
      current.resetTime = now + windowMs;
    } else {
      current.count += 1;
    }

    requestCounts.set(ip, current);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - current.count));

    if (current.count > maxRequests) {
      return res.status(429).json({ error: "Too many requests. Please wait a minute before retrying." });
    }

    next();
  });

  // Set up body parser with higher limit for media upload base64 strings
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.post("/api/refine", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      const { initialPrompt, type, previousContext, media } = req.body;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const SYSTEM_INSTRUCTIONS = `You are a world-class Prompt Architect and AI Copilot. You can BOTH converse naturally with users and transform user ideas or media into professional AI prompts.

CRITICAL INTENT RULES:
1. **CONVERSATIONAL & INFORMATIONAL INTENT**:
   - If the user's input is a greeting, general chat, question, discussion, opinion request, or explanation (e.g., "Hello", "How are you?", "What is Midjourney?", "Should I use Claude or GPT-4?", "Explain negative prompts", etc.):
   - Act as a friendly, intelligent AI engineering copilot!
   - Write your natural, conversational Markdown response in the \`refinedPrompt\` field.
   - Set \`explanation\` to "Conversational response".
   - Leave \`questions\` as an empty array \`[]\` unless specifically relevant.
   - Set \`suggestedTitle\` to a concise topic summary of the conversation.

2. **PROMPT CREATION / REFINEMENT INTENT**:
   - ONLY when the user is explicitly requesting to create, refine, architect, or transform a prompt:
   - For TEXT / LLM prompts: Synthesize a structured master prompt (Role, Core Objective, Tone, Output Format, Constraints) and include clarifying questions in the \`questions\` array.
   - For IMAGE / VIDEO prompts: Synthesize a high-performance prompt covering optics, lighting, mood, camera dynamics, and atmosphere.

3. **INTEGRATING USER FEEDBACK**: Weave user choices for tone, format, and complexity into prompt updates seamlessly.`;

      const contents: any[] = [];
      let textPrompt = `
        Prompt Type: ${type ? type.toUpperCase() : "DETECT"}
        User's Initial Idea: "${initialPrompt || ""}"
        ${previousContext ? `Previous Context/Answers: ${previousContext}` : ""}
        
        Please refine this prompt or ask clarifying questions.
      `;

      if (media && media.data && media.mimeType) {
        let mediaTypeLabel = "media";
        if (media.mimeType.startsWith("image/")) {
          mediaTypeLabel = "image";
        } else if (media.mimeType.startsWith("video/")) {
          mediaTypeLabel = "video";
        } else if (media.mimeType.startsWith("audio/")) {
          mediaTypeLabel = "audio";
        } else {
          mediaTypeLabel = "file";
        }

        let mediaInstructions = "";
        if (type === "image") {
          mediaInstructions = `Analyze this ${mediaTypeLabel} and generate a highly detailed IMAGE generation prompt (style, lighting, framing, subject focus, atmosphere) that would recreate or match this content.`;
        } else if (type === "video") {
          mediaInstructions = `Analyze this ${mediaTypeLabel} and generate a highly detailed VIDEO generation prompt focusing on pacing, camera work, motions, transitions, and temporal lighting changes.`;
        } else if (type === "text") {
          mediaInstructions = `Analyze this ${mediaTypeLabel} and generate an advanced, powerful LLM master instruction prompt to analyze, interpret, expand, or summarize this media.`;
        } else {
          mediaInstructions = `Analyze this ${mediaTypeLabel} thoroughly. Infer if the user would benefit most from an 'image' recreation prompt, a 'video' scene prompt, or a 'text' analysis prompt. Generate a highly detailed, world-class prompt for the optimal modality.`;
        }

        textPrompt = `
          Prompt Type: ${type ? type.toUpperCase() : "DETECT"}
          User's Initial Idea: "${initialPrompt || "Analyze this media."}"
          ${previousContext ? `Previous Context/Answers: ${previousContext}` : ""}
          
          ${mediaInstructions}
        `;

        contents.push({
          inlineData: {
            data: media.data,
            mimeType: media.mimeType
          }
        });
      }

      contents.push({ text: textPrompt });

      const response = await generateContentWithFallback(ai, {
        contents: { parts: contents },
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              refinedPrompt: {
                type: Type.STRING,
                description: "The full, expanded prompt for the target AI model. MUST NOT BE EMPTY.",
              },
              explanation: {
                type: Type.STRING,
                description: "A brief explanation of why you designed or reverse engineered the prompt this way.",
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "Only include 2-3 clarifying questions if more details are needed for absolute perfection.",
              },
              suggestedTitle: {
                type: Type.STRING,
                description: "A short catchy title (max 5 words).",
              },
              suggestedTags: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "3-5 relevant descriptive tags.",
              },
              detectedType: {
                type: Type.STRING,
                description: "The best fitting prompt type for the media/input. Must be 'image', 'video', or 'text'.",
              }
            },
            required: ["refinedPrompt", "explanation", "suggestedTitle", "suggestedTags"],
          },
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      
      res.json({
        refinedPrompt: result.refinedPrompt || "",
        explanation: result.explanation || "",
        questions: result.questions || [],
        suggestedTitle: result.suggestedTitle || "Untitled Prompt",
        suggestedTags: result.suggestedTags || [],
        detectedType: result.detectedType || type || "image"
      });
    } catch (error: any) {
      console.error("Gemini Refine Error:", error);
      res.status(500).json({ error: error.message || "Failed to process the prompt generation." });
    }
  });

  app.post("/api/transform-framework", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      const { currentPrompt, frameworkName, frameworkTemplate, promptType } = req.body;
      if (!currentPrompt || !frameworkName) {
        return res.status(400).json({ error: "Missing required fields: currentPrompt or frameworkName." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const SYSTEM_INSTRUCTION = `You are a master Prompt Architect specializing in formal prompt engineering frameworks (e.g., Product Showcase, AIDA Copywriting, Chain of Thought, Calibrated Master Prompt, Few-Shot, Isometric 3D, Cinematic Drone, Socratic Questioning, Code Review).

Your mission is to transform and re-architect the provided prompt into the target framework schema.
CRITICAL INSTRUCTIONS:
1. Preserve all core subjects, specific details, technical nuances, constraints, and intent from the input prompt.
2. Restructure and translate those exact ideas so that they strictly follow the structure, tone, and methodology of the target framework "${frameworkName}".
3. If the framework uses blueprint variables (like [SUBJECT], [ROLE], [CAMERA], [LIGHTING], [RESOLUTION], [TASK], [CONTEXT]), populate them with rich, calibrated values derived from the prompt, or retain bracketed placeholders where dynamic parametrization is helpful.
4. Provide a refined, production-ready master prompt in \`refinedPrompt\` formatted in clean, professional Markdown or target prompt notation.
5. Provide a brief explanation of how the prompt was adapted to the framework in \`explanation\`.`;

      const promptText = `
Target Framework: ${frameworkName}
Framework Reference Template:
${frameworkTemplate || "Standard industry framework specification"}

Target Modality: ${promptType || "detect"}

Original Prompt to Transform:
"""
${currentPrompt}
"""

Please re-architect this prompt into the ${frameworkName} framework now.
      `;

      const response = await generateContentWithFallback(ai, {
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              refinedPrompt: {
                type: Type.STRING,
                description: "The complete prompt restructured and written in the target framework format.",
              },
              explanation: {
                type: Type.STRING,
                description: "A brief, elegant design summary of how the prompt was adapted to the target framework.",
              },
              suggestedTitle: {
                type: Type.STRING,
                description: "A concise title reflecting the framework-adapted prompt.",
              },
              suggestedTags: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "Tags including the framework name and modality.",
              }
            },
            required: ["refinedPrompt", "explanation", "suggestedTitle", "suggestedTags"],
          },
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);

      res.json({
        refinedPrompt: result.refinedPrompt || currentPrompt,
        explanation: result.explanation || `Successfully transformed prompt into the ${frameworkName} framework.`,
        suggestedTitle: result.suggestedTitle || `${frameworkName} Architecture`,
        suggestedTags: result.suggestedTags || [frameworkName, promptType || "prompt"],
        detectedType: promptType || "text"
      });
    } catch (error: any) {
      console.error("Gemini Framework Transform Error:", error);
      res.status(500).json({ error: error.message || "Failed to transform prompt to target framework." });
    }
  });

  app.get("/api/prompts", (req, res) => {
    const { search, type } = req.query;
    let query = "SELECT * FROM saved_prompts";
    const params: any[] = [];

    if (search || type) {
      query += " WHERE";
      const conditions: string[] = [];
      if (search) {
        conditions.push("(title LIKE ? OR tags LIKE ? OR refined_prompt LIKE ?)");
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }
      if (type) {
        conditions.push("type = ?");
        params.push(type);
      }
      query += " " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC";
    const rows = db.prepare(query).all(...params);
    
    const result = rows.map((row: any) => {
      let tags = [];
      let messages = [];
      let resultHistory = [];
      try { tags = row.tags ? JSON.parse(row.tags) : []; } catch (e) {}
      try { messages = row.messages ? JSON.parse(row.messages) : []; } catch (e) {}
      try { resultHistory = row.result_history ? JSON.parse(row.result_history) : []; } catch (e) {}
      
      return {
        ...row,
        parentId: row.parent_id,
        derivedFromId: row.derived_from_id,
        versionNotes: row.version_notes,
        tags,
        messages,
        resultHistory,
        currentResultIndex: row.current_result_index,
        originalIdea: row.original_idea,
        refinedPrompt: row.refined_prompt,
        isFavorite: row.is_favorite === 1,
        createdAt: row.created_at * 1000
      };
    });

    res.json(result);
  });

  app.post("/api/prompts", (req, res) => {
    const { title, originalIdea, refinedPrompt, type, tags, messages, isFavorite, versionNotes, resultHistory, currentResultIndex } = req.body;
    const stmt = db.prepare(`
      INSERT INTO saved_prompts (title, original_idea, refined_prompt, type, tags, messages, is_favorite, version_notes, result_history, current_result_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      title,
      originalIdea,
      refinedPrompt,
      type,
      JSON.stringify(tags),
      JSON.stringify(messages || []),
      isFavorite ? 1 : 0,
      versionNotes || null,
      JSON.stringify(resultHistory || []),
      currentResultIndex || 0
    );
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/prompts/:id", (req, res) => {
    const { id } = req.params;
    const { title, originalIdea, refinedPrompt, type, tags, messages, isFavorite, versionNotes, resultHistory, currentResultIndex } = req.body;

    if (title && originalIdea === undefined) {
      const stmt = db.prepare(`UPDATE saved_prompts SET title = ? WHERE id = ?`);
      stmt.run(title, id);
      return res.json({ success: true });
    }

    const stmt = db.prepare(`
      UPDATE saved_prompts 
      SET title = ?, original_idea = ?, refined_prompt = ?, type = ?, tags = ?, messages = ?, is_favorite = ?, version_notes = ?, result_history = ?, current_result_index = ?
      WHERE id = ?
    `);
    stmt.run(
      title,
      originalIdea,
      refinedPrompt,
      type,
      JSON.stringify(tags),
      JSON.stringify(messages || []),
      isFavorite ? 1 : 0,
      versionNotes || null,
      JSON.stringify(resultHistory || []),
      currentResultIndex || 0,
      id
    );
    res.json({ success: true });
  });

  app.put("/api/prompts/:id/favorite", (req, res) => {
    const { id } = req.params;
    const { isFavorite } = req.body;
    const stmt = db.prepare(`
      UPDATE saved_prompts 
      SET is_favorite = ?
      WHERE id = ?
    `);
    stmt.run(isFavorite ? 1 : 0, id);
    res.json({ success: true });
  });

  app.delete("/api/prompts/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM saved_prompts WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/feedback", (req, res) => {
    const { promptId, rating, comment, refinedPrompt, type } = req.body;
    const stmt = db.prepare(`
      INSERT INTO feedback (prompt_id, rating, comment, refined_prompt, type)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(promptId || null, rating, comment, refinedPrompt, type);
    res.json({ id: info.lastInsertRowid });
  });

  // Chat Sessions API
  app.get("/api/sessions", (req, res) => {
    const rows = db.prepare("SELECT * FROM chat_sessions ORDER BY updated_at DESC").all();
    const result = rows.map((row: any) => {
      let messages = [];
      let resultHistory = [];
      try { messages = row.messages ? JSON.parse(row.messages) : []; } catch (e) {}
      try { resultHistory = row.result_history ? JSON.parse(row.result_history) : []; } catch (e) {}
      return {
        ...row,
        messages,
        currentType: row.current_type,
        resultHistory,
        currentResultIndex: row.current_result_index,
        editingPromptId: row.editing_prompt_id,
        updatedAt: row.updated_at * 1000,
        createdAt: row.created_at * 1000
      };
    });
    res.json(result);
  });

  app.get("/api/sessions/:id", (req, res) => {
    const { id } = req.params;
    const row = db.prepare("SELECT * FROM chat_sessions WHERE id = ?").get(id) as any;
    if (!row) return res.status(404).json({ error: "Session not found" });
    
    let messages = [];
    let resultHistory = [];
    try { messages = row.messages ? JSON.parse(row.messages) : []; } catch (e) {}
    try { resultHistory = row.result_history ? JSON.parse(row.result_history) : []; } catch (e) {}
    
    res.json({
      ...row,
      messages,
      currentType: row.current_type,
      resultHistory,
      currentResultIndex: row.current_result_index,
      updatedAt: row.updated_at * 1000,
      createdAt: row.created_at * 1000
    });
  });

  app.post("/api/sessions", (req, res) => {
    const { id, title, messages, currentType, resultHistory, currentResultIndex, editingPromptId } = req.body;
    const stmt = db.prepare(`
      INSERT INTO chat_sessions (id, title, messages, current_type, result_history, current_result_index, editing_prompt_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, JSON.stringify(messages), currentType, JSON.stringify(resultHistory || []), currentResultIndex || 0, editingPromptId || null);
    res.json({ success: true });
  });

  app.put("/api/sessions/:id", (req, res) => {
    const { id } = req.params;
    const { title, messages, currentType, resultHistory, currentResultIndex, editingPromptId } = req.body;
    const stmt = db.prepare(`
      UPDATE chat_sessions 
      SET title = ?, messages = ?, current_type = ?, result_history = ?, current_result_index = ?, editing_prompt_id = ?, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `);
    stmt.run(title, JSON.stringify(messages), currentType, JSON.stringify(resultHistory || []), currentResultIndex || 0, editingPromptId || null, id);
    res.json({ success: true });
  });

  app.delete("/api/sessions/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM chat_sessions WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.delete("/api/sessions", (req, res) => {
    db.prepare("DELETE FROM chat_sessions").run();
    res.json({ success: true });
  });

  // Helper function to get daily rotating suggestions
  const getDailySuggestions = (suggestions: Record<string, string[]>, count: number = 4): Record<string, string[]> => {
    const today = new Date();
    // Seed changes every 24 hours
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Simple seeded PRNG
    const random = (s: number) => {
      let x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };

    const result: Record<string, string[]> = {};
    
    for (const [key, values] of Object.entries(suggestions)) {
      if (!values || values.length <= count) {
        result[key] = values;
        continue;
      }
      
      // Create a seeded copy of the array
      const shuffled = [...values].sort((a, b) => {
        const hashA = a.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = b.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return random(seed + hashA) - random(seed + hashB);
      });
      
      result[key] = shuffled.slice(0, count);
    }
    
    return result;
  };

  // Hardcoded templates for now, could be in DB
  app.get("/api/templates", (req, res) => {
    const templates = [
      {
        id: "img-photo-1",
        title: "Cinematic Portrait",
        description: "High-end photography style for characters",
        type: "image",
        category: "Photorealism",
        template: "A cinematic portrait of [subject], [lighting] lighting, shot on [camera], 8k resolution, highly detailed skin textures, [mood] atmosphere.",
        placeholders: ["subject", "lighting", "camera", "mood"],
        suggestions: {
          subject: [
            "a grizzled detective", "an elven warrior", "a cyberpunk hacker", "a wise old monk",
            "a rogue AI", "a time-traveling historian", "a neon samurai", "a space explorer",
            "a mythical beast", "a steampunk inventor", "a wandering merchant", "a celestial being",
            "a deep sea diver", "a haunted doll", "a feral druid", "a cosmic entity",
            "a weary astronaut", "a royal knight", "a street urchin", "a mad scientist"
          ],
          lighting: [
            "Rembrandt", "neon rim", "dramatic chiaroscuro", "soft golden hour",
            "volumetric fog", "harsh shadows", "bioluminescent", "moonlight",
            "candlelight", "lens flare", "dappled sunlight", "overcast diffused",
            "strobe light", "underwater caustic", "firelight", "cyberpunk neon"
          ],
          camera: [
            "35mm lens", "85mm portrait lens", "medium format", "anamorphic lens",
            "wide angle", "macro", "drone shot", "low angle", "fisheye", "telephoto",
            "Dutch angle", "bird's eye view", "worm's eye view", "over the shoulder",
            "point of view", "isometric", "panoramic", "tilt-shift"
          ],
          mood: [
            "melancholic", "intense", "ethereal", "gritty",
            "dark and gritty", "uplifting", "mysterious", "energetic",
            "whimsical", "ominous", "peaceful", "chaotic",
            "nostalgic", "romantic", "tense", "dreamlike"
          ]
        },
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "img-anime-1",
        title: "Studio Ghibli Style",
        description: "Whimsical hand-drawn animation look",
        type: "image",
        category: "Anime",
        template: "An anime illustration of [subject] in the style of Studio Ghibli, [setting], lush landscapes, soft watercolor textures, [time_of_day] light.",
        placeholders: ["subject", "setting", "time_of_day"],
        suggestions: {
          subject: [
            "a young witch flying", "a giant fluffy spirit", "a brave knight", "a curious cat",
            "a wandering musician", "a lost prince", "a mechanical golem", "a talking fox",
            "a spirited princess", "a grumpy old wizard", "a sky pirate", "a gentle giant",
            "a forest spirit", "a brave little girl", "a mysterious traveler", "a clockwork bird"
          ],
          setting: [
            "a magical forest", "a floating island", "a bustling steampunk town", "a quiet seaside village",
            "an ancient overgrown castle", "a hidden valley", "a skyship deck", "a glowing crystal cave",
            "a cozy bakery", "a train traveling over water", "a bathhouse for spirits", "a windmill on a hill"
          ],
          time_of_day: [
            "golden hour", "starry night", "misty morning", "bright afternoon",
            "twilight", "moonlit night", "rainy afternoon", "sunrise",
            "overcast day", "sunset", "dusk", "midnight"
          ]
        },
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "img-cyber-1",
        title: "Cyberpunk Cityscape",
        description: "Neon-drenched futuristic urban environment",
        type: "image",
        category: "Sci-Fi",
        template: "A sprawling cyberpunk city at [time], neon signs in [color_palette], rainy streets reflecting lights, [atmosphere] mood, high-tech low-life aesthetic.",
        placeholders: ["time", "color_palette", "atmosphere"],
        suggestions: {
          time: [
            "midnight", "dusk", "dawn", "3 AM",
            "high noon", "sunset", "early morning", "late night",
            "twilight", "rush hour", "dead of night", "sunrise"
          ],
          color_palette: [
            "neon pink and cyan", "acid green and purple", "deep blue and orange", "monochrome red",
            "gold and black", "electric blue and silver", "toxic green and yellow", "crimson and chrome",
            "holographic pastel", "stark black and white", "muted grey and neon yellow", "vibrant synthwave"
          ],
          atmosphere: [
            "gritty", "holographic", "dystopian", "rainy and melancholic",
            "chaotic and crowded", "sterile and corporate", "abandoned and decaying", "high-tech and sleek",
            "smog-filled", "neon-drenched", "underground and secretive", "glitchy and surreal"
          ]
        },
        image: "https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "img-macro-1",
        title: "Macro Nature",
        description: "Extreme close-up of natural elements",
        type: "image",
        category: "Nature",
        template: "Macro photography of [object], showing intricate details of [detail_focus], soft bokeh background, [lighting] light, vibrant [colors].",
        placeholders: ["object", "detail_focus", "lighting", "colors"],
        suggestions: {
          object: ["a dewdrop on a leaf", "a butterfly wing", "a blooming orchid", "a snowflake"],
          detail_focus: ["cellular structure", "crystalline patterns", "fine hairs", "iridescent scales"],
          lighting: ["soft diffused", "backlit", "dappled sunlight", "studio ring"],
          colors: ["emerald and gold", "sapphire blue", "vibrant magenta", "iridescent rainbow"]
        },
        image: "https://images.unsplash.com/photo-1500829243541-74b677fecc30?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "vid-cinematic-1",
        title: "Slow Motion Reveal",
        description: "Dramatic camera movement for video",
        type: "video",
        category: "Cinematic",
        template: "A slow motion [camera_movement] shot of [subject], [environment], [lighting] atmosphere, particles floating in the air, 4k 60fps.",
        placeholders: ["camera_movement", "subject", "environment", "lighting"],
        suggestions: {
          camera_movement: ["push in", "orbiting", "tracking", "crane down"],
          subject: ["a samurai drawing a sword", "a dancer leaping", "a sports car drifting", "a wizard casting a spell"],
          environment: ["a misty bamboo forest", "an abandoned warehouse", "a neon-lit street", "a grand cathedral"],
          lighting: ["volumetric rays", "strobe", "high contrast", "moonlight"]
        },
        image: "https://picsum.photos/seed/cinematic/800/600"
      },
      {
        id: "vid-drone-1",
        title: "Epic Drone Sweep",
        description: "Wide aerial perspective for landscapes",
        type: "video",
        category: "Aerial",
        template: "An epic drone shot sweeping over [landscape], [time_of_day], dramatic shadows, [weather_condition], smooth cinematic motion.",
        placeholders: ["landscape", "time_of_day", "weather_condition"],
        suggestions: {
          landscape: ["a jagged mountain range", "a dense rainforest", "a futuristic metropolis", "a winding canyon"],
          time_of_day: ["sunrise", "golden hour", "twilight", "high noon"],
          weather_condition: ["rolling fog", "clearing storm", "snow flurries", "clear skies"]
        },
        image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "text-expert-1",
        title: "Expert Consultant",
        description: "Professional tone for complex tasks",
        type: "text",
        category: "Professional",
        template: "Act as a world-class [profession] with expertise in [specialty]. Your task is to [task]. Provide a detailed, [tone] response with actionable insights.",
        placeholders: ["profession", "specialty", "task", "tone"],
        suggestions: {
          profession: ["software engineer", "marketing strategist", "financial advisor", "fitness coach"],
          specialty: ["React performance", "viral campaigns", "crypto investments", "hypertrophy training"],
          task: ["review my code", "create a 30-day plan", "analyze this trend", "optimize my workflow"],
          tone: ["professional and direct", "encouraging and supportive", "academic and rigorous", "casual and friendly"]
        },
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "text-creative-1",
        title: "Story Architect",
        description: "Creative writing and world-building",
        type: "text",
        category: "Creative",
        template: "Write a [genre] story about [protagonist] who discovers [discovery]. The tone should be [mood], and the setting is [setting]. Focus on [theme].",
        placeholders: ["genre", "protagonist", "discovery", "mood", "setting", "theme"],
        suggestions: {
          genre: ["sci-fi thriller", "high fantasy", "cozy mystery", "cyberpunk"],
          protagonist: ["a retired detective", "a young mage", "a rogue AI", "a reluctant hero"],
          discovery: ["an ancient artifact", "a hidden conspiracy", "a portal to another world", "a forgotten memory"],
          mood: ["dark and suspenseful", "lighthearted and whimsical", "epic and grand", "melancholic"],
          setting: ["a sprawling space station", "a magical academy", "a dystopian megacity", "a quiet coastal town"],
          theme: ["the cost of ambition", "found family", "man vs machine", "the power of redemption"]
        },
        image: "https://picsum.photos/seed/storyteller/800/600"
      },
      {
        id: "text-eli5-1",
        title: "ELI5 Explanation",
        description: "Simple explanations for complex topics",
        type: "text",
        category: "Educational",
        template: "Explain [topic] to me like I am a 5-year-old. Use simple analogies and avoid jargon. Focus on the core concept of [core_concept].",
        placeholders: ["topic", "core_concept"],
        suggestions: {
          topic: ["quantum computing", "black holes", "blockchain", "the immune system"],
          core_concept: ["superposition", "gravity", "decentralization", "antibodies"]
        },
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "text-pros-cons-1",
        title: "Pros & Cons Analysis",
        description: "Detailed evaluation of a subject",
        type: "text",
        category: "Analytical",
        template: "Provide a detailed pros and cons analysis of [topic]. Format the output as a [format]. Include a final recommendation based on [criteria].",
        placeholders: ["topic", "format", "criteria"],
        suggestions: {
          topic: ["remote work", "electric vehicles", "moving to a new city", "learning Python vs JavaScript"],
          format: ["bulleted list", "markdown table", "detailed paragraphs", "executive summary"],
          criteria: ["cost-effectiveness", "long-term sustainability", "career growth", "work-life balance"]
        },
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "text-socratic-1",
        title: "Socratic Questioning",
        description: "Interactive learning through questions",
        type: "text",
        category: "Educational",
        template: "Act as a Socratic tutor. Help me understand [topic] by asking guiding questions rather than giving direct answers. Start by asking about my current knowledge of [subtopic].",
        placeholders: ["topic", "subtopic"],
        suggestions: {
          topic: ["the French Revolution", "object-oriented programming", "stoicism", "climate change"],
          subtopic: ["the causes of the revolution", "classes and objects", "the dichotomy of control", "greenhouse gases"]
        },
        image: "https://picsum.photos/seed/philosophy/800/600"
      },
      {
        id: "text-code-review-1",
        title: "Code Review",
        description: "Expert feedback on programming code",
        type: "text",
        category: "Programming",
        template: "Review the following code for [language]. Focus on [focus_area] and suggest improvements. Format the feedback as [format].\n\n[code]",
        placeholders: ["language", "focus_area", "format", "code"],
        suggestions: {
          language: ["TypeScript", "Python", "Rust", "Go"],
          focus_area: ["performance optimization", "security vulnerabilities", "readability", "best practices"],
          format: ["inline comments", "a bulleted list", "a comprehensive report", "a refactored code block"],
          code: ["// Paste your code here", "function example() { ... }", "class MyClass { ... }", "def my_function(): ..."]
        },
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "img-iso-1",
        title: "Isometric 3D",
        description: "Clean, geometric 3D renders",
        type: "image",
        category: "3D Art",
        template: "Isometric 3D render of [subject] in a [environment], [color_palette] color palette, soft lighting, highly detailed, trending on ArtStation.",
        placeholders: ["subject", "environment", "color_palette"],
        suggestions: {
          subject: ["a cozy coffee shop", "a futuristic server room", "a magical potion lab", "a retro arcade"],
          environment: ["a floating island", "a glass terrarium", "a cross-section room", "a miniature diorama"],
          color_palette: ["pastel", "neon cyberpunk", "earthy tones", "monochrome minimalist"]
        },
        image: "https://picsum.photos/seed/isometric/800/600"
      },
      {
        id: "img-logo-1",
        title: "Minimalist Logo",
        description: "Clean vector logo design",
        type: "image",
        category: "Design",
        template: "Minimalist vector logo for a [industry] company, featuring [subject], [colors] colors, flat design, white background.",
        placeholders: ["industry", "subject", "colors"],
        suggestions: {
          industry: ["tech startup", "eco-friendly brand", "luxury fashion", "specialty coffee"],
          subject: ["an abstract geometric shape", "a stylized leaf", "a sleek monogram", "a minimalist animal"],
          colors: ["black and white", "navy and gold", "vibrant gradient", "muted earth tones"]
        },
        image: "https://picsum.photos/seed/minimalistlogo/800/600"
      },
      {
        id: "img-watercolor-1",
        title: "Watercolor Painting",
        description: "Soft, dreamy traditional art style",
        type: "image",
        category: "Traditional",
        template: "Watercolor painting of [subject], [mood] mood, soft edges, [colors] pastel colors, dreamy atmosphere.",
        placeholders: ["subject", "mood", "colors"],
        suggestions: {
          subject: ["a quaint cottage", "a blooming cherry tree", "a sleeping fox", "a bustling street market"],
          mood: ["serene", "melancholic", "joyful", "nostalgic"],
          colors: ["warm autumn", "cool winter", "vibrant spring", "muted vintage"]
        },
        image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "img-product-1",
        title: "Product Photography",
        description: "Commercial studio shots",
        type: "image",
        category: "Commercial",
        template: "Commercial product photography of [subject], [lighting] lighting, clean background, shot on [camera], [resolution].",
        placeholders: ["subject", "lighting", "camera", "resolution"],
        suggestions: {
          subject: ["a sleek perfume bottle", "a high-end smartwatch", "artisanal skincare", "a gourmet burger"],
          lighting: ["dramatic studio", "soft window", "neon rim", "high-key"],
          camera: ["macro lens", "medium format", "85mm portrait", "tilt-shift"],
          resolution: ["8k highly detailed", "4k crisp", "photorealistic", "ultra-hd"]
        },
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "vid-product-1",
        title: "Product Showcase",
        description: "Smooth 360-degree commercial video",
        type: "video",
        category: "Commercial",
        template: "Smooth 360-degree product showcase video of [subject], [lighting] lighting, [camera] camera motion, [resolution], commercial style.",
        placeholders: ["subject", "lighting", "camera", "resolution"],
        suggestions: {
          subject: ["a luxury sports car", "a futuristic smartphone", "a designer watch", "a pair of sneakers"],
          lighting: ["dynamic studio", "neon reflections", "soft cinematic", "high-contrast"],
          camera: ["slow pan", "dolly zoom", "orbiting", "macro tracking"],
          resolution: ["4k 60fps", "8k ultra-hd", "1080p slow motion", "cinematic 24fps"]
        },
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "vid-anim-1",
        title: "Character Animation",
        description: "Expressive 3D character motion",
        type: "video",
        category: "Animation",
        template: "3D animation of [subject] expressing [emotion], [style] style, [lighting] lighting, smooth movement, [resolution].",
        placeholders: ["subject", "emotion", "style", "lighting", "resolution"],
        suggestions: {
          subject: ["a cute robot", "a fantasy warrior", "a cartoon animal", "a stylized human"],
          emotion: ["joyful surprise", "deep sadness", "intense anger", "curious wonder"],
          style: ["Pixar-like", "cel-shaded anime", "stop-motion clay", "hyper-realistic"],
          lighting: ["warm studio", "dramatic shadows", "colorful neon", "soft ambient"],
          resolution: ["4k 60fps", "1080p", "8k highly detailed", "cinematic 24fps"]
        },
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "vid-nature-1",
        title: "Nature Documentary",
        description: "High-quality wildlife and nature footage",
        type: "video",
        category: "Nature",
        template: "Nature documentary style footage of [subject] in [environment], [camera] camera, [motion] motion, highly detailed, [resolution].",
        placeholders: ["subject", "environment", "camera", "motion", "resolution"],
        suggestions: {
          subject: ["a majestic eagle", "a herd of elephants", "a blooming flower", "a coral reef"],
          environment: ["a dense jungle", "the African savanna", "a snowy mountain peak", "the deep ocean"],
          camera: ["telephoto lens", "macro close-up", "wide-angle", "drone aerial"],
          motion: ["slow tracking", "time-lapse", "smooth pan", "steady-cam"],
          resolution: ["8k ultra-hd", "4k 60fps", "cinematic 24fps", "IMAX quality"]
        },
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "vid-music-1",
        title: "Music Video",
        description: "Stylized, dynamic performance shots",
        type: "video",
        category: "Creative",
        template: "Stylized music video scene, [subject] performing, [lighting] lighting, [motion] motion, [style] style, dynamic editing.",
        placeholders: ["subject", "lighting", "motion", "style"],
        suggestions: {
          subject: ["a rock band", "a solo pop singer", "a hip-hop dancer", "an electronic DJ"],
          lighting: ["strobe lights", "neon lasers", "moody silhouettes", "vibrant colors"],
          motion: ["fast cuts", "handheld shaky", "smooth gimbal", "slow motion"],
          style: ["gritty vintage", "futuristic cyberpunk", "dreamy ethereal", "high-energy pop"]
        },
        image: "https://picsum.photos/seed/musicvideo/800/600"
      },
      {
        id: "text-marketing-1",
        title: "Social Media Campaign",
        description: "Engaging posts for various platforms",
        type: "text",
        category: "Marketing",
        template: "Create a [platform] post about [topic]. The target audience is [audience]. The tone should be [tone] and include a strong call to action.",
        placeholders: ["platform", "topic", "audience", "tone"],
        suggestions: {
          platform: ["Twitter thread", "LinkedIn post", "Instagram caption", "Facebook ad"],
          topic: ["a new product launch", "a company milestone", "industry insights", "a special discount"],
          audience: ["young professionals", "tech enthusiasts", "small business owners", "fitness lovers"],
          tone: ["enthusiastic", "professional", "humorous", "urgent"]
        },
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "img-fantasy-1",
        title: "Epic Fantasy Landscape",
        description: "Grand, sweeping magical vistas",
        type: "image",
        category: "Fantasy",
        template: "An epic fantasy landscape featuring [landmark], surrounded by [environment], under a [sky_condition] sky, [lighting] lighting, highly detailed concept art.",
        placeholders: ["landmark", "environment", "sky_condition", "lighting"],
        suggestions: {
          landmark: ["a towering crystal spire", "an ancient ruined castle", "a giant glowing tree", "a floating citadel"],
          environment: ["a misty glowing swamp", "jagged volcanic mountains", "a lush enchanted forest", "a frozen tundra"],
          sky_condition: ["star-filled nebula", "blood red sunset", "aurora borealis", "stormy lightning"],
          lighting: ["dramatic god rays", "ethereal glow", "harsh contrast", "soft magical"]
        },
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "vid-timelapse-1",
        title: "City Time-Lapse",
        description: "Fast-paced urban transition",
        type: "video",
        category: "Cinematic",
        template: "A dynamic time-lapse video of [city_element] transitioning from [start_state] to [end_state], [camera_motion], 4k resolution.",
        placeholders: ["city_element", "start_state", "end_state", "camera_motion"],
        suggestions: {
          city_element: ["a busy intersection", "a city skyline", "a construction site", "a train station"],
          start_state: ["day", "dusk", "empty", "still"],
          end_state: ["night", "dawn", "crowded", "bustling"],
          camera_motion: ["static wide shot", "slow pan", "tilt up", "dolly forward"]
        },
        image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "text-recipe-1",
        title: "Gourmet Recipe Creator",
        description: "Detailed culinary instructions",
        type: "text",
        category: "Lifestyle",
        template: "Write a detailed recipe for a [cuisine] dish featuring [main_ingredient]. The difficulty level should be [difficulty], and the style should be [style]. Include prep time and nutritional info.",
        placeholders: ["cuisine", "main_ingredient", "difficulty", "style"],
        suggestions: {
          cuisine: ["Italian", "Japanese", "Mexican", "French"],
          main_ingredient: ["fresh salmon", "wild mushrooms", "wagyu beef", "tofu"],
          difficulty: ["beginner", "intermediate", "advanced", "Michelin-star"],
          style: ["quick and easy", "slow-cooked", "healthy and low-carb", "decadent comfort food"]
        },
        image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "img-retro-1",
        title: "Retro Synthwave",
        description: "80s inspired neon aesthetics",
        type: "image",
        category: "Retro",
        template: "A retro synthwave illustration of [subject], featuring a [background_element], neon [color_palette] colors, VHS glitch effect, 80s aesthetic.",
        placeholders: ["subject", "background_element", "color_palette"],
        suggestions: {
          subject: ["a sleek sports car", "a futuristic grid", "a palm tree silhouette", "a robotic bust"],
          background_element: ["a wireframe sun", "a glowing city skyline", "a starry space background", "geometric shapes"],
          color_palette: ["magenta and cyan", "purple and orange", "neon green and pink", "electric blue"]
        },
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80"
      }
    ];
    
    // Apply daily rotation to all templates
    const templatesWithDailySuggestions = templates.map(t => ({
      ...t,
      suggestions: getDailySuggestions(t.suggestions)
    }));
    
    // Shuffle the templates array daily
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    const random = (s: number) => {
      let x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };

    const shuffledTemplates = [...templatesWithDailySuggestions].sort((a, b) => {
      const hashA = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return random(seed + hashA) - random(seed + hashB);
    });
    
    // Return all templates, but shuffled daily so the gallery looks fresh
    // The frontend will handle showing a subset and a "View More" button
    res.json(shuffledTemplates);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const staticDistPath = fs.existsSync(path.join(_dirname, "dist"))
      ? path.join(_dirname, "dist")
      : fs.existsSync(path.join(_dirname, "../dist"))
      ? path.join(_dirname, "../dist")
      : path.join(process.cwd(), "dist");

    app.use(express.static(staticDistPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticDistPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
