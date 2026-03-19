# Phase 5: Visual Phasing — Framer-Motion Pulsing Orbs

> **Goal:** Make the two orbs (Left and Right hand) flash/pulse in sync with the Web Audio clicks. The visual timing must be driven by the audio engine's scheduling data, NOT by React state updates, to keep visual and audio perfectly aligned.

> **Prerequisite:** Phase 4 is complete. Audio plays when you click Play.

---

## Architecture: How to Sync Visuals with Audio

The audio engine schedules notes ahead of time using `AudioContext.currentTime`. We need the orbs to flash at the same moments. Here's the approach:

1. **The audio engine emits "visual event" callbacks** — when it schedules a note, it also records when the visual flash should happen.
2. **A React hook uses `requestAnimationFrame`** to poll these events and trigger the flash at the right moment.
3. **Framer-motion `animate`** handles the actual opacity/scale animation on the orb.

We will:
- Add a callback system to the audio engine
- Create a `usePulseSync` hook
- Update `HandColumn.tsx` to use framer-motion for the orb

---

## Step 1: Add Visual Event Emitter to the Audio Engine

### 1.1 — Update `src/audio/audioEngine.ts`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/audio/audioEngine.ts`

Add the following code. Do NOT replace the whole file — add/modify only the sections indicated.

**ADD** these type and variable declarations near the top of the file, after the existing module state variables (after `const SCHEDULER_INTERVAL_MS = 25;`):

```typescript
// ────────────────────────────────────────────────────────────
// VISUAL SYNC CALLBACK SYSTEM
// ────────────────────────────────────────────────────────────

export interface VisualEvent {
  hand: Hand;
  time: number;       // AudioContext.currentTime when the note plays
  isAccent: boolean;
}

// Queue of upcoming visual events (consumed by usePulseSync hook)
const visualEventQueue: VisualEvent[] = [];

// Maximum events in queue before we start dropping old ones
const MAX_QUEUE_SIZE = 64;
```

**MODIFY** the `playClick` function — add one line at the END of the function body, just before the closing `}`:

```typescript
function playClick(time: number, hand: Hand, isAccent: boolean): void {
  if (!audioContext) return;

  const state = useMetronomeStore.getState();

  // Check if this hand is muted
  if (hand === 'left' && state.leftMuted) return;
  if (hand === 'right' && state.rightMuted) return;

  // ... (all existing oscillator code stays the same) ...

  // ── ADD THIS BLOCK at the end of playClick ──
  // Push visual event to the queue (consumed by usePulseSync hook)
  if (visualEventQueue.length < MAX_QUEUE_SIZE) {
    visualEventQueue.push({ hand, time, isAccent });
  }
}
```

**ADD** a new exported function at the bottom of the file, before the final closing comments:

```typescript
/**
 * Drains all visual events that should have fired by now.
 * Called by the usePulseSync hook on every animation frame.
 *
 * Returns an array of events whose scheduled time has passed.
 * Removes them from the internal queue.
 */
export function drainVisualEvents(): VisualEvent[] {
  if (!audioContext) return [];

  const now = audioContext.currentTime;
  const ready: VisualEvent[] = [];

  while (visualEventQueue.length > 0 && visualEventQueue[0].time <= now) {
    ready.push(visualEventQueue.shift()!);
  }

  return ready;
}
```

**MODIFY** the `stopAudio` function — add a line to clear the queue:

```typescript
export function stopAudio(): void {
  if (schedulerTimerId !== null) {
    clearTimeout(schedulerTimerId);
    schedulerTimerId = null;
  }
  // Clear any pending visual events
  visualEventQueue.length = 0;
}
```

---

## Step 2: Create the `usePulseSync` Hook

### 2.1 — Create the hook file

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/hooks/usePulseSync.ts`

Create this file with the following content:

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { drainVisualEvents, VisualEvent } from '../audio/audioEngine';
import { useMetronomeStore } from '../store/metronomeStore';

interface PulseState {
  leftPulse: boolean;
  rightPulse: boolean;
  leftAccent: boolean;
  rightAccent: boolean;
}

type PulseCallback = (state: PulseState) => void;

/**
 * Hook that synchronizes visual pulses with the Web Audio engine.
 *
 * Uses requestAnimationFrame to poll the audio engine's visual event queue.
 * When events are ready, it calls the provided callback with pulse state.
 *
 * The pulse state is:
 *   - leftPulse: true when the left orb should flash
 *   - rightPulse: true when the right orb should flash
 *   - leftAccent / rightAccent: true when the flash is "The One"
 *
 * After a short duration (60ms), the pulse resets to false.
 */
export function usePulseSync(callback: PulseCallback): void {
  const isPlaying = useMetronomeStore((s) => s.isPlaying);
  const rafId = useRef<number | null>(null);
  const callbackRef = useRef(callback);
  const timeoutIds = useRef<number[]>([]);

  // Keep callback ref up to date
  callbackRef.current = callback;

  const tick = useCallback(() => {
    const events = drainVisualEvents();

    if (events.length > 0) {
      // Determine which hands fired
      let leftPulse = false;
      let rightPulse = false;
      let leftAccent = false;
      let rightAccent = false;

      for (const event of events) {
        if (event.hand === 'left') {
          leftPulse = true;
          if (event.isAccent) leftAccent = true;
        } else {
          rightPulse = true;
          if (event.isAccent) rightAccent = true;
        }
      }

      // Fire the pulse
      callbackRef.current({ leftPulse, rightPulse, leftAccent, rightAccent });

      // Reset after 60ms
      const resetId = window.setTimeout(() => {
        callbackRef.current({
          leftPulse: false,
          rightPulse: false,
          leftAccent: false,
          rightAccent: false,
        });
      }, 60);

      timeoutIds.current.push(resetId);
    }

    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      rafId.current = requestAnimationFrame(tick);
    } else {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      // Clear all pending reset timeouts
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
      // Reset pulse state
      callbackRef.current({
        leftPulse: false,
        rightPulse: false,
        leftAccent: false,
        rightAccent: false,
      });
    }

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, [isPlaying, tick]);
}
```

---

## Step 3: Create the Pulsing Orb Component

### 3.1 — Create the new `PulsingOrb` component

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/PulsingOrb.tsx`

Create this file with the following content:

```tsx
import { motion } from 'framer-motion';

interface PulsingOrbProps {
  side: 'left' | 'right';
  isMuted: boolean;
  isPulsing: boolean;
  isAccent: boolean;
}

export default function PulsingOrb({ side, isMuted, isPulsing, isAccent }: PulsingOrbProps) {
  const isLeft = side === 'left';

  // Base colors
  const outerIdle = isMuted
    ? 'bg-surface-light border border-border'
    : isLeft
      ? 'bg-left/10 border border-left/30'
      : 'bg-right/10 border border-right/30';

  const innerIdle = isMuted
    ? 'bg-muted/30'
    : isLeft
      ? 'bg-left/40'
      : 'bg-right/40';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Glow ring (animated) */}
      <motion.div
        className={`absolute inset-0 rounded-orb ${outerIdle}`}
        animate={{
          scale: isPulsing ? 1.15 : 1,
          opacity: isPulsing ? 1 : 0.7,
          boxShadow: isPulsing
            ? isAccent
              ? '0 0 60px rgba(232, 192, 104, 0.6)'
              : isLeft
                ? '0 0 40px rgba(212, 168, 83, 0.4)'
                : '0 0 40px rgba(232, 192, 104, 0.4)'
            : '0 0 0px rgba(212, 168, 83, 0)',
        }}
        transition={{
          duration: isPulsing ? 0.05 : 0.15,
          ease: 'easeOut',
        }}
      />

      {/* Inner orb (animated) */}
      <motion.div
        className={`relative w-12 h-12 rounded-orb ${innerIdle}`}
        animate={{
          scale: isPulsing ? 1.3 : 1,
          opacity: isPulsing ? 1 : 0.6,
          backgroundColor: isPulsing
            ? isAccent
              ? 'rgba(232, 192, 104, 0.9)'
              : isLeft
                ? 'rgba(212, 168, 83, 0.8)'
                : 'rgba(232, 192, 104, 0.8)'
            : undefined,
        }}
        transition={{
          duration: isPulsing ? 0.03 : 0.12,
          ease: 'easeOut',
        }}
      />
    </div>
  );
}
```

---

## Step 4: Update `HandColumn.tsx` to Use `PulsingOrb`

### 4.1 — Replace the static orb div in `HandColumn.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/HandColumn.tsx`

Replace the existing static orb div section with the `PulsingOrb` component.

The updated file (full content for a dumb AI):

```tsx
import { Minus, Plus, Volume2, VolumeX } from 'lucide-react';
import { MIN_RATIO, MAX_RATIO } from '../lib/constants';
import PulsingOrb from './PulsingOrb';

