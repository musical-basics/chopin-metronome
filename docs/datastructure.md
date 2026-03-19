# Data Structures & Schemas

## 1. App State (Zustand or React `useState`)
```typescript
interface MetronomeState {
  isPlaying: boolean;
  masterBpm: number;
  leftRatio: number;   // e.g., 3
  rightRatio: number;  // e.g., 4
  leftMuted: boolean;
  rightMuted: boolean;
}
2. Web Audio Scheduling Logic
Because we cannot rely on React state to trigger perfect audio, the scheduling loop runs independently:

TypeScript
// Conceptual logic for the audio scheduler:
const scheduleAheadTime = 0.1; // How far ahead to schedule (seconds)
let nextNoteTimeLeft = audioContext.currentTime;
let nextNoteTimeRight = audioContext.currentTime;

function scheduler() {
  while (nextNoteTimeLeft < audioContext.currentTime + scheduleAheadTime) {
    scheduleNote('left', nextNoteTimeLeft);
    nextNoteTimeLeft += (60.0 / masterBpm) / leftRatio;
  }
  while (nextNoteTimeRight < audioContext.currentTime + scheduleAheadTime) {
    scheduleNote('right', nextNoteTimeRight);
    nextNoteTimeRight += (60.0 / masterBpm) / rightRatio;
  }
  timerID = requestAnimationFrame(scheduler);
}