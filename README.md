# Music Studio

An interactive music application built with React and TypeScript. This app allows you to play piano notes and electronic drum sounds using your mouse or keyboard.

![Music Studio Screenshot](https://github.com/amogiska/music-studio/raw/master/screenshot.png)

## Features

- Interactive piano keyboard with white and black keys
- Electronic drum pad with modern synthesized sounds
- Demo beat sequence showcasing the drum pad capabilities
- Hold-to-repeat functionality for rhythmic patterns
- Visual feedback when keys/pads are pressed
- Clean, responsive design

## Instruments

### Piano
- Interactive keyboard with one octave range
- Visual feedback when keys are pressed
- Keyboard controls for easy playing

### Electronic Sound Pad
- 12 different electronic sounds inspired by modern music production
- Wobble bass, vocal chops, glitch effects, and more
- Hold-to-repeat functionality for creating rhythmic patterns
- Demo beat sequence showcasing the sounds

## Keyboard Controls

### Piano
- White keys: A, S, D, F, G, H, J, K
- Black keys: W, E, T, Y, U

### Drum Pad
- Top row: 1, 2, 3, 4, Q, W, E, R
- Bottom row: A, S, D, F

## How to Run the Application

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone this repository:
```bash
git clone https://github.com/amogiska/music-studio.git
```

2. Navigate to the project directory:
```bash
cd music-studio
```

3. Install dependencies:
```bash
npm install
```
or if you use yarn:
```bash
yarn install
```

### Running the Development Server

Start the development server:
```bash
npm start
```
or with yarn:
```bash
yarn start
```

The app will open in your browser at `http://localhost:3000`.

### Building for Production

To create a production build:
```bash
npm run build
```
or with yarn:
```bash
yarn build
```

The build files will be created in the `build` folder.

### Deploying the Application

You can deploy the production build to any static site hosting service:

1. GitHub Pages:
```bash
npm install -g gh-pages
npm run build
gh-pages -d build
```

2. Netlify, Vercel, or similar services:
   - Connect your GitHub repository
   - Set the build command to `npm run build`
   - Set the publish directory to `build`

## How It Works

The app uses Tone.js, a Web Audio framework, to generate sounds in real-time. When a key or pad is pressed (either by mouse or keyboard), the app triggers the corresponding sound using various Tone.js synthesizers.

### Piano Component
The piano uses a simple synthesizer with a triangle waveform to create piano-like sounds. Each key corresponds to a specific note in the C4 to C5 range.

### Drum Pad Component
The drum pad uses various synthesizers to create different percussion and electronic sounds:
- MembraneSynth for kick drums
- NoiseSynth for snare and clap sounds
- MetalSynth for hi-hats
- FMSynth for glitch effects
- PolySynth for chord stabs
- MonoSynth with AutoFilter for wobble bass

## Troubleshooting

### Audio Not Playing
- Most browsers require a user interaction before playing audio. Click anywhere on the page to initialize audio.
- Check that your volume is turned up and not muted.
- Try using a different browser if audio issues persist.

### Performance Issues
- Close other resource-intensive applications or browser tabs.
- Try using Chrome or Firefox for best performance.

## License

This project is open source and available under the MIT License.
