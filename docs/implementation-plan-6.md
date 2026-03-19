# Phase 6: Mute, Swap, and Real-Time BPM Adjustments During Playback

> **Goal:** Ensure that muting/unmuting a hand, swapping ratios, and changing BPM all work seamlessly WHILE the metronome is already playing — without stopping and restarting the audio engine.

> **Prerequisite:** Phase 5 is complete. Audio plays and orbs pulse in sync.

---

## Why This Phase Exists

In Phases 2–4, we built the controls and audio engine separately. The audio engine reads from Zustand via `useMetronomeStore.getState()` on every scheduler tick, so BPM and ratio changes are *already* picked up in real-time by the scheduling loop.

However, there are edge cases and UX improvements we need to handle:

1. **BPM changes during playback** — the scheduler already reads the latest BPM, but we need to ensure the slider and input feel smooth.
2. **Ratio changes during playback** — changing ratios mid-playback can create timing discontinuities. We need to reset the beat counter for the changed hand.
3. **Swap during playback** — swapping ratios should reset both beat counters.
4. **Mute during playback** — already works at the audio level (Phase 3 checks `leftMuted`/`rightMuted`), but the orb needs to stop pulsing immediately.

---

## Step 1: Add Beat Counter Reset Capability to Audio Engine

### 1.1 — Update `src/audio/audioEngine.ts`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/audio/audioEngine.ts`

**ADD** a new exported function at the bottom of the file (before any closing comments):

```typescript
/**
 * Resets the beat counters and re-aligns the next note times
 * to the current AudioContext time. Call this when ratios change
 * during playback to avoid timing discontinuities.
 *
 * @param hand - Which hand to reset. If 'both', resets both hands.
 */
export function resetBeatCounters(hand: 'left' | 'right' | 'both'): void {
  if (!audioContext) return;

  const now = audioContext.currentTime;

  if (hand === 'left' || hand === 'both') {
    currentBeatLeft = 0;
    nextNoteTimeLeft = now;
  }
  if (hand === 'right' || hand === 'both') {
    currentBeatRight = 0;
    nextNoteTimeRight = now;
  }
}
```

---

## Step 2: Update Zustand Store to Reset Beat Counters on Ratio/Swap Changes

### 2.1 — Update `src/store/metronomeStore.ts`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/store/metronomeStore.ts`

**ADD** this import at the top of the file:

```typescript
import { resetBeatCounters } from '../audio/audioEngine';
```

**MODIFY** the following actions to add beat counter resets. Replace only these specific action implementations:

```typescript
  setLeftRatio: (ratio: number) =>
    set(() => {
      resetBeatCounters('left');
      return { leftRatio: clamp(Math.round(ratio), MIN_RATIO, MAX_RATIO) };
    }),

  setRightRatio: (ratio: number) =>
    set(() => {
      resetBeatCounters('right');
      return { rightRatio: clamp(Math.round(ratio), MIN_RATIO, MAX_RATIO) };
    }),

  incrementLeftRatio: () =>
    set((state) => {
      resetBeatCounters('left');
      return { leftRatio: clamp(state.leftRatio + 1, MIN_RATIO, MAX_RATIO) };
    }),

  decrementLeftRatio: () =>
    set((state) => {
      resetBeatCounters('left');
      return { leftRatio: clamp(state.leftRatio - 1, MIN_RATIO, MAX_RATIO) };
    }),

  incrementRightRatio: () =>
    set((state) => {
      resetBeatCounters('right');
      return { rightRatio: clamp(state.rightRatio + 1, MIN_RATIO, MAX_RATIO) };
    }),

  decrementRightRatio: () =>
    set((state) => {
      resetBeatCounters('right');
      return { rightRatio: clamp(state.rightRatio - 1, MIN_RATIO, MAX_RATIO) };
    }),

  swapRatios: () =>
    set((state) => {
      resetBeatCounters('both');
      return { leftRatio: state.rightRatio, rightRatio: state.leftRatio };
    }),
```

> **IMPORTANT:** The actions that do NOT need beat counter resets are: `togglePlay`, `setMasterBpm`, `incrementBpm`, `decrementBpm`, `toggleLeftMute`, `toggleRightMute`. These all work correctly without resetting because:
> - BPM changes are picked up naturally by `getInterval()` on the next scheduler tick.
> - Mute changes are picked up by the `playClick()` function's mute check.

---

## Step 3: Ensure BPM Slider Feels Smooth During Playback

The BPM slider already works because `setMasterBpm` updates the Zustand store, and the audio engine reads `masterBpm` via `getState()` on every scheduler tick. The interval changes gradually and naturally.

**No code changes needed for this step.** This is a verification-only step.

---

## Step 4: Verify Phase 6

### 4.1 — Run the dev server

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm dev
```

### 4.2 — Real-time control verification checklist

| # | Action | Expected Result |
|---|---|---|
| 1 | Start playing (3:4 at 60 BPM) | Audio and visual pulses are steady, in sync. |
| 2 | While playing, drag BPM slider to 120 | Tempo smoothly speeds up in real-time. No glitches, no restart, no gap in audio. |
| 3 | While playing, drag BPM slider back to 60 | Tempo smoothly slows down. |
| 4 | While playing, type `180` into BPM input | Immediate tempo change. |
| 5 | While playing, click Left Hand `+` (3→4) | Left hand rhythm changes immediately. Pattern is now 4:4. Beat counter resets — no timing discontinuity. |
| 6 | While playing, click Left Hand `-` (4→3) | Reverts to 3:4. Smooth reset. |
| 7 | While playing, click "Swap" | Ratio display swaps (3:4 → 4:3). The low tock now plays 4 times per beat, the high tick plays 3 times. Both counters reset cleanly. |
| 8 | While playing, click "Mute" on Left Hand | Left hand audio stops immediately. Left orb goes dim. Right hand continues uninterrupted. |
| 9 | While playing, unmute Left Hand | Left hand audio resumes on the next scheduled tick. Orb starts pulsing again. |
| 10 | While playing, mute BOTH hands | No audio (complete silence), but the Play button still shows Pause (engine is still running). |
| 11 | While playing, unmute both hands | Audio resumes. |
| 12 | Extreme test: play at 240 BPM, 22:7 ratio, rapidly swap and change ratios | No crashes, no audio glitches, no console errors. May sound chaotic but should be stable. |
| 13 | Browser console | Zero errors, zero warnings |

### 4.3 — Git commit

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
git add -A
git commit -m "Phase 6: real-time BPM, ratio, mute, swap controls during playback"
```

---

## What Phase 7 Will Do (Preview)

Phase 7 will add polish: micro-animations on hover/press, page entrance animations, responsive layout for mobile, and refinement of the "The One" accent visual effect.
