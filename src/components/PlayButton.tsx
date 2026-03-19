import { Play, Pause } from 'lucide-react';
import { useMetronomeStore } from '../store/metronomeStore';

export default function PlayButton() {
  const isPlaying = useMetronomeStore((s) => s.isPlaying);
  const togglePlay = useMetronomeStore((s) => s.togglePlay);

  return (
    <button
      onClick={togglePlay}
      className="relative w-20 h-20 rounded-full bg-gold flex items-center justify-center
                 shadow-gold-glow-strong hover:bg-gold-bright active:scale-95
                 transition-all duration-150"
      aria-label={isPlaying ? 'Pause metronome' : 'Play metronome'}
    >
      {isPlaying ? (
        <Pause size={32} className="text-background" fill="#0A0A0A" />
      ) : (
        <Play size={32} className="text-background ml-1" fill="#0A0A0A" />
      )}
    </button>
  );
}
