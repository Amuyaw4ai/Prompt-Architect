# 🚀 Prompt Architect Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)](https://vitejs.dev/)
[![Security Audit](https://img.shields.io/badge/Security-Passed-brightgreen.svg)](<context docs/security+ docs/SECURITY_AUDIT.md>)

**Prompt Architect Studio** is a state-of-the-art visual studio application designed to refine, structure, and expand raw ideas into production-ready prompts across **Text/LLM, Image, Video, Audio, and Code** modalities.

Powered by a dual-engine setup (Google Gemini AI + Local Fallback Synthesizer) and an intuitive **3-Column Studio Interface**, Prompt Architect gives creators, prompt engineers, and developers complete visibility into prompt evaluation, structural reasoning, and live framework transformations.

---

## ✨ Key Features

- 🏛️ **3-Column Parallel Studio Workspace**:
  - **Left Column (Chat Interface)**: Clean message stream between user and model (distinguished user query cards, avatar-free clean flow, smooth invisible scrollbar, and attachment bar).
  - **Middle Column (Prompt Editor)**: Real-time editable blueprint with version history (undo/redo, copy, export, variable blueprints).
  - **Right Column (Architectural Output)**: Full analytical panel displaying Quality Scores, Structural Reasoning, Contextual Quick-Add Pills, Framework Synthesizer, and Test Simulation Sandbox.
- 🎨 **Multi-Modality Architecture Support**:
  - **Text / General LLMs**: Specialist role, context, task instructions, format/tone rules, and clarifying questions.
  - **Image Generation (Imagen 3, Midjourney, DALL-E 3)**: Subject, aesthetic style, lighting, camera lens, resolution, and negative prompt fields.
  - **Video Generation (Veo 2, Sora, Runway Gen-3)**: Cinematic shot type, motion dynamics, frame rate, lighting, and camera movement.
  - **Audio & Music (MusicLM, Suno)**: Genre, BPM, mood, instrumentation, vocal character, and audio arrangement.
  - **Code Generation**: Target language, frameworks, input/output schemas, error handling, performance constraints, and unit test requirements.
- ⚡ **Live Framework Synthesizer**: Restructure any prompt on the fly into proven frameworks:
  - **CO-STAR**: Context, Objective, Style, Tone, Audience, Response.
  - **RTF**: Role, Task, Format.
  - **Few-Shot**: Task definition with explicit input-output demonstration pairs.
  - **CRISPE**: Capacity, Role, Insight, Statement, Personality, Experiment.
  - **TAG**: Task, Action, Goal.
  - **CARE**: Context, Action, Result, Example.
  - **APE**: Action, Purpose, Expectation.
- 🎯 **Interactive Variable Blueprints**: Automatic extraction of dynamic variables `[VARIABLE_NAME]` into custom input fields with smart suggestions.
- 🧪 **Interactive Test Sandbox**: Run simulation tests directly inside the studio to verify model compliance and parameter adherence before deployment.
- 🔒 **Enterprise Security & Offline Resilience**: Server-side key isolation, zero-secret client exposure, parameterized SQLite queries, and full offline engine fallback capabilities.

---

## 📐 3-Column Studio Layout

```
+---------------------------------------------------------------------------------------------------------+
|                                        PROMPT ARCHITECT STUDIO                                          |
+------------------------------------+-----------------------------------+--------------------------------+
|           MAIN COLUMN 1            |           MAIN COLUMN 1           |         MAIN COLUMN 2          |
|         (Sub-Column 1: Chat)       |     (Sub-Column 2: Editor)        |    (Architectural Output)     |
+------------------------------------+-----------------------------------+--------------------------------+
|  User Message                      |  [PROMPT EDITOR]                  |  [QUALITY SCORE: 95%]          |
|  "Expand a prompt for SaaS..."     |                                   |  - Specificity: High           |
|                                    |  Role: Senior SaaS Architect      |  - Structure: Optimal          |
|  AI Model Response                 |  Objective: Build scalable API    |                                |
|  Architecting structured prompt    |  Context: Node.js & SQLite...     |  [ARCHITECTURAL BLUEPRINT]     |
|  expansion for SaaS...             |                                   |  - Persona established         |
|                                    |  [Variables: {DOMAIN}, {STACK}]   |  - Clarifications generated    |
|  [Framework Selector]              |                                   |                                |
|  [Input Bar & Attachments]         |  [Version Switcher: v2 / v3]      |  [FRAMEWORK SYNTHESIZER]       |
|                                    |  [Copy / Export / Download]       |  [TEST SIMULATION SANDBOX]     |
+------------------------------------+-----------------------------------+--------------------------------+
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, React Markdown
- **Backend API**: Node.js, Express, Better-SQLite3, `@google/genai`
- **Build System**: Vite, ESBuild, PostCSS, Autoprefixer
- **Security & Utilities**: dotenv, parameterized SQL, custom rate-limiting headers

---

## ⚡ Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- **Google Gemini API Key** (Get free key from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone Repository
```bash
git clone https://github.com/Amuyaw4ai/Prompt-Architect.git
cd Prompt-Architect
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```
Open `.env` and insert your Gemini API Key:
```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere
PORT=3000
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to launch Prompt Architect Studio.

---

## 📜 Available NPM Scripts

- `npm run dev` - Starts the full-stack Vite + Express server on port 3000.
- `npm run build` - Builds client assets into `dist/` and compiles production server code.
- `npm run start` - Starts production Node server from built output.
- `npm run preview` - Previews the production Vite build locally.

---

## 🛡️ Security & Privacy Policy

Prompt Architect enforces strict security practices:
- **Zero API Key Leakage**: API Keys remain server-side in `process.env`.
- **Database Safety**: Parameterized queries using `better-sqlite3` protect against SQL Injection.
- **Dependency Hardening**: Regular `npm audit` fixes to ensure no high or critical vulnerabilities exist.
- **Vulnerability Reporting**: See [`SECURITY.md`](<context docs/security+ docs/SECURITY.md>) and [`SECURITY_AUDIT.md`](<context docs/security+ docs/SECURITY_AUDIT.md>) for full compliance details.

---

## 📚 Context & Architectural Documentation

All reference manuals, design blueprints, standards, and security audits are housed inside [`context docs`](<context docs>):

- **Universal Standards** ([`context docs/universal standards/`](<context docs/universal standards>)):
  - [`CONTAINERIZATION_STANDARD.md`](<context docs/universal standards/CONTAINERIZATION_STANDARD.md>): Universal Containerization & Scaling SOP.
  - [`SECURE_VIBE_CODING_STANDARDS.md`](<context docs/universal standards/SECURE_VIBE_CODING_STANDARDS.md>): Master Security & Governance Framework.
- **Project Specifications** ([`context docs/project docs/`](<context docs/project docs>)):
  - [`master_ui_design_spec.md`](<context docs/project docs/master_ui_design_spec.md>): Master UI/UX Design System & Component Specification.
  - [`PRODUCT_ROADMAP_AND_MONETIZATION.md`](<context docs/project docs/PRODUCT_ROADMAP_AND_MONETIZATION.md>): Product Roadmap & Monetization Blueprint.
  - [`DEPLOYMENT.md`](<context docs/project docs/DEPLOYMENT.md>): Deployment & Scaling Guide across Docker, Cloud Run & Kubernetes.
- **Security Governance** ([`context docs/security+ docs/`](<context docs/security+ docs>)):
  - [`SECURITY.md`](<context docs/security+ docs/SECURITY.md>): Security Policy & Vulnerability Disclosure.
  - [`SECURITY_AUDIT.md`](<context docs/security+ docs/SECURITY_AUDIT.md>): Automated & Codebase Security Audit Report.
  - [`Secure Vibe Coding Risk Management.pdf`](<context docs/security+ docs/Secure Vibe Coding Risk Management.pdf>): Risk Management Blueprint.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.
