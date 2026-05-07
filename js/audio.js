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
  // Layered cosmic music that evolves with gameplay:
  //   - 3 sine drones (root + 5th + octave) — always present
  //   - Slow bass pulse every ~2s — like a heartbeat
  //   - Sparse pentatonic melody every ~10s — random notes, gentle
  //   - All voices respond to game intensity (passed in via setIntensity)
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
    g.gain.linearRampToValueAtTime(0.22, t + 2.5);

    o1.connect(filter); o2.connect(filter); o3.connect(filter);
    filter.connect(g);
    g.connect(this.musicBus);

    o1.start(t); o2.start(t); o3.start(t); lfo.start(t); filterLfo.start(t);
    this.musicVoice = { o1, o2, o3, lfo, filterLfo, g, filter };
    this.intensity = 0;

    // Schedule recurring layers
    this._scheduleBassPulse();
    this._scheduleMelody();
  }

  // Game can call this to make music more energetic (0..1 range)
  setIntensity(v) {
    this.intensity = Math.max(0, Math.min(1, v));
  }

  _scheduleBassPulse() {
    if (!this.musicVoice || !this.musicEnabled) return;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    // Pulse on root or octave depending on intensity
    o.frequency.value = (this.intensity > 0.5 ? 110 : 55);
    const peak = 0.18 + this.intensity * 0.15;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g);
    g.connect(this.musicBus);
    try { o.start(t); o.stop(t + 0.5); } catch (e) {}
    // Faster pulse when game is intense
    const wait = 2400 - this.intensity * 1200 + Math.random() * 400;
    this.bassTimer = setTimeout(() => this._scheduleBassPulse(), wait);
  }

  _scheduleMelody() {
    if (!this.musicVoice || !this.musicEnabled) return;
    if (!this.ctx) return;
    // A minor pentatonic, two octaves
    const scale = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25, 587.33, 659.25];
    const note = scale[Math.floor(Math.random() * scale.length)];
    const t = this.ctx.currentTime;

    // Two-tone bell: fundamental + octave at lower volume
    const o1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    o1.type = 'sine';
    o1.frequency.value = note;
    const peak = 0.10 + this.intensity * 0.06;
    g1.gain.setValueAtTime(0.0001, t);
    g1.gain.exponentialRampToValueAtTime(peak, t + 0.08);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o1.connect(g1); g1.connect(this.musicBus);

    const o2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    o2.type = 'triangle';
    o2.frequency.value = note * 2;
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(peak * 0.5, t + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o2.connect(g2); g2.connect(this.musicBus);

    try {
      o1.start(t); o1.stop(t + 1.8);
      o2.start(t); o2.stop(t + 1.4);
    } catch (e) {}

    // Sometimes add a quick second note (creates sense of phrase)
    if (Math.random() < 0.4) {
      setTimeout(() => {
        if (!this.musicVoice || !this.musicEnabled || !this.ctx) return;
        const t2 = this.ctx.currentTime;
        const idx = scale.indexOf(note);
        const next = scale[Math.max(0, Math.min(scale.length - 1, idx + (Math.random() < 0.5 ? -1 : 1)))];
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine'; o.frequency.value = next;
        g.gain.setValueAtTime(0.0001, t2);
        g.gain.exponentialRampToValueAtTime(peak * 0.7, t2 + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, t2 + 1.0);
        o.connect(g); g.connect(this.musicBus);
        try { o.start(t2); o.stop(t2 + 1.1); } catch (e) {}
      }, 300 + Math.random() * 200);
    }

    // Next note in 5-12s, faster as intensity increases
    const wait = (5000 + Math.random() * 7000) - this.intensity * 3000;
    this.melodyTimer = setTimeout(() => this._scheduleMelody(), wait);
  }

  stopMusic() {
    if (this.melodyTimer) { clearTimeout(this.melodyTimer); this.melodyTimer = null; }
    if (this.bassTimer) { clearTimeout(this.bassTimer); this.bassTimer = null; }
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
