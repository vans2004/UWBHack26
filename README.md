# Spine-o-saur — Digital Wellness Companion

A React-based wellness app built for UWBHack 2026. Spine-o-saur combines a virtual pet, work session management, habit tracking, real-time posture monitoring, and social accountability to encourage healthy work habits and combat sedentary lifestyle issues.

## 🎮 Core Features

### 🐾 Virtual Pet
- Pixel-art dinosaur companion with 4 mood states (happy 😄, neutral 😐, sad 😢, sick 😷)
- Health system (0–100 HP) that decays over time to encourage activity
- Framer Motion animations responsive to mood
- Heals (+20 HP) when you complete work breaks
- Direct health feedback for habit completion and posture detection
- Multiple dino color themes (Sage, Lavender, Peach, Ocean)

### ⏱️ Digital Breaker
- Customizable work session timer (default 30 minutes)
- Real-time break countdown display in navbar
- Break challenge modal with interactive prompts at session end
- Pet heals immediately upon break completion
- Session timer persists across navigation and tab switches
- Audio/visual feedback when break ends

### 📋 Daily Health Inventory — 4 Core Habits
Gamified daily checklist with sub-checkpoints for each habit:

**💧 Hydration**
- 4 checkpoints throughout the day (8 AM, 12 PM, 3 PM, 6 PM)
- Tips: "Start your day hydrated", "Beat the afternoon slump", etc.
- +10 HP per completed habit

**🌙 Sleep**
- 3 checkpoints: Screen-free wind-down, Set bedtime, Log 7+ hours
- Tips for sleep hygiene and consistent schedules
- +10 HP per completed habit

**🏃 Movement**
- 3 checkpoints: Morning stretch, Mid-day walk, Full workout
- Flexible activity options (walk, gym, stretch, yoga, etc.)
- +10 HP per completed habit

**🌿 Outdoor Time**
- 3 checkpoints: Morning air, Lunch outdoors, Evening stroll
- Encourages fresh air and sunlight exposure
- +10 HP per completed habit

**Features:**
- Visual progress rings show completion percentage per habit
- Daily auto-reset at midnight
- Habit tips with recommended times
- Color-coded UI per habit type
- Total of 13 possible checkpoint completions per day

### 🧍 Posture Guardian — AI-Powered Posture Detection
- Real-time posture analysis using MediaPipe Pose Landmarker
- Computer vision slouch detection via shoulder-to-ear distance ratio
- Intrusive amber warning banner when slouching detected
- Smart guidance frame with SVG visual overlays during capture
- "Align Head & Shoulders" visual guide for consistent positioning
- 5-second countdown before capture to let user adjust
- Roboflow AI backend integration for posture classification
- Scan history with visual indicators (✅ good, ⚠️ slouching)
- Smart feedback: "Better than last time! 🌟", "Keep it up! 💪", etc.
- Health impact: +5 HP for good posture, −3 HP for slouching
- Auto-suggest turning off camera to save battery after 2 minutes of active scanning

### 👥 Social Features & Profile
**Friends System**
- Add friends by username
- View friend list with real-time HP and habit completion %
- Pre-loaded with demo friends (Alex, Maya, Jordan, Sam) for hackathon presentation

**Nudge System** 
- Send nudges to friends (💧 Drink water, 🧘 Fix posture, 🦕 Your dino needs you, 🏃 Stretch)
- Visual nudge feed showing recent incoming nudges from friends
- Timestamps for all nudges (e.g., "2 minutes ago", "1 hour ago")
- Auto-triggered demo nudge pop-up 30 seconds after app load

**Leaderboard**
- Rank friends by HP (🥇 🥈 🥉)
- Shows current user's rank among friends
- Habit completion % for each friend
- Updates in real-time as friends complete habits

