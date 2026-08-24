# 🎨 PROMPT ARCHITECT — MASTER UI/UX DESIGN & COMPONENT SPECIFICATION

> **Authoritative UI/UX Design System, Micro-Interaction Architecture & Responsive Layout Blueprint**  
> *Synthesized from Approaches 1, 2, and 3 (Pages 1–309)*  
> *Visual Language: Dark Slate & Emerald Glassmorphism, Precision Micro-Animations, High-Contrast Typography, Tactile Physical States*

---

## 🏛️ DESIGN SYSTEM & VISUAL PERSONALITY

### 1. The Core UI Principle: "Precision + Intelligence + Momentum"
The UI design must feel like a **serious, high-tier intelligent tool** (inspired by the responsiveness of Duolingo and the sleek minimalism of Vercel/Linear), avoiding juvenile visual clutter like casino confetti or childish cartoons.

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

# PART I: HERO VIEWPORT & INPUT SANDBOX ARCHITECTURE

The hero section is **100% zero-scroll** (`h-screen` / `100dvh` `overflow-hidden`): the input sandbox acts as the hero itself so visitors can immediately test the engine without reading marketing fluff.

---

### A. Desktop View Specification (Widescreen Overview > 1024px)

```
+-------------------------------------------------------------------------+
| LOGO                                              [ Create Free Account ]|
+-------------------------------------------------------------------------+
| [ Try: SaaS Cold Email ]  [ Try: Python Refactor ]  [ Try: Cinema Shot ]|
| +---------------------------------------------------------------------+ |
| | Input Area: Auto-Expanding Textarea                                 | |
| | "e.g. Write a marketing plan for my sustainable shoe brand..."      | |
| |                                                                     | |
| | [ Quick Add: + Golden Hour Light ]  [ + 85mm Lens ]                 | |
| | [ Characters: 0 ]                        [ Architect My Prompt → ]  | |
| +---------------------------------------------------------------------+ |
| * Zero signup required. Instant structural prompt architecture.         |
+-------------------------------------------------------------------------+
```

1. **Inspiration Chips**: 3 horizontal pill buttons (`[Try: SaaS Cold Email]`, `[Try: Python Refactor]`, `[Try: Cinema Shot]`) pinned above the canvas. Rotates per visit/modal open.
2. **Text Canvas**: Auto-expanding textarea with glowing emerald focus ring (`focus:ring-2 focus:ring-emerald-500`).
3. **Character Counter**: Pinned bottom-left (`[ Characters: 0 ]`). Pure character count.
4. **Smart Assist Pills**: 300ms debounced auto-chips pinned bottom-left below canvas (`[+ Add Golden Hour Lighting]`).
5. **Tactile CTA Button**: Pinned bottom-right (**`"Architect My Prompt →"`**).

---

### B. Mobile View Specification (Touch-Optimized Viewports < 1024px)

```
+--------------------------------──────────+
| [⚡ PromptArchitect]        [ Sign In ]   | <-- Sticky Top Header Bar (h-14)
+--------------------------------──────────+
| [ SaaS Pitch ] [ Bug Fix ] [ Portrait ]  | <-- Touch-Scroll Inspiration Rail
+--------------------------------──────────+
| ┌──────────────────────────────────────┐ |
| │ Textarea: Auto-Height (140px-220px)  │ |
| │ "Type or paste your raw draft..."    │ |
| │                                      │ |
| │ [ Char: 28 ]         [ Paste Clip ]  │ |
| └──────────────────────────────────────┘ |
| Preset Assist Pills:                     |
| [+ Golden Hour Light] [+ 85mm Lens]      |
+--------------------------------──────────+
| [ STICKY BOTTOM THUMB-ZONE BAR ]         |
| [ ⚡ ARCHITECT MY PROMPT → ]             | <-- Fixed Bottom Tactile CTA
+--------------------------------──────────+
```

1. **Mobile Sticky Header Bar (`h-14`)**: Pinned to top with logo + `[ Sign In ]` button.
2. **Touch-Scroll Inspiration Rail**: Edge-to-edge horizontal scroll carousel (`overflow-x-auto no-scrollbar flex gap-2 py-1 px-3`) with subtle right fade gradient.
3. **Mobile Text Canvas**: Auto-height textarea (`min-h-[140px] max-h-[220px]`) optimized for virtual touch keyboards. Includes `[ Paste Clip ]` helper button.
4. **Mobile Assist Pills**: Edge-to-edge touch-scroll row beneath input box.
5. **Sticky Thumb-Zone CTA**: Fixed to absolute bottom of mobile screen above browser navigation bar: **`[ ⚡ ARCHITECT MY PROMPT → ]`** (full-width high-contrast button).

