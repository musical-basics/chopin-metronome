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
