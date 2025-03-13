import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import '../styles/DrumPad.css';

interface DrumPadProps {
  keyTrigger: string;
  id: string;
  isActive: boolean;
  onPadTrigger: (id: string) => void;
  onPadHold: (id: string, isHolding: boolean) => void;
}

interface DrumPadData {
  id: string;
  keyTrigger: string;
  color: string;
}

const DrumPadButton: React.FC<DrumPadProps> = ({ keyTrigger, id, isActive, onPadTrigger, onPadHold }) => {
  // Get color based on the id
  const getColor = () => {
    switch(id) {
      case 'Kick': return '#FF5252';
      case 'Snare': return '#FF9800';
      case 'Clap': return '#FFEB3B';
      case 'HiHat': return '#8BC34A';
      case 'Vocal': return '#E91E63';
      case 'Pluck': return '#3F51B5';
      case 'Wobble': return '#9C27B0';
      case 'Glitch': return '#F44336';
      case 'Chord': return '#4CAF50';
      case 'Arp': return '#03A9F4';
      case 'Pad': return '#795548';
      case 'Vox': return '#607D8B';
      default: return '#CCCCCC';
    }
  };

  return (
    <div 
      className={`drum-pad ${isActive ? 'active' : ''}`} 
      id={id}
      onClick={() => onPadTrigger(id)}
      onMouseDown={() => onPadHold(id, true)}
      onMouseUp={() => onPadHold(id, false)}
      onMouseLeave={() => onPadHold(id, false)}
      style={{ 
        backgroundColor: isActive ? getColor() : undefined,
        borderTop: `3px solid ${getColor()}`
      }}
    >
      <div className="pad-content">
        <div className="key-trigger">{keyTrigger}</div>
        <div className="pad-name">{id}</div>
      </div>
    </div>
  );
};

const DrumPad: React.FC = () => {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [instruments, setInstruments] = useState<Record<string, any>>({});
  const [heldPads, setHeldPads] = useState<Record<string, boolean>>({});
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  
  // Refs for repeat functionality
  const repeatIntervals = useRef<Record<string, number>>({});
  const repeatRates = useRef<Record<string, number>>({
    'Kick': 200,    // 200ms between repeats
    'Snare': 150,
    'Clap': 180,
    'HiHat': 100,   // Faster for hi-hats
    'Vocal': 250,
    'Pluck': 150,
    'Wobble': 300,  // Slower for bass sounds
    'Glitch': 120,
    'Chord': 350,   // Slower for chords
    'Arp': 200,     // The arp already has internal repeats
    'Pad': 500,     // Very slow for pads
    'Vox': 250
  });
  
  // Ref for demo sequence
  const demoSequence = useRef<any>(null);
  const demoTimeouts = useRef<number[]>([]);

  // Define drum pads with their keyboard mappings - updated with more electronic sounds
  const drumPads: DrumPadData[] = [
    { id: 'Kick', keyTrigger: '1', color: '#FF5252' },
    { id: 'Snare', keyTrigger: '2', color: '#FF9800' },
    { id: 'Clap', keyTrigger: '3', color: '#FFEB3B' },
    { id: 'HiHat', keyTrigger: '4', color: '#8BC34A' },
    { id: 'Vocal', keyTrigger: 'Q', color: '#E91E63' },
    { id: 'Pluck', keyTrigger: 'W', color: '#3F51B5' },
    { id: 'Wobble', keyTrigger: 'E', color: '#9C27B0' },
    { id: 'Glitch', keyTrigger: 'R', color: '#F44336' },
    { id: 'Chord', keyTrigger: 'A', color: '#4CAF50' },
    { id: 'Arp', keyTrigger: 'S', color: '#03A9F4' },
    { id: 'Pad', keyTrigger: 'D', color: '#795548' },
    { id: 'Vox', keyTrigger: 'F', color: '#607D8B' },
  ];

  // Initialize Tone.js instruments
  useEffect(() => {
    let isMounted = true;
    
    const initInstruments = async () => {
      try {
        // Start audio context
        await Tone.start();
        setIsAudioReady(true);
        
        // Create different synthesizers for each drum sound
        const drumInstruments: Record<string, any> = {
          // Kick drum
          Kick: new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 5,
            oscillator: { type: 'sine' },
            envelope: {
              attack: 0.001,
              decay: 0.4,
              sustain: 0.01,
              release: 1.4,
              attackCurve: 'exponential'
            }
          }).toDestination(),
          
          // Snare drum
          Snare: new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: {
              attack: 0.001,
              decay: 0.2,
              sustain: 0.02,
              release: 0.2
            }
          }).toDestination(),
          
          // Clap
          Clap: new Tone.NoiseSynth({
            noise: { type: 'pink' },
            envelope: {
              attack: 0.001,
              decay: 0.15,
              sustain: 0.02,
              release: 0.1
            }
          }).toDestination(),
          
          // Hi-hat closed
          HiHat: new Tone.MetalSynth({
            envelope: {
              attack: 0.001,
              decay: 0.1,
              release: 0.01
            },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
          }).toDestination(),
          
          // Vocal-like sound (Fred Again style vocal chop)
          Vocal: new Tone.Sampler({
            urls: {
              C3: "https://tonejs.github.io/audio/casio/A1.mp3", // Fallback to Tone.js sample
            },
            attack: 0.02,
            release: 0.8,
            baseUrl: ""
          }).toDestination(),
          
          // Pluck sound (electronic pluck)
          Pluck: new Tone.PluckSynth({
            attackNoise: 1,
            dampening: 4000,
            resonance: 0.98
          }).toDestination(),
          
          // Wobble bass (dubstep-like)
          Wobble: new Tone.MonoSynth({
            oscillator: { type: 'sawtooth' },
            envelope: {
              attack: 0.01,
              decay: 0.1,
              sustain: 0.6,
              release: 0.5
            },
            filterEnvelope: {
              attack: 0.02,
              decay: 0.2,
              sustain: 0.5,
              release: 0.5,
              baseFrequency: 200,
              octaves: 4
            }
          }).connect(new Tone.AutoFilter({
            frequency: 4,
            depth: 0.9
          }).toDestination()),
          
          // Glitch sound (digital artifacts)
          Glitch: new Tone.FMSynth({
            harmonicity: 12,
            modulationIndex: 80,
            oscillator: { type: 'square' },
            envelope: {
              attack: 0.001,
              decay: 0.1,
              sustain: 0.1,
              release: 0.2
            },
            modulation: { type: 'square' },
            modulationEnvelope: {
              attack: 0.01,
              decay: 0.05,
              sustain: 0.1,
              release: 0.1
            }
          }).toDestination(),
          
          // Chord stab (Fred Again style chord)
          Chord: new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: {
              attack: 0.01,
              decay: 0.3,
              sustain: 0.1,
              release: 0.7
            }
          }).toDestination(),
          
          // Arpeggiator sound
          Arp: new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: {
              attack: 0.01,
              decay: 0.1,
              sustain: 0.2,
              release: 0.3
            }
          }).connect(new Tone.PingPongDelay({
            delayTime: "8n",
            feedback: 0.3,
            wet: 0.5
          }).toDestination()),
          
          // Ambient pad
          Pad: new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: {
              attack: 0.5,
              decay: 0.5,
              sustain: 0.8,
              release: 3
            }
          }).connect(new Tone.Reverb({
            decay: 5,
            wet: 0.6
          }).toDestination()),
          
          // Vocal chop (Fred Again style)
          Vox: new Tone.AMSynth({
            harmonicity: 1.5,
            detune: 0,
            oscillator: { type: 'sine' },
            envelope: {
              attack: 0.05,
              decay: 0.1,
              sustain: 0.3,
              release: 0.5
            },
            modulation: { type: 'square' },
            modulationEnvelope: {
              attack: 0.5,
              decay: 0,
              sustain: 1,
              release: 0.5
            }
          }).connect(new Tone.Chorus({
            frequency: 4,
            delayTime: 2.5,
            depth: 0.7,
            wet: 0.5
          }).toDestination()),
        };
        
        // Set volume for each instrument
        Object.values(drumInstruments).forEach(instrument => {
          instrument.volume.value = -10; // Reduce volume to avoid clipping
        });
        
        if (isMounted) {
          setInstruments(drumInstruments);
          // Short timeout to ensure UI is responsive
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initInstruments();
    
    return () => {
      isMounted = false;
      // Clear all intervals on unmount
      Object.values(repeatIntervals.current).forEach(interval => {
        window.clearInterval(interval);
      });
      // Clear all demo timeouts
      demoTimeouts.current.forEach(timeout => {
        window.clearTimeout(timeout);
      });
      // Dispose all instruments
      Object.values(instruments).forEach(instrument => {
        if (instrument && typeof instrument.dispose === 'function') {
          instrument.dispose();
        }
      });
    };
  }, []);

  // Function to start audio context on first user interaction
  const handleStartAudio = async () => {
    if (!isAudioReady) {
      await Tone.start();
      setIsAudioReady(true);
    }
  };

  // Handle pad trigger
  const handlePadTrigger = useCallback((padId: string, isDemoMode: boolean = false) => {
    const instrument = instruments[padId];
    if (instrument) {
      try {
        // Different handling based on instrument type
        if (padId === 'Kick') {
          // For kick drum
          instrument.triggerAttackRelease('C1', '8n');
        } else if (padId === 'Snare' || padId === 'Clap' || padId === 'HiHat') {
          // For noise-based sounds
          instrument.triggerAttackRelease('8n');
        } else if (padId === 'Vocal') {
          // For vocal sample
          instrument.triggerAttackRelease('C3', '8n');
        } else if (padId === 'Pluck') {
          // For pluck sound
          instrument.triggerAttackRelease('C4', '8n');
        } else if (padId === 'Wobble') {
          // For wobble bass
          instrument.triggerAttackRelease('G1', '4n');
        } else if (padId === 'Glitch') {
          // For glitch sound
          instrument.triggerAttackRelease('C3', '16n');
        } else if (padId === 'Chord') {
          // For chord stab - play a chord
          instrument.triggerAttackRelease(['C3', 'E3', 'G3', 'B3'], '4n');
        } else if (padId === 'Arp') {
          // For arpeggiator sound
          const now = Tone.now();
          instrument.triggerAttackRelease('C4', '16n', now);
          instrument.triggerAttackRelease('E4', '16n', now + 0.1);
          instrument.triggerAttackRelease('G4', '16n', now + 0.2);
          instrument.triggerAttackRelease('B4', '16n', now + 0.3);
        } else if (padId === 'Pad') {
          // For ambient pad
          instrument.triggerAttackRelease('C3', '2n');
        } else if (padId === 'Vox') {
          // For vocal chop
          instrument.triggerAttackRelease('A3', '8n');
        }
        
        setActivePad(padId);
        
        // Reset active state after a short delay
        // Use a longer highlight time for demo mode to make it more visible
        setTimeout(() => {
          setActivePad(null);
        }, isDemoMode ? 150 : 100);
      } catch (error) {
        console.error(`Error playing sound ${padId}:`, error);
      }
    } else {
      console.warn(`Instrument ${padId} not initialized yet`);
    }
  }, [instruments]);

  // Handle pad hold (for repeating sounds)
  const handlePadHold = useCallback((padId: string, isHolding: boolean) => {
    if (isHolding) {
      // Start repeating the sound
      setHeldPads(prev => ({ ...prev, [padId]: true }));
      
      // Clear any existing interval for this pad
      if (repeatIntervals.current[padId]) {
        window.clearInterval(repeatIntervals.current[padId]);
      }
      
      // Trigger the sound immediately
      handlePadTrigger(padId);
      
      // Set up interval for repeating the sound
      const rate = repeatRates.current[padId] || 200; // Default to 200ms if not specified
      repeatIntervals.current[padId] = window.setInterval(() => {
        handlePadTrigger(padId);
      }, rate);
    } else {
      // Stop repeating the sound
      setHeldPads(prev => ({ ...prev, [padId]: false }));
      
      // Clear the interval
      if (repeatIntervals.current[padId]) {
        window.clearInterval(repeatIntervals.current[padId]);
        delete repeatIntervals.current[padId];
      }
    }
  }, [handlePadTrigger]);

  // Play demo sequence
  const playDemoSequence = useCallback(() => {
    if (isPlayingDemo) return; // Don't start if already playing
    
    // Clear any existing timeouts
    demoTimeouts.current.forEach(timeout => {
      window.clearTimeout(timeout);
    });
    demoTimeouts.current = [];
    
    setIsPlayingDemo(true);
    setDemoProgress(0);
    
    // Define a cool 15-second drum sequence (Upbeat with more wobble bass)
    const sequence = [
      // Intro - 0-2s - Start with wobble right away
      { time: 0, pad: 'Kick' },
      { time: 0, pad: 'Wobble' },
      { time: 200, pad: 'HiHat' },
      { time: 400, pad: 'HiHat' },
      { time: 600, pad: 'Kick' },
      { time: 800, pad: 'HiHat' },
      { time: 1000, pad: 'Kick' },
      { time: 1000, pad: 'Wobble' },
      { time: 1200, pad: 'HiHat' },
      { time: 1400, pad: 'Snare' },
      { time: 1600, pad: 'HiHat' },
      { time: 1800, pad: 'Kick' },
      
      // Build up - 2-4s - Faster rhythm
      { time: 2000, pad: 'Kick' },
      { time: 2000, pad: 'Wobble' },
      { time: 2100, pad: 'HiHat' },
      { time: 2200, pad: 'HiHat' },
      { time: 2300, pad: 'Clap' },
      { time: 2400, pad: 'Kick' },
      { time: 2500, pad: 'HiHat' },
      { time: 2600, pad: 'HiHat' },
      { time: 2700, pad: 'Clap' },
      { time: 2800, pad: 'Kick' },
      { time: 2800, pad: 'Wobble' },
      { time: 2900, pad: 'HiHat' },
      { time: 3000, pad: 'Glitch' },
      { time: 3100, pad: 'HiHat' },
      { time: 3200, pad: 'Kick' },
      { time: 3300, pad: 'HiHat' },
      { time: 3400, pad: 'Clap' },
      { time: 3500, pad: 'HiHat' },
      { time: 3600, pad: 'Kick' },
      { time: 3600, pad: 'Wobble' },
      { time: 3700, pad: 'HiHat' },
      { time: 3800, pad: 'Glitch' },
      { time: 3900, pad: 'HiHat' },
      
      // Drop with heavy bass - 4-6s
      { time: 4000, pad: 'Kick' },
      { time: 4000, pad: 'Wobble' },
      { time: 4100, pad: 'HiHat' },
      { time: 4200, pad: 'HiHat' },
      { time: 4300, pad: 'Clap' },
      { time: 4400, pad: 'Kick' },
      { time: 4500, pad: 'HiHat' },
      { time: 4600, pad: 'HiHat' },
      { time: 4700, pad: 'Clap' },
      { time: 4800, pad: 'Kick' },
      { time: 4800, pad: 'Wobble' },
      { time: 4900, pad: 'HiHat' },
      { time: 5000, pad: 'Glitch' },
      { time: 5100, pad: 'HiHat' },
      { time: 5200, pad: 'Kick' },
      { time: 5300, pad: 'HiHat' },
      { time: 5400, pad: 'Clap' },
      { time: 5500, pad: 'HiHat' },
      { time: 5600, pad: 'Kick' },
      { time: 5600, pad: 'Wobble' },
      { time: 5700, pad: 'HiHat' },
      { time: 5800, pad: 'Glitch' },
      { time: 5900, pad: 'HiHat' },
      
      // Vocal section with wobble - 6-8s
      { time: 6000, pad: 'Kick' },
      { time: 6000, pad: 'Wobble' },
      { time: 6000, pad: 'Vocal' },
      { time: 6100, pad: 'HiHat' },
      { time: 6200, pad: 'HiHat' },
      { time: 6300, pad: 'Clap' },
      { time: 6400, pad: 'Kick' },
      { time: 6500, pad: 'HiHat' },
      { time: 6600, pad: 'HiHat' },
      { time: 6700, pad: 'Clap' },
      { time: 6800, pad: 'Kick' },
      { time: 6800, pad: 'Wobble' },
      { time: 6900, pad: 'HiHat' },
      { time: 7000, pad: 'Vox' },
      { time: 7100, pad: 'HiHat' },
      { time: 7200, pad: 'Kick' },
      { time: 7300, pad: 'HiHat' },
      { time: 7400, pad: 'Clap' },
      { time: 7500, pad: 'HiHat' },
      { time: 7600, pad: 'Kick' },
      { time: 7600, pad: 'Wobble' },
      { time: 7700, pad: 'HiHat' },
      { time: 7800, pad: 'Vox' },
      { time: 7900, pad: 'HiHat' },
      
      // Chord section with wobble - 8-10s
      { time: 8000, pad: 'Kick' },
      { time: 8000, pad: 'Wobble' },
      { time: 8000, pad: 'Chord' },
      { time: 8100, pad: 'HiHat' },
      { time: 8200, pad: 'HiHat' },
      { time: 8300, pad: 'Clap' },
      { time: 8400, pad: 'Kick' },
      { time: 8500, pad: 'HiHat' },
      { time: 8600, pad: 'HiHat' },
      { time: 8700, pad: 'Clap' },
      { time: 8800, pad: 'Kick' },
      { time: 8800, pad: 'Wobble' },
      { time: 8900, pad: 'HiHat' },
      { time: 9000, pad: 'Glitch' },
      { time: 9100, pad: 'HiHat' },
      { time: 9200, pad: 'Kick' },
      { time: 9300, pad: 'HiHat' },
      { time: 9400, pad: 'Clap' },
      { time: 9500, pad: 'HiHat' },
      { time: 9600, pad: 'Kick' },
      { time: 9600, pad: 'Wobble' },
      { time: 9700, pad: 'HiHat' },
      { time: 9800, pad: 'Chord' },
      { time: 9900, pad: 'HiHat' },
      
      // Arp section with wobble - 10-12s
      { time: 10000, pad: 'Kick' },
      { time: 10000, pad: 'Wobble' },
      { time: 10000, pad: 'Arp' },
      { time: 10100, pad: 'HiHat' },
      { time: 10200, pad: 'HiHat' },
      { time: 10300, pad: 'Clap' },
      { time: 10400, pad: 'Kick' },
      { time: 10500, pad: 'HiHat' },
      { time: 10600, pad: 'HiHat' },
      { time: 10700, pad: 'Clap' },
      { time: 10800, pad: 'Kick' },
      { time: 10800, pad: 'Wobble' },
      { time: 10900, pad: 'HiHat' },
      { time: 11000, pad: 'Arp' },
      { time: 11100, pad: 'HiHat' },
      { time: 11200, pad: 'Kick' },
      { time: 11300, pad: 'HiHat' },
      { time: 11400, pad: 'Clap' },
      { time: 11500, pad: 'HiHat' },
      { time: 11600, pad: 'Kick' },
      { time: 11600, pad: 'Wobble' },
      { time: 11700, pad: 'HiHat' },
      { time: 11800, pad: 'Arp' },
      { time: 11900, pad: 'HiHat' },
      
      // Climax - everything together - 12-14s
      { time: 12000, pad: 'Kick' },
      { time: 12000, pad: 'Wobble' },
      { time: 12000, pad: 'Chord' },
      { time: 12000, pad: 'Vox' },
      { time: 12100, pad: 'HiHat' },
      { time: 12200, pad: 'HiHat' },
      { time: 12300, pad: 'Clap' },
      { time: 12400, pad: 'Kick' },
      { time: 12400, pad: 'Wobble' },
      { time: 12500, pad: 'HiHat' },
      { time: 12600, pad: 'HiHat' },
      { time: 12700, pad: 'Clap' },
      { time: 12800, pad: 'Kick' },
      { time: 12800, pad: 'Wobble' },
      { time: 12900, pad: 'HiHat' },
      { time: 13000, pad: 'Glitch' },
      { time: 13100, pad: 'HiHat' },
      { time: 13200, pad: 'Kick' },
      { time: 13200, pad: 'Wobble' },
      { time: 13300, pad: 'HiHat' },
      { time: 13400, pad: 'Clap' },
      { time: 13500, pad: 'HiHat' },
      { time: 13600, pad: 'Kick' },
      { time: 13600, pad: 'Wobble' },
      { time: 13700, pad: 'HiHat' },
      { time: 13800, pad: 'Vox' },
      { time: 13900, pad: 'HiHat' },
      
      // Outro - 14-15s - Big finish
      { time: 14000, pad: 'Kick' },
      { time: 14000, pad: 'Wobble' },
      { time: 14000, pad: 'Chord' },
      { time: 14100, pad: 'HiHat' },
      { time: 14200, pad: 'Clap' },
      { time: 14300, pad: 'HiHat' },
      { time: 14400, pad: 'Kick' },
      { time: 14400, pad: 'Wobble' },
      { time: 14500, pad: 'Pluck' },
      { time: 14600, pad: 'HiHat' },
      { time: 14700, pad: 'Clap' },
      { time: 14800, pad: 'Kick' },
      { time: 14800, pad: 'Wobble' },
      { time: 14900, pad: 'Glitch' },
    ];
    
    // Schedule all sounds
    sequence.forEach(event => {
      const timeout = window.setTimeout(() => {
        // Pass true as second parameter to indicate demo mode
        handlePadTrigger(event.pad, true);
        // Update progress (0-100%)
        const progress = Math.min(100, Math.floor((event.time / 15000) * 100));
        setDemoProgress(progress);
      }, event.time);
      
      demoTimeouts.current.push(timeout);
    });
    
    // Set timeout to end the demo
    const endTimeout = window.setTimeout(() => {
      setIsPlayingDemo(false);
      setDemoProgress(100);
      // Reset progress after a short delay
      setTimeout(() => {
        setDemoProgress(0);
      }, 1000);
    }, 15000);
    
    demoTimeouts.current.push(endTimeout);
    
  }, [isPlayingDemo, handlePadTrigger]);

  // Stop demo sequence
  const stopDemoSequence = useCallback(() => {
    // Clear all timeouts
    demoTimeouts.current.forEach(timeout => {
      window.clearTimeout(timeout);
    });
    demoTimeouts.current = [];
    
    setIsPlayingDemo(false);
    setDemoProgress(0);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.repeat) { // Only trigger on initial press
        const pad = drumPads.find(p => p.keyTrigger.toLowerCase() === e.key.toLowerCase());
        if (pad) {
          // Start the repeating sound
          handlePadHold(pad.id, true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const pad = drumPads.find(p => p.keyTrigger.toLowerCase() === e.key.toLowerCase());
      if (pad) {
        // Stop the repeating sound
        handlePadHold(pad.id, false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePadHold, drumPads]);

  return (
    <div className="drum-machine-container" onClick={handleStartAudio}>
      <h2>Electronic Sound Pad</h2>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Initializing sounds...</div>
        </div>
      ) : (
        <>
          <div className={`status-indicator ready`}>
            Ready to play
          </div>
          
          <div className="demo-controls">
            <button 
              className={`demo-button ${isPlayingDemo ? 'playing' : ''}`}
              onClick={isPlayingDemo ? stopDemoSequence : playDemoSequence}
              disabled={isLoading}
            >
              {isPlayingDemo ? 'Stop Demo' : 'Play Demo Beat'}
            </button>
            
            {isPlayingDemo && (
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${demoProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="drum-pads-grid">
        {drumPads.map(pad => (
          <DrumPadButton
            key={pad.id}
            id={pad.id}
            keyTrigger={pad.keyTrigger}
            isActive={activePad === pad.id || heldPads[pad.id]}
            onPadTrigger={handlePadTrigger}
            onPadHold={handlePadHold}
          />
        ))}
      </div>
      <div className="instructions">
        <p>Click on pads or use keyboard keys shown on each pad</p>
        <p>Top row: 1-4, Q-R | Bottom row: A-F</p>
        <p><strong>Hold keys down</strong> for rapid repeat effect</p>
        <p>Featuring Fred Again inspired sounds and electronic textures</p>
      </div>
    </div>
  );
};

export default DrumPad; 