---

# PART II: THE SIGNATURE "TRANSFORMATION RITUAL" MICRO-INTERACTIONS

```
CLICK ──> ACKNOWLEDGE ──> ANTICIPATE ──> REVEAL ──> REWARD ──> CONTINUATION
 (0ms)      (0-300ms)     (300-1200ms)   (1.2-1.5s)  (1.5-2.0s)   (2.0s+)
```

### A. Desktop Transformation Micro-Interactions
1. **0-300ms**: Button contracts (`scale-95`), text changes to `"Architecting..."` with spinning refresh icon.
2. **300-1200ms**: Glowing emerald laser-line sweeps horizontally across text canvas. Status badges cycle: `Analyzing Intention...` → `Injecting Guardrails...` → `Building Blueprint...`.
3. **1200-1500ms**: Container smoothly transitions into the 40/60 Dual-View Transformation Dashboard.
4. **1500-2000ms**: Health Score gauge counts up smoothly (`15 → 42 → 68 → 84`).

---

### B. Mobile Transformation Micro-Interactions
1. **0-300ms**: Fixed bottom sticky CTA button contracts (`scale-95`), text changes to `"Architecting..."` with spinning pulse.
2. **300-1200ms**: Full-width laser scan pulse sweeps across the mobile textarea. Micro-status badge transitions smoothly above sticky bottom bar.
3. **1200-2000ms**: Deck automatically slides to Result View (`Tab 1: Master Spec ✨`) with zero page vertical scroll jumpiness.

---

# PART III: DUAL-VIEW TRANSFORMATION DASHBOARD & CHATBOT SIMULATION

---

### A. Desktop View Specification (40/60 Split Real Estate — Zero Scroll `100vh`)

```
+------------------------------------+---------------------------------------------+
| LEFT PANEL (40%): DRAFT & INSIGHTS | RIGHT PANEL (60%): ARCHITECTED SPEC ✨      |
+------------------------------------+---------------------------------------------+
| Circular Gauge: Score 84/100       | [ Copy Spec ]  [ Simulate AI Output ]      |
| Verdict: 🚀 Strong Foundation       |                                             |
|                                    | ```markdown                                 |
| Flagged Gaps (1-Sentence Plain):   | Act as a Senior AI Solutions Architect...   |
| [!] No expert role assigned.       | [CONTEXT & GOALS]                           |
| [!] Missing lens specs & lighting. | Target explicit domain boundaries...        |
|                                    | ```                                         |
|                                    | [ Open & Refine in Studio → ]               |
+------------------------------------+---------------------------------------------+
```

1. **Left Panel (40%)**: Circular progress gauge + Quality Badge + exactly 2 punchy 1-sentence flaw badges in simple English.
2. **Right Panel (60%)**: Master Architected Spec code block + 1-Click Copy button + `"Simulate AI Response Preview"` button.
3. **In-Place Chatbot Simulation (Desktop)**:
   * Tapping `"Simulate AI Response Preview"` transforms both columns in-place into side-by-side Chatbot Conversation Threads:
     * **Left Column (40%)**: Right-aligned User Bubble (raw draft, 3-line truncated) + Left-aligned Vanilla AI Response Bubble (full width).
     * **Right Column (60%)**: Right-aligned User Bubble (architected spec, 3-line truncated) + Left-aligned Frontier AI Response Bubble (full width).
     * **Return Button**: `[ ← Back to Prompt Blueprint ]` flips both columns back in under 150ms.

---

### B. Mobile View Specification (Segmented `100dvh` Deck — Zero Scroll)

On mobile viewports (< 1024px), vertical stacking is eliminated to maintain **zero-scroll bounds (`h-[100dvh] overflow-hidden`)** via a **3-Tab Segmented Control Deck**:

