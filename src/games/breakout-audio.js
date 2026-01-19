export class BreakoutAudio {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this._enabled = true;
  }

  setEnabled(enabled) {
    this._enabled = Boolean(enabled);
  }

  async resume() {
    if (!this._enabled) return;
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch {
        // ignore
      }
    }
  }

  _beep({ type = 'sine', freq = 440, dur = 0.08, gain = 0.08, endFreq } = {}) {
    if (!this._enabled) return;
    if (this.audioContext.state !== 'running') return;

    const ctx = this.audioContext;
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + dur);

    // quick attack/decay
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

    o.connect(g);
    g.connect(ctx.destination);

    o.start();
    o.stop(ctx.currentTime + dur + 0.01);
  }

  launch() {
    // bright “plink”
    this._beep({ type: 'triangle', freq: 660, endFreq: 990, dur: 0.09, gain: 0.09 });
  }

  wall() {
    this._beep({ type: 'square', freq: 220, endFreq: 180, dur: 0.05, gain: 0.05 });
  }

  paddle(hitStrength = 0.5) {
    const f = 260 + 220 * Math.max(0, Math.min(1, hitStrength));
    this._beep({ type: 'sine', freq: f, endFreq: f * 0.75, dur: 0.07, gain: 0.07 });
  }

  brick(rowIndex = 0) {
    // pitch by row (rainbow)
    const base = [988, 880, 784, 659, 523, 392][rowIndex % 6] ?? 784;
    this._beep({ type: 'sine', freq: base, endFreq: base * 0.9, dur: 0.06, gain: 0.07 });
  }

  lifeLost() {
    // sad down-gliss
    this._beep({ type: 'sawtooth', freq: 220, endFreq: 110, dur: 0.22, gain: 0.08 });
  }

  win() {
    // tiny chord
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      setTimeout(() => this._beep({ type: 'sine', freq: f, dur: 0.18, gain: 0.06 }), i * 60);
    });
  }

  gameOver() {
    this._beep({ type: 'sawtooth', freq: 196, endFreq: 82, dur: 0.35, gain: 0.09 });
  }

  async close() {
    try {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }
    } catch {
      // ignore
    }
  }
}

