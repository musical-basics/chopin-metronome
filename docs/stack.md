# Tech Stack & Dependencies

## 1. Core Architecture
* **Framework:** Next.js 14 (App Router) or raw React.
* **Styling:** Tailwind CSS.

## 2. Audio Engine (CRITICAL)
* **API:** The native browser `Web Audio API`. 
* **Warning:** Do NOT use `setInterval` or `setTimeout` for the audio clicks. JavaScript's main thread is blocked easily, which makes `setInterval` metronomes stutter and drift. We MUST use `AudioContext.currentTime` to schedule future audio events precisely.

## 3. UI/UX Utilities
* **Animations:** `framer-motion` for the zero-latency visual pulsing that matches the audio context.
* **Icons:** `lucide-react` (Play, Pause, Settings).