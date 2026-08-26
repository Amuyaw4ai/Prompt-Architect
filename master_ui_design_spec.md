# 🎨 PROMPT ARCHITECT — MASTER UI/UX DESIGN & COMPONENT SPECIFICATION

> **Authoritative UI/UX Design System, Micro-Interaction Architecture & Desktop Layout Blueprint**  
> *Last Updated: August 2026*  
> *Visual Language: Dark Slate & Emerald Glassmorphism, Precision Micro-Animations, High-Contrast Typography, Tactile Physical States*

---

## 🏛️ DESIGN SYSTEM & VISUAL PERSONALITY

### 1. Core UI Principle: "Precision + Intelligence + Momentum"
The UI design feels like a **serious, high-tier intelligent tool** (inspired by the responsiveness of Duolingo and sleek minimalism of Vercel/Linear). It avoids unnecessary visual clutter, redundant status badges, and fake artificial delays.

### 2. Design Tokens & Palette

| Element | Dark Mode Token | Light Mode Token | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `bg-slate-950` (`#020617`) | `bg-stone-50` (`#fafaf9`) | Deep, immersive background |
| **Surface Cards** | `bg-slate-900/80` + `backdrop-blur-md` | `bg-white` | Glassmorphic containers |
| **Border Highlights** | `border-slate-800` / `border-emerald-500/30` | `border-stone-200` | High-contrast structural boundaries |
| **Primary Brand Accent** | `text-emerald-400` / `bg-emerald-500` | `text-emerald-600` / `bg-emerald-600` | High-impact actions and positive badges |
| **Warning / Flaw Accent**| `text-amber-400` / `bg-amber-500/10` | `text-amber-600` | Non-alarmist insight indicators |
| **Critical Flaw Accent**| `text-pink-400` / `bg-pink-500/10` | `text-pink-600` | High-severity hard gate indicators |
| **Typography** | Inter / System Sans, `font-black` headings, `font-mono` for prompt code specs | Clean hierarchy & high readability |

---

# PART I: HERO VIEWPORT & INPUT SANDBOX ARCHITECTURE (DESKTOP)

The desktop hero section is **100% zero-scroll** (`h-screen` / `100vh` `overflow-hidden`). Vertical padding is tightly calibrated so the entire input sandbox fits comfortably without triggering vertical browser scrollbars.

```
+-------------------------------------------------------------------------+
| [⚡ PromptArchitect]        [Home] [Menu ▾]         [Theme ☀] [NEW CHAT] | <-- Pinned Header (Clean Dropdown Below)
+-------------------------------------------------------------------------+
| [ Try: SaaS Cold Email ]  [ Try: Python Scraper ]  [ Try: Cinema Shot ] | <-- Rotating Dynamic Inspiration Chips
| +---------------------------------------------------------------------+ |
| | Input Area: Auto-Expanding Textarea                                 | |
| | "Type or paste your raw draft prompt..."                            | |
| |                                                                     | |
| | [ Quick Add: + Golden Hour Light ]  [ + 85mm Lens ]                 | |
| | [ Characters: 0 ]                        [ Architect My Prompt → ]  | |
| +---------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
```

### 1. Modality Selector Removal
* **Omitted**: Manual `[ Text | Image | Video | Code ]` modality selector pills are **completely removed** from the Hero Sandbox interface.
* **Auto-Detection**: Modality classification is handled sub-10ms by the backend frontline pre-classifier (`analyzeFrontlineInput`).

2. Dynamic Inspiration Chips (Rotates Daily / On Refresh)
* **Location**: Pinned directly above the text canvas.
* **Behavior**: 3 horizontal pill buttons (`[Try: SaaS Cold Email]`, `[Try: Python Scraper]`, `[Try: Cinema Shot]`).
* **Dynamic Refresh Rule**: Chips cycle randomly on every page refresh / session start from an expanded category library so the sandbox feels fresh.
* **Interaction**: Tapping any chip injects the sample prompt into the input area with a subtle flash effect.

### 3. Auto-Expanding Text Canvas & Dynamic Character Counter
* **Styling**: Distraction-free textarea with a glowing emerald focus ring (`focus:ring-2 focus:ring-emerald-500`).
* **Character Counter**: Pinned to bottom-left (`[ Characters: 142 ]`). Displays pure character count without arbitrary limit text.

### 4. Smart Assist Pills (300ms Debounced Auto-Chips)
* **Location**: Pinned directly below text canvas.
* **Behavior**: When the user pauses typing for 300ms, 2–3 contextual completion pills appear (`[+ Add Golden Hour Lighting]`, `[+ Add TypeScript Types]`).

### 5. Tactile Primary CTA Button (**`"Architect My Prompt →"`**)
* **Styling**: High-contrast emerald button pinned to bottom-right.
* **Direct Transition**: Once backend processing completes, transitions directly to the output dashboard without artificial delays.

---

# PART II: DUAL-VIEW TRANSFORMATION DASHBOARD & CHATBOT SIMULATION (DESKTOP)

---

## 🖥️ A. Primary Output View (Draft & Architected Spec — 40/60 Split Real Estate)

```
+------------------------------------+---------------------------------------------+
| LEFT PANEL (40%): DRAFT & INSIGHTS | RIGHT PANEL (60%): ARCHITECTED SPEC ✨      |
+------------------------------------+---------------------------------------------+
| Circular Gauge: Score 84/100       | [ Copy Spec ]  [ Simulate AI Output ]      |
| Verdict: "B2B SaaS Cold Email"     |                                             |
| (No "Target: text" label)          | ```markdown                                 |
|                                    | Act as a Senior AI Solutions Architect...   |
| Dynamic Prompt-Specific Flaws:     | [CONTEXT & GOALS]                           |
| [!] No expert role assigned.       | Target explicit domain boundaries...        |
| [!] Missing cold call hook.        | ```                                         |
|                                    | [ Open & Refine in Studio → ]               |
+------------------------------------+---------------------------------------------+
```

