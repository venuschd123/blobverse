// =================================================================
// AUDIO — Web Audio API synthesizer
// All sounds generated in real-time. No assets. No copyright concerns.
// =================================================================

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.musicVoice = null;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.musicVolume = 0.35;
    this.sfxVolume = 0.55;
    this.initialized = false;
  }

  // Must be called from a user gesture (click) on iOS / Safari
  init() {
    if (this.initialized) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.master.gain.value = 1;
      this.musicBus.gain.value = this.musicVolume;
      this.sfxBus.gain.value = this.sfxVolume;
      this.master.connect(this.ctx.destination);
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.initialized = true;
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMusicEnabled(v) {
    this.musicEnabled = !!v;
    if (this.musicBus) this.musicBus.gain.value = v ? this.musicVolume : 0;
  }
  setSfxEnabled(v) {
    this.sfxEnabled = !!v;
    if (this.sfxBus) this.sfxBus.gain.value = v ? this.sfxVolume : 0;
  }
  setMusicVolume(v) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicBus && this.musicEnabled) this.musicBus.gain.value = this.musicVolume;
  }
  setSfxVolume(v) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxBus && this.sfxEnabled) this.sfxBus.gain.value = this.sfxVolume;
  }

  // ============== SFX ==============

  _osc(freq, dur, type = 'sine', vol = 0.2, slide = 0, delay = 0) {
    if (!this.ctx || !this.sfxEnabled) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  drop() { this._osc(380, 0.09, 'sine', 0.18, 0.55); }

  merge(tier) {
    const base = 220 * Math.pow(1.12, tier);
    this._osc(base, 0.18, 'triangle', 0.22);
    this._osc(base * 1.5, 0.18, 'triangle', 0.16, 1, 0.04);
    if (tier >= 4) {
      this._osc(base * 2, 0.25, 'sine', 0.14, 1.4, 0.08);
    }
  }

  combo(n) {
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
    const idx = Math.min(n - 2, notes.length - 1);
    if (idx < 0) return;
    this._osc(notes[idx], 0.14, 'square', 0.14);
    this._osc(notes[idx] * 2, 0.14, 'triangle', 0.08, 1, 0.03);
  }

  power(kind) {
    if (kind === 'bomb') {
      // Boom — noise burst
      if (!this.ctx || !this.sfxEnabled) return;
      const t = this.ctx.currentTime;
      const buf = this.ctx.createBuffer(1, 4096, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(800, t);
      filt.frequency.exponentialRampToValueAtTime(80, t + 0.3);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.4, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      src.connect(filt); filt.connect(g); g.connect(this.sfxBus);
      src.start(t);
      this._osc(120, 0.4, 'sawtooth', 0.18, 0.3);
    } else if (kind === 'freeze') {
      this._osc(880, 0.15, 'sine', 0.14, 0.5);
      this._osc(1760, 0.2, 'sine', 0.1, 0.5, 0.05);
      this._osc(2640, 0.25, 'triangle', 0.06, 0.5, 0.1);
    } else if (kind === 'magnet') {
      this._osc(220, 0.3, 'sine', 0.16, 2);
      this._osc(330, 0.3, 'sine', 0.12, 2, 0.05);
    } else if (kind === 'swap' || kind === 'upgrade') {
      this._osc(440, 0.08, 'square', 0.14);
      this._osc(660, 0.08, 'square', 0.14, 1, 0.05);
      this._osc(880, 0.1, 'square', 0.14, 1, 0.1);
    }
  }

  levelUp() {
    [261.63, 329.63, 392.0, 523.25].forEach((f, i) => {
      this._osc(f, 0.18, 'triangle', 0.18, 1, i * 0.06);
    });
  }

  gameOver() {
    [330, 294, 262, 220].forEach((f, i) => {
      this._osc(f, 0.25, 'triangle', 0.18, 0.95, i * 0.12);
    });
  }

  win() {
    [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => {
      this._osc(f, 0.16, 'triangle', 0.2, 1, i * 0.07);
      this._osc(f * 2, 0.16, 'sine', 0.1, 1, i * 0.07 + 0.02);
    });
  }

  click() { this._osc(880, 0.04, 'square', 0.08); }

  achievement() {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      this._osc(f, 0.2, 'sine', 0.18, 1, i * 0.08);
    });
  }

  // ============== AMBIENT MUSIC ==============
  // Slow evolving cosmic drone. Three sine voices, slow LFO, lowpass.
  startMusic() {
    if (!this.ctx || !this.musicEnabled || this.musicVoice) return;
    const t = this.ctx.currentTime;
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const o3 = this.ctx.createOscillator();
    o1.type = 'sine'; o1.frequency.value = 110;     // A2 root
    o2.type = 'sine'; o2.frequency.value = 164.81;  // E3 (5th)
    o3.type = 'triangle'; o3.frequency.value = 220; // A3 octave

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.13;
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(o2.frequency);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    filter.Q.value = 0.6;

    const filterLfo = this.ctx.createOscillator();
    const filterLfoGain = this.ctx.createGain();
    filterLfo.frequency.value = 0.07;
    filterLfoGain.gain.value = 250;
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.18, t + 2.5);

    o1.connect(filter); o2.connect(filter); o3.connect(filter);
    filter.connect(g);
    g.connect(this.musicBus);

    o1.start(t); o2.start(t); o3.start(t); lfo.start(t); filterLfo.start(t);
    this.musicVoice = { o1, o2, o3, lfo, filterLfo, g, filter };
  }

  stopMusic() {
    if (!this.musicVoice) return;
    const t = this.ctx.currentTime;
    try {
      this.musicVoice.g.gain.cancelScheduledValues(t);
      this.musicVoice.g.gain.setValueAtTime(this.musicVoice.g.gain.value, t);
      this.musicVoice.g.gain.linearRampToValueAtTime(0.0001, t + 0.6);
      const v = this.musicVoice;
      setTimeout(() => {
        try { v.o1.stop(); v.o2.stop(); v.o3.stop(); v.lfo.stop(); v.filterLfo.stop(); } catch (e) {}
      }, 700);
    } catch (e) {}
    this.musicVoice = null;
  }
}

export const audio = new AudioEngine();
