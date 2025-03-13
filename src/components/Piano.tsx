import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import '../styles/Piano.css';

interface PianoKeyProps {
  note: string;
  isBlackKey: boolean;
  onMouseDown: (note: string) => void;
  onMouseUp: () => void;
  isActive: boolean;
}

const PianoKey: React.FC<PianoKeyProps> = ({ note, isBlackKey, onMouseDown, onMouseUp, isActive }) => {
  // Combine base class with active state class if key is active
  const keyClass = `piano-key ${isBlackKey ? 'black-key' : 'white-key'} ${isActive ? 'active' : ''}`;
  
  // Map notes to keyboard keys for display
  const keyboardMap: { [key: string]: string } = {
    'C4': 'A', 'C#4': 'W', 'D4': 'S', 'D#4': 'E', 'E4': 'D',
    'F4': 'F', 'F#4': 'T', 'G4': 'G', 'G#4': 'Y', 'A4': 'H',
    'A#4': 'U', 'B4': 'J', 'C5': 'K'
  };
  
  return (
    <div 
      className={keyClass}
      onMouseDown={() => onMouseDown(note)}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="key-label">{note}</div>
      <div className="keyboard-label">{keyboardMap[note]}</div>
    </div>
  );
};

const Piano: React.FC = () => {
  const [synth, setSynth] = useState<Tone.Synth | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Define piano keys - one octave
  const pianoKeys = [
    { note: 'C4', isBlackKey: false },
    { note: 'C#4', isBlackKey: true },
    { note: 'D4', isBlackKey: false },
    { note: 'D#4', isBlackKey: true },
    { note: 'E4', isBlackKey: false },
    { note: 'F4', isBlackKey: false },
    { note: 'F#4', isBlackKey: true },
    { note: 'G4', isBlackKey: false },
    { note: 'G#4', isBlackKey: true },
    { note: 'A4', isBlackKey: false },
    { note: 'A#4', isBlackKey: true },
    { note: 'B4', isBlackKey: false },
    { note: 'C5', isBlackKey: false },
  ];

  // Initialize Tone.js synth
  useEffect(() => {
    let isMounted = true;
    
    const initAudio = async () => {
      try {
        // Start audio context
        await Tone.start();
        setIsAudioReady(true);
        
        // Create synth
        const newSynth = new Tone.Synth({
          oscillator: {
            type: "triangle8"
          },
          envelope: {
            attack: 0.05,
            decay: 0.3,
            sustain: 0.4,
            release: 1
          }
        }).toDestination();
        
        if (isMounted) {
          setSynth(newSynth);
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
    
    initAudio();
    
    return () => {
      isMounted = false;
      if (synth) {
        synth.dispose();
      }
    };
  }, []);

  // Function to start audio context on first user interaction
  const handleStartAudio = async () => {
    if (!isAudioReady) {
      await Tone.start();
      setIsAudioReady(true);
    }
  };

  // Handle key press - memoized with useCallback
  const handleKeyDown = useCallback((note: string) => {
    if (synth) {
      synth.triggerAttack(note);
      setActiveNote(note);
    }
  }, [synth]);

  // Handle key release - memoized with useCallback
  const handleKeyUp = useCallback(() => {
    if (synth && activeNote) {
      synth.triggerRelease();
      setActiveNote(null);
    }
  }, [synth, activeNote]);

  // Handle keyboard events
  useEffect(() => {
    const keyMap: { [key: string]: string } = {
      'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
      'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
      'u': 'A#4', 'j': 'B4', 'k': 'C5'
    };

    const handleKeyboardDown = (e: KeyboardEvent) => {
      if (keyMap[e.key.toLowerCase()] && !e.repeat) {
        handleKeyDown(keyMap[e.key.toLowerCase()]);
      }
    };

    const handleKeyboardUp = (e: KeyboardEvent) => {
      if (keyMap[e.key.toLowerCase()]) {
        handleKeyUp();
      }
    };

    window.addEventListener('keydown', handleKeyboardDown);
    window.addEventListener('keyup', handleKeyboardUp);

    return () => {
      window.removeEventListener('keydown', handleKeyboardDown);
      window.removeEventListener('keyup', handleKeyboardUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="piano-container" onClick={handleStartAudio}>
      <h2>Virtual Piano</h2>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Initializing piano...</div>
        </div>
      ) : (
        <div className={`status-indicator ready`}>
          Ready to play
        </div>
      )}
      
      <div className="piano">
        {pianoKeys.map((key) => (
          <PianoKey
            key={key.note}
            note={key.note}
            isBlackKey={key.isBlackKey}
            onMouseDown={handleKeyDown}
            onMouseUp={handleKeyUp}
            isActive={activeNote === key.note}
          />
        ))}
      </div>
      <div className="instructions">
        <p>Click on keys or use your keyboard (A-K and W,E,T,Y,U for black keys)</p>
      </div>
    </div>
  );
};

export default Piano; 