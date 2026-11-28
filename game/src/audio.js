// All sound is synthesized live with WebAudio — no audio files, no network.
// A tiny folk tune (the "Gobble Reel") loops under the run, and every action
// gets its own short blip. Everything is guarded: if the browser has no
// AudioContext, the game simply stays silent.

const MELODY = [
  // [midi note, beats] — a cheerful reel in G major.
  [79, 1], [76, 1], [74, 1], [76, 1], [79, 1], [83, 1], [81, 1], [79, 1],
  [76, 1], [74, 1], [71, 1], [74, 1], [76, 2], [74, 1], [71, 1],
  [67, 1], [71, 1], [74, 1], [76, 1], [79, 1], [76, 1], [74, 1], [71, 1],
  [74, 1], [76, 1], [79, 2], [0, 1],
];
const BASS = [55, 55, 62, 55, 55, 62, 67, 55, 50, 55, 62, 67, 55, 50, 55, 55];

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicOn = false;
    this._step = 0;
    this._nextTime = 0;
    this._timer = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      return true;
    } catch {
      return false;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopMusic();
    else if (this._wantsMusic) this.startMusic();
    return this.muted;
  }

  // One short synthesized note: the building block of every effect.
  tone(freq, dur, type = 'sine', vol = 0.16, when = 0, slideTo = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  jump() { this.tone(320, 0.16, 'square', 0.07, 0, 640); }
  slide() { this.tone(220, 0.14, 'sawtooth', 0.05, 0, 110); }
  dash() {
    this.tone(500, 0.2, 'sawtooth', 0.08, 0, 1100);
    this.tone(250, 0.2, 'square', 0.05, 0.02, 900);
  }
  land() { this.tone(140, 0.08, 'sine', 0.1, 0, 70); }
  corn(combo) {
    const base = 660 + Math.min(combo, 12) * 30;
    this.tone(base, 0.1, 'sine', 0.14);
    this.tone(base * 1.5, 0.14, 'sine', 0.12, 0.06);
  }
  golden() {
    [880, 1108, 1318, 1760].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.12, i * 0.07));
  }
  power() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.12, 'square', 0.07, i * 0.05));
  }
  hit() {
    this.tone(180, 0.25, 'sawtooth', 0.14, 0, 60);
    this.tone(90, 0.3, 'square', 0.1, 0.02, 45);
  }
  smash() {
    this.tone(300, 0.12, 'square', 0.1, 0, 90);
    this.tone(1200, 0.1, 'sine', 0.08, 0.03, 300);
  }
  click() { this.tone(700, 0.05, 'sine', 0.08); }
  stageClear() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.12, i * 0.09));
  }
  caught() {
    [392, 370, 349, 311, 262].forEach((f, i) => this.tone(f, 0.28, 'sawtooth', 0.1, i * 0.16));
  }
  escaped() {
    [523, 659, 784, 1046, 784, 1046, 1318, 1568].forEach((f, i) =>
      this.tone(f, 0.22, 'triangle', 0.12, i * 0.11));
  }

  startMusic() {
    this._wantsMusic = true;
    if (!this.ensure() || this.muted || this.musicOn) return;
    this.musicOn = true;
    this._step = 0;
    this._nextTime = this.ctx.currentTime + 0.1;
    this._timer = setInterval(() => this._schedule(), 90);
  }

  stopMusic() {
    this._wantsMusic = false;
    this.musicOn = false;
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _schedule() {
    if (!this.ctx || this.muted) return;
    const beat = 0.21;
    while (this._nextTime < this.ctx.currentTime + 0.35) {
      const i = this._step % MELODY.length;
      const [note, beats] = MELODY[i];
      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = midiToFreq(note);
        gain.gain.setValueAtTime(0.05, this._nextTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this._nextTime + beat * beats * 0.95);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(this._nextTime);
        osc.stop(this._nextTime + beat * beats);
      }
      if (this._step % 2 === 0) {
        const bass = BASS[(this._step / 2) % BASS.length | 0];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = midiToFreq(bass);
        gain.gain.setValueAtTime(0.07, this._nextTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this._nextTime + beat * 1.9);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(this._nextTime);
        osc.stop(this._nextTime + beat * 2);
      }
      this._nextTime += beat * beats;
      this._step += 1;
    }
  }
}
