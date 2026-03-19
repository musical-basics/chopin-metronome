import { motion } from 'framer-motion';

interface PulsingOrbProps {
  side: 'left' | 'right';
  isMuted: boolean;
  isPulsing: boolean;
  isAccent: boolean;
}

export default function PulsingOrb({ side, isMuted, isPulsing, isAccent }: PulsingOrbProps) {
  const isLeft = side === 'left';

  // Base colors
  const outerIdle = isMuted
    ? 'bg-surface-light border border-border'
    : isLeft
      ? 'bg-left/10 border border-left/30'
      : 'bg-right/10 border border-right/30';

  const innerIdle = isMuted
    ? 'bg-muted/30'
    : isLeft
      ? 'bg-left/40'
      : 'bg-right/40';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Glow ring (animated) */}
      <motion.div
        className={`absolute inset-0 rounded-orb ${outerIdle}`}
        animate={{
          scale: isPulsing ? 1.15 : 1,
          opacity: isPulsing ? 1 : 0.7,
          boxShadow: isPulsing
            ? isAccent
              ? '0 0 60px rgba(232, 192, 104, 0.6)'
              : isLeft
                ? '0 0 40px rgba(212, 168, 83, 0.4)'
                : '0 0 40px rgba(232, 192, 104, 0.4)'
            : '0 0 0px rgba(212, 168, 83, 0)',
        }}
        transition={{
          duration: isPulsing ? 0.05 : 0.15,
          ease: 'easeOut',
        }}
      />

      {/* Inner orb (animated) */}
      <motion.div
        className={`relative w-12 h-12 rounded-orb ${innerIdle}`}
        animate={{
          scale: isPulsing ? 1.3 : 1,
          opacity: isPulsing ? 1 : 0.6,
          backgroundColor: isPulsing
            ? isAccent
              ? 'rgba(232, 192, 104, 0.9)'
              : isLeft
                ? 'rgba(212, 168, 83, 0.8)'
                : 'rgba(232, 192, 104, 0.8)'
            : undefined,
        }}
        transition={{
          duration: isPulsing ? 0.03 : 0.12,
          ease: 'easeOut',
        }}
      />
    </div>
  );
}
