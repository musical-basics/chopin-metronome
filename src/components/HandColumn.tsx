import { Minus, Plus, Volume2, VolumeX } from 'lucide-react';
import { MIN_RATIO, MAX_RATIO } from '../lib/constants';
import PulsingOrb from './PulsingOrb';

interface HandColumnProps {
  side: 'left' | 'right';
  label: string;
  sublabel: string;
  ratio: number;
  isMuted: boolean;
  isPulsing: boolean;
  isAccent: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetRatio: (ratio: number) => void;
  onToggleMute: () => void;
}

export default function HandColumn({
  side,
  label,
  sublabel,
  ratio,
  isMuted,
  isPulsing,
  isAccent,
  onIncrement,
  onDecrement,
  onSetRatio,
  onToggleMute,
}: HandColumnProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <span className="label-text">{label}</span>
        <span className="text-xs text-text-secondary">{sublabel}</span>
      </div>

      {/* Pulsing Orb (animated via framer-motion) */}
      <PulsingOrb side={side} isMuted={isMuted} isPulsing={isPulsing} isAccent={isAccent} />

      {/* Ratio selector */}
      <div className="flex items-center gap-3">
        <button
          id={`${side}-ratio-decrement`}
          onClick={onDecrement}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label={`Decrease ${label} ratio`}
        >
          <Minus size={14} />
        </button>

        <input
          id={`${side}-ratio-input`}
          type="number"
          value={ratio}
          onChange={(e) => onSetRatio(Number(e.target.value))}
          min={MIN_RATIO}
          max={MAX_RATIO}
          className="bg-transparent text-ratio-display text-text-primary text-center w-16
                     font-display outline-none"
        />

        <button
          id={`${side}-ratio-increment`}
          onClick={onIncrement}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center
                     text-text-secondary hover:border-gold hover:text-gold transition-colors"
          aria-label={`Increase ${label} ratio`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Mute toggle */}
      <button
        id={`${side}-mute-toggle`}
        onClick={onToggleMute}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
                    ${isMuted
                      ? 'bg-surface-light text-muted border border-border'
                      : 'bg-surface-light text-text-secondary border border-border hover:border-gold/50'
                    }`}
        aria-label={`${isMuted ? 'Unmute' : 'Mute'} ${label}`}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        <span>{isMuted ? 'Muted' : 'Mute'}</span>
      </button>
    </div>
  );
}
