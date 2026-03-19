# Phase 1: Project Scaffold, Tailwind v3 Design Tokens, Static UI Layout

> **Goal:** Set up a Vite + React + TypeScript project from scratch with Tailwind CSS v3, define the full design token system, and build every UI component as a static (non-interactive) layout. No state management, no audio, no animations — just pixel-perfect HTML/CSS structure.

---

## Confirmed Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Vite + React + TypeScript | Pure client-side audio engine, no SSR needed. Lightning-fast HMR. |
| Styling | Tailwind CSS **v3** (pinned) | Need standard `tailwind.config.js` for custom animations and design tokens. |
| State Management | **Zustand** | Audio scheduler runs outside React render cycle. `getState()` avoids stale closures. |
| Audio | **Oscillator-based** (synthesized) | Zero latency, offline, no static asset management. Engineered attack/decay. |
| Package Manager | **pnpm** | Per project conventions. |

---

## Step 1: Scaffold the Vite + React + TypeScript Project

### 1.1 — Create the project

Run this from inside the `chopin-metronome` directory. The `./` tells Vite to scaffold into the current directory.

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm create vite@latest ./ --template react-ts
```

> **IMPORTANT:** If Vite complains that the directory is not empty (because the `docs/` folder exists), it will prompt. Answer **yes** to proceed — it will not delete existing files, only add its scaffold files alongside them.

### 1.2 — Install core dependencies

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm install
```

### 1.3 — Install project-specific dependencies

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm add zustand framer-motion lucide-react
```

### 1.4 — Install Tailwind CSS v3

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

> This creates two files: `tailwind.config.js` and `postcss.config.js`.

### 1.5 — Verify the scaffold runs

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm dev
```

Open `http://localhost:5173` in a browser. You should see the default Vite + React page. Then kill the dev server (`Ctrl+C`).

---

## Step 2: Configure Tailwind CSS v3 with Design Tokens

### 2.1 — Replace `tailwind.config.js`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/tailwind.config.js`

Delete all existing content and replace with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette from PRD: "Steinway grand piano" aesthetic
        background: '#0A0A0A',
        surface: '#141414',
        'surface-light': '#1E1E1E',
        border: '#2A2A2A',
        gold: {
          DEFAULT: '#D4A853',
          dim: '#B8923F',
          bright: '#E8C068',
        },
        // Hand-specific colors
        left: {
          DEFAULT: '#D4A853',     // Gold for Left Hand (Base)
          dim: '#B8923F',
          glow: 'rgba(212, 168, 83, 0.3)',
        },
        right: {
          DEFAULT: '#E8C068',     // Bright gold for Right Hand (Treble)
          dim: '#D4A853',
          glow: 'rgba(232, 192, 104, 0.3)',
        },
        muted: '#6B6B6B',
        'text-primary': '#FAFAF5',
        'text-secondary': '#A0A0A0',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'bpm-display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '300' }],
        'ratio-display': ['3rem', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1', letterSpacing: '0.1em', fontWeight: '500' }],
      },
      borderRadius: {
        'orb': '50%',
      },
      boxShadow: {
        'gold-glow': '0 0 40px rgba(212, 168, 83, 0.15)',
        'gold-glow-strong': '0 0 60px rgba(212, 168, 83, 0.3)',
        'inner-gold': 'inset 0 0 30px rgba(212, 168, 83, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
```

### 2.2 — Replace `src/index.css`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/index.css`

Delete all existing content and replace with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Google Fonts ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Base Resets ── */
@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background-color: #0A0A0A;
    color: #FAFAF5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Remove spinner arrows from number inputs */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
}

/* ── Utility Classes ── */
@layer components {
  .glass-panel {
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(42, 42, 42, 0.6);
    border-radius: 1rem;
  }

  .gold-border {
    border: 1px solid rgba(212, 168, 83, 0.3);
  }

  .gold-text {
    color: #D4A853;
  }

  .label-text {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #A0A0A0;
  }
}
```

---

## Step 3: Clean Up Vite Scaffold Files

### 3.1 — Delete default Vite files we don't need

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
rm -f src/App.css
rm -f src/assets/react.svg
rm -f public/vite.svg
```

### 3.2 — Replace `index.html`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/index.html`

Delete all existing content and replace with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A precision polyrhythm metronome for classical pianists. Practice complex ratios like 22-against-7 with dual independent pulse engines." />
    <title>PolyRhythm Pro — The Chopin Metronome</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3.3 — Create a simple SVG favicon

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/public/favicon.svg`

Create this file with the following content:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#0A0A0A"/>
  <circle cx="35" cy="50" r="12" fill="#D4A853" opacity="0.9"/>
  <circle cx="65" cy="50" r="12" fill="#E8C068" opacity="0.9"/>
</svg>
```

