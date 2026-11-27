// Turkey Run — all sound is synthesized with WebAudio oscillators.
// One clear job: gobbles, pickups, alarms, hits and a plucky farm tune.

let audioContext = null;
let musicTimer = null;
let muted = false;
let musicStep = 0;

// A cheerful little farm melody, notes as [frequency, beats].
const MELODY = [
  [523, 1], [659, 1], [784, 1], [659, 1], [880, 2], [784, 1], [659, 1],
  [587, 1], [523, 2], [0, 1], [523, 1], [659, 1], [784, 1], [880, 1],
  [784, 2], [659, 1], [587, 1], [523, 2], [0, 1],
];

export function ensureAudioContext() {
  if (!audioContext) {
    try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioContext = null; }
  }
  if (audioContext && audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

export function isMuted() { return muted; }

export function toggleMute() {
  muted = !muted;
  if (muted) stopFarmMusic();
  return muted;
}

function playTone(freq, durMs, type, volume, whenMs = 0) {
  if (muted) return;
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const t0 = ctx.currentTime + whenMs / 1000;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(volume || 0.12, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + durMs / 1000);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + durMs / 1000 + 0.02);
}

export function playGobble() {
  // Gobble-gobble: three quick descending blips.
  playTone(320, 90, 'square', 0.10, 0);
  playTone(260, 90, 'square', 0.10, 110);
  playTone(210, 140, 'square', 0.10, 220);
}

export function playCornPickup() {
  playTone(880, 90, 'sine', 0.14, 0);
  playTone(1318, 140, 'sine', 0.12, 80);
}

export function playGoldenPickup() {
  [880, 1108, 1318, 1760].forEach((f, i) => playTone(f, 120, 'triangle', 0.12, i * 70));
}

export function playDashFlap() {
  playTone(500, 80, 'triangle', 0.08, 0);
  playTone(700, 80, 'triangle', 0.08, 70);
}

export function playSpottedAlarm() {
  playTone(220, 160, 'sawtooth', 0.10, 0);
  playTone(330, 160, 'sawtooth', 0.10, 160);
}

export function playHitThud() {
  playTone(140, 220, 'sawtooth', 0.16, 0);
  playTone(90, 260, 'square', 0.12, 40);
}

export function playKnifeWhizz() { playTone(1200, 160, 'sine', 0.05, 0); }

export function playStageClear() {
  [523, 659, 784, 1046].forEach((f, i) => playTone(f, 180, 'triangle', 0.13, i * 110));
}

export function playEscapeFanfare() {
  [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => playTone(f, 220, 'triangle', 0.14, i * 140));
}

export function playCaughtSadTrombone() {
  [392, 370, 349, 311].forEach((f, i) => playTone(f, 320, 'sawtooth', 0.09, i * 260));
}

export function startFarmMusic() {
  if (muted || musicTimer) return;
  ensureAudioContext();
  musicTimer = setInterval(() => {
    if (muted) return;
    const note = MELODY[musicStep % MELODY.length];
    musicStep += 1;
    if (note[0] > 0) playTone(note[0], 260, 'triangle', 0.045, 0);
  }, 300);
}

export function stopFarmMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}
