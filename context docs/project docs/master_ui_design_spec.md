# 🎨 PROMPT ARCHITECT — MASTER UI/UX DESIGN & COMPONENT SPECIFICATION

> **Authoritative UI/UX Design System, Micro-Interaction Architecture & Full Responsive Layout Blueprint**  
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
| [⚡ PromptArchitect]                               [ Create Free Account ]|
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

#### Desktop Component Details:
1. **Dynamic Inspiration Chips**: 3 horizontal pill buttons (`[Try: SaaS Cold Email]`, `[Try: Python Refactor]`, `[Try: Cinema Shot]`) pinned directly above the canvas. Rotates per visit/modal open.
2. **Text Canvas**: Auto-expanding textarea with glowing emerald focus ring (`focus:ring-2 focus:ring-emerald-500`).
3. **Character Counter**: Pinned bottom-left (`[ Characters: 0 ]`). Pure character count.
4. **Smart Assist Pills**: 300ms debounced auto-chips pinned bottom-left below canvas (`[+ Add Golden Hour Lighting]`).
5. **Tactile Primary CTA Button**: High-contrast emerald button pinned to bottom-right (**`"Architect My Prompt →"`**).

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

#### Mobile Component Details:
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

---

### A. Desktop Transformation Micro-Interactions
1. **0ms to 300ms (Acknowledge)**: Button contracts (`scale-95`), text changes to `"Architecting..."` with spinning refresh icon.
2. **300ms to 1200ms (Anticipate & Laser Scan Pulse)**: Glowing emerald laser-line sweeps horizontally across text canvas. Status badges cycle: `Analyzing Intention...` → `Injecting Guardrails...` → `Building Blueprint...`.
3. **1200ms to 1500ms (Result Reveal)**: Container smoothly transitions into the 40/60 Dual-View Transformation Dashboard.
4. **1500ms to 2000ms (Count-Up Score Reveal)**: Health Score gauge counts up smoothly (`15 → 42 → 68 → 84`).

---

### B. Mobile Transformation Micro-Interactions
1. **0ms to 300ms (Acknowledge)**: Fixed bottom sticky CTA button contracts (`scale-95`), text changes to `"Architecting..."` with spinning pulse.
2. **300ms to 1200ms (Anticipate & Laser Scan Pulse)**: Full-width laser scan pulse sweeps across the mobile textarea. Micro-status badges cycle smoothly above sticky bottom bar.
3. **1200ms to 2000ms (Result Reveal)**: Deck automatically slides to Result View (`Tab 1: Master Spec ✨`) with zero page vertical scroll jumpiness.

---

# PART III: DUAL-VIEW TRANSFORMATION DASHBOARD & CHATBOT SIMULATION

---

## 🖥️ A. DESKTOP VIEW SPECIFICATION (40/60 Split Real Estate — Zero Scroll `100vh`)

On desktop, the transformation dashboard renders as a side-by-side 40/60 split container bounded inside `100vh`.

### Desktop Sub-View 1: Draft & Architected Spec View (Primary Output)

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

* **Left Panel (40%)**: Circular SVG progress gauge + Quality Badge + exactly 2 punchy 1-sentence flaw badges in simple English.
* **Right Panel (60%)**: Master Architected Spec code block + 1-Click Copy button + `"Simulate AI Response Preview"` button.

---

### Desktop Sub-View 2: Chatbot Simulation View (In-Place Transformation)

When the user taps **`"Simulate AI Response Preview"`**, both desktop columns transform in-place into side-by-side Chatbot Threads:

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

1. **Left Panel (40% Width — Vanilla AI Simulation)**:
   * **User Chat Bubble (Right-Aligned)**: `ml-auto max-w-[85%] bg-slate-800 text-slate-100 rounded-2xl rounded-tr-xs p-3 text-xs shadow-sm`. Truncated at 3 lines with gradient mask.
   * **Assistant Response Bubble (Left-Aligned, Full Width)**: `w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed shadow-sm`. Generic LLM Avatar.
2. **Right Panel (60% Width — Frontier Architected Simulation)**:
   * **User Chat Bubble (Right-Aligned)**: `ml-auto max-w-[85%] bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-2xl rounded-tr-xs p-3 text-xs font-mono shadow-sm`. Truncated at 3 lines.
   * **Assistant Response Bubble (Left-Aligned, Full Width)**: `w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-200 leading-relaxed shadow-sm`. Glowing Emerald Avatar.
3. **Return Toggle (`[ ← Back to Prompt Blueprint ]`)**: Flips both columns back to Sub-View 1 in under 150ms.

---

## 📱 B. MOBILE TOUCH DECK SPECIFICATION (3-Tab Swipeable Deck — Zero Scroll `100dvh`)

On mobile viewports (< 1024px), vertical page scrolling is eliminated (`h-[100dvh] overflow-hidden`). The interface renders a **3-Tab Segmented Control Deck** that supports **both tap selection AND horizontal touch swipe gestures**.

---

### Mobile Tab 1: Master Spec ✨ (Primary Output View)

```
+--------------------------------──────────────────+
| 📱 MOBILE HEADER: AUDIT SCORE 84/100 (Strong)    | <-- Sticky Top Score Bar
+--------------------------------------------------+
| [(•) Master Spec ✨] [ Insights ] [ Simulation ] | <-- Segmented Deck Tabs (Swipeable)
+--------------------------------────────────────--+
| (Active: Tab 1 — Master Spec ✨)                 |
|                                                  |
| ```markdown                                      |
| Act as a Senior AI Solutions Architect...        |
| [CONTEXT & GOALS]                                |
| Target explicit domain boundaries...             |
| ```                                              |
|                                                  |
| [ Copy Spec ]                                    |
+--------------------------------────────────────--+
| [ OPEN & REFINE IN STUDIO → ]                    | <-- Sticky Bottom CTA
+--------------------------------------------------+
```

