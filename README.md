# BreakFree — Digital Wellness Companion

A React-based wellness app built for UWBHack 2026. BreakFree combines a virtual pet, break timer, habit tracking, and posture monitoring to encourage healthy work habits.

## Features

### 🐾 Virtual Pet
- Pixel-art pet with mood states (happy, neutral, sad, sick)
- Health system (0–100) that decays over time
- Framer Motion animations for idle states
- Heals when you complete breaks or daily habits

### ⏱️ Digital Breaker
- 30-minute (or custom interval) work session timer
- Break challenge modal with motivational prompts
- Completes and resets pet health on break completion
- Customizable break intervals

### 📋 Health Inventory
- 4 daily habits: water intake, sleep, movement, time outside
- Each completed habit grants +10 HP
- Daily reset at midnight
- LocalStorage persistence
- Tips tab with wellness advice

### 🧍 Posture Guardian
- Real-time posture detection using MediaPipe Pose Landmarker
- Slouch detection with amber warning banner
- Configurable sensitivity thresholds
- Runs entirely in-browser via CDN

### 🎯 Buddy Tracking
- Habit buddy cards with progress bars
- Social accountability features

## Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Posture Detection:** MediaPipe (CDN loaded)
- **State:** React Context + localStorage (no backend)

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── VirtualPet/          # Pet rendering and animations
│   ├── DigitalBreaker/       # Timer and break challenge modal
│   ├── HealthInventory/      # Habit tracking and tips
│   ├── PostureGuardian/      # Posture detection
│   └── ...
├── context/
│   └── AppContext.jsx        # Global state management
└── App.jsx                   # Main app component
```

## Key Implementation Details

- **MediaPipe:** Dynamically loaded from CDN (`vision_bundle.mjs`) — no npm dependency
- **Posture Detection:** Slouch heuristic uses shoulder-to-ear distance ratio
- **State Persistence:** All data stored in localStorage with daily reset for habits
- **Pet Health Decay:** Background timer gradually reduces health to encourage habit completion

## Development Notes

- All state lives in `AppContext.jsx` and localStorage
- No backend — fully client-side
- Pet sprites defined as SVG pixel grids in `PetSprites.jsx`
- Posture Guardian uses dynamic CDN import pattern for MediaPipe

## License

Hackathon project — 2026