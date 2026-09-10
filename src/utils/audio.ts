// Lightweight Web Audio API synthesizer for road trip sound effects
class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy audio context creation on user interaction
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Soft cheerful chime when a plate is spotted
  public playSpotSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.18); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.28); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      // Audio playback failed silently
    }
  }

  // Triumphant victory fanfare when finding a state plate
  public playVictorySound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Arpeggio notes: C5 (523.25), E5 (659.25), G5 (783.99), high C6 (1046.50) + E6 (1318.51)
      const arpeggio = [
        { freq: 523.25, time: 0, dur: 0.18, vol: 0.22, type: 'triangle' as OscillatorType },
        { freq: 659.25, time: 0.1, dur: 0.2, vol: 0.24, type: 'triangle' as OscillatorType },
        { freq: 783.99, time: 0.2, dur: 0.24, vol: 0.26, type: 'triangle' as OscillatorType },
        { freq: 1046.5, time: 0.32, dur: 0.65, vol: 0.32, type: 'triangle' as OscillatorType },
        { freq: 1318.51, time: 0.34, dur: 0.65, vol: 0.22, type: 'sine' as OscillatorType },
      ];

      arpeggio.forEach(({ freq, time, dur, vol, type }) => {
        const startTime = now + time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(vol, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });

      // Shimmer / sparkle bells
      const sparkles = [1567.98, 2093.0];
      sparkles.forEach((freq, idx) => {
        const startTime = now + 0.36 + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {
      // Audio playback failed silently
    }
  }

  // Triumphant fanfare when unlocking an achievement
  public playAchievementSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const startTime = ctx.currentTime + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.38);
      });
    } catch {
      // Audio playback failed silently
    }
  }

  // Subtle tap sound
  public playTapSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio playback failed silently
    }
  }
}

export const sounds = new SoundEngine();
