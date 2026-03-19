# User Flow & State Machine

## 1. The Idle State
* User lands on the page.
* Sees a massive Master BPM control in the center (default: 60 BPM).
* Below it, two distinct columns: "Left Hand (Base)" and "Right Hand (Treble)".
* User sets Left Hand to `3` and Right Hand to `4`.
* Hits a giant, gold "Play" button.

## 2. The Active State (Playing)
* The Web Audio API context resumes.
* The system calculates the interval for each hand:
  * Base interval: `60 / BPM` seconds.
  * Left interval: `Base interval / LeftRatio`.
  * Right interval: `Base interval / RightRatio`.
* The visual UI shows two pulsing orbs. The Left orb flashes 3 times per beat, the Right orb flashes 4 times per beat. 
* User can adjust the BPM slider in real-time without stopping the metronome.

## 3. The Customization Flow
* User clicks a "Mute" toggle on either hand to isolate one rhythm.
* User clicks "Swap" to instantly invert the ratio (e.g., changing 4-against-3 to 3-against-4).