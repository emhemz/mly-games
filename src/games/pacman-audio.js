export class PacManAudio {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.sirenOscillator = null;
    this.sirenGain = null;
    this.sirenFreq = 0;
  }

  _ensureContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  resume() {
    this._ensureContext();
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Wakka wakka sound (eating pellets)
  playWakka() {
    this._ensureContext();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  // Siren sound (background when chasing)
  playSiren() {
    this._ensureContext();
    
    // Stop existing siren
    this.stopSiren();
    
    // Create new siren
    this.sirenOscillator = this.audioContext.createOscillator();
    this.sirenGain = this.audioContext.createGain();
    
    this.sirenOscillator.type = 'sine';
    this.sirenGain.gain.value = 0.08;
    
    this.sirenOscillator.connect(this.sirenGain);
    this.sirenGain.connect(this.masterGain);
    
    this.sirenOscillator.start();
    this.sirenFreq = 0;
    
    // Modulate frequency
    this._modulateSiren();
  }

  _modulateSiren() {
    if (!this.sirenOscillator) return;
    
    this.sirenFreq = (this.sirenFreq + 0.02) % (Math.PI * 2);
    const freq = 300 + Math.sin(this.sirenFreq) * 100;
    this.sirenOscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    
    setTimeout(() => this._modulateSiren(), 50);
  }

  stopSiren() {
    if (this.sirenOscillator) {
      this.sirenOscillator.stop();
      this.sirenOscillator = null;
      this.sirenGain = null;
    }
  }

  // Power up sound
  playPowerUp() {
    this._ensureContext();
    this.stopSiren();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  // Eat ghost sound
  playEatGhost() {
    this._ensureContext();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  // Death sound
  playDeath() {
    this._ensureContext();
    this.stopSiren();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.8);
    
    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.8);
  }

  // Win sound
  playWin() {
    this._ensureContext();
    this.stopSiren();
    
    // Play a cheerful ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (higher octave)
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.15);
      
      gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.15 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(this.audioContext.currentTime + i * 0.15);
      osc.stop(this.audioContext.currentTime + i * 0.15 + 0.3);
    });
  }

  close() {
    this.stopSiren();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
