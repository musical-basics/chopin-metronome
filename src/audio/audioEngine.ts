import { useMetronomeStore } from '../store/metronomeStore';
import {
  LEFT_FREQUENCY,
  RIGHT_FREQUENCY,
  ACCENT_FREQUENCY,
  ATTACK_TIME,
  DECAY_TIME,
  ACCENT_DECAY_TIME,
} from '../lib/constants';

// ────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────

type Hand = 'left' | 'right';

// ────────────────────────────────────────────────────────────
// MODULE STATE (intentionally outside React)
// ────────────────────────────────────────────────────────────

let audioContext: AudioContext | null = null;
let schedulerTimerId: number | null = null;

// Tracking the next scheduled note time for each hand
let nextNoteTimeLeft = 0;
let nextNoteTimeRight = 0;

// Tracking the current beat index for each hand (to detect "The One")
let currentBeatLeft = 0;
let currentBeatRight = 0;

// How far ahead to schedule (seconds). Larger = more resilient to main-thread jank.
// Smaller = more responsive to BPM/ratio changes.
const SCHEDULE_AHEAD_TIME = 0.1; // 100ms lookahead

// How often the scheduler wakes up to check (milliseconds).
const SCHEDULER_INTERVAL_MS = 25;

// ────────────────────────────────────────────────────────────
// VISUAL SYNC CALLBACK SYSTEM
// ────────────────────────────────────────────────────────────

export interface VisualEvent {
  hand: Hand;
  time: number;       // AudioContext.currentTime when the note plays
  isAccent: boolean;
}

// Queue of upcoming visual events (consumed by usePulseSync hook)
const visualEventQueue: VisualEvent[] = [];

// Maximum events in queue before we start dropping old ones
const MAX_QUEUE_SIZE = 64;

// ────────────────────────────────────────────────────────────
// SOUND SYNTHESIS
// ────────────────────────────────────────────────────────────

/**
 * Plays a short, percussive oscillator "click" at the given time.
 *
 * - Left Hand: 400Hz triangle wave (low, resonant "tock")
 * - Right Hand: 1000Hz sine wave (high, sharp "tick")
 * - Accent ("The One"): 1500Hz sine wave (chime, longer decay)
 *
 * Each note uses:
 *   - A very short linear attack (5ms) to avoid harsh clicks
 *   - An exponential decay to simulate natural percussion
 */
function playClick(time: number, hand: Hand, isAccent: boolean): void {
  if (!audioContext) return;

  const state = useMetronomeStore.getState();

  // Check if this hand is muted
  if (hand === 'left' && state.leftMuted) return;
  if (hand === 'right' && state.rightMuted) return;

  // Create oscillator
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (isAccent) {
    // "The One" — accented chime
    osc.type = 'sine';
    osc.frequency.value = ACCENT_FREQUENCY;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.6, time + ATTACK_TIME);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + ACCENT_DECAY_TIME);
    osc.start(time);
    osc.stop(time + ACCENT_DECAY_TIME + 0.01);
  } else if (hand === 'left') {
    // Left Hand — low-pitched "tock"
    osc.type = 'triangle'; // softer, more resonant than sine
    osc.frequency.value = LEFT_FREQUENCY;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.5, time + ATTACK_TIME);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + DECAY_TIME);
    osc.start(time);
    osc.stop(time + DECAY_TIME + 0.01);
  } else {
    // Right Hand — high-pitched "tick"
    osc.type = 'sine';
    osc.frequency.value = RIGHT_FREQUENCY;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.4, time + ATTACK_TIME);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + DECAY_TIME);
    osc.start(time);
    osc.stop(time + DECAY_TIME + 0.01);
  }

  // Push visual event to the queue (consumed by usePulseSync hook)
  if (visualEventQueue.length < MAX_QUEUE_SIZE) {
    visualEventQueue.push({ hand, time, isAccent });
  }
}

// ────────────────────────────────────────────────────────────
// INTERVAL CALCULATION
// ────────────────────────────────────────────────────────────

/**
 * Computes the time interval between consecutive notes for a given hand.
 *
 * From datastructure.md:
 *   Base interval = 60 / BPM  (seconds per beat)
 *   Hand interval = Base interval / ratio
 *
 * Example: BPM=60, leftRatio=3 → 60/60 = 1s per beat → 1/3 = 0.333s per left tick
 */
function getInterval(hand: Hand): number {
  const state = useMetronomeStore.getState();
  const baseInterval = 60.0 / state.masterBpm;
  const ratio = hand === 'left' ? state.leftRatio : state.rightRatio;
  return baseInterval / ratio;
}