---

### Mobile Tab 2: Insights & Flaw Badges View

```
+--------------------------------──────────────────+
| 📱 MOBILE HEADER: AUDIT SCORE 84/100 (Strong)    | <-- Sticky Top Score Bar
+--------------------------------------------------+
| [ Master Spec ✨ ] [(•) Insights] [ Simulation ] | <-- Segmented Deck Tabs (Swipeable)
+--------------------------------------------------+
| (Active: Tab 2 — Insights & Flaws)               |
|                                                  |
|              ╭───────────────╮                   |
|              │  SCORE 84/100 │                   | <-- Circular SVG Health Gauge
|              ╰───────────────╯                   |
|                                                  |
| [!] No expert persona assigned.                  | <-- 1-Sentence Flaw Badge 1
| [!] Missing lens specs & camera angle.           | <-- 1-Sentence Flaw Badge 2
|                                                  |
+--------------------------------------------------+
| [ OPEN & REFINE IN STUDIO → ]                    | <-- Sticky Bottom CTA
+--------------------------------------------------+
```

---

### Mobile Tab 3: AI Simulation Chat Thread View (Vertically Scrollable Thread)

```
+--------------------------------──────────────────+
| 📱 MOBILE HEADER: AUDIT SCORE 84/100 (Strong)    | <-- Sticky Top Score Bar
+--------------------------------------------------+
| [ Master Spec ✨ ] [ Insights ] [(•) Simulation] | <-- Segmented Deck Tabs (Swipeable)
+--------------------------------------------------+
| (Active: Tab 3 — AI Simulation Thread)           |
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
| [ ← BACK TO MASTER SPEC ]                        | <-- Sticky Bottom CTA
+--------------------------------------------------+
```

#### Mobile Touch Deck Rules & Swipe Gesture Specs:
1. **Lightning-Fast Horizontal Touch Swipe**: Swiping left or right anywhere on the viewport smoothly transitions between **Tab 1 (`Master Spec ✨`)**, **Tab 2 (`Insights`)**, and **Tab 3 (`AI Simulation`)** using fluid spring physics (`type: "spring", stiffness: 500, damping: 35`).
2. **Tab 3 Vertically Scrollable Chat Thread**: Tab 3 renders a continuous vertically scrollable conversation thread with Message 1 (Raw Prompt User Bubble) → Message 2 (Vanilla AI Response) → Divider → Message 3 (Architected Spec User Bubble) → Message 4 (Frontier AI Response).
3. **Seamless Custom Scrollbar**: Text containers use an ultra-subtle, seamless custom scrollbar (`scrollbar-none` or `scrollbar-thin scrollbar-thumb-slate-800/40`) so scrolling through the thread is 100% smooth, frictionless, and keeps full attention on the prompt & response contrast.

---

# PART IV: 4TH ATTEMPT INTERACTIVE PAYWALL INTERCEPT

### 1. 3 Free Daily Audits Rule (Backend Registered)
* **Daily Allowance**: Every anonymous visitor receives **3 free daily audits** tracked via composite hardware device fingerprinting in SQLite `visitors` and `prompt_audits` tables.
* **Audits 1, 2, and 3**: Run 100% free with full score dials, insights, and unlocked Architected Specs.
* **Audit 4 (The Intercept Trigger)**: On the **4th audit attempt of the day**, the backend API (`/api/audit/compile`) sets `isPaywallTriggered: true`, activating the interactive paywall intercept.

---

### A. Desktop Paywall Intercept View (Widescreen > 1024px)

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

* **Frosted-Glass Overlay (`blur(12px)`)**: Covers the Right Column (60% Output Panel) midway through the transformation animation as the user sees their prompt actively taking shape right before their eyes.
* **Auth Card Controls**: `[ Continue with Google ]` and `[ Continue with Email ]`.

---

### B. Mobile Paywall Intercept View (Touch Viewports < 1024px)

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

- [x] **100% Equal Fullness & Parity**: Desktop AND Mobile specifications and ASCII diagrams explicitly detailed for Part I, Part II, Part III, Part IV, and Part V.
- [x] **Mobile Tab 1 (Master Spec ✨)**: ASCII diagram + full-width code container + Copy button + sticky bottom CTA.
- [x] **Mobile Tab 2 (Insights)**: ASCII diagram + circular SVG progress gauge + 2 punchy 1-sentence flaw badges.
- [x] **Mobile Tab 3 (AI Simulation)**: ASCII diagram + continuous vertically scrollable chat thread (Raw Draft User Bubble → Vanilla AI Response → Divider → Architected Spec User Bubble → Frontier AI Response) + seamless custom scrollbar.
- [x] **Desktop Simulation Sub-View**: ASCII diagram showing Left Column (Vanilla AI Run) + Right Column (Frontier Architected Spec Run) + `[← Back to Prompt Blueprint]` return toggle.
- [x] **Frictionless Touch Swipe Gestures**: Horizontal swipe gestures supported across Mobile Deck Tab 1, Tab 2, and Tab 3.
- [x] **Backend 3 Free Audits**: SQLite `visitors` and `prompt_audits` daily count check triggering `isPaywallTriggered: true` on attempt 4.
- [x] **Zero-Scroll Viewport**: Bounded in `100vh` (Desktop) and `100dvh` (Mobile).
