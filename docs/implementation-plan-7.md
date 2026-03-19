# Phase 7: Polish — Animations, Micro-Interactions, Responsive Design, "The One" Accent

> **Goal:** Make the app feel premium and alive. Add entrance animations, hover/press micro-interactions, responsive layout for mobile, a keyboard shortcut for play/pause (spacebar), and refine the "The One" accent visual to be more dramatic.

> **Prerequisite:** Phase 6 is complete. All controls work during playback.

---

## Step 1: Add Page Entrance Animation

### 1.1 — Update `src/App.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/App.tsx`

Wrap the main content sections in framer-motion `motion.div` elements with staggered fade-in animations.

**ADD** this import at the top:

```tsx
import { motion } from 'framer-motion';
```

Replace the return statement's top-level JSX with:

```tsx
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* ── Header ── */}
      <motion.header
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="font-display text-2xl font-light tracking-widest text-gold uppercase">
          PolyRhythm Pro
        </h1>
        <p className="text-sm text-text-secondary mt-1">The Chopin Metronome</p>
      </motion.header>

      {/* ── BPM Control ── */}
      <motion.section
        className="mb-14"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      >
        <BpmDisplay />
      </motion.section>

      {/* ── Main Panel: Left Hand | Play/Swap | Right Hand ── */}
      <motion.section
        className="glass-panel px-10 py-10 flex items-center gap-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      >
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
      </motion.section>

      {/* ── Footer ── */}
      <motion.footer
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-xs text-text-secondary">
          Built for pianists who practice Chopin Nocturne Op. 9 No. 1
        </p>
      </motion.footer>
    </div>
  );
```

---

## Step 2: Add Spacebar Keyboard Shortcut for Play/Pause

### 2.1 — Create a keyboard hook

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/hooks/useKeyboardShortcuts.ts`

Create this file with the following content:

```typescript
import { useEffect } from 'react';
import { useMetronomeStore } from '../store/metronomeStore';

/**
 * Registers global keyboard shortcuts.
 * - Spacebar: Toggle Play/Pause (only when not focused on an input/button)
 */
export function useKeyboardShortcuts(): void {
  const togglePlay = useMetronomeStore((s) => s.togglePlay);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input field
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault(); // Prevent page scroll
        togglePlay();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);
}
```

### 2.2 — Use the keyboard hook in `App.tsx`

**Add** this import to `App.tsx`:

```tsx
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
```

**Add** this hook call inside the App function, after the `useAudioEngine()` call:

```tsx
export default function App() {
  useAudioEngine();
  useKeyboardShortcuts(); // ← ADD THIS LINE
  // ... rest of the component
```

---

## Step 3: Add Micro-Interaction to Play Button

### 3.1 — Update `PlayButton.tsx`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/components/PlayButton.tsx`

Delete all existing content and replace with:

```tsx
import { Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetronomeStore } from '../store/metronomeStore';

export default function PlayButton() {
  const isPlaying = useMetronomeStore((s) => s.isPlaying);
  const togglePlay = useMetronomeStore((s) => s.togglePlay);

  return (
    <motion.button
      onClick={togglePlay}
      className="relative w-20 h-20 rounded-full bg-gold flex items-center justify-center
                 shadow-gold-glow-strong hover:bg-gold-bright
                 transition-colors duration-150"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isPlaying ? 'Pause metronome' : 'Play metronome'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isPlaying ? (
          <motion.div
            key="pause"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Pause size={32} className="text-background" fill="#0A0A0A" />
          </motion.div>
        ) : (
          <motion.div
            key="play"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="ml-1"
          >
            <Play size={32} className="text-background" fill="#0A0A0A" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
```

---

## Step 4: Responsive Layout for Mobile

### 4.1 — Update `src/App.tsx` — make main panel responsive

The main panel currently uses `flex items-center gap-10` which lays out horizontally. On mobile (small screens), we need to stack vertically.

**MODIFY** the main panel `<motion.section>` className:

Change:
```tsx
className="glass-panel px-10 py-10 flex items-center gap-10"
```

To:
```tsx
className="glass-panel px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-10"
```

### 4.2 — Update `BpmDisplay.tsx` — responsive slider width

**MODIFY** the slider's className:

Change:
```tsx
className="w-72 h-1 ..."
```

To:
```tsx
className="w-56 sm:w-72 h-1 ..."
```

### 4.3 — Update `App.tsx` — responsive header spacing

**MODIFY** the header's className:

Change:
```tsx
className="mb-12 text-center"
```

To:
```tsx
className="mb-8 sm:mb-12 text-center"
```

And the BPM section's className:

Change:
```tsx
className="mb-14"
```

To:
```tsx
className="mb-8 sm:mb-14"
```

---

## Step 5: Add Subtle Background Gradient

### 5.1 — Update `src/index.css`

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/index.css`

**ADD** this rule inside the `@layer base` block, after the `body` rule:

```css
  #root {
    min-height: 100vh;
    background: radial-gradient(
      ellipse at 50% 0%,
      rgba(212, 168, 83, 0.03) 0%,
      transparent 60%
    );
  }
```

---

## Step 6: Add "Playing" Indicator to Header

### 6.1 — Update the header in `App.tsx`

Add a small pulsing dot next to the title when playing, to give a global "recording" feel.

**ADD** this inside the `<motion.header>` tag, after the subtitle `<p>`:

```tsx
{useMetronomeStore.getState().isPlaying && (
  <motion.div
    className="w-2 h-2 rounded-full bg-gold mx-auto mt-3"
    animate={{ opacity: [1, 0.3, 1] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
  />
)}
```

Wait — using `getState()` in JSX won't update reactively. We need a store selector. **Instead, use the existing subscription pattern:**

Since `isPlaying` isn't already imported in the App component, **ADD** this to the store selectors block in `App.tsx`:

```tsx
const isPlaying = useMetronomeStore((s) => s.isPlaying);
```

Then use `isPlaying` (not `getState()`):

```tsx
{isPlaying && (
  <motion.div
    className="w-2 h-2 rounded-full bg-gold mx-auto mt-3"
    animate={{ opacity: [1, 0.3, 1] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
  />
)}
```

---

## Step 7: Full Updated `App.tsx` (Complete File)

For a dumb AI that needs the entire file after all Phase 7 changes:

**File:** `/Users/lionelyu/Documents/New Version/chopin-metronome/src/App.tsx`

Delete all existing content and replace with:

```tsx
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import BpmDisplay from './components/BpmDisplay';
import HandColumn from './components/HandColumn';
import PlayButton from './components/PlayButton';
import SwapButton from './components/SwapButton';
import RatioLabel from './components/RatioLabel';
import { useMetronomeStore } from './store/metronomeStore';
import { useAudioEngine } from './hooks/useAudioEngine';
import { usePulseSync } from './hooks/usePulseSync';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  // Hooks
  useAudioEngine();
  useKeyboardShortcuts();

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
  const isPlaying = useMetronomeStore((s) => s.isPlaying);
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* ── Header ── */}
      <motion.header
        className="mb-8 sm:mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="font-display text-2xl font-light tracking-widest text-gold uppercase">
          PolyRhythm Pro
        </h1>
        <p className="text-sm text-text-secondary mt-1">The Chopin Metronome</p>
        {isPlaying && (
          <motion.div
            className="w-2 h-2 rounded-full bg-gold mx-auto mt-3"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.header>

      {/* ── BPM Control ── */}
      <motion.section
        className="mb-8 sm:mb-14"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      >
        <BpmDisplay />
      </motion.section>

      {/* ── Main Panel: Left Hand | Play/Swap | Right Hand ── */}
      <motion.section
        className="glass-panel px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      >
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
      </motion.section>

      {/* ── Footer ── */}
      <motion.footer
        className="mt-8 sm:mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-xs text-text-secondary">
          Built for pianists who practice Chopin Nocturne Op. 9 No. 1
        </p>
      </motion.footer>
    </div>
  );
}
```

---

## Step 8: Verify Phase 7

### 8.1 — Run the dev server

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
pnpm dev
```

### 8.2 — Polish verification checklist

| # | Action | Expected Result |
|---|---|---|
| 1 | Refresh the page | All sections fade in with staggered timing: header first, then BPM, then main panel, then footer. Smooth easeOut transitions. |
| 2 | Hover over the Play button | Button scales up slightly (1.05x). Smooth and satisfying. |
| 3 | Click the Play button | Button scales down briefly (0.92x) on press (spring feel). Play/Pause icon crossfades smoothly. |
| 4 | Press Spacebar | Toggles Play/Pause without scrolling the page. Works when no input is focused. |
| 5 | Focus on BPM input, press Spacebar | Does NOT toggle play (input captures the key). |
| 6 | Play the metronome, look at header | A small gold dot pulses gently (breathe animation) below the subtitle. |
| 7 | Pause the metronome | Gold dot disappears. |
| 8 | Resize browser to ~375px wide (mobile) | Layout stacks vertically: Left Hand on top, Center controls in middle, Right Hand on bottom. Padding reduces. Everything fits without horizontal scrolling. |
| 9 | Check the very top-left of the background | Extremely subtle radial gold gradient emanates from the top center. Almost invisible but adds depth. |
| 10 | Browser console | Zero errors, zero warnings |

### 8.3 — Git commit

```bash
cd /Users/lionelyu/Documents/New\ Version/chopin-metronome
git add -A
git commit -m "Phase 7: entrance animations, keyboard shortcuts, responsive layout, micro-interactions, polish"
```

---

## What Phase 8 Will Do (Preview)

Phase 8 is the final phase: accessibility audit, SEO meta tags, production build optimization, and final QA pass.
