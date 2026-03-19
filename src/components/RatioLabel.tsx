import { DEFAULT_LEFT_RATIO, DEFAULT_RIGHT_RATIO } from '../lib/constants';

export default function RatioLabel() {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-2xl text-text-primary font-light tracking-wider">
        {DEFAULT_LEFT_RATIO} <span className="text-gold mx-1">:</span> {DEFAULT_RIGHT_RATIO}
      </span>
      <span className="label-text">Polyrhythm</span>
    </div>
  );
}
