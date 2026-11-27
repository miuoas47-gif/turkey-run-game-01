// All sound in Turkey Run! is synthesised with WebAudio — no audio files.
// One job: effects (gobble, jump, coin, thud, yell, fanfare) and a plucky loop.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    // A cheerful autumn jig, one note per step (Hz, 0 = rest).
    this.melody = [
      523, 659, 784, 659, 587, 659, 523, 0,
      587, 698, 880, 698, 659, 587, 523, 0,
      523, 659, 784, 880, 784, 659, 587, 659,
      587, 523, 587, 0, 392, 0, 523, 0,
    ];
  }

  // Must be called from a user gesture at least once.
  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (muted) this.stopMusic();
    else this.startMusic();
  }

  tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur, vol, when = 0, lowpass = 1200) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(t0);
  }

  click() { this.tone(660, 0.06, 'square', 0.08); }
  jump() { this.tone(280, 0.18, 'sine', 0.16, 0, 620); }
  dash() { this.noise(0.16, 0.12, 0, 2400); this.tone(500, 0.14, 'triangle', 0.1, 0, 900); }

  coin() {
    this.tone(988, 0.09, 'triangle', 0.14);
    this.tone(1319, 0.16, 'triangle', 0.14, 0.08);
  }

  feather() {
    this.tone(784, 0.1, 'sine', 0.14);
    this.tone(1047, 0.1, 'sine', 0.14, 0.09);
    this.tone(1568, 0.2, 'sine', 0.12, 0.18);
  }

  thud() {
    this.noise(0.18, 0.22, 0, 500);
    this.tone(110, 0.2, 'sine', 0.22, 0, 55);
  }

  gobble() {
    // Three quick descending clucks, like a turkey objecting loudly.
    for (let i = 0; i < 3; i++) {
      this.tone(420 - i * 60, 0.09, 'sawtooth', 0.1, i * 0.11, 240 - i * 40);
    }
  }

  yell() {
    // The farmer spots you: a rising shout.
    this.tone(180, 0.5, 'sawtooth', 0.16, 0, 520);
    this.tone(220, 0.4, 'square', 0.07, 0.05, 440);
  }

  winFanfare() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.16, i * 0.13));
    this.tone(262, 0.9, 'triangle', 0.1, 0.1);
  }

  lose() {
    const notes = [392, 330, 262, 196];
    notes.forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.14, i * 0.22));
  }

  startMusic() {
    if (!this.ctx || this.muted || this.musicTimer) return;
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const f = this.melody[this.musicStep % this.melody.length];
      this.musicStep++;
      if (f) this.tone(f, 0.16, 'triangle', 0.045);
      if (this.musicStep % 4 === 1) this.tone(131, 0.2, 'sine', 0.05);
    }, 170);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
