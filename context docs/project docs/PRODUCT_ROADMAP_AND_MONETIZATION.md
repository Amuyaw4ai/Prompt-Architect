# 🗺️ Prompt Architect — Product Roadmap & Monetization Log

> **Master Architecture, Monetization Blueprint & User Retention Engine**  
> *Last Updated: August 2026*

This document serves as the **authoritative tracking record** for all monetization opportunities, tiered service boundaries, user retention strategies, and future feature implementations delegated for upcoming releases.

---

## 💰 1. Monetization Opportunities & Tiered Services

| Feature Area | Free Tier Limit | Pro / Enterprise Tier (Monetized) | Monetization Value Proposition |
| :--- | :--- | :--- | :--- |
| **File Upload Limits** | • Images: **10 MB** (JPEG, PNG, GIF, WebP)<br>• Videos: **25 MB** (MP4, WebM, MOV)<br>• Audio: **15 MB** (MP3, WAV, OGG)<br>• Documents: **10 MB** (PDF, DOCX, TXT, CSV) | • Images: **100 MB**<br>• Videos: **1 GB**<br>• Audio: **250 MB**<br>• Documents: **500 MB** (Batch document parsing & multi-file context) | High-volume media creators & enterprise developers needing large dataset uploads. |
| **Architectural Studio Iterations** | **3 Free Iterations per session** (Unlocked trial) | **Unlimited Studio Iterations & Version Tree Cloud Storage** (Triggered on 4th iteration) | Prompts registered users to sign in to save prompt version lineages (`v1`–`v10`) across all devices. |
| **Model Acceleration & Priority** | Standard queue processing rate limits | **Dedicated Priority Compute & Accelerated Rendering** (Zero queue wait times) | Time-sensitive agency & corporate workflows requiring instant prompt optimization. |
| **Cloud History & Device Backup** | Local device storage (`localStorage` & SQLite local fallback) | **Unlimited Persistent Cloud Backup & Cross-Device Sync** | Access prompt architecture history seamlessly from any device or desktop. |
| **Custom Model API Keys (BYOK)** | Built-in standard AI models | **Bring Your Own Key (BYOK)** for OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), and Google (Gemini 1.5 Pro) | Advanced power users needing targeted model selection and custom rate limits. |
| **Export & Branding Customization** | Standard JSON / Markdown export | **Custom Branded PDF Reports, White-label Watermarking & REST API access** | Agencies delivering client-facing prompt blueprints and corporate specs. |
| **Team Workspaces & Collaboration** | Single User | **Multi-Seat Workspaces & Shared Team Prompt Vaults** | Engineering teams standardizing AI prompt guidelines across organizations. |

---

## 🔄 2. User Retention & Pro Conversion Engine (Synthesized from Approach 3)

The biggest challenge in single-use utility AI tools is user churn—users who use the tool once for a quick prompt fix and disappear. Prompt Architect solves this by implementing a **4-Pillar Retention & Pro Conversion Pipeline**:

```
ONE-OFF VISIT ──> TRANSITION BRIDGE ──> VERSION TREE HABIT ──> PRO CONVERSION
 (Single Audit)   ("Continue in Workspace")   (Prompt Vault Lineage)   (Paid Subscription)
```

### Pillar 1: The Transition Bridge (`/try` / `/audit` → `/workspace`)
* **Strategy**: The single-shot transformation on the landing page (`/try` or `/audit`) is just the public hook.
* **Mechanism**: As soon as a visitor receives their upgraded prompt, the interface displays a frictionless bridge: **`"Want to keep refining this prompt across versions? Continue in Workspace →"`**.
* **Impact**: Shifts the user's mental model from a single-use website to an evolving, interactive multi-turn workspace.

### Pillar 2: Prompt Version Trees & Lineage History (`v1` → `v2` → `v3`)
* **Strategy**: When users refine prompts in the studio workspace, the engine builds a visual **Prompt Version Lineage Tree**.
* **Mechanism**: Users return daily because their prompt variations, fine-tuned templates, and test results are stored securely in their account catalog (their "Prompt Vault").
* **Impact**: Accumulating personal prompt assets creates high switching costs—making users loyal to Prompt Architect as their primary engineering hub.

### Pillar 3: Daily Workflow Habit & 3 Free Audits Reset Engine
* **Strategy**: The daily free audit counter resets every 24 hours (3 free daily audits).
* **Mechanism**: Users form a daily pre-submission habit: before sending any prompt to ChatGPT, Claude, Midjourney, or Cursor, they run a sub-10ms health audit in Prompt Architect.
* **Impact**: Transforms occasional visitors into habitual daily active users (DAUs).

