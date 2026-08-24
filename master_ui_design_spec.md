# 🎨 PROMPT ARCHITECT — MASTER UI/UX DESIGN & COMPONENT SPECIFICATION

> **Authoritative UI/UX Design System, Micro-Interaction Architecture & Layout Blueprint**  
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

The hero section is **100% zero-scroll**: the input sandbox acts as the hero itself so visitors can immediately test the engine without reading marketing fluff.

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

### 1. Dynamic Inspiration Chips (Rotates Per Visit / Modal Open)
* **Location**: Pinned directly above the text canvas.
* **Behavior**: 3 horizontal pill buttons (`[Try: SaaS Cold Email]`, `[Try: Python Refactor]`, `[Try: Cinema Shot]`).
* **Dynamic Refresh Rule**: The 3 chips dynamically rotate from a preset library every time the modal/auditor is opened or a new visit begins. They remain locked/pinned during an active typing session to avoid user distraction.
* **Micro-Interaction**: Tapping any chip injects a weak prompt into the input area with a subtle flash effect, allowing 1-click testing.

### 2. Auto-Expanding Text Canvas & Dynamic Character Counter
* **Styling**: Distraction-free textarea with a glowing emerald focus ring (`focus:ring-2 focus:ring-emerald-500`).
* **Character Counter**: Pinned to the bottom-left of the input container (`[ Characters: 142 ]`). Displays pure character count without arbitrary limit text.

### 3. Smart Assist Pills (300ms Debounced Auto-Chips)
* **Location**: Pinned directly below the text canvas.
* **Behavior**: When the user pauses typing for 300ms, 2–3 contextual completion pills appear (`[+ Add Golden Hour Lighting]`, `[+ Add TypeScript Types]`).
* **Interaction**: Tapping any pill appends the detail into the text canvas with smooth spring animation.

### 4. Tactile Primary CTA Button (**`"Architect My Prompt →"`**)
* **Styling**: High-contrast emerald button pinned to the bottom-right of the input frame.
* **Hover State**: Subtle scale (`hover:scale-[1.02]`) with glowing emerald backdrop blur.

---

# PART II: THE SIGNATURE "TRANSFORMATION RITUAL" MICRO-INTERACTIONS

When the user clicks **`"Architect My Prompt →"`**, the interface executes a 6-stage emotional interaction arc:

```
CLICK ──> ACKNOWLEDGE ──> ANTICIPATE ──> REVEAL ──> REWARD ──> CONTINUATION
 (0ms)      (0-300ms)     (300-1200ms)   (1.2-1.5s)  (1.5-2.0s)   (2.0s+)
```

### Detailed Micro-Interaction Sequence

1. **0ms to 300ms (Acknowledge)**:
   * The button contracts slightly (`scale-95`), the text changes to **`"Architecting..."`**, and a spinning refresh pulse begins inside the button. No dead screen.

2. **300ms to 1200ms (Anticipate & Laser Scan Pulse)**:
   * The input box subtly contracts (`scale-[0.99]`).
   * A horizontal glowing emerald laser-line animation sweeps across the text box.
   * Micro-badges cycle smoothly across the status bar:
     * `Analyzing Intention...` → `Injecting Guardrails...` → `Building Blueprint...`

3. **1200ms to 1500ms (Result Reveal)**:
   * The container smoothly transitions into the **Dual-View Transformation Dashboard**.
   * The prompt card settles smoothly with zero outer vertical page jumpiness (`transition={{ ease: [0.16, 1, 0.3, 1] }}`).

4. **1500ms to 2000ms (Count-Up Score Reveal & Micro-Reward)**:
   * The Health Score gauge counts up smoothly from 0 to the calculated score over 600ms (`15 → 42 → 68 → 84`).
   * The score badge lights up in emerald, blue, amber, or pink depending on the quality tier.

5. **2000ms+ (Continuation & Studio Bridge)**:
   * The **`"Open & Refine in Studio →"`** primary conversion CTA highlights, inviting the user to step into the full product.

---

# PART III: DUAL-VIEW TRANSFORMATION DASHBOARD & CHATBOT SIMULATION

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

### 1. Desktop Layout (40/60 Split Real Estate — Zero Scroll `100vh`)
* **Left Panel (40%) — Draft & Insights**:
  * Circular progress gauge with count-up score animation.
  * Quality tier badge (`S-Tier`, `Production Ready`, `Needs Optimization`, `Weak Draft`).
  * **1-Sentence Plain English Insights**: Exactly 2 punchy 1-sentence flaw badges in simple English.
* **Right Panel (60%) — Architected Spec ✨**:
  * High-density code block rendering the master-level transformed prompt with syntax highlighting.
  * **1-Click Copy Button**: Springs to **`"✓ Copied!"`** with a green checkmark for 1.5 seconds.
  * **In-Place Chatbot Simulation Trigger (`"Simulate AI Response Preview"`)**: Tapping this button transforms both panels in-place into realistic chatbot threads (see Section 2 below).

