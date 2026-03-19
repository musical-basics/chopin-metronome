import { Minus, Plus } from 'lucide-react';
import { useMetronomeStore } from '../store/metronomeStore';
import { MIN_BPM, MAX_BPM } from '../lib/constants';

export default function BpmDisplay() {
  const masterBpm = useMetronomeStore((s) => s.masterBpm);
  const setMasterBpm = useMetronomeStore((s) => s.setMasterBpm);
  const incrementBpm = useMetronomeStore((s) => s.incrementBpm);
  const decrementBpm = useMetronomeStore((s) => s.decrementBpm);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Label */}
      <span className="label-text">Master Tempo</span>

      {/* BPM number + stepper buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={decrementBpm}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label="Decrease BPM"
        >
          <Minus size={18} />
        </button>

        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={masterBpm}
            onChange={(e) => setMasterBpm(Number(e.target.value))}
            className="bg-transparent text-bpm-display text-text-primary text-center w-36
                       font-display outline-none caret-gold"
            min={MIN_BPM}
            max={MAX_BPM}
          />
          <span className="label-text text-text-secondary">BPM</span>
        </div>

        <button
          onClick={incrementBpm}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label="Increase BPM"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* BPM Slider */}
      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={masterBpm}
        onChange={(e) => setMasterBpm(Number(e.target.value))}
        className="w-72 h-1 bg-border rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-gold
                   [&::-webkit-slider-thumb]:shadow-gold-glow
                   [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}