### Pillar 4: The Pro Conversion Ladder (Converting Free Users to Paying Subscribers)
Free users are converted to paying Pro subscribers at key high-intent friction points:
1. **4th Daily Audit Intercept**: Converts heavy daily power users into registered account holders on their 4th daily attempt.
2. **Unlimited Vault Cloud Backup & Sync**: Converted when users want cross-device sync and unlimited prompt storage beyond local browser storage.
3. **Direct Model Execution & BYOK (Bring Your Own Key)**: Converted when power users want to execute their architected prompts directly inside GPT-4o, Claude 3.5, or Flux right from the Prompt Architect workspace without context switching.
4. **Team Vaults & Shared Blueprints**: Converted when corporate engineering teams and agencies need multi-seat shared prompt libraries and white-label client PDF exports.

---

## 🛣️ 3. Delegated Future Implementations & Feature Backlog

The following features and updates have been delegated for future release iterations:

### 🎛️ F. Output Model Target Selector (Claude / GPT-4o / Midjourney / Flux)
* **Model Dropdown Selector**: Dropdown above the Architected Spec box allowing power users to toggle target model syntax (`[ Engine Target: GPT-4o / Claude 3.5 | Midjourney v6.1 | Flux.1 | React/TS ]`).

### 🧩 E. Browser Extension Ecosystem (Zero-Context Switching)
* **Chrome / Arc / Edge Extension Bridge**: Offer a lightweight browser extension enabling users to run the Prompt Health Auditor directly inside ChatGPT, Claude, Midjourney Discord, and Cursor using hotkeys (`Cmd + Shift + P`).
* **Instant Prompt Injection**: Automatically injects the architected prompt directly into third-party chat input fields and links back to the user's Prompt Architect Studio history.

### 🔐 A. User Onboarding & Authentication
* **Full Authentication Flow**: Integrate Google SSO, GitHub OAuth, and email/password authentication (via Firebase / Supabase / Auth0).
* **Interactive User Onboarding Walkthrough**: Step-by-step interactive onboarding for new users explaining the 3-column architecture (Chat -> Editor -> Output).
* **User Profile Settings & Preferences**: Dedicated user account settings for managing subscription tiers, API keys, and notification preferences.

### 📜 B. Deep Prompt Iteration & Version Diffing
* **Prompt Version Diff Viewer**: Visual side-by-side text diffing (highlighting additions in green and deletions in red) between `v1`, `v2`, `v3` prompt iterations in the Prompt Editor.
* **Granular Iteration Branching**: Ability to branch off an earlier prompt version (`v2`) into a new sub-session without losing original iteration history.

### 🤖 C. Model & Integration Expansion
* **Multi-Provider AI API Integration**: Direct API connections for:
  - OpenAI GPT-4o & GPT-4o-mini
  - Anthropic Claude 3.5 Sonnet & Claude 3 Haiku
  - Google Gemini 1.5 Pro & Gemini 1.5 Flash
* **Custom System Persona Presets**: User-defined persona templates (e.g. "Senior React Architect", "Legal Counsel", "Cybersecurity Auditor").

### 🤝 D. Community & Team Collaboration
* **Public Prompt Showcase**: Optional public sharing links for user-created prompt architectures.
* **Community Prompt Marketplace**: Discover, star, and clone top-rated prompt frameworks built by the community.

---

## 📝 4. Log of Implementation Milestones

* **August 2026**:
  * Added **User Retention & Pro Conversion Engine** (Pillar 1: Transition Bridge, Pillar 2: Version Trees, Pillar 3: Daily Reset Habit, Pillar 4: Pro Conversion Ladder).
  * Consolidated application views into a single unified History view with live search, favorite stars, modality filters, and inline title editing.
  * Streamlined Calibrate & Quick Add options to strictly 4-5 context-tailored items with an eye-friendly emerald-slate palette.
  * Added desktop resizable column persistence saving split dimensions to browser storage.
  * Refactored mobile swipe gesture engine with high-speed velocity detection and vertical list scroll protection.
  * Streamlined context attachment button into a single 1-click file picker supporting Images, Videos, Audio, and Documents with active free-tier size enforcement.
  * Implemented **Instant Diagnostic Scoring & Prompt Health Auditor** with spin-the-wheel gauge animation, 5-point industry standards breakdown, and 1-click conversion funnel into the Architectural Studio.
  * Configured **Automated GitHub Release Pipeline (`.github/workflows/release.yml`)** and updated Governance Standard (`v2.6`).
  * Compiled Master Synthesis Blueprint (`master_synthesis_blueprint.md`) synthesizing Approaches 1, 2, and 3 across 309 pages with non-trigger copy governance, 4th iteration conversion hook, and SQLite/Gemini 1.5 Flash backend regrowth roadmap.
