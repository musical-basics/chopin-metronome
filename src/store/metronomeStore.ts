import { create } from 'zustand';
import {
  DEFAULT_BPM,
  MIN_BPM,
  MAX_BPM,
  DEFAULT_LEFT_RATIO,
  DEFAULT_RIGHT_RATIO,
  MIN_RATIO,
  MAX_RATIO,
} from '../lib/constants';

interface MetronomeState {
  // ── State ──
  isPlaying: boolean;
  masterBpm: number;
  leftRatio: number;
  rightRatio: number;
  leftMuted: boolean;
  rightMuted: boolean;

  // ── Actions ──
  togglePlay: () => void;
  setMasterBpm: (bpm: number) => void;
  incrementBpm: () => void;
  decrementBpm: () => void;
  setLeftRatio: (ratio: number) => void;
  setRightRatio: (ratio: number) => void;
  incrementLeftRatio: () => void;
  decrementLeftRatio: () => void;
  incrementRightRatio: () => void;
  decrementRightRatio: () => void;
  toggleLeftMute: () => void;
  toggleRightMute: () => void;
  swapRatios: () => void;
}

// Helper: clamp a number between min and max
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const useMetronomeStore = create<MetronomeState>((set) => ({
  // ── Initial State ──
  isPlaying: false,
  masterBpm: DEFAULT_BPM,
  leftRatio: DEFAULT_LEFT_RATIO,
  rightRatio: DEFAULT_RIGHT_RATIO,
  leftMuted: false,
  rightMuted: false,

  // ── Actions ──
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setMasterBpm: (bpm: number) =>
    set(() => ({ masterBpm: clamp(Math.round(bpm), MIN_BPM, MAX_BPM) })),

  incrementBpm: () =>
    set((state) => ({ masterBpm: clamp(state.masterBpm + 1, MIN_BPM, MAX_BPM) })),

  decrementBpm: () =>
    set((state) => ({ masterBpm: clamp(state.masterBpm - 1, MIN_BPM, MAX_BPM) })),

  setLeftRatio: (ratio: number) =>
    set(() => ({ leftRatio: clamp(Math.round(ratio), MIN_RATIO, MAX_RATIO) })),

  setRightRatio: (ratio: number) =>
    set(() => ({ rightRatio: clamp(Math.round(ratio), MIN_RATIO, MAX_RATIO) })),

  incrementLeftRatio: () =>
    set((state) => ({ leftRatio: clamp(state.leftRatio + 1, MIN_RATIO, MAX_RATIO) })),

  decrementLeftRatio: () =>
    set((state) => ({ leftRatio: clamp(state.leftRatio - 1, MIN_RATIO, MAX_RATIO) })),

  incrementRightRatio: () =>
    set((state) => ({ rightRatio: clamp(state.rightRatio + 1, MIN_RATIO, MAX_RATIO) })),

  decrementRightRatio: () =>
    set((state) => ({ rightRatio: clamp(state.rightRatio - 1, MIN_RATIO, MAX_RATIO) })),

  toggleLeftMute: () =>
    set((state) => ({ leftMuted: !state.leftMuted })),

  toggleRightMute: () =>
    set((state) => ({ rightMuted: !state.rightMuted })),

  swapRatios: () =>
    set((state) => ({ leftRatio: state.rightRatio, rightRatio: state.leftRatio })),
}));
