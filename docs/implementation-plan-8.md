# Phase 8: Final QA, Accessibility, SEO Meta Tags, Production Build

> **Goal:** The final phase. Audit accessibility (aria labels, focus management, color contrast), add complete SEO meta tags, run the production build, and perform a comprehensive end-to-end QA pass.

> **Prerequisite:** Phase 7 is complete. The app is fully functional and polished.

---

## Step 1: Accessibility Audit and Fixes

### 1.1 — Add visible focus styles for keyboard navigation

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/index.css`

**ADD** this rule inside the `@layer base` block:

```css
  /* Visible focus ring for keyboard users (not mouse users) */
  :focus-visible {
    outline: 2px solid #D4A853;
    outline-offset: 2px;
  }

  /* Remove default focus ring for mouse users */
  :focus:not(:focus-visible) {
    outline: none;
  }
```

### 1.2 — Add `role` and `aria-valuenow` to the BPM slider

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/BpmDisplay.tsx`

**MODIFY** the range input. Add the following attributes:

```tsx
<input
  type="range"
  min={MIN_BPM}
  max={MAX_BPM}
  value={masterBpm}
  onChange={(e) => setMasterBpm(Number(e.target.value))}
  aria-label="Master BPM slider"
  aria-valuenow={masterBpm}
  aria-valuemin={MIN_BPM}
  aria-valuemax={MAX_BPM}
  className="w-56 sm:w-72 h-1 bg-border rounded-full appearance-none cursor-pointer
             [&::-webkit-slider-thumb]:appearance-none
             [&::-webkit-slider-thumb]:w-4
             [&::-webkit-slider-thumb]:h-4
             [&::-webkit-slider-thumb]:rounded-full
             [&::-webkit-slider-thumb]:bg-gold
             [&::-webkit-slider-thumb]:shadow-gold-glow
             [&::-webkit-slider-thumb]:cursor-pointer"
/>
```

### 1.3 — Add unique IDs to all interactive elements

**MODIFY** each interactive element across all components. Add `id` attributes:

In `BpmDisplay.tsx`:
```tsx
<button id="bpm-decrement" ...>
<input id="bpm-input" type="number" ...>
<button id="bpm-increment" ...>
<input id="bpm-slider" type="range" ...>
```

In `PlayButton.tsx`:
```tsx
<motion.button id="play-pause-button" ...>
```

In `SwapButton.tsx`:
```tsx
<button id="swap-button" ...>
```

In `HandColumn.tsx` — use the `side` prop to create unique IDs:
```tsx
<button id={`${side}-ratio-decrement`} ...>  {/* e.g., "left-ratio-decrement" */}
<input id={`${side}-ratio-input`} type="number" ...>
<button id={`${side}-ratio-increment`} ...>
<button id={`${side}-mute-toggle`} ...>
```

### 1.4 — Add `aria-live` region for screen reader announcements

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/App.tsx`

**ADD** a visually hidden live region at the bottom of the main content, before the footer. This announces BPM and ratio changes to screen readers:

```tsx
{/* Screen reader announcements */}
<div
  role="status"
  aria-live="polite"
  className="sr-only"
>
  {isPlaying ? 'Metronome playing' : 'Metronome paused'}.
  {' '}{masterBpm} BPM.
  {' '}Left hand: {leftRatio}. Right hand: {rightRatio}.
</div>
```

**ADD** this selector to the store selectors in `App.tsx` (if not already present):

```tsx
const masterBpm = useMetronomeStore((s) => s.masterBpm);
```

**ADD** this CSS class to `src/index.css` inside the `@layer components` block:

```css
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
```

---

## Step 2: SEO Meta Tags

### 2.1 — Update `index.html`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/index.html`

Delete all existing content and replace with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags -->
    <title>PolyRhythm Pro — The Chopin Metronome</title>
    <meta name="title" content="PolyRhythm Pro — The Chopin Metronome" />
    <meta name="description" content="A precision polyrhythm metronome for classical pianists. Practice complex rhythmic ratios like 22-against-7 with dual independent pulse engines and real-time visual phasing." />
    <meta name="author" content="DreamPlay" />
    <meta name="keywords" content="polyrhythm, metronome, Chopin, classical piano, music practice, rhythm trainer, cross-rhythm" />

    <!-- Open Graph / Social -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="PolyRhythm Pro — The Chopin Metronome" />
    <meta property="og:description" content="A precision polyrhythm metronome for classical pianists. Dual pulse engines, visual phasing, real-time control." />
    <meta property="og:image" content="/og-image.png" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="PolyRhythm Pro — The Chopin Metronome" />
    <meta name="twitter:description" content="Practice complex polyrhythms like 22-against-7 with precision audio and visual feedback." />

    <!-- Theme -->
    <meta name="theme-color" content="#0A0A0A" />
    <meta name="color-scheme" content="dark" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2.2 — Create a simple OG image placeholder

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/public/og-image.png`

For now, create a placeholder. You can generate a proper OG image later using the `generate_image` tool or a design tool.

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
# Create a 1200x630 placeholder — we'll generate a real one if needed
echo "placeholder" > public/og-image-placeholder.txt
```

> **NOTE:** A proper OG image (1200x630px) can be generated later. The meta tag will still work with a placeholder path — social previews just won't have an image until the real file is added.

---

## Step 3: Production Build

### 3.1 — Run the production build

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm build
```

### 3.2 — Verify the build succeeds

Expected output:
```
vite v5.x.x building for production...
✓ X modules transformed.
dist/index.html                  X.XX kB │ gzip: X.XX kB
dist/assets/index-XXXXXXXX.css   X.XX kB │ gzip: X.XX kB
dist/assets/index-XXXXXXXX.js   XX.XX kB │ gzip: XX.XX kB
✓ built in Xs
```

- **No errors** in the terminal.
- **No warnings** (or only non-critical ones about unused exports).

### 3.3 — Preview the production build locally

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm preview
```

Open `http://localhost:4173` and run the same comprehensive tests from Step 4.

---

## Step 4: Final End-to-End QA Pass

### 4.1 — Run the production preview

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm preview
```

### 4.2 — Comprehensive QA checklist

Open `http://localhost:4173` and test EVERY item below:

**Visual & Layout:**

