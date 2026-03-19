import { useMetronomeStore } from '../store/metronomeStore';

export default function RatioLabel() {
  const leftRatio = useMetronomeStore((s) => s.leftRatio);
  const rightRatio = useMetronomeStore((s) => s.rightRatio);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-2xl text-text-primary font-light tracking-wider">
        {leftRatio} <span className="text-gold mx-1">:</span> {rightRatio}
      </span>
      <span className="label-text">Polyrhythm</span>
    </div>
  );
}
