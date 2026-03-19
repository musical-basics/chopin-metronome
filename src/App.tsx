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
  const masterBpm = useMetronomeStore((s) => s.masterBpm);
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