```
+--------------------------------──────────────────+
| 📱 MOBILE HEADER: AUDIT SCORE 84/100 (Strong)    | <-- Sticky Top Score Bar
+--------------------------------------------------+
| [ Master Spec ✨ ] [ Insights ] [ AI Simulation ]| <-- Segmented Deck Tabs
+--------------------------------------------------+
| (Active: Tab 3 — AI Simulation)                  |
|                                                  |
| 💬 CONTINUOUS VERTICALLY SCROLLABLE CHAT THREAD  |
|                                                  |
|                               [ USER BUBBLE ] 👤 | <-- Right-Aligned User Bubble
|                         "car driving down..."    | (Truncated at 3 lines)
|                                                  |
| 🤖 GENERIC LLM RESPONSE BUBBLE (Full Width):     | <-- Left-Aligned Full Width
| "Here is a basic overview of a car driving..."   |
|                                                  |
| ─── ⚡ PROMPT ARCHITECT TRANSFORMED ──────────── | <-- Divider Line
|                                                  |
|                               [ USER BUBBLE ] 👤 | <-- Right-Aligned User Bubble
|            "Act as Senior Director. 4k 60fps..." | (Truncated at 3 lines)
|                                                  |
| ❇️ FRONTIER AI RESPONSE BUBBLE (Full Width):      | <-- Left-Aligned Full Width
| "1. SCENE DIRECTION: Volumetric golden hour..."  |
|                                                  |
+--------------------------------------------------+
| [ ← Back to Master Spec ]                        | <-- Sticky Bottom CTA Bar
+--------------------------------------------------+
```

#### Detailed Mobile Tab & Chatbot Thread Specifications:
1. **Header Sticky Bar**: Displays `AUDIT SCORE: 84/100` + Quality Badge (`S-Tier`, `Production Ready`, `Needs Optimization`, `Weak Draft`).
2. **Segmented Deck Navigation Tabs**:
   * **`[Tab 1: Master Spec ✨]`**: Displays complete Architected Spec code container + Copy Spec button + sticky bottom CTA `[ Open in Studio → ]`.
   * **`[Tab 2: Insights]`**: Displays circular SVG Health Score gauge + 2 punchy 1-sentence flaw badges.
   * **`[Tab 3: AI Simulation]`**: Displays a **continuous, vertically scrollable Chatbot Conversation Thread**:
     * **Message 1 (Raw User Draft)**: Right-aligned user chat bubble (`ml-auto max-w-[85%] bg-slate-800 text-slate-100 rounded-2xl rounded-tr-xs p-3.5 text-xs shadow-sm`), truncated at 3 lines with subtle gradient mask.
     * **Message 2 (Vanilla AI Response)**: Left-aligned full-width assistant response bubble (`w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed shadow-sm`).
     * **Divider Line**: `─── ⚡ PROMPT ARCHITECT TRANSFORMED ───`
     * **Message 3 (Architected Spec ✨)**: Right-aligned user chat bubble (`ml-auto max-w-[85%] bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-2xl rounded-tr-xs p-3.5 text-xs font-mono shadow-sm`), truncated at 3 lines.
     * **Message 4 (Frontier AI Response ✨)**: Left-aligned full-width assistant response bubble (`w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-200 leading-relaxed shadow-sm`).
3. **Seamless Custom Scrollbar**: Uses an ultra-subtle, seamless custom scrollbar (`scrollbar-none` or `scrollbar-thin scrollbar-thumb-slate-800/40 scrollbar-track-transparent`) on Tab 3 so scrolling through the thread is 100% smooth, frictionless, and keeps full focus on the prompt & response contrast!
4. **Sticky Bottom Bar**: Pinned to bottom of Tab 3: **`[ ← Back to Master Spec ]`**.

---

# PART IV: 4TH ATTEMPT INTERACTIVE PAYWALL INTERCEPT

### 1. 3 Free Daily Audits Rule (Backend Registered)
* **Daily Allowance**: Every anonymous visitor receives **3 free daily audits** tracked via composite hardware device fingerprinting in the SQLite `visitors` and `prompt_audits` tables.
* **Audits 1, 2, and 3**: Run 100% free with full score dials, insights, and unlocked Architected Specs.
* **Audit 4 (The Intercept Trigger)**: On the **4th audit attempt of the day**, the backend API (`/api/audit/compile`) sets `isPaywallTriggered: true`, activating the interactive paywall intercept.

---

