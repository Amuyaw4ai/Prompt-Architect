import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("prompts.db");

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
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
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
      try { tags = row.tags ? JSON.parse(row.tags) : []; } catch (e) {}
      try { messages = row.messages ? JSON.parse(row.messages) : []; } catch (e) {}
      
      return {
        ...row,
        tags,
        messages,
        originalIdea: row.original_idea,
        refinedPrompt: row.refined_prompt,
        createdAt: row.created_at * 1000
      };
    });

    res.json(result);
  });

  app.post("/api/prompts", (req, res) => {
    const { title, originalIdea, refinedPrompt, type, tags, messages } = req.body;
    const stmt = db.prepare(`
      INSERT INTO saved_prompts (title, original_idea, refined_prompt, type, tags, messages)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(title, originalIdea, refinedPrompt, type, JSON.stringify(tags), JSON.stringify(messages || []));
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/prompts/:id", (req, res) => {
    const { id } = req.params;
    const { title, originalIdea, refinedPrompt, type, tags, messages } = req.body;
    const stmt = db.prepare(`
      UPDATE saved_prompts 
      SET title = ?, original_idea = ?, refined_prompt = ?, type = ?, tags = ?, messages = ?
      WHERE id = ?
    `);
    stmt.run(title, originalIdea, refinedPrompt, type, JSON.stringify(tags), JSON.stringify(messages || []), id);
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
      try { messages = row.messages ? JSON.parse(row.messages) : []; } catch (e) {}
      return {
        ...row,
        messages,
        currentType: row.current_type,
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
    try { messages = row.messages ? JSON.parse(row.messages) : []; } catch (e) {}
    
    res.json({
      ...row,
      messages,
      currentType: row.current_type,
      updatedAt: row.updated_at * 1000,
      createdAt: row.created_at * 1000
    });
  });

  app.post("/api/sessions", (req, res) => {
    const { id, title, messages, currentType } = req.body;
    const stmt = db.prepare(`
      INSERT INTO chat_sessions (id, title, messages, current_type)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, title, JSON.stringify(messages), currentType);
    res.json({ success: true });
  });

  app.put("/api/sessions/:id", (req, res) => {
    const { id } = req.params;
    const { title, messages, currentType } = req.body;
    const stmt = db.prepare(`
      UPDATE chat_sessions 
      SET title = ?, messages = ?, current_type = ?, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `);
    stmt.run(title, JSON.stringify(messages), currentType, id);
    res.json({ success: true });
  });

  app.delete("/api/sessions/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM chat_sessions WHERE id = ?").run(id);
    res.json({ success: true });
  });

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
        placeholders: ["subject", "lighting", "camera", "mood"]
      },
      {
        id: "img-anime-1",
        title: "Studio Ghibli Style",
        description: "Whimsical hand-drawn animation look",
        type: "image",
        category: "Anime",
        template: "An anime illustration of [subject] in the style of Studio Ghibli, [setting], lush landscapes, soft watercolor textures, [time_of_day] light.",
        placeholders: ["subject", "setting", "time_of_day"]
      },
      {
        id: "img-cyber-1",
        title: "Cyberpunk Cityscape",
        description: "Neon-drenched futuristic urban environment",
        type: "image",
        category: "Sci-Fi",
        template: "A sprawling cyberpunk city at [time], neon signs in [color_palette], rainy streets reflecting lights, [atmosphere] mood, high-tech low-life aesthetic.",
        placeholders: ["time", "color_palette", "atmosphere"]
      },
      {
        id: "img-macro-1",
        title: "Macro Nature",
        description: "Extreme close-up of natural elements",
        type: "image",
        category: "Nature",
        template: "Macro photography of [object], showing intricate details of [detail_focus], soft bokeh background, [lighting] light, vibrant [colors].",
        placeholders: ["object", "detail_focus", "lighting", "colors"]
      },
      {
        id: "vid-cinematic-1",
        title: "Slow Motion Reveal",
        description: "Dramatic camera movement for video",
        type: "video",
        category: "Cinematic",
        template: "A slow motion [camera_movement] shot of [subject], [environment], [lighting] atmosphere, particles floating in the air, 4k 60fps.",
        placeholders: ["camera_movement", "subject", "environment", "lighting"]
      },
      {
        id: "vid-drone-1",
        title: "Epic Drone Sweep",
        description: "Wide aerial perspective for landscapes",
        type: "video",
        category: "Aerial",
        template: "An epic drone shot sweeping over [landscape], [time_of_day], dramatic shadows, [weather_condition], smooth cinematic motion.",
        placeholders: ["landscape", "time_of_day", "weather_condition"]
      },
      {
        id: "text-expert-1",
        title: "Expert Consultant",
        description: "Professional tone for complex tasks",
        type: "text",
        category: "Professional",
        template: "Act as a world-class [profession] with expertise in [specialty]. Your task is to [task]. Provide a detailed, [tone] response with actionable insights.",
        placeholders: ["profession", "specialty", "task", "tone"]
      },
      {
        id: "text-creative-1",
        title: "Story Architect",
        description: "Creative writing and world-building",
        type: "text",
        category: "Creative",
        template: "Write a [genre] story about [protagonist] who discovers [discovery]. The tone should be [mood], and the setting is [setting]. Focus on [theme].",
        placeholders: ["genre", "protagonist", "discovery", "mood", "setting", "theme"]
      }
    ];
    res.json(templates);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