---

### 2. Authentic Chatbot Conversation Simulation Viewport (Desktop 40/60 Split)

When the user taps **`"Simulate AI Response Preview"`**, the 2-column split board transforms in-place into **two side-by-side Chatbot Conversation Threads** styled like an authentic AI interface:

```
+--------------------------------------------------+----------------------------------------------------+
| LEFT PANEL (40%): VANILLA CHATBOT SIMULATION     | RIGHT PANEL (60%): ARCHITECTED FRONTIER SIMULATION  |
+--------------------------------------------------+----------------------------------------------------+
|                               [ USER BUBBLE ] 👤 |                                 [ USER BUBBLE ] 👤 |
|                         "car driving down..."    |                 "Act as Senior Director. 4k..."    |
|                                                  |                                                    |
| 🤖 GENERIC LLM RESPONSE BUBBLE (Full Width):     | ❇️ FRONTIER AI RESPONSE BUBBLE (Full Width):        |
| "Here is a basic overview of a car driving down  | "1. SCENE DIRECTION: Volumetric golden hour light, |
| a road. The car moves along the street..."       | 85mm lens, 4k 60fps stable tracking..."           |
|                                                  |                                                    |
|                                                  | [ ← Back to Prompt Blueprint ]                     |
+--------------------------------------------------+----------------------------------------------------+
```

#### Authentic Chatbot Bubble Alignment & Layout Rules:
1. **User Prompt Bubble**: Aligned to the **RIGHT** (`ml-auto max-w-[85%] bg-slate-800 text-slate-100 rounded-2xl rounded-tr-xs p-3 text-xs shadow-sm`). Cleanly truncated at 3 to 4 lines with a subtle gradient fade mask.
2. **AI Assistant Response Bubble**: Aligned from the **LEFT across the full panel width** (`w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed shadow-sm`).
3. **Left Panel (40% Width — Vanilla AI Simulation)**:
   * Right-aligned User Bubble: Truncated raw draft prompt (`">_ car driving down a street..."`).
   * Left-aligned Assistant Bubble: Generic LLM Bot Avatar + mediocre, un-guarded response.
4. **Right Panel (60% Width — Frontier Architected Simulation)**:
   * Right-aligned User Bubble: Truncated Architected Master Spec ✨ (`"Act as Senior Film Director..."`).
   * Left-aligned Assistant Bubble: Glowing Emerald Frontier AI Avatar + structured, high-yield response.
5. **Sticky Return Button (`[ ← Back to Prompt Blueprint ]`)**: Pinned to the panel. Tapping it smoothly flips both columns back to the Draft & Architected Spec view in under 150ms!

---

### 3. Mobile Transformation & Chatbot Simulation Deck Layout (`100dvh` Zero Scroll)

On mobile viewports (< 1024px), vertical stacking is eliminated to maintain zero-scroll bounds (`h-[100dvh] overflow-hidden`). The mobile interface renders a **3-Tab Segmented Control Deck**:

```
+--------------------------------──────────────────+
| 📱 MOBILE HEADER: AUDIT SCORE 84/100 (Strong)    |
+--------------------------------------------------+
| [ Master Spec ✨ ] [ Insights ] [ AI Simulation ]| <-- Segmented Deck Tabs
+--------------------------------------------------+
| (Active: Tab 3 — AI Simulation)                  |
|                                                  |
|   [ (•) Vanilla AI Response ]  [ Frontier Spec ]  | <-- Segmented Output Switcher
|                                                  |
|                               [ USER BUBBLE ] 👤 |
|                         "car driving down..."    |
|                                                  |
| 🤖 GENERIC LLM RESPONSE BUBBLE (Full Width):     |
| "Here is a basic overview of a car driving..."   |
|                                                  |
+--------------------------------------------------+
| [ ← Back to Master Spec ]                        | <-- Sticky Bottom CTA
+--------------------------------──────────────────+
```

#### Detailed Mobile Tab Anatomy:
* **Header Sticky Bar**: Displays `AUDIT SCORE: 84/100` + Quality Badge.
* **`[Tab 1: Master Spec ✨]`**: Displays the complete Architected Spec code block with 1-click Copy button and `"Open in Studio →"` CTA.
* **`[Tab 2: Insights]`**: Displays the circular Health Score gauge and the 2 punchy 1-sentence flaw badges.
* **`[Tab 3: AI Simulation]`**: 
  * Features a top Segmented Toggle: `[ (•) Vanilla AI Response ]` | `[ Frontier Architected Spec ✨ ]`.
  * Selecting **Vanilla AI Response** renders the right-aligned truncated raw draft bubble + left-aligned generic LLM response.
  * Selecting **Frontier Architected Spec ✨** renders the right-aligned truncated master spec bubble + left-aligned pristine Frontier AI response.
  * Sticky bottom CTA bar: `[ ← Back to Master Spec ]`.

