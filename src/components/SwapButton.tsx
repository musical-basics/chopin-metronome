import { ArrowLeftRight } from 'lucide-react';
import { useMetronomeStore } from '../store/metronomeStore';

export default function SwapButton() {
  const swapRatios = useMetronomeStore((s) => s.swapRatios);

  return (
    <button
      onClick={swapRatios}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                 bg-surface-light text-text-secondary border border-border
                 hover:border-gold/50 hover:text-gold transition-colors"
      aria-label="Swap left and right hand ratios"
    >
      <ArrowLeftRight size={16} />
      <span>Swap</span>
    </button>
  );
}
