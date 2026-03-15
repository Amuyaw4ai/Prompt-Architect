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
    is_favorite INTEGER DEFAULT 0,
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
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
`);

try {
  db.exec("ALTER TABLE chat_sessions ADD COLUMN result_history TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE chat_sessions ADD COLUMN current_result_index INTEGER;");
} catch (e) {}
try {
  db.exec("ALTER TABLE saved_prompts ADD COLUMN is_favorite INTEGER DEFAULT 0;");
} catch (e) {}

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
        isFavorite: row.is_favorite === 1,
        createdAt: row.created_at * 1000
      };
    });

    res.json(result);
  });

  app.post("/api/prompts", (req, res) => {
    const { title, originalIdea, refinedPrompt, type, tags, messages, isFavorite } = req.body;
    const stmt = db.prepare(`
      INSERT INTO saved_prompts (title, original_idea, refined_prompt, type, tags, messages, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(title, originalIdea, refinedPrompt, type, JSON.stringify(tags), JSON.stringify(messages || []), isFavorite ? 1 : 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/prompts/:id", (req, res) => {
    const { id } = req.params;
    const { title, originalIdea, refinedPrompt, type, tags, messages, isFavorite } = req.body;
    const stmt = db.prepare(`
      UPDATE saved_prompts 
      SET title = ?, original_idea = ?, refined_prompt = ?, type = ?, tags = ?, messages = ?, is_favorite = ?
      WHERE id = ?
    `);
    stmt.run(title, originalIdea, refinedPrompt, type, JSON.stringify(tags), JSON.stringify(messages || []), isFavorite ? 1 : 0, id);
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
    const { id, title, messages, currentType, resultHistory, currentResultIndex } = req.body;
    const stmt = db.prepare(`
      INSERT INTO chat_sessions (id, title, messages, current_type, result_history, current_result_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, title, JSON.stringify(messages), currentType, JSON.stringify(resultHistory || []), currentResultIndex || 0);
    res.json({ success: true });
  });

  app.put("/api/sessions/:id", (req, res) => {
    const { id } = req.params;
    const { title, messages, currentType, resultHistory, currentResultIndex } = req.body;
    const stmt = db.prepare(`
      UPDATE chat_sessions 
      SET title = ?, messages = ?, current_type = ?, result_history = ?, current_result_index = ?, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `);
    stmt.run(title, JSON.stringify(messages), currentType, JSON.stringify(resultHistory || []), currentResultIndex || 0, id);
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
          subject: ["a grizzled detective", "an elven warrior", "a cyberpunk hacker", "a wise old monk"],
          lighting: ["Rembrandt", "neon rim", "dramatic chiaroscuro", "soft golden hour"],
          camera: ["35mm lens", "85mm portrait lens", "medium format", "anamorphic lens"],
          mood: ["melancholic", "intense", "ethereal", "gritty"]
        }
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
          subject: ["a young witch flying", "a giant fluffy spirit", "a brave knight", "a curious cat"],
          setting: ["a magical forest", "a floating island", "a bustling steampunk town", "a quiet seaside village"],
          time_of_day: ["golden hour", "starry night", "misty morning", "bright afternoon"]
        }
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
          time: ["midnight", "dusk", "dawn", "3 AM"],
          color_palette: ["neon pink and cyan", "acid green and purple", "deep blue and orange", "monochrome red"],
          atmosphere: ["gritty", "holographic", "dystopian", "rainy and melancholic"]
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