### 📢 Notification System
**Toast Notifications** (bottom-right corner)
- Camera battery-saving reminder after 2 minutes of active scanning
- Screen time limit warnings (10 min before limit, at limit reached)
- Daily check-in reminder if <3 habits completed by 2 PM

**Modal Pop-ups**
- Nudge alerts when friends send nudges
- Large, intrusive design to ensure user engagement
- Click to dismiss or auto-dismiss after interaction

### 🛡️ Screen Time Management
- Set custom screen time limits per session
- Persistent countdown tracking
- Reminder 10 minutes before limit
- Final alert when limit is reached
- Option to dismiss or confirm new limit

### 💡 Posture Tips & Educational Content
- Curated tips on proper posture, ergonomics, and desk setup
- Video resources and tutorials
- Best practices for long work sessions
- Stretching routines and exercises

### 💪 Workouts
- Pre-curated workout suggestions
- Quick exercises (5–20 minute options)
- Desk-friendly and full-body routines
- Integrated into overall wellness tracking

### 🔐 Authentication
- User login/registration system
- Persistent session management
- Multi-user support on same device
- Logout functionality

## 📊 Data & Persistence

- **Storage:** localStorage (no backend)
- **User Data:** Profile, HP, habits, posture scans, friends, nudges
- **Daily Reset:** Habits reset each day, pet health persists
- **Public Data:** Each user's HP and habit score visible to friends
- **Demo Seeding:** Fake friends and nudges pre-load on first Profile page visit for presentations

## 🏗️ Technical Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Computer Vision:** MediaPipe Pose Landmarker (CDN loaded, no npm dependency)
- **Posture Classification:** Roboflow API
- **State Management:** React Context + localStorage
- **No Backend:** Fully client-side, single-page application

## 🚀 Getting Started

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

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/                    # Login screen & auth UI
│   ├── VirtualPet/              # Pet rendering, sprites, animations
│   ├── DigitalBreaker/          # Timer, break modal, UI
│   ├── HealthInventory/         # Daily habits checklist, tips
│   ├── PostureGuardian/         # AI posture detection, Roboflow API
│   ├── PostureReminder/         # Posture check reminders
│   ├── PostureTips/             # Educational content
│   ├── Workouts/                # Workout suggestions
│   ├── Profile/                 # User profile, friends, leaderboard, nudges
│   ├── Notifications/           # Toast & modal notifications
│   ├── ScreenTimeLimitModal/    # Screen time limit UI
│   └── ...
├── context/
│   ├── AppContext.jsx           # Global wellness app state
│   └── AuthContext.jsx          # Authentication state
└── App.jsx                      # Main app layout & routing
```

## 🔑 Key Implementation Details

**Architecture:**
- Centralized state in `AppContext.jsx` manages health, habits, breaks, posture scans
- Separate `AuthContext.jsx` for user authentication & session
- Component-based UI with Framer Motion for smooth animations

**Posture Detection:**
- MediaPipe Vision Bundle loaded dynamically from CDN (no build bloat)
- Slouch heuristic: `(shoulderY - earY) < 0.09` for N consecutive frames
- Roboflow API handles classification ("looks good" vs "slouching")
- Real-time video feed with visual guidance overlays

**Habit Tracking:**
- Checkpoints tracked per habit in nested checkpoint objects
- Daily auto-reset using date-based keys
- HP rewards scale with completion percentage

**Performance:**
- Nudge polling optimized to 30-second intervals
- Lazy loading of MediaPipe and Roboflow APIs
- SVG-based pet sprites minimize asset size

## 🎯 Hackathon Features

- **Live Demo Data:** Pre-seeded friends list, nudge feed, and leaderboard for instant visual appeal
- **Auto-Triggered Demo Nudge:** Pop-up modal fires 30 seconds after app load to showcase social features
- **Responsive Design:** Optimized for desktop presentation on large screens
- **Minimal Setup:** No backend, no API keys needed for local development (Roboflow optional)

## 📝 License

Hackathon project — UWBHack 2026