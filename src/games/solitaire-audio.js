export class SolitaireAudio {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  async resume() {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch {
        // ignore
      }
    }
  }

  _beep({ type = 'sine', freq = 440, endFreq, dur = 0.08, gain = 0.06 } = {}) {
    if (this.audioContext.state !== 'running') return;
    const ctx = this.audioContext;
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + dur);

    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.01);
  }

  draw() {
    this._beep({ type: 'triangle', freq: 520, endFreq: 740, dur: 0.07, gain: 0.06 });
  }

  flip() {
    this._beep({ type: 'square', freq: 240, endFreq: 180, dur: 0.05, gain: 0.04 });
  }

  place() {
    this._beep({ type: 'sine', freq: 660, endFreq: 520, dur: 0.06, gain: 0.05 });
  }

  error() {
    this._beep({ type: 'sawtooth', freq: 160, endFreq: 90, dur: 0.18, gain: 0.05 });
  }

  recycle() {
    this._beep({ type: 'triangle', freq: 300, endFreq: 420, dur: 0.10, gain: 0.04 });
  }

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      setTimeout(() => this._beep({ type: 'sine', freq: f, dur: 0.18, gain: 0.05 }), i * 70);
    });
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

