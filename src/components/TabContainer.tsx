import React, { useState, useEffect } from 'react';
import Piano from './Piano';
import DrumPad from './DrumPad';
import * as Tone from 'tone';
import '../styles/TabContainer.css';

const TabContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'piano' | 'drumpad'>('piano');

  // Initialize audio context when the component mounts
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        // This will be called on the first user interaction
        const handleFirstInteraction = async () => {
          await Tone.start();
          console.log("Audio context started");
          // Remove the event listeners once audio is initialized
          document.removeEventListener('click', handleFirstInteraction);
          document.removeEventListener('keydown', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
      } catch (error) {
        console.error("Error initializing audio context:", error);
      }
    };

    initAudioContext();
  }, []);

  // Handle tab change
  const handleTabChange = (tab: 'piano' | 'drumpad') => {
    // Suspend any ongoing audio when switching tabs
    Tone.Transport.stop();
    setActiveTab(tab);
  };

  return (
    <div className="tab-container">
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'piano' ? 'active' : ''}`}
          onClick={() => handleTabChange('piano')}
        >
          Piano
        </button>
        <button 
          className={`tab-button ${activeTab === 'drumpad' ? 'active' : ''}`}
          onClick={() => handleTabChange('drumpad')}
        >
          Drum Pad
        </button>
      </div>
      <div className="tab-content">
        {activeTab === 'piano' ? <Piano /> : <DrumPad />}
      </div>
    </div>
  );
};

export default TabContainer; 