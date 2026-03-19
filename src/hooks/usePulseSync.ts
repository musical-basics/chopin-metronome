import { useEffect, useRef, useCallback } from 'react';
import { drainVisualEvents } from '../audio/audioEngine';
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
