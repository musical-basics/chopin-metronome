import { Play } from 'lucide-react';

export default function PlayButton() {
  const isPlaying = false;

  return (
    <button
      className="relative w-20 h-20 rounded-full bg-gold flex items-center justify-center
                 shadow-gold-glow-strong hover:bg-gold-bright active:scale-95
                 transition-all duration-150"
      aria-label={isPlaying ? 'Pause metronome' : 'Play metronome'}
    >
      {/* Always show Play icon in Phase 1 (no toggle logic yet) */}
      <Play size={32} className="text-background ml-1" fill="#0A0A0A" />
    </button>
  );
}