1. **Left Panel (40% Width — Draft & Insights)**:
   * **Health Score Dial**: Circular SVG gauge (`Score 84/100`) counting up smoothly.
   * **Dynamic Task Verdict**: Displays a specific task title derived from the user's prompt (e.g. *"B2B SaaS Cold Email Spec"* instead of generic "Architected Spec").
   * **No "Target: text" Label**: Removed to avoid redundant visual clutter.
   * **Dynamic Prompt-Specific Flaws**: Displays exactly 2 punchy, input-specific flaws calculated dynamically by the backend engine (no repeated static hardcoded flaws).
2. **Right Panel (60% Width — Architected Spec ✨)**:
   * Master Architected Spec code block with syntax highlighting.
   * **No Redundant Header Badge**: The orange/amber `Needs Optimization (18/100)` badge in the top-right header is **removed** (score is already in the left audit dial).
   * **1-Click Copy Button**: Springs to **`"✓ Copied!"`**.
   * **In-Place Chatbot Simulation Trigger (`"Simulate AI Output"`)**: Transforms the existing Left & Right panels in-place into Chatbot View.
   * **Primary Studio Bridge**: **`"Open & Refine in Studio →"`** button pinned to bottom-right.

---

## 💬 B. Chatbot Simulation View (In-Place Transformation)

Clicking **`"Simulate AI Output"`** transforms the current Left & Right panels **in-place** into side-by-side AI Chatbot Conversation Threads:

```
+--------------------------------------------------+----------------------------------------------------+
| LEFT PANEL (40%): VANILLA CHATBOT SIMULATION     | RIGHT PANEL (60%): ARCHITECTED FRONTIER SIMULATION  |
+--------------------------------------------------+----------------------------------------------------+
|                               [ USER BUBBLE ] 👤 |                                 [ USER BUBBLE ] 👤 |
|                         "car driving down..."    |                 "Act as Senior Director. 4k..."    |
|                                                  |                                                    |
| 🤖 GENERIC LLM RESPONSE BUBBLE (Full Width):     | ❇️ FRONTIER AI RESPONSE BUBBLE (Full Width):        |
| (Dynamic Mediocre Baseline Output for User Input)| (Dynamic Structured High-Fidelity Output for Spec) |
| [Processing Indicator: ● ● ●]                    | [Processing Indicator: ● ● ●]                      |
|                                                  |                                                    |
|                                                  | [ Open & Refine in Studio → ]                     |
|                                                  | [ ← Back to Prompt Blueprint ]                     |
+--------------------------------------------------+----------------------------------------------------+
```

1. **In-Place Panel Transformation**: Replaces existing columns in-place (no separate modal popup or full-page jump).
2. **Typing & Processing Animation**: When simulation opens, a subtle 3-dot pulse (`● ● ●`) indicates the simulated model is receiving the prompt and generating its response.
3. **Dynamic Prompt-Tailored Responses**:
   * **Left Panel (40% — Vanilla AI Model)**: Generates a realistic, mediocre baseline response specifically answering the user's raw prompt (never static placeholder text about cars).
   * **Right Panel (60% — Frontier AI Model)**: Generates a structured, rich, high-yield response directly answering the master architected spec.
4. **"Open & Refine in Studio →" CTA Pinned**: Includes the primary `"Open & Refine in Studio →"` CTA button directly in the Simulation View so users can immediately jump into the Studio workspace.
5. **Return Button (`[ ← Back to Prompt Blueprint ]`)**: Flips back to the primary blueprint view in under 150ms.

---

# PART III: NAVIGATION MENU & APP INTEGRATION

### 1. Dropdown Tooltip Alignment Fix
* **Dropdown Alignment**: The navigation menu dropdown (`NavigationMenu.tsx`) opens cleanly **below** the menu button (`top-full right-0 mt-2`), maintaining proper z-index and padding so it **never covers** the Prompt Architect logo or Home button.

### 2. View Navigation Blank Screen Fix
* All views (`Home`, `Architect` / ChatInterface, `SavedPrompts`, `ChatHistory`, `TemplatesGallery`) render reliably with defensive error boundary fallbacks, preventing blank screen states when switching menu options.

---

# PART IV: LANDING PAGE STRUCTURE BELOW HERO (DESKTOP)

1. **Proof Through Examples**: Example cards displayed cleanly without redundant "Proof through examples" text header.
2. **"How Prompt Architect Works"**: Section removed.
3. **"Ready for new projects?" CTA**: Section removed to eliminate unnecessary page scroll.

---

## 📋 VERIFICATION & IMPLEMENTATION CHECKLIST

- [x] **Modality Selector Omitted**: Omitted manual modality selector pills from Hero Sandbox.
- [x] **Navigation Menu Fix**: Fixed dropdown alignment below menu button & eliminated view switching blank screens.
- [x] **Dynamic Flaws & Verdict**: Backend generates dynamic prompt-specific flaws & task titles. Removed "Target: text" label.
- [x] **Header Cleanup**: Removed redundant top-right score badge.
- [x] **Dynamic Inspiration Chips**: Chips rotate dynamically on load/refresh.
- [x] **In-Place Chatbot Simulation**: In-place panel transformation, typing indicator, dynamic simulated outputs, and `"Open & Refine in Studio →"` CTA.
- [x] **Landing Page Cleanup**: Removed redundant header text, "How it works", and bottom CTA section.
