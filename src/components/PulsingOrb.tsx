import { motion } from 'framer-motion';

interface PulsingOrbProps {
  side: 'left' | 'right';
  isMuted: boolean;
  isPulsing: boolean;
  isAccent: boolean;
}

export default function PulsingOrb({ side, isMuted, isPulsing, isAccent }: PulsingOrbProps) {
  const isLeft = side === 'left';

  // 3 distinct colors:
  // Left = warm amber (#E8924C)
  // Right = cool blue (#5BA4E8)
  // Accent "The One" = bright gold (#D4A853)
  const colors = isLeft
    ? {
        outerBg: 'bg-left/10',
        outerBorder: 'border-left/30',
        innerBg: 'bg-left/40',
        pulseGlow: 'rgba(232, 146, 76, 0.4)',
        accentGlow: 'rgba(212, 168, 83, 0.6)',
        pulseColor: 'rgba(232, 146, 76, 0.8)',
        accentColor: 'rgba(212, 168, 83, 0.95)',
      }
    : {
        outerBg: 'bg-right/10',
        outerBorder: 'border-right/30',
        innerBg: 'bg-right/40',
        pulseGlow: 'rgba(91, 164, 232, 0.4)',
        accentGlow: 'rgba(212, 168, 83, 0.6)',
        pulseColor: 'rgba(91, 164, 232, 0.8)',
        accentColor: 'rgba(212, 168, 83, 0.95)',
      };

  const outerIdle = isMuted
    ? 'bg-surface-light border border-border'
    : `${colors.outerBg} border ${colors.outerBorder}`;

  const innerIdle = isMuted
    ? 'bg-muted/30'
    : colors.innerBg;

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
              ? `0 0 60px ${colors.accentGlow}`
              : `0 0 40px ${colors.pulseGlow}`
            : '0 0 0px rgba(0, 0, 0, 0)',
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
              ? colors.accentColor
              : colors.pulseColor
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
