import { Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetronomeStore } from '../store/metronomeStore';

export default function PlayButton() {
  const isPlaying = useMetronomeStore((s) => s.isPlaying);
  const togglePlay = useMetronomeStore((s) => s.togglePlay);

  return (
    <motion.button
      onClick={togglePlay}
      className="relative w-20 h-20 rounded-full bg-gold flex items-center justify-center
                 shadow-gold-glow-strong hover:bg-gold-bright
                 transition-colors duration-150"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isPlaying ? 'Pause metronome' : 'Play metronome'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isPlaying ? (
          <motion.div
            key="pause"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <Pause size={32} className="text-background" fill="#0A0A0A" />
          </motion.div>
        ) : (
          <motion.div
            key="play"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="ml-1"
          >
            <Play size={32} className="text-background" fill="#0A0A0A" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
