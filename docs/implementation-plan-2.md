# Phase 2: Zustand State Store + UI Interactivity

> **Goal:** Create the Zustand store matching the `MetronomeState` interface, then wire every button and input in the Phase 1 UI to dispatch Zustand actions. After this phase, clicking buttons and typing into inputs will update visible state — but there is still NO audio and NO animation.

> **Prerequisite:** Phase 1 is fully complete and the static UI renders without errors.

---

## Step 1: Create the Zustand Store

### 1.1 — Create the store file

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/store/metronomeStore.ts`

Create this file with the following content:

```typescript
import { create } from 'zustand';
import {
  DEFAULT_BPM,
  MIN_BPM,
  MAX_BPM,
  DEFAULT_LEFT_RATIO,
  DEFAULT_RIGHT_RATIO,
  MIN_RATIO,
  MAX_RATIO,
} from '../lib/constants';

interface MetronomeState {
  // ── State ──
  isPlaying: boolean;
  masterBpm: number;
  leftRatio: number;
  rightRatio: number;
  leftMuted: boolean;
  rightMuted: boolean;

  // ── Actions ──
  togglePlay: () => void;
  setMasterBpm: (bpm: number) => void;
  incrementBpm: () => void;
  decrementBpm: () => void;
  setLeftRatio: (ratio: number) => void;
  setRightRatio: (ratio: number) => void;
  incrementLeftRatio: () => void;
  decrementLeftRatio: () => void;
  incrementRightRatio: () => void;
  decrementRightRatio: () => void;
  toggleLeftMute: () => void;
  toggleRightMute: () => void;
  swapRatios: () => void;
}

// Helper: clamp a number between min and max
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const useMetronomeStore = create<MetronomeState>((set) => ({
  // ── Initial State ──
  isPlaying: false,
  masterBpm: DEFAULT_BPM,
  leftRatio: DEFAULT_LEFT_RATIO,
  rightRatio: DEFAULT_RIGHT_RATIO,
  leftMuted: false,
  rightMuted: false,

  // ── Actions ──
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setMasterBpm: (bpm: number) =>
    set(() => ({ masterBpm: clamp(Math.round(bpm), MIN_BPM, MAX_BPM) })),

  incrementBpm: () =>
    set((state) => ({ masterBpm: clamp(state.masterBpm + 1, MIN_BPM, MAX_BPM) })),

  decrementBpm: () =>
    set((state) => ({ masterBpm: clamp(state.masterBpm - 1, MIN_BPM, MAX_BPM) })),

  setLeftRatio: (ratio: number) =>
    set(() => ({ leftRatio: clamp(Math.round(ratio), MIN_RATIO, MAX_RATIO) })),

  setRightRatio: (ratio: number) =>
    set(() => ({ rightRatio: clamp(Math.round(ratio), MIN_RATIO, MAX_RATIO) })),

  incrementLeftRatio: () =>
    set((state) => ({ leftRatio: clamp(state.leftRatio + 1, MIN_RATIO, MAX_RATIO) })),

  decrementLeftRatio: () =>
    set((state) => ({ leftRatio: clamp(state.leftRatio - 1, MIN_RATIO, MAX_RATIO) })),

  incrementRightRatio: () =>
    set((state) => ({ rightRatio: clamp(state.rightRatio + 1, MIN_RATIO, MAX_RATIO) })),

  decrementRightRatio: () =>
    set((state) => ({ rightRatio: clamp(state.rightRatio - 1, MIN_RATIO, MAX_RATIO) })),

  toggleLeftMute: () =>
    set((state) => ({ leftMuted: !state.leftMuted })),

  toggleRightMute: () =>
    set((state) => ({ rightMuted: !state.rightMuted })),

  swapRatios: () =>
    set((state) => ({ leftRatio: state.rightRatio, rightRatio: state.leftRatio })),
}));
```

---

## Step 2: Wire Components to the Store

### 2.1 — Update `BpmDisplay.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/BpmDisplay.tsx`

Delete all existing content and replace with:

```tsx
import { Minus, Plus } from 'lucide-react';
import { useMetronomeStore } from '../store/metronomeStore';
import { MIN_BPM, MAX_BPM } from '../lib/constants';