### A. Desktop Paywall Intercept View
* The **Right Column (60% Output Panel)** renders the frosted-glass overlay (`backdrop-filter: blur(12px)`) directly over the compiled prompt block.
* **Mid-Transformation Tease**: Drops midway through the transformation ritual as the user sees their prompt actively taking shape right before their eyes.
* **Auth Card Controls**: `[ Continue with Google ]` and `[ Continue with Email ]`.

---

### B. Mobile Paywall Intercept View

```
+--------------------------------------------------+
| 📱 MOBILE HEADER: AUDIT SCORE 18/100 (Weak)      |
+--------------------------------------------------+
| 🔒 FROSTED GLASS OVERLAY (backdrop-filter: blur) |
|                                                  |
| Your raw draft was diagnosed and upgraded into a |
| master-level spec!                               |
|                                                  |
| You have used your 3 free daily audits today.    |
| Save your history & unlock instantly for free.   |
|                                                  |
| [ Continue with Google ]  [ Continue with Email ]|
|                                                  |
+--------------------------------------------------+
| [ 🔒 UNLOCK FULL PROMPT FOR FREE ]               | <-- Sticky Bottom CTA Bar
+--------------------------------------------------+
```

1. **Frosted-Glass Overlay (`blur(12px)`)**: Covers Tab 1 (Master Spec) and Tab 3 (AI Simulation) midway through the transformation animation.
2. **Mobile Auth Card**: Displays locked summary + `[ Continue with Google ]` and `[ Continue with Email ]` buttons.
3. **Mobile Sticky Bottom Bar**: Transforms into a high-contrast unlock button: **`[ 🔒 UNLOCK FULL PROMPT FOR FREE ]`**.
4. **Direct Sign-In Shortcuts**: Google and Email buttons redirect to the sign-in page, authenticate, and return the user directly to their unlocked workspace.

---

# PART V: LANDING PAGE STRUCTURE BELOW THE HERO

Below the zero-scroll hero viewport, the landing page provides proof, trust signals, and workspace teasers:

### A. Desktop View Specification (Multi-Column Grid)
1. **Proof Through Examples**: 3-column grid of interactive Before/After cards categorized by user role (`Developer`, `Creator`, `Student`, `Business Owner`).
2. **"How It Helps" Simple Explanation**: 3-column visual narrative: Messy Idea → Precision Engine → Production Spec.
3. **Workspace Preview**: 2-column layout showing prompt versioning trees (`v1` → `v2` → `v3`).
4. **Privacy & Trust Signals**: Centered privacy badge (`"Private by default. Never used for public training."`).
5. **Repeat Hero Final CTA**: Full-width input sandbox at bottom of page.

---

### B. Mobile View Specification (Single-Column Touch Stack)
1. **Proof Through Examples**: Single-column touch-swipe card carousel with pagination dots.
2. **"How It Helps" Simple Explanation**: Vertical 3-step stacked cards.
3. **Workspace Preview**: Single-column stacked version tree preview.
4. **Privacy & Trust Signals**: Full-width touch card.
5. **Repeat Hero Final CTA**: Full-width mobile input sandbox with sticky bottom CTA.

---

## 📋 VERIFICATION & IMPLEMENTATION CHECKLIST

- [x] **Right-Aligned User Bubbles**: User chat bubble aligned right (`ml-auto`), truncated at 3-4 lines; AI Assistant bubble aligned left across full panel width.
- [x] **Mobile Chatbot Deck (Tab 3)**: Continuous vertically scrollable chat thread showing Raw Draft User Bubble → Vanilla AI Response → Divider → Architected Spec User Bubble → Frontier AI Response, with seamless custom scrollbar.
- [x] **Explicit Mobile Specs Across All Parts**: Part I (Mobile Header + Touch Rail + Sticky CTA), Part II (Mobile Scan Pulse), Part III (Mobile 3-Tab Deck), Part IV (Mobile Frosted Glass & Sticky Unlock CTA), Part V (Mobile Single-Column Stack).
- [x] **Backend 3 Free Audits**: SQLite `visitors` and `prompt_audits` daily count check triggering `isPaywallTriggered: true` on attempt 4.
- [x] **Mid-Transformation Paywall Tease**: Paywall drops midway through the transformation animation as the prompt is actively taking shape.
- [x] **Zero-Scroll Viewport**: Bounded in `100vh` (Desktop) and `100dvh` (Mobile).
