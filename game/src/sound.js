// Tiny synthesized sound effects: every noise the game makes is an oscillator or a burst of
// filtered noise struck at play time, so the game ships no audio files and stays fully
// offline. The context wakes on the first key or click, as browsers require a gesture.

let context = null;
let muted = false;

export function wakeAudio() {
  if (context === null) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) context = new AudioCtor();
  }
  if (context && context.state === 'suspended') context.resume();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freqFrom, freqTo, seconds, type, volume, delay = 0) {
  if (!context || muted) return;
  const start = context.currentTime + delay;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqTo), start + seconds);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
  osc.connect(gain).connect(context.destination);
  osc.start(start);
  osc.stop(start + seconds + 0.02);
}

function noiseBurst(seconds, volume, delay = 0) {
  if (!context || muted) return;
  const start = context.currentTime + delay;
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.start(start);
}

/** The turkey's startled squawk as it leaves the ground. */
export function playJump() {
  tone(620, 1180, 0.13, 'square', 0.05);
  tone(930, 1560, 0.1, 'triangle', 0.06, 0.03);
}

/** A soft wingbeat whoosh for the mid-air flap. */
export function playFlap() {
  noiseBurst(0.16, 0.12);
  tone(300, 190, 0.14, 'sine', 0.05);
}

/** A bright pop when a corn cob is grabbed. */
export function playCorn(golden) {
  tone(golden ? 880 : 660, golden ? 1560 : 990, 0.09, 'triangle', 0.09);
  if (golden) tone(1320, 1980, 0.14, 'triangle', 0.08, 0.07);
}

/** A dull thud and a squawk of protest when the turkey clips something. */
export function playHit() {
  noiseBurst(0.12, 0.2);
  tone(340, 120, 0.2, 'sawtooth', 0.08);
  tone(760, 420, 0.16, 'square', 0.05, 0.05);
}

/** Three rising notes for slipping through the Wildwood gate. */
export function playEscaped() {
  tone(523, 523, 0.14, 'triangle', 0.1);
  tone(659, 659, 0.14, 'triangle', 0.1, 0.13);
  tone(784, 1175, 0.3, 'triangle', 0.11, 0.26);
}

/** A slow descending slide-whistle of doom for the catch. */
export function playCaught() {
  tone(700, 140, 0.7, 'triangle', 0.1);
  noiseBurst(0.3, 0.08, 0.55);
}
