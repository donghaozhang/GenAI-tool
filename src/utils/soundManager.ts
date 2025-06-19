
export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.initAudioContext();
    this.generateSounds();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private async generateSounds() {
    if (!this.audioContext) return;

    // Generate different sound effects
    this.sounds.set('shoot', this.createShootSound());
    this.sounds.set('explosion', this.createExplosionSound());
    this.sounds.set('enemyShoot', this.createEnemyShootSound());
    this.sounds.set('gameOver', this.createGameOverSound());
    this.sounds.set('levelUp', this.createLevelUpSound());
  }

  private createShootSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const buffer = this.audioContext.createBuffer(1, 4410, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (800 - t * 400) * t) * Math.exp(-t * 8);
    }
    
    return buffer;
  }

  private createExplosionSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const buffer = this.audioContext.createBuffer(1, 8820, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      const noise = (Math.random() - 0.5) * 2;
      data[i] = noise * Math.exp(-t * 4) * Math.sin(2 * Math.PI * 100 * t);
    }
    
    return buffer;
  }

  private createEnemyShootSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const buffer = this.audioContext.createBuffer(1, 2205, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (200 + t * 200) * t) * Math.exp(-t * 10);
    }
    
    return buffer;
  }

  private createGameOverSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const buffer = this.audioContext.createBuffer(1, 22050, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (400 - t * 50) * t) * Math.exp(-t * 2);
    }
    
    return buffer;
  }

  private createLevelUpSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const buffer = this.audioContext.createBuffer(1, 11025, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (400 + t * 200) * t) * Math.exp(-t * 4);
    }
    
    return buffer;
  }

  public play(soundName: string, volume: number = 0.3) {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) return;

    try {
      const buffer = this.sounds.get(soundName);
      if (!buffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  public toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
