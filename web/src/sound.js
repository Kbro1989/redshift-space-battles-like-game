// Web Audio Synthesizer for Redshift Space Battles
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.audioCache = {};
    this._attachUnlock();
  }

  async playClip(filename) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (!this.audioCache[filename]) {
        let res = await fetch(`./audio/${filename}`);
        if (!res.ok) {
          res = await fetch(`/audio/${filename}`);
        }
        if (!res.ok) return false;
        const arrayBuf = await res.arrayBuffer();
        this.audioCache[filename] = await this.ctx.decodeAudioData(arrayBuf);
      }
      const source = this.ctx.createBufferSource();
      source.buffer = this.audioCache[filename];
      const gain = this.ctx.createGain();
      gain.gain.value = 0.35;
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(0);
      return true;
    } catch (e) {
      return false;
    }
  }

  _attachUnlock() {
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  async playLaser(isHeavy = false) {
    if (!this.enabled) return;
    const clipPlayed = await this.playClip(isHeavy ? 'combat2a.wav' : 'combat1a.wav');
    if (clipPlayed) return;

    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isHeavy ? 'sawtooth' : 'sine';
    const startFreq = isHeavy ? 440 : 880;
    const endFreq = isHeavy ? 60 : 120;
    const duration = isHeavy ? 0.22 : 0.12;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  async playExplosion(size = 1.0) {
    if (!this.enabled) return;
    const clipPlayed = await this.playClip('death.wav');
    if (clipPlayed) return;

    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.5 + size * 0.4;

    // Buffer noise
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Lowpass filter for deep space rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320 * size, now);
    filter.frequency.linearRampToValueAtTime(40, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  async playUi(type = 'click') {
    if (!this.enabled) return;
    let clipName = 'click.wav';
    if (type === 'upgrade') clipName = 'advance.wav';
    else if (type === 'coins' || type === 'bounty') clipName = 'coins.wav';
    else if (type === 'mechanical') clipName = 'mechanical.wav';
    else if (type === 'heavy_laser') clipName = 'combat3a.wav';

    const clipPlayed = await this.playClip(clipName);
    if (clipPlayed) return;

    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'upgrade') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'coins' || type === 'bounty') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.setValueAtTime(1320, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'mechanical') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'warning' || type === 'error') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'whoosh') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'mining') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'footstep') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.005, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  }
}

export const sound = new SoundEngine();