| # | Check | Expected |
|---|---|---|
| 1 | Page loads | Staggered fade-in animation: header → BPM → main panel → footer. |
| 2 | Background | Near-black (#0A0A0A) with extremely subtle radial gold gradient at top. |
| 3 | Typography | Inter for body, Outfit for display numbers, JetBrains Mono for any monospace. All load from Google Fonts. |
| 4 | Glassmorphism panel | Semi-transparent background, subtle border, backdrop blur. Orbs visible inside. |
| 5 | Resize to 375px width | Layout stacks vertically. No horizontal scroll. Everything readable. |
| 6 | Resize to 1920px width | Layout remains centered. Panel doesn't stretch too wide. |

**Controls:**

| # | Check | Expected |
|---|---|---|
| 7 | BPM +/- buttons | Increment/decrement by 1. Clamps at 20 and 240. |
| 8 | BPM direct input | Type any number, clamped. |
| 9 | BPM slider | Smooth drag. Value updates live. |
| 10 | Ratio +/- buttons | Increment/decrement by 1. Clamps at 1 and 32. |
| 11 | Ratio direct input | Type any number, clamped. |
| 12 | Swap button | Ratios swap. Ratio label updates. |
| 13 | Mute toggle | Text and icon change. Orb goes dim. |

**Audio:**

| # | Check | Expected |
|---|---|---|
| 14 | Play (3:4 at 60 BPM) | Two distinct pitches: low tock (left), high tick (right). Clear 3:4 interlocking pattern. |
| 15 | "The One" accent | Every 12 ticks, a distinct higher-pitched chime when both hands coincide. |
| 16 | Mute left, play | Only right hand ticks. |
| 17 | Mute right, play | Only left hand tocks. |
| 18 | Mute both, play | Complete silence, but engine still running (Pause icon visible). |
| 19 | Extreme: 22:7 at 60 BPM | Mathematically complex pattern. No stuttering. No drift. |
| 20 | Extreme: 3:4 at 240 BPM | Very fast but stable. |
| 21 | Change BPM while playing | Smooth tempo change, no restart. |
| 22 | Change ratio while playing | Immediate pattern change, beat counter resets. |
| 23 | Swap while playing | Pattern inverts immediately. |

**Visual Sync:**

| # | Check | Expected |
|---|---|---|
| 24 | Orbs pulse with audio | Each orb flash perfectly aligns with its audio click. No visible lag. |
| 25 | Accent flash | Both orbs flash brighter/larger on "The One." |
| 26 | Muted orb | Dim, no pulsing. |

**Keyboard & Accessibility:**

| # | Check | Expected |
|---|---|---|
| 27 | Press Spacebar | Toggles Play/Pause. |
| 28 | Spacebar with input focused | Does NOT toggle Play (input captures key). |
| 29 | Tab through controls | Visible gold focus ring on each interactive element. |
| 30 | Browser DevTools → Lighthouse Accessibility | Score should be 90+. |

**Browser Console:**

| # | Check | Expected |
|---|---|---|
| 31 | No errors | Zero console errors during all tests. |
| 32 | No warnings | Zero console warnings (or only non-critical Vite warnings). |

---

## Step 5: Final Git Commit and Push

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
git add -A
git commit -m "Phase 8: accessibility, SEO meta tags, production build, final QA"
git push origin main
```

---

## Final File Tree (Complete Project)

```
chopin-metronome/
├── docs/
│   ├── datastructure.md
│   ├── implementation-plan-1.md
│   ├── implementation-plan-2.md
│   ├── implementation-plan-3.md
│   ├── implementation-plan-4.md
│   ├── implementation-plan-5.md
│   ├── implementation-plan-6.md
│   ├── implementation-plan-7.md
│   ├── implementation-plan-8.md
│   ├── prd.md
│   ├── stack.md
│   └── userflow.md
├── public/
│   ├── favicon.svg
│   └── og-image-placeholder.txt
├── src/
│   ├── audio/
│   │   └── audioEngine.ts
│   ├── components/
│   │   ├── BpmDisplay.tsx
│   │   ├── HandColumn.tsx
│   │   ├── PlayButton.tsx
│   │   ├── PulsingOrb.tsx
│   │   ├── RatioLabel.tsx
│   │   └── SwapButton.tsx
│   ├── hooks/
│   │   ├── useAudioEngine.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── usePulseSync.ts
│   ├── lib/
│   │   └── constants.ts
│   ├── store/
│   │   └── metronomeStore.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Summary of All 8 Phases

| Phase | What It Does | Key Files Created/Modified |
|---|---|---|
| 1 | Project scaffold, Tailwind v3 design tokens, static UI | All scaffolding, `index.css`, `tailwind.config.js`, 5 components |
| 2 | Zustand store + UI interactivity | `metronomeStore.ts`, all components updated |
| 3 | Web Audio engine (standalone, not connected) | `audioEngine.ts` |
| 4 | Connect audio engine to Play/Pause | `useAudioEngine.ts`, `App.tsx` |
| 5 | Framer-motion pulsing orbs synced to audio | `PulsingOrb.tsx`, `usePulseSync.ts`, `audioEngine.ts` (visual events) |
| 6 | Real-time controls during playback | `audioEngine.ts` (resetBeatCounters), `metronomeStore.ts` |
| 7 | Polish: animations, keyboard, responsive, micro-interactions | `App.tsx`, `PlayButton.tsx`, `useKeyboardShortcuts.ts`, `index.css` |
| 8 | Accessibility, SEO, production build, QA | `index.html`, `BpmDisplay.tsx`, `index.css`, all components (IDs) |
