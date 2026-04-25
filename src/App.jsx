import { useApp, AppProvider } from './context/AppContext'
import VirtualPet from './components/VirtualPet/VirtualPet'
import DigitalBreaker from './components/DigitalBreaker/DigitalBreaker'
import ResetModal from './components/DigitalBreaker/ResetModal'
import HealthInventory from './components/HealthInventory/HealthInventory'
import PostureGuardian from './components/PostureGuardian/PostureGuardian'

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function Navbar() {
  const { petHealth, petMood, breakTimer } = useApp()

  const hpColor = petHealth >= 75 ? '#72B896' : petHealth >= 50 ? '#8AAEE0' : petHealth >= 25 ? '#9B87D4' : '#FF8C5A'
  const moodEmoji = { happy: '😄', neutral: '😐', sad: '😢', sick: '😷' }[petMood]

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-lavender-light shadow-softer">
      <div className="min-w-[1024px] max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sage flex items-center justify-center text-xl shadow-soft">
            🌿
          </div>
          <div>
            <span className="text-xl font-black text-ink tracking-tight">BreakFree</span>
            <span className="hidden lg:inline text-sm text-ink-muted font-bold ml-3">Your Wellness Buddy</span>
          </div>
        </div>

        {/* live stats */}
        <div className="flex items-center gap-5">
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
        </div>
      </div>
    </nav>
  )
}

function Layout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="min-w-[1024px] max-w-[1400px] mx-auto px-6 py-7
                       grid grid-cols-[minmax(300px,400px)_1fr] gap-6 items-start">
        <VirtualPet />
        <div className="space-y-5">
          <DigitalBreaker />
          <HealthInventory />
          <PostureGuardian />
        </div>
      </main>

      <footer className="min-w-[1024px] text-center text-xs text-ink-faint font-bold py-8">
        made with 💚 at UWBHack '26
      </footer>

      <ResetModal />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  )
}
