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