export default function BpmDisplay() {
  const masterBpm = useMetronomeStore((s) => s.masterBpm);
  const setMasterBpm = useMetronomeStore((s) => s.setMasterBpm);
  const incrementBpm = useMetronomeStore((s) => s.incrementBpm);
  const decrementBpm = useMetronomeStore((s) => s.decrementBpm);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Label */}
      <span className="label-text">Master Tempo</span>

      {/* BPM number + stepper buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={decrementBpm}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label="Decrease BPM"
        >
          <Minus size={18} />
        </button>

        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={masterBpm}
            onChange={(e) => setMasterBpm(Number(e.target.value))}
            className="bg-transparent text-bpm-display text-text-primary text-center w-36
                       font-display outline-none caret-gold"
            min={MIN_BPM}
            max={MAX_BPM}
          />
          <span className="label-text text-text-secondary">BPM</span>
        </div>

        <button
          onClick={incrementBpm}
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
        value={masterBpm}
        onChange={(e) => setMasterBpm(Number(e.target.value))}
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

### 2.2 — Update `HandColumn.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/HandColumn.tsx`

Delete all existing content and replace with:

```tsx
import { Minus, Plus, Volume2, VolumeX } from 'lucide-react';
import { MIN_RATIO, MAX_RATIO } from '../lib/constants';

interface HandColumnProps {
  side: 'left' | 'right';
  label: string;
  sublabel: string;
  ratio: number;
  isMuted: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetRatio: (ratio: number) => void;
  onToggleMute: () => void;
}

export default function HandColumn({
  side,
  label,
  sublabel,
  ratio,
  isMuted,
  onIncrement,
  onDecrement,
  onSetRatio,
  onToggleMute,
}: HandColumnProps) {
  const isLeft = side === 'left';

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <span className="label-text">{label}</span>
        <span className="text-xs text-text-secondary">{sublabel}</span>
      </div>

      {/* Pulsing Orb (static in Phase 1–2 — animation added in Phase 5) */}
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
          onClick={onDecrement}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label={`Decrease ${label} ratio`}
        >
          <Minus size={14} />
        </button>

        <input
          type="number"
          value={ratio}
          onChange={(e) => onSetRatio(Number(e.target.value))}
          min={MIN_RATIO}
          max={MAX_RATIO}
          className="bg-transparent text-ratio-display text-text-primary text-center w-16
                     font-display outline-none"
        />

        <button
          onClick={onIncrement}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label={`Increase ${label} ratio`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Mute toggle */}
      <button
        onClick={onToggleMute}
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

### 2.3 — Update `PlayButton.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/PlayButton.tsx`

Delete all existing content and replace with:

```tsx
import { Play, Pause } from 'lucide-react';
import { useMetronomeStore } from '../store/metronomeStore';

export default function PlayButton() {
  const isPlaying = useMetronomeStore((s) => s.isPlaying);
  const togglePlay = useMetronomeStore((s) => s.togglePlay);

  return (
    <button
      onClick={togglePlay}
      className="relative w-20 h-20 rounded-full bg-gold flex items-center justify-center
                 shadow-gold-glow-strong hover:bg-gold-bright active:scale-95
                 transition-all duration-150"
      aria-label={isPlaying ? 'Pause metronome' : 'Play metronome'}
    >
      {isPlaying ? (
        <Pause size={32} className="text-background" fill="#0A0A0A" />
      ) : (
        <Play size={32} className="text-background ml-1" fill="#0A0A0A" />
      )}
    </button>
  );
}
```

### 2.4 — Update `SwapButton.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/SwapButton.tsx`

Delete all existing content and replace with:

```tsx
import { ArrowLeftRight } from 'lucide-react';
import { useMetronomeStore } from '../store/metronomeStore';

export default function SwapButton() {
  const swapRatios = useMetronomeStore((s) => s.swapRatios);

  return (
    <button
      onClick={swapRatios}
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

### 2.5 — Update `RatioLabel.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/RatioLabel.tsx`

Delete all existing content and replace with:

```tsx
import { useMetronomeStore } from '../store/metronomeStore';

export default function RatioLabel() {
  const leftRatio = useMetronomeStore((s) => s.leftRatio);
  const rightRatio = useMetronomeStore((s) => s.rightRatio);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-2xl text-text-primary font-light tracking-wider">
        {leftRatio} <span className="text-gold mx-1">:</span> {rightRatio}
      </span>
      <span className="label-text">Polyrhythm</span>
    </div>
  );
}
```

---

## Step 3: Update `App.tsx` to Pass Store Actions to HandColumn

### 3.1 — Replace `src/App.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/App.tsx`

Delete all existing content and replace with:

```tsx
import BpmDisplay from './components/BpmDisplay';
import HandColumn from './components/HandColumn';
import PlayButton from './components/PlayButton';
import SwapButton from './components/SwapButton';
import RatioLabel from './components/RatioLabel';
import { useMetronomeStore } from './store/metronomeStore';

