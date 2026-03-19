# Phase 3: Web Audio Engine — Dual-Pulse Scheduling Loop

> **Goal:** Build the complete Web Audio engine that produces sound. This engine runs independently of React's render cycle by reading state directly from the Zustand store via `useMetronomeStore.getState()`. After this phase, the engine file exists and is fully functional — but it is NOT yet connected to any UI. It is a standalone module.

> **Prerequisite:** Phase 2 is fully complete. Zustand store exists at `src/store/metronomeStore.ts`.

---

## Critical Concept: Why We Cannot Use setInterval

From `stack.md`: JavaScript's `setInterval` and `setTimeout` run on the main thread and are throttled when the tab is in the background, when the thread is busy, or when the browser decides to. This causes audible drift and stuttering.

**Our approach:** We use the Web Audio API's hardware clock (`AudioContext.currentTime`) to **schedule future audio events** at precise times. A lightweight `setTimeout` loop (running ~25ms intervals) only acts as a "wake-up call" to check if new notes need to be scheduled. The actual timing precision comes from `AudioContext.currentTime`, not from `setTimeout`.

---

## Step 1: Create the Audio Engine Module

### 1.1 — Create the audio engine file

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/audio/audioEngine.ts`

Create this file with the following content:

```typescript
import { useMetronomeStore } from '../store/metronomeStore';
import {
  LEFT_FREQUENCY,
  RIGHT_FREQUENCY,
  ACCENT_FREQUENCY,
  ATTACK_TIME,
  DECAY_TIME,
  ACCENT_DECAY_TIME,
} from '../lib/constants';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

type Hand = 'left' | 'right';

// ────────────────────────────────────────────────────────────
// MODULE STATE (intentionally outside React)
// ────────────────────────────────────────────────────────────

let audioContext: AudioContext | null = null;
let schedulerTimerId: number | null = null;

// Tracking the next scheduled note time for each hand
let nextNoteTimeLeft = 0;
let nextNoteTimeRight = 0;

// Tracking the current beat index for each hand (to detect "The One")
let currentBeatLeft = 0;
let currentBeatRight = 0;

// How far ahead to schedule (seconds). Larger = more resilient to main-thread jank.
// Smaller = more responsive to BPM/ratio changes.
const SCHEDULE_AHEAD_TIME = 0.1; // 100ms lookahead

// How often the scheduler wakes up to check (milliseconds).
const SCHEDULER_INTERVAL_MS = 25;

// ────────────────────────────────────────────────────────────
// SOUND SYNTHESIS
// ────────────────────────────────────────────────────────────

/**
 * Plays a short, percussive oscillator "click" at the given time.
 *
 * - Left Hand: 400Hz sine wave (low, resonant "tock")
 * - Right Hand: 1000Hz sine wave (high, sharp "tick")
 * - Accent ("The One"): 1500Hz sine wave (chime, longer decay)
 *
 * Each note uses:
 *   - A very short linear attack (5ms) to avoid harsh clicks
 *   - An exponential decay to simulate natural percussion
 */
function playClick(time: number, hand: Hand, isAccent: boolean): void {
  if (!audioContext) return;

  const state = useMetronomeStore.getState();

  // Check if this hand is muted
  if (hand === 'left' && state.leftMuted) return;
  if (hand === 'right' && state.rightMuted) return;

  // Create oscillator
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (isAccent) {
    // "The One" — accented chime
    osc.type = 'sine';
    osc.frequency.value = ACCENT_FREQUENCY;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.6, time + ATTACK_TIME);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + ACCENT_DECAY_TIME);
    osc.start(time);
    osc.stop(time + ACCENT_DECAY_TIME + 0.01);
  } else if (hand === 'left') {
    // Left Hand — low-pitched "tock"
    osc.type = 'triangle'; // softer, more resonant than sine
    osc.frequency.value = LEFT_FREQUENCY;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.5, time + ATTACK_TIME);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + DECAY_TIME);
    osc.start(time);
    osc.stop(time + DECAY_TIME + 0.01);
  } else {
    // Right Hand — high-pitched "tick"
    osc.type = 'sine';
    osc.frequency.value = RIGHT_FREQUENCY;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.4, time + ATTACK_TIME);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + DECAY_TIME);
    osc.start(time);
    osc.stop(time + DECAY_TIME + 0.01);
  }
}

// ────────────────────────────────────────────────────────────
// INTERVAL CALCULATION
// ────────────────────────────────────────────────────────────

/**
 * Computes the time interval between consecutive notes for a given hand.
 *
 * From datastructure.md:
 *   Base interval = 60 / BPM  (seconds per beat)
 *   Hand interval = Base interval / ratio
 *
 * Example: BPM=60, leftRatio=3 → 60/60 = 1s per beat → 1/3 = 0.333s per left tick
 */
function getInterval(hand: Hand): number {
  const state = useMetronomeStore.getState();
  const baseInterval = 60.0 / state.masterBpm;
  const ratio = hand === 'left' ? state.leftRatio : state.rightRatio;
  return baseInterval / ratio;
}

// ────────────────────────────────────────────────────────────
// SCHEDULER
// ────────────────────────────────────────────────────────────

