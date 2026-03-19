import BpmDisplay from './components/BpmDisplay';
import HandColumn from './components/HandColumn';
import PlayButton from './components/PlayButton';
import SwapButton from './components/SwapButton';
import RatioLabel from './components/RatioLabel';
import { DEFAULT_LEFT_RATIO, DEFAULT_RIGHT_RATIO } from './lib/constants';

export default function App() {
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
          ratio={DEFAULT_LEFT_RATIO}
          isMuted={false}
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
          ratio={DEFAULT_RIGHT_RATIO}
          isMuted={false}
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
