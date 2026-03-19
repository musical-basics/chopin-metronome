# Phase 4: Connect Audio Engine to UI Controls

> **Goal:** Wire the audio engine's `startAudio()` and `stopAudio()` functions to the Play/Pause button. After this phase, clicking Play will produce audible polyrhythmic clicks from the speakers. Clicking Pause will stop them.

> **Prerequisite:** Phase 3 is complete. `src/audio/audioEngine.ts` exists and compiles without errors.

---

## Step 1: Create the `useAudioEngine` Hook

We need a React hook that watches the Zustand `isPlaying` state and calls `startAudio()` / `stopAudio()` accordingly. This hook also handles cleanup (stopping audio when the component unmounts).

### 1.1 — Create the hook file

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/hooks/useAudioEngine.ts`

Create this file with the following content:

```typescript
import { useEffect, useRef } from 'react';
import { useMetronomeStore } from '../store/metronomeStore';
import { startAudio, stopAudio } from '../audio/audioEngine';

/**
 * Hook that bridges the Zustand store's `isPlaying` state
 * to the Web Audio engine's start/stop lifecycle.
 *
 * This hook:
 * 1. Subscribes to `isPlaying` from the store.
 * 2. Calls `startAudio()` when `isPlaying` becomes true.
 * 3. Calls `stopAudio()` when `isPlaying` becomes false.
 * 4. Calls `stopAudio()` on unmount as a safety cleanup.
 *
 * Place this hook in App.tsx (the root component) so it runs
 * for the entire lifetime of the application.
 */
export function useAudioEngine(): void {
  const isPlaying = useMetronomeStore((s) => s.isPlaying);
  const prevIsPlaying = useRef(false);

  useEffect(() => {
    // Only react to actual changes (not initial mount with isPlaying=false)
    if (isPlaying && !prevIsPlaying.current) {
      startAudio();
    } else if (!isPlaying && prevIsPlaying.current) {
      stopAudio();
    }
    prevIsPlaying.current = isPlaying;

    // Cleanup: stop audio if the component unmounts while playing
    return () => {
      if (isPlaying) {
        stopAudio();
      }
    };
  }, [isPlaying]);
}
```

---

## Step 2: Use the Hook in App.tsx

### 2.1 — Update `src/App.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/App.tsx`

Add the import at the top of the file (add this line after the existing imports):

```tsx
import { useAudioEngine } from './hooks/useAudioEngine';
```

Add the hook call inside the `App` function body, BEFORE the return statement. Place it as the very first line inside the function:

```tsx
export default function App() {
  useAudioEngine(); // ← ADD THIS LINE

  const leftRatio = useMetronomeStore((s) => s.leftRatio);
  // ... rest of the component remains unchanged
```

The full updated `App.tsx` (for a dumb AI that needs the complete file):

```tsx
import BpmDisplay from './components/BpmDisplay';
import HandColumn from './components/HandColumn';
import PlayButton from './components/PlayButton';
import SwapButton from './components/SwapButton';
import RatioLabel from './components/RatioLabel';
import { useMetronomeStore } from './store/metronomeStore';
import { useAudioEngine } from './hooks/useAudioEngine';

export default function App() {
  // Bridge Zustand isPlaying → Web Audio engine start/stop
  useAudioEngine();

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

## Step 3: Verify Phase 4

### 3.1 — Run the dev server

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm dev
```

### 3.2 — Audio verification checklist

Open `http://localhost:5173` in a browser **with speakers or headphones on**.

| # | Action | Expected Result |
|---|---|---|
| 1 | Click the Play button | You hear a steady stream of clicks — a LOW "tock" (left hand) and a HIGH "tick" (right hand) interleaving in a 3:4 pattern. The Play icon changes to Pause. |
| 2 | Listen for "The One" | Every 12 ticks (LCM of 3 and 4), there is a single higher-pitched accent chime when both hands coincide on beat 1. |
| 3 | Click the Pause button | All sound stops immediately. Icon returns to Play. |
| 4 | Click Play again | Sound resumes from the beginning of the pattern (beat 1). |
| 5 | Change BPM to 120 while stopped, then Play | Clicks are noticeably faster (twice as fast as 60 BPM). |
| 6 | Change Left ratio to `7`, Right to `4`, then Play | You hear an asymmetric pattern — 7 low tocks per beat vs 4 high ticks per beat. |
| 7 | Set to extreme values: Left=22, Right=7, BPM=60, Play | You hear rapid cascading clicks. The "Chopin Nocturne Op. 9 No. 1" stress test. No audio glitches or stuttering. |
| 8 | Set BPM=240 with 3:4 ratio, Play | Fast but stable. No drift or glitching. |
| 9 | Browser console | Zero errors, zero warnings |

### 3.3 — Git commit

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
git add -A
git commit -m "Phase 4: connect audio engine to Play/Pause button, sound plays"
```

---

## What Phase 5 Will Do (Preview)

Phase 5 will add visual pulsing orbs using framer-motion. The orbs will flash in sync with the audio ticks, driven by the same timing data from the Web Audio engine.
