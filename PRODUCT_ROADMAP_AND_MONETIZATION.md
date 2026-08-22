# 🗺️ Prompt Architect — Product Roadmap & Monetization Log

> **Master Architecture & Monetization Blueprint**  
> *Last Updated: August 2026*

This document serves as the **authoritative tracking record** for all monetization opportunities, tiered service boundaries, and future feature implementations delegated for upcoming releases.

---

## 💰 1. Monetization Opportunities & Tiered Services

| Feature Area | Free Tier Limit | Pro / Enterprise Tier (Monetized) | Monetization Value Proposition |
| :--- | :--- | :--- | :--- |
| **File Upload Limits** | • Images: **10 MB** (JPEG, PNG, GIF, WebP)<br>• Videos: **25 MB** (MP4, WebM, MOV)<br>• Audio: **15 MB** (MP3, WAV, OGG)<br>• Documents: **10 MB** (PDF, DOCX, TXT, CSV) | • Images: **100 MB**<br>• Videos: **1 GB**<br>• Audio: **250 MB**<br>• Documents: **500 MB** (Batch document parsing & multi-file context) | High-volume media creators & enterprise developers needing large dataset uploads. |
| **Model Acceleration & Priority** | Standard queue processing rate limits | **Dedicated Priority Compute & Accelerated Rendering** (Zero queue wait times) | Time-sensitive agency & corporate workflows requiring instant prompt optimization. |
| **Cloud History & Device Backup** | Local device storage (`localStorage` & SQLite local fallback) | **Unlimited Persistent Cloud Backup & Cross-Device Sync** | Access prompt architecture history seamlessly from any device or desktop. |
| **Custom Model API Keys (BYOK)** | Built-in standard AI models | **Bring Your Own Key (BYOK)** for OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), and Google (Gemini 1.5 Pro) | Advanced power users needing targeted model selection and custom rate limits. |
| **Export & Branding Customization** | Standard JSON / Markdown export | **Custom Branded PDF Reports, White-label Watermarking & REST API access** | Agencies delivering client-facing prompt blueprints and corporate specs. |
| **Team Workspaces & Collaboration** | Single User | **Multi-Seat Workspaces & Shared Team Prompt Vaults** | Engineering teams standardizing AI prompt guidelines across organizations. |

---

## 🛣️ 2. Delegated Future Implementations & Feature Backlog

The following features and updates have been delegated for future release iterations:

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

## 📝 3. Log of Implementation Milestones

* **August 2026**:
  * Consolidated application views into a single unified History view with live search, favorite stars, modality filters, and inline title editing.
  * Streamlined Calibrate & Quick Add options to strictly 4-5 context-tailored items with an eye-friendly emerald-slate palette.
  * Added desktop resizable column persistence saving split dimensions to browser storage.
  * Refactored mobile swipe gesture engine with high-speed velocity detection and vertical list scroll protection.
  * Streamlined context attachment button into a single 1-click file picker supporting Images, Videos, Audio, and Documents with active free-tier size enforcement.