export default function App() {
  const leftRatio = useMetronomeStore((s) => s.leftRatio);
  const rightRatio = useMetronomeStore((s) => s.rightRatio);
  const leftMuted = useMetronomeStore((s) => s.leftMuted);
  const rightMuted = useMetronomeStore((s) => s.rightMuted);
  const setLeftRatio = useMetronomeStore((s) => s.setLeftRatio);
  const setRightRatio = useMetronomeStore((s) => s.setRightRatio);
  const incrementLeftRatio = useMetronomeStore((s) => s.incrementLeftRatio);
  const decrementLeftRatio = useMetronomeStore((s) => s.decrementLeftRatio);
  const incrementRightRatio = useMetronomeStore((s) => s.incrementRightRatio);
  const decrementRightRatio = useMetronomeStore((s) => s.decrementRightRatio);
  const toggleLeftMute = useMetronomeStore((s) => s.toggleLeftMute);
  const toggleRightMute = useMetronomeStore((s) => s.toggleRightMute);

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
          ratio={leftRatio}
          isMuted={leftMuted}
          onIncrement={incrementLeftRatio}
          onDecrement={decrementLeftRatio}
          onSetRatio={setLeftRatio}
          onToggleMute={toggleLeftMute}
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
          ratio={rightRatio}
          isMuted={rightMuted}
          onIncrement={incrementRightRatio}
          onDecrement={decrementRightRatio}
          onSetRatio={setRightRatio}
          onToggleMute={toggleRightMute}
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

---

## Step 4: Verify Phase 2

### 4.1 — Run the dev server

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm dev
```

### 4.2 — Interactive verification checklist

Open `http://localhost:5173` and test ALL of the following:

| # | Action | Expected Result |
|---|---|---|
| 1 | Click the BPM `+` button | BPM number increases by 1 (60 → 61) |
| 2 | Click the BPM `-` button | BPM number decreases by 1 (61 → 60) |
| 3 | Type `120` into the BPM input | BPM displays 120, slider moves to match |
| 4 | Drag the BPM slider to the far right | BPM updates in real-time, maxes at 240 |
| 5 | Drag the BPM slider to the far left | BPM updates in real-time, mins at 20 |
| 6 | Click Left Hand `+` button | Left ratio increases (3 → 4), ratio label updates to "4 : 4" |
| 7 | Click Left Hand `-` button | Left ratio decreases (4 → 3), ratio label updates to "3 : 4" |
| 8 | Type `22` into the Left Hand ratio input | Left ratio shows 22, ratio label shows "22 : 4" |
| 9 | Type `0` into any ratio input | Clamped to 1 (minimum) |
| 10 | Type `99` into any ratio input | Clamped to 32 (maximum) |
| 11 | Click the Play button | Icon toggles from Play ▶ to Pause ⏸ |
| 12 | Click the Play button again | Icon toggles back to Play ▶ |
| 13 | Click "Swap" button | Left and Right ratios swap values (e.g., 3:4 → 4:3). Ratio label updates. |
| 14 | Click "Mute" on Left Hand | Button text changes to "Muted", icon changes to VolumeX, orb becomes gray |
| 15 | Click "Muted" on Left Hand | Button text changes back to "Mute", icon changes to Volume2, orb returns to gold |
| 16 | Repeat mute test for Right Hand | Same behavior as Left Hand |
| 17 | No audio plays | Confirm: clicking Play produces NO sound (audio engine is Phase 3) |
| 18 | Browser console | Zero errors, zero warnings |

### 4.3 — Git commit

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
git add -A
git commit -m "Phase 2: Zustand state store, all UI controls wired and interactive"
```

---

## What Phase 3 Will Do (Preview)

Phase 3 will build the Web Audio engine in `src/audio/audioEngine.ts` — the dual-pulse scheduling loop using `AudioContext.currentTime`, oscillator-based sound synthesis with engineered attack/decay envelopes, and the "schedule-ahead" pattern from `datastructure.md`.