interface HandColumnProps {
  side: 'left' | 'right';
  label: string;
  sublabel: string;
  ratio: number;
  isMuted: boolean;
  isPulsing: boolean;
  isAccent: boolean;
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
  isPulsing,
  isAccent,
  onIncrement,
  onDecrement,
  onSetRatio,
  onToggleMute,
}: HandColumnProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <span className="label-text">{label}</span>
        <span className="text-xs text-text-secondary">{sublabel}</span>
      </div>

      {/* Pulsing Orb (animated via framer-motion) */}
      <PulsingOrb side={side} isMuted={isMuted} isPulsing={isPulsing} isAccent={isAccent} />

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

---

## Step 5: Update `App.tsx` to Wire Pulse State

### 5.1 — Replace `src/App.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/App.tsx`

Delete all existing content and replace with:

```tsx
import { useState, useCallback } from 'react';
import BpmDisplay from './components/BpmDisplay';
import HandColumn from './components/HandColumn';
import PlayButton from './components/PlayButton';
import SwapButton from './components/SwapButton';
import RatioLabel from './components/RatioLabel';
import { useMetronomeStore } from './store/metronomeStore';
import { useAudioEngine } from './hooks/useAudioEngine';
import { usePulseSync } from './hooks/usePulseSync';

export default function App() {
  // Bridge Zustand isPlaying → Web Audio engine start/stop
  useAudioEngine();

  // Pulse state for visual sync
  const [pulseState, setPulseState] = useState({
    leftPulse: false,
    rightPulse: false,
    leftAccent: false,
    rightAccent: false,
  });

  const handlePulse = useCallback(
    (state: { leftPulse: boolean; rightPulse: boolean; leftAccent: boolean; rightAccent: boolean }) => {
      setPulseState(state);
    },
    []
  );

  usePulseSync(handlePulse);

  // Store selectors
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
          isPulsing={pulseState.leftPulse}
          isAccent={pulseState.leftAccent}
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
          isPulsing={pulseState.rightPulse}
          isAccent={pulseState.rightAccent}
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

## Step 6: Verify Phase 5

### 6.1 — Run the dev server

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm dev
```

### 6.2 — Visual sync verification checklist

| # | Action | Expected Result |
|---|---|---|
| 1 | Click Play | Both orbs begin pulsing. Left orb flashes 3 times per beat, right orb flashes 4 times per beat (at default 3:4 ratio). |
| 2 | Watch the orbs | Flashes are tightly synchronized with the audio clicks. Each flash corresponds to a click — no visible delay between sound and visual. |
| 3 | Listen+watch for "The One" | When both hands hit beat 1, BOTH orbs flash larger/brighter (accent glow). |
| 4 | Click Mute on Left Hand | Left orb stops pulsing, goes dim/gray. Right orb continues pulsing. Audio for left hand also stops (from Phase 3 muting logic). |
| 5 | Click Pause | Both orbs return to idle (static, no pulsing). |
| 6 | Set BPM to 120, Play | Faster pulsing, still in sync. |
| 7 | Set extreme ratio (22:7), Play | Rapid pulsing. Left orb pulses 22 times per beat. Still visually smooth, no stuttering. |
| 8 | Browser console | Zero errors, zero warnings |

### 6.3 — Git commit

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
git add -A
git commit -m "Phase 5: framer-motion pulsing orbs synced to audio engine"
```

---

## What Phase 6 Will Do (Preview)

Phase 6 will implement mute toggling during playback, the swap button during playback, and real-time BPM adjustment while the metronome is playing (without restarting the audio engine).
