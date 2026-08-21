export function playEngineSound(engineType: string) {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  const now = ctx.currentTime;
  
  if (engineType.includes('V8')) {
    // V8 Rumble
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(100, now + 1.2);
    
    // Add grit
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(30, now);
    osc2.frequency.exponentialRampToValueAtTime(150, now + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(50, now + 1.2);
    osc2.connect(gainNode);
    osc2.start(now);
    osc2.stop(now + 1.2);

  } else if (engineType.includes('V10')) {
    // V10 High Pitch Scream
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.7);
    osc.frequency.exponentialRampToValueAtTime(150, now + 1.5);

  } else if (engineType.includes('V12')) {
    // V12 Smooth Howl
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(200, now + 1.8);
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(240, now);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.8);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 1.8);
    osc2.connect(gainNode);
    osc2.start(now);
    osc2.stop(now + 1.8);
  } else if (engineType.includes('Electric')) {
    // EV Whine
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(3000, now + 1.0);
    osc.frequency.exponentialRampToValueAtTime(400, now + 2.0);
  } else {
    // Default
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(80, now + 1.0);
  }
  
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + (engineType.includes('Electric') ? 2.0 : 1.5));
  
  osc.start(now);
  osc.stop(now + (engineType.includes('Electric') ? 2.0 : 1.5));
  
  setTimeout(() => {
    ctx.close();
  }, 2500);
}