/**
 * The core scheduling loop. This function is called every ~25ms by setTimeout.
 * It checks if any notes need to be scheduled in the near future (within
 * SCHEDULE_AHEAD_TIME) and, if so, passes them to playClick with a precise
 * AudioContext timestamp.
 *
 * Key insight: setTimeout is ONLY used as a "wake-up" mechanism. The actual
 * timing precision comes from scheduling audio events at exact
 * AudioContext.currentTime values.
 */
function scheduler(): void {
  if (!audioContext) return;

  const state = useMetronomeStore.getState();
  if (!state.isPlaying) return;

  const currentTime = audioContext.currentTime;

  // Schedule Left Hand notes
  while (nextNoteTimeLeft < currentTime + SCHEDULE_AHEAD_TIME) {
    const isAccent = currentBeatLeft === 0 && currentBeatRight === 0;
    playClick(nextNoteTimeLeft, 'left', isAccent);
    nextNoteTimeLeft += getInterval('left');
    currentBeatLeft = (currentBeatLeft + 1) % state.leftRatio;
  }

  // Schedule Right Hand notes
  while (nextNoteTimeRight < currentTime + SCHEDULE_AHEAD_TIME) {
    const isAccent = currentBeatRight === 0 && currentBeatLeft === 0;
    playClick(nextNoteTimeRight, 'right', isAccent);
    nextNoteTimeRight += getInterval('right');
    currentBeatRight = (currentBeatRight + 1) % state.rightRatio;
  }

  // Schedule the next wake-up
  schedulerTimerId = window.setTimeout(scheduler, SCHEDULER_INTERVAL_MS);
}

// ────────────────────────────────────────────────────────────
// PUBLIC API
// ────────────────────────────────────────────────────────────

/**
 * Starts the audio engine. Creates the AudioContext (if needed), resets
 * beat counters, and begins the scheduling loop.
 *
 * Must be called from a user gesture (click/tap) to satisfy browser
 * autoplay policies.
 */
export function startAudio(): void {
  // Create AudioContext on first call (must be triggered by user gesture)
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Reset timing
  nextNoteTimeLeft = audioContext.currentTime;
  nextNoteTimeRight = audioContext.currentTime;
  currentBeatLeft = 0;
  currentBeatRight = 0;

  // Start the scheduling loop
  scheduler();
}

/**
 * Stops the audio engine. Clears the scheduling timer.
 * Does NOT close the AudioContext (so it can be resumed quickly).
 */
export function stopAudio(): void {
  if (schedulerTimerId !== null) {
    clearTimeout(schedulerTimerId);
    schedulerTimerId = null;
  }
}

/**
 * Returns the AudioContext instance (for use by visual sync in Phase 5).
 * Returns null if the engine has never been started.
 */
export function getAudioContext(): AudioContext | null {
  return audioContext;
}
```

---

## Step 2: Verify the Module Compiles

### 2.1 — Run the dev server to check for TypeScript errors

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm dev
```

### 2.2 — Verification checklist

| # | Check | Expected |
|---|---|---|
| 1 | Dev server starts without errors | Terminal shows `VITE vX.X.X ready` with no red errors |
| 2 | Browser console | Zero errors (the audio engine is not imported yet, so nothing happens) |
| 3 | TypeScript compilation | No type errors in `src/audio/audioEngine.ts` |

### 2.3 — Git commit

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
git add -A
git commit -m "Phase 3: Web Audio engine with dual-pulse scheduler, oscillator synthesis"
```

---

## Key Design Decisions in This Phase

1. **Module-level state (not React state):** Variables like `audioContext`, `nextNoteTimeLeft`, `currentBeatLeft` are declared at the module level (top of the file, outside any function). This is intentional — they must persist across scheduler calls and must NOT trigger React re-renders.

2. **`useMetronomeStore.getState()` instead of hooks:** The audio engine is NOT a React component. It cannot use React hooks. Instead, it reads the latest Zustand state synchronously via `getState()`. This is the entire reason we chose Zustand over `useState` — it gives us a clean escape hatch from React's render cycle.

3. **"The One" accent detection:** A beat is "The One" when BOTH `currentBeatLeft === 0` AND `currentBeatRight === 0`. This happens once per full polyrhythm cycle (e.g., every 12 ticks for a 3:4 pattern). The accent check happens independently in both the left and right scheduling loops to ensure the accent fires even if one hand is muted.

4. **No `requestAnimationFrame`:** The original `datastructure.md` pseudo-code used `requestAnimationFrame` for the scheduler. We use `setTimeout` instead because `requestAnimationFrame` is suspended when the tab is in the background, which would stop the metronome. `setTimeout` continues firing (though less frequently), and since our timing precision comes from `AudioContext.currentTime`, background throttling of `setTimeout` doesn't affect audio accuracy.

---

## What Phase 4 Will Do (Preview)

Phase 4 will connect the audio engine's `startAudio()` and `stopAudio()` functions to the Play/Pause button. When the user clicks Play, the audio engine starts. When they click Pause, it stops. Sound will actually come out of the speakers.