---

## Step 4: Set Up the Project File Structure

### 4.1 — Create the directory structure

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
mkdir -p src/components
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/audio
mkdir -p src/lib
```

This creates the following tree (only the `src/` portion shown):

```
src/
├── audio/          # Phase 3: Web Audio engine will live here
├── components/     # All React components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions, constants
├── store/          # Zustand store (Phase 2)
├── App.tsx         # Root component
├── main.tsx        # Vite entry point
└── index.css       # Global styles (already created)
```

---

## Step 5: Create Shared Constants

### 5.1 — Create the constants file

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/lib/constants.ts`

Create this file with the following content:

```typescript
// ── BPM Limits ──
export const MIN_BPM = 20;
export const MAX_BPM = 240;
export const DEFAULT_BPM = 60;

// ── Ratio Limits ──
export const MIN_RATIO = 1;
export const MAX_RATIO = 32;
export const DEFAULT_LEFT_RATIO = 3;
export const DEFAULT_RIGHT_RATIO = 4;

// ── Oscillator Frequencies (Hz) ──
// Left Hand: low-pitched, resonant "tock" (sine/triangle, 400Hz)
export const LEFT_FREQUENCY = 400;
// Right Hand: high-pitched, sharp "tick" (sine, 1000Hz)
export const RIGHT_FREQUENCY = 1000;
// "The One": accented chime when both hands hit beat 1 simultaneously
export const ACCENT_FREQUENCY = 1500;

// ── Oscillator Envelope ──
export const ATTACK_TIME = 0.005;    // 5ms attack (very short)
export const DECAY_TIME = 0.08;      // 80ms exponential decay
export const ACCENT_DECAY_TIME = 0.15; // 150ms for the accent chime (longer ring)
```

---

## Step 6: Build the Static UI Components

> **IMPORTANT:** Every component in this step is a STATIC visual shell. No `onClick` handlers do anything. No state changes. Buttons and inputs are rendered but non-functional. We wire them up in Phase 2.

### 6.1 — Create the BPM Display component

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/BpmDisplay.tsx`

```tsx
import { Minus, Plus } from 'lucide-react';
import { DEFAULT_BPM, MIN_BPM, MAX_BPM } from '../lib/constants';

export default function BpmDisplay() {
  const bpm = DEFAULT_BPM;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Label */}
      <span className="label-text">Master Tempo</span>

      {/* BPM number + stepper buttons */}
      <div className="flex items-center gap-4">
        <button
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label="Decrease BPM"
        >
          <Minus size={18} />
        </button>

        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={bpm}
            readOnly
            className="bg-transparent text-bpm-display text-text-primary text-center w-36
                       font-display outline-none caret-gold"
            min={MIN_BPM}
            max={MAX_BPM}
          />
          <span className="label-text text-text-secondary">BPM</span>
        </div>

        <button
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label="Increase BPM"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* BPM Slider */}
      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        readOnly
        className="w-72 h-1 bg-border rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-gold
                   [&::-webkit-slider-thumb]:shadow-gold-glow
                   [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}
```

### 6.2 — Create the Hand Column component

This component is reused for both Left and Right hand. It displays the ratio number and a mute button.

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/HandColumn.tsx`

