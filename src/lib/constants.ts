// ── BPM Limits ──
export const MIN_BPM = 20;
export const MAX_BPM = 240;
export const DEFAULT_BPM = 60;

// ── Ratio Limits ──
export const MIN_RATIO = 1;
export const MAX_RATIO = 32;
export const DEFAULT_LEFT_RATIO = 3;
export const DEFAULT_RIGHT_RATIO = 4;

// ── Oscillator Frequencies (Hz) ──
// Left Hand: low-pitched, resonant "tock" (sine/triangle, 400Hz)
export const LEFT_FREQUENCY = 400;
// Right Hand: high-pitched, sharp "tick" (sine, 1000Hz)
export const RIGHT_FREQUENCY = 1000;
// "The One": accented chime when both hands hit beat 1 simultaneously
export const ACCENT_FREQUENCY = 1500;

// ── Oscillator Envelope ──
export const ATTACK_TIME = 0.005;    // 5ms attack (very short)
export const DECAY_TIME = 0.08;      // 80ms exponential decay
export const ACCENT_DECAY_TIME = 0.15; // 150ms for the accent chime (longer ring)
