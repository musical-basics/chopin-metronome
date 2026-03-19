import BpmDisplay from './components/BpmDisplay';
import HandColumn from './components/HandColumn';
import PlayButton from './components/PlayButton';
import SwapButton from './components/SwapButton';
import RatioLabel from './components/RatioLabel';
import { useMetronomeStore } from './store/metronomeStore';

export default function App() {
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