```tsx
import { Minus, Plus, Volume2, VolumeX } from 'lucide-react';
import { MIN_RATIO, MAX_RATIO } from '../lib/constants';

interface HandColumnProps {
  side: 'left' | 'right';
  label: string;
  sublabel: string;
  ratio: number;
  isMuted: boolean;
}

export default function HandColumn({ side, label, sublabel, ratio, isMuted }: HandColumnProps) {
  const isLeft = side === 'left';

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <span className="label-text">{label}</span>
        <span className="text-xs text-text-secondary">{sublabel}</span>
      </div>

      {/* Pulsing Orb (static in Phase 1 — no animation) */}
      <div
        className={`w-24 h-24 rounded-orb flex items-center justify-center
                    ${isMuted
                      ? 'bg-surface-light border border-border'
                      : isLeft
                        ? 'bg-left/10 border border-left/30 shadow-gold-glow'
                        : 'bg-right/10 border border-right/30 shadow-gold-glow'
                    }`}
      >
        <div
          className={`w-12 h-12 rounded-orb
                      ${isMuted
                        ? 'bg-muted/30'
                        : isLeft
                          ? 'bg-left/40'
                          : 'bg-right/40'
                      }`}
        />
      </div>

      {/* Ratio selector */}
      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label={`Decrease ${label} ratio`}
        >
          <Minus size={14} />
        </button>

        <input
          type="number"
          value={ratio}
          readOnly
          min={MIN_RATIO}
          max={MAX_RATIO}
          className="bg-transparent text-ratio-display text-text-primary text-center w-16
                     font-display outline-none"
        />

        <button
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label={`Increase ${label} ratio`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Mute toggle */}
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
                    ${isMuted
                      ? 'bg-surface-light text-muted border border-border'
                      : 'bg-surface-light text-text-secondary border border-border hover:border-gold/50'
                    }`}
        aria-label={`${isMuted ? 'Unmute' : 'Mute'} ${label}`}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        <span>{isMuted ? 'Muted' : 'Mute'}</span>
      </button>
    </div>
  );
}
```

### 6.3 — Create the Play Button component

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/PlayButton.tsx`

```tsx
import { Play } from 'lucide-react';

export default function PlayButton() {
  const isPlaying = false;

  return (
    <button
      className="relative w-20 h-20 rounded-full bg-gold flex items-center justify-center
                 shadow-gold-glow-strong hover:bg-gold-bright active:scale-95
                 transition-all duration-150"
      aria-label={isPlaying ? 'Pause metronome' : 'Play metronome'}
    >
      {/* Always show Play icon in Phase 1 (no toggle logic yet) */}
      <Play size={32} className="text-background ml-1" fill="#0A0A0A" />
    </button>
  );
}
```

### 6.4 — Create the Swap Button component

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/SwapButton.tsx`

```tsx
import { ArrowLeftRight } from 'lucide-react';

export default function SwapButton() {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                 bg-surface-light text-text-secondary border border-border
                 hover:border-gold/50 hover:text-gold transition-colors"
      aria-label="Swap left and right hand ratios"
    >
      <ArrowLeftRight size={16} />
      <span>Swap</span>
    </button>
  );
}
```

### 6.5 — Create the Ratio Label component

This shows the "3 : 4" label between the two hand columns.

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/RatioLabel.tsx`

```tsx
import { DEFAULT_LEFT_RATIO, DEFAULT_RIGHT_RATIO } from '../lib/constants';

export default function RatioLabel() {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-2xl text-text-primary font-light tracking-wider">
        {DEFAULT_LEFT_RATIO} <span className="text-gold mx-1">:</span> {DEFAULT_RIGHT_RATIO}
      </span>
      <span className="label-text">Polyrhythm</span>
    </div>
  );
}
```

---

## Step 7: Assemble the Root App Component

### 7.1 — Replace `src/App.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/App.tsx`

Delete all existing content and replace with:

```tsx
import BpmDisplay from './components/BpmDisplay';
import HandColumn from './components/HandColumn';
import PlayButton from './components/PlayButton';
import SwapButton from './components/SwapButton';
import RatioLabel from './components/RatioLabel';
import { DEFAULT_LEFT_RATIO, DEFAULT_RIGHT_RATIO } from './lib/constants';

export default function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* ── Header ── */}
      <header className="mb-12 text-center">
        <h1 className="font-display text-2xl font-light tracking-widest text-gold uppercase">
          PolyRhythm Pro
        </h1>
        <p className="text-sm text-text-secondary mt-1">The Chopin Metronome</p>
      </header>

      {/* ── BPM Control ── */}
      <section className="mb-14">
        <BpmDisplay />
      </section>

      {/* ── Main Panel: Left Hand | Play/Swap | Right Hand ── */}
      <section className="glass-panel px-10 py-10 flex items-center gap-10">
        {/* Left Hand Column */}
        <HandColumn
          side="left"
          label="Left Hand"
          sublabel="Base"
          ratio={DEFAULT_LEFT_RATIO}
          isMuted={false}
        />

        {/* Center Controls */}
        <div className="flex flex-col items-center gap-6">
          <RatioLabel />
          <PlayButton />
          <SwapButton />
        </div>

        {/* Right Hand Column */}
        <HandColumn
          side="right"
          label="Right Hand"
          sublabel="Treble"
          ratio={DEFAULT_RIGHT_RATIO}
          isMuted={false}
        />
      </section>

      {/* ── Footer ── */}
      <footer className="mt-12 text-center">
        <p className="text-xs text-text-secondary">
          Built for pianists who practice Chopin Nocturne Op. 9 No. 1
        </p>
      </footer>
    </div>
  );
}
```

### 7.2 — Replace `src/main.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/main.tsx`

Delete all existing content and replace with:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

---

## Step 8: Initialize Git

### 8.1 — Create `.gitignore`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/.gitignore`

```
# Dependencies
node_modules/

# Build output
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Repomix
repomix-output*
*.xml
!repomix.config.*
```

### 8.2 — Initialize git and make the first commit

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
git init
git add -A
git commit -m "Phase 1: project scaffold, Tailwind v3 design tokens, static UI layout"
```

---

## Step 9: Verify Phase 1

### 9.1 — Run the dev server

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm dev
```

### 9.2 — Visual verification checklist

Open `http://localhost:5173` in a browser and confirm ALL of the following:

| # | Check | Expected |
|---|---|---|
| 1 | Background | Solid `#0A0A0A` (near-black) |
| 2 | Header | "POLYRHYTHM PRO" in gold (`#D4A853`), uppercase, tracked letters. "The Chopin Metronome" subtitle in gray below. |
| 3 | BPM Display | Large "60" number, centered, with "BPM" label. Minus/Plus circle buttons on either side. A slider bar below. |
| 4 | Glass Panel | Semi-transparent dark panel with a subtle border and backdrop blur. |
| 5 | Left Hand Column | Label "LEFT HAND" + "Base". A gold-bordered circular orb. The number "3" with +/- buttons. A "Mute" button with speaker icon. |
| 6 | Right Hand Column | Same layout as Left but label says "RIGHT HAND" + "Treble". Number shows "4". |
| 7 | Center Controls | "3 : 4" ratio display with gold colon. A large gold circular Play button. A "Swap" button below. |
| 8 | Footer | Small gray text about Chopin Nocturne Op. 9 No. 1. |
| 9 | Typography | Inter font for body text. Outfit font for display numbers and labels. |
| 10 | Number inputs | No spinner arrows visible on the BPM or ratio number inputs. |
| 11 | No errors | Browser console has zero errors and zero warnings. |

### 9.3 — Kill the dev server after verification

```bash
# Press Ctrl+C in the terminal running pnpm dev
```

---

## Final File Tree After Phase 1

```
chopin-metronome/
├── docs/
│   ├── implementation-plan-1.md   ← this file
│   ├── datastructure.md
│   ├── prd.md
│   ├── stack.md
│   └── userflow.md
├── public/
│   └── favicon.svg
├── src/
│   ├── audio/                     ← empty (Phase 3)
│   ├── components/
│   │   ├── BpmDisplay.tsx
│   │   ├── HandColumn.tsx
│   │   ├── PlayButton.tsx
│   │   ├── RatioLabel.tsx
│   │   └── SwapButton.tsx
│   ├── hooks/                     ← empty (Phase 2+)
│   ├── lib/
│   │   └── constants.ts
│   ├── store/                     ← empty (Phase 2)
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts              ← auto-generated by Vite
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Architectural Decisions Made in This Phase

1. **Color differentiation between hands:** Left Hand uses `#D4A853` (standard gold) and Right Hand uses `#E8C068` (brighter gold). This is subtle but intentional — keeps the "Steinway" aesthetic while still being distinguishable.

2. **Glass-panel layout:** The two hand columns and center controls are wrapped in a single glassmorphism panel (semi-transparent bg + backdrop blur + subtle border). This creates a cohesive "instrument panel" feel.

3. **Number input without spinners:** CSS removes the native browser spinner arrows from `<input type="number">`. Users will control values via the custom +/- buttons (wired in Phase 2) or by typing directly.

4. **Folder structure convention:** `src/audio/` is for the Web Audio engine, `src/store/` for Zustand, `src/hooks/` for custom hooks, `src/lib/` for constants and utilities. Components are flat in `src/components/` (no nesting — the app is small enough).

5. **Doc files stay at root for now:** The original `prd.md`, `datastructure.md`, `stack.md`, and `userflow.md` remain in the project root. They will be moved to `docs/` in the git init step if desired, but are not imported by any code.

---

## What Phase 2 Will Do (Preview)

Phase 2 will:
- Create the Zustand store (`src/store/metronomeStore.ts`) matching the `MetronomeState` interface from `datastructure.md`
- Wire all buttons/inputs to dispatch Zustand actions (play/pause, BPM changes, ratio changes, mute, swap)
- Make the UI fully interactive (but still no audio or animation)
