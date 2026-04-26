import { useState } from 'react'
import { useApp, AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import VirtualPet from './components/VirtualPet/VirtualPet'
import DigitalBreaker from './components/DigitalBreaker/DigitalBreaker'
import ResetModal from './components/DigitalBreaker/ResetModal'
import HealthInventory from './components/HealthInventory/HealthInventory'
import PostureGuardian from './components/PostureGuardian/PostureGuardian'
import PostureTips from './components/PostureTips/PostureTips'
import Workouts from './components/Workouts/Workouts'
import LoginScreen from './components/Auth/LoginScreen'
import Notifications from './components/Notifications/Notifications'
import ScreenTimeLimitModal from './components/ScreenTimeLimitModal/ScreenTimeLimitModal'
import PostureReminder from './components/PostureReminder/PostureReminder'
import ProfilePage from './components/Profile/ProfilePage'

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const TABS = [
  { id: 'home',     label: '🏠 Home'     },
  { id: 'tips',     label: '💡 Tips'     },
  { id: 'workouts', label: '💪 Workouts' },
  { id: 'profile',  label: '👤 Profile'  },
]

function Navbar({ activeTab, setActiveTab }) {
  const { petHealth, petMood, breakTimer } = useApp()
  const { currentUser, logout } = useAuth()

  const hpColor = petHealth >= 75 ? '#72B896' : petHealth >= 50 ? '#8AAEE0' : petHealth >= 25 ? '#9B87D4' : '#FF8C5A'
  const moodEmoji = { happy: '😄', neutral: '😐', sad: '😢', sick: '😷' }[petMood]

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-lavender-light shadow-softer">
      {/* Main row */}
      <div className="min-w-[1024px] max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* brand */}
        <div className="flex items-center gap-2.5">
          <img
            src="/dino.jpg"
            alt="Spine-o-saur dino"
            className="w-11 h-11 rounded-2xl object-cover shadow-soft"
          />
          <div>
            <span className="text-xl font-black text-ink tracking-tight">Spine-o-saur</span>
            <span className="hidden lg:inline text-sm text-ink-muted font-bold ml-3">Posture Management</span>
          </div>
        </div>

        {/* live stats + user */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink-muted">Session</span>
            <span className="font-black text-ink tabular-nums text-sm">{fmt(breakTimer)}</span>
          </div>
          <div className="w-px h-6 bg-lavender-light" />
          <div className="flex items-center gap-2 bg-cream rounded-2xl px-4 py-2">
            <span className="text-base">{moodEmoji}</span>
            <span className="font-black text-sm tabular-nums" style={{ color: hpColor }}>
              {Math.round(petHealth)} HP
            </span>
          </div>
          <div className="w-px h-6 bg-lavender-light" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-ink">👤 {currentUser}</span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded-full text-xs font-bold bg-cream text-ink-muted hover:bg-peach-light hover:text-peach-dark transition-all"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar row */}
      <div className="min-w-[1024px] max-w-[1400px] mx-auto px-6 pb-2.5 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-lavender-light text-lavender-dark'
                : 'text-ink-muted hover:text-ink hover:bg-cream'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

function Layout() {
  const [activeTab, setActiveTab] = useState('home')
  const { currentUser } = useAuth()

  const [showScreenTimeModal, setShowScreenTimeModal] = useState(false)

  const handleScreenTimeConfirm = (limitSecs) => {
    try {
      localStorage.setItem(
        `spos_stlimit_${currentUser}`,
        JSON.stringify({ limitSecs, startedAt: Date.now() })
      )
    } catch {}
    setShowScreenTimeModal(false)
  }

  const handleScreenTimeDismiss = () => {
    try { localStorage.removeItem(`spos_stlimit_${currentUser}`) } catch {}
    setShowScreenTimeModal(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="min-w-[1024px] max-w-[1400px] mx-auto px-6 py-7
                       grid grid-cols-[minmax(300px,400px)_1fr] gap-6 items-start">
        <VirtualPet />
        <div className="space-y-5">
          {activeTab === 'home' && (
            <>
              <DigitalBreaker onOpenScreenTimeModal={() => setShowScreenTimeModal(true)} />
              <HealthInventory />
              <PostureGuardian />
            </>
          )}
          {activeTab === 'tips' && <PostureTips />}
          {activeTab === 'workouts' && <Workouts />}
          {activeTab === 'profile' && <ProfilePage />}
        </div>
      </main>

      <footer className="min-w-[1024px] text-center text-xs text-ink-faint font-bold py-8">
        made with 🦕 at UWBHack '26
      </footer>

      <ResetModal />
      <Notifications />
      <PostureReminder />
      {showScreenTimeModal && (
        <ScreenTimeLimitModal
          onConfirm={handleScreenTimeConfirm}
          onDismiss={handleScreenTimeDismiss}
        />
      )}
    </div>
  )
}

function AuthGate() {
  const { currentUser } = useAuth()

  if (!currentUser) return <LoginScreen />

  return (
    <AppProvider username={currentUser}>
      <Layout />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