// ────────────────────────────────────────────────────────────
// SCHEDULER
// ────────────────────────────────────────────────────────────

/**
 * The core scheduling loop. This function is called every ~25ms by setTimeout.
 * It checks if any notes need to be scheduled in the near future (within
 * SCHEDULE_AHEAD_TIME) and, if so, passes them to playClick with a precise
 * AudioContext timestamp.
 *
 * Key insight: setTimeout is ONLY used as a "wake-up" mechanism. The actual
 * timing precision comes from scheduling audio events at exact
 * AudioContext.currentTime values.
 */
function scheduler(): void {
  if (!audioContext) return;

  const state = useMetronomeStore.getState();
  if (!state.isPlaying) return;

  const currentTime = audioContext.currentTime;

  // Snapshot beat counters BEFORE scheduling either hand.
  // This ensures both loops see the same state when detecting "The One".
  const leftBeatSnapshot = currentBeatLeft;
  const rightBeatSnapshot = currentBeatRight;

  // Schedule Left Hand notes
  while (nextNoteTimeLeft < currentTime + SCHEDULE_AHEAD_TIME) {
    const isAccent = currentBeatLeft === 0 && rightBeatSnapshot === 0;
    playClick(nextNoteTimeLeft, 'left', isAccent);
    nextNoteTimeLeft += getInterval('left');
    currentBeatLeft = (currentBeatLeft + 1) % state.leftRatio;
  }

  // Schedule Right Hand notes
  while (nextNoteTimeRight < currentTime + SCHEDULE_AHEAD_TIME) {
    const isAccent = currentBeatRight === 0 && leftBeatSnapshot === 0;
    playClick(nextNoteTimeRight, 'right', isAccent);
    nextNoteTimeRight += getInterval('right');
    currentBeatRight = (currentBeatRight + 1) % state.rightRatio;
  }

  // Schedule the next wake-up
  schedulerTimerId = window.setTimeout(scheduler, SCHEDULER_INTERVAL_MS);
}

// ────────────────────────────────────────────────────────────
// PUBLIC API
// ────────────────────────────────────────────────────────────

/**
 * Starts the audio engine. Creates the AudioContext (if needed), resets
 * beat counters, and begins the scheduling loop.
 *
 * Must be called from a user gesture (click/tap) to satisfy browser
 * autoplay policies.
 */
export function startAudio(): void {
  // Create AudioContext on first call (must be triggered by user gesture)
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Reset timing
  nextNoteTimeLeft = audioContext.currentTime;
  nextNoteTimeRight = audioContext.currentTime;
  currentBeatLeft = 0;
  currentBeatRight = 0;

  // Start the scheduling loop
  scheduler();
}

/**
 * Stops the audio engine. Clears the scheduling timer.
 * Does NOT close the AudioContext (so it can be resumed quickly).
 */
export function stopAudio(): void {
  if (schedulerTimerId !== null) {
    clearTimeout(schedulerTimerId);
    schedulerTimerId = null;
  }
  // Clear any pending visual events
  visualEventQueue.length = 0;
}

/**
 * Returns the AudioContext instance (for use by visual sync in Phase 5).
 * Returns null if the engine has never been started.
 */
export function getAudioContext(): AudioContext | null {
  return audioContext;
}

/**
 * Drains all visual events that should have fired by now.
 * Called by the usePulseSync hook on every animation frame.
 *
 * Returns an array of events whose scheduled time has passed.
 * Removes them from the internal queue.
 */
export function drainVisualEvents(): VisualEvent[] {
  if (!audioContext) return [];

  const now = audioContext.currentTime;
  const ready: VisualEvent[] = [];

  while (visualEventQueue.length > 0 && visualEventQueue[0].time <= now) {
    ready.push(visualEventQueue.shift()!);
  }

  return ready;
}

/**
 * Resets the beat counters and re-aligns the next note times
 * to the current AudioContext time. Call this when ratios change
 * during playback to avoid timing discontinuities.
 *
 * @param hand - Which hand to reset. If 'both', resets both hands.
 */
export function resetBeatCounters(hand: 'left' | 'right' | 'both'): void {
  if (!audioContext) return;

  const now = audioContext.currentTime;

  if (hand === 'left' || hand === 'both') {
    currentBeatLeft = 0;
    nextNoteTimeLeft = now;
  }
  if (hand === 'right' || hand === 'both') {
    currentBeatRight = 0;
    nextNoteTimeRight = now;
  }
}