---

# PART IV: 4TH ATTEMPT INTERACTIVE PAYWALL INTERCEPT

### 1. 3 Free Daily Audits Rule (Backend Registered)
* **Daily Allowance**: Every anonymous visitor receives **3 free daily audits** tracked via composite hardware device fingerprinting in the SQLite `visitors` and `prompt_audits` tables.
* **Audits 1, 2, and 3**: Run 100% free with full score dials, insights, and unlocked Architected Specs.
* **Audit 4 (The Intercept Trigger)**: On the **4th audit attempt of the day**, the backend API (`/api/audit/compile`) sets `isPaywallTriggered: true`, activating the interactive paywall intercept.

### 2. Mid-Transformation Tease Intercept Rule (Psychological Tease)
* **Text Canvas Unlocked**: The user is **NEVER** blocked from typing or pasting their raw draft on attempt 4.
* **Mid-Transformation Reveal & Tease**: When the user clicks **`"Architect My Prompt →"`** on Attempt 4:
  1. The system executes its signature transformation ritual (laser scan sweeps, score dial counts up, and the master prompt begins taking shape in front of their eyes).
  2. **Midway through the transformation**, as the user sees their prompt actively being upgraded and taking shape, the **Frosted-Glass Intercept Layer (`backdrop-filter: blur(12px)`)** drops over the output!
* **UX Rationale**: Seeing the masterpiece taking shape right before it frosts over creates an irresistible visual proof that the upgraded prompt is ready beneath the glass.

```
+-------------------------------------------------------------------------+
|                              🔒 PROMPT ARCHITECTED                       |
|                                                                         |
| Your raw draft was diagnosed and upgraded into a master-level spec!      |
|                                                                         |
| You have used your 3 free daily audits for today. Save your prompt       |
| history & unlock your result instantly for free.                        |
|                                                                         |
|         [ Continue with Google ]        [ Continue with Email ]         |
+-------------------------------------------------------------------------+
```

### 3. Direct Sign-In Shortcut Navigation & Return Redirect
* The auth options **`[ Continue with Google ]`** and **`[ Continue with Email ]`** act as direct shortcuts to our sign-in page.
* **Authentication Redirection Flow**:
  1. User clicks **`"Architect My Prompt →"`** on Attempt 4.
  2. The transformation ritual begins, and midway through taking shape, the frosted-glass intercept displays the locked prompt summary.
  3. User clicks `[ Continue with Google ]` or `[ Continue with Email ]`.
  4. User is directed to the sign-in page to authenticate.
  5. Upon completing sign-in, the user is redirected right back to their active workspace with their 4th audit unlocked and their prompt history synced to their account!

---

# PART V: LANDING PAGE STRUCTURE BELOW THE HERO

Below the zero-scroll hero viewport, the landing page provides proof, trust signals, and workspace teasers:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. PROOF THROUGH EXAMPLES                                             │
│    Interactive Before/After transformation cards categorized by user  │
│    types (Creator, Developer, Student, Business Owner).                │
├────────────────────────────────────────────────────────────────────────┤
│ 2. "HOW IT HELPS" SIMPLE EXPLANATION                                  │
│    3-step visual story: Messy Idea ──> Precision Engine ──> AI Result.│
├────────────────────────────────────────────────────────────────────────┤
│ 3. INTERACTIVE WORKSPACE PREVIEW                                      │
│    Visual teaser showing prompt versioning trees (v1 -> v2 -> v3).    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. PRIVACY & TRUST SIGNALS                                            │
│    Privacy badges ("Private by default") & non-invasive note:         │
│    "Free to try. Save history when you need version trees."           │
├────────────────────────────────────────────────────────────────────────┤
│ 5. REPEAT HERO FINAL CTA                                              │
│    Repeats the input sandbox at the bottom: "Got something messy? Try"│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 VERIFICATION & IMPLEMENTATION CHECKLIST

- [x] **Right-Aligned User Bubbles**: User prompt bubble aligned right (`ml-auto`), truncated at 3-4 lines; AI Assistant bubble aligned left across full panel width.
- [x] **Mobile Chatbot Deck**: Tab 3 (AI Simulation) with top toggle (`Vanilla` vs `Frontier Spec`) and `[← Back to Master Spec]` bottom bar.
- [x] **Backend 3 Free Audits**: SQLite `visitors` and `prompt_audits` daily count check triggering `isPaywallTriggered: true` on attempt 4.
- [x] **Mid-Transformation Paywall Tease**: Paywall drops midway through the transformation animation as the prompt is actively taking shape.
- [x] **Zero-Scroll Viewport**: Bounded in `100vh` (Desktop) and `100dvh` (Mobile).
