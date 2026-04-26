import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const AppContext = createContext(null)

const HEALTH_DECAY_INTERVAL = 120
const HEALTH_DECAY_AMOUNT = 1
const CHECKPOINT_HP = 3
const BREAK_HEALTH_BONUS = 15
const BREAK_DISMISS_PENALTY = 10

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function loadLS(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val !== null ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// Epoch stored in sessionStorage — survives tab switches, resets on page/browser close.
function loadTimerEpoch() {
  try {
    const stored = sessionStorage.getItem('spos_timerEpoch')
    if (stored) return parseInt(stored, 10)
  } catch {}
  const now = Date.now()
  try { sessionStorage.setItem('spos_timerEpoch', String(now)) } catch {}
  return now
}

const DEFAULT_CHECKPOINTS = {
  water:   { morning: false, midday: false, afternoon: false, evening: false },
  sleep:   { noscreen: false, bedtime: false, slept: false },
  move:    { stretch: false, walk: false, workout: false },
  outside: { morning: false, lunch: false, evening: false },
}

const BREAK_CHALLENGES = [
  { emoji: '🤸', text: 'Do 10 shoulder rolls — each direction!' },
  { emoji: '👀', text: 'Look 20 feet away for 20 seconds (20-20-20 rule).' },
  { emoji: '💧', text: 'Drink a full glass of water right now.' },
  { emoji: '🧘', text: 'Take 5 deep belly breaths, slow and steady.' },
  { emoji: '🚶', text: 'Stand up and walk around for 60 seconds.' },
  { emoji: '✋', text: 'Shake out your wrists and stretch your fingers.' },
  { emoji: '🙆', text: 'Roll your neck gently side to side, 5 times.' },
  { emoji: '🌬️', text: 'Open a window and take 3 breaths of fresh air.' },
]

export function AppProvider({ children, username }) {
  const [petHealth, setPetHealthRaw] = useState(() => loadLS('bf_petHealth', 70))

  const [checkpoints, setCheckpointsRaw] = useState(() => {
    const savedDate = loadLS('bf_habitDate', '')
    const today = todayKey()
    if (savedDate !== today) {
      saveLS('bf_habitDate', today)
      saveLS('bf_checkpoints', DEFAULT_CHECKPOINTS)
      return DEFAULT_CHECKPOINTS
    }
    return loadLS('bf_checkpoints', DEFAULT_CHECKPOINTS)
  })

  const habits = Object.fromEntries(
    Object.entries(checkpoints).map(([key, cps]) => [key, Object.values(cps).every(Boolean)])
  )

  // Wall-clock timer — epoch is pinned to sessionStorage so background throttling
  // and tab switches don't cause drift.
  const timerEpochRef = useRef(loadTimerEpoch())
  const initialElapsed = Math.floor((Date.now() - timerEpochRef.current) / 1000)
  // Track the last second at which health decay was applied so catch-up works on wake.
  const lastDecaySecRef = useRef(
    Math.floor(initialElapsed / HEALTH_DECAY_INTERVAL) * HEALTH_DECAY_INTERVAL
  )

  const [breakTimer, setBreakTimer] = useState(initialElapsed)
  const [showBreakModal, setShowBreakModal] = useState(false)
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [isSlouching, setIsSlouching] = useState(false)
  const [postureEnabled, setPostureEnabled] = useState(false)

  // Posture scan history (max 3), shared with Notifications
  const [postureScans, setPostureScansRaw] = useState([])

  // Per-user break interval preference
  const biKey = `spos_bi_${username}`
  const [breakIntervalMins, setBreakIntervalMinsRaw] = useState(
    () => loadLS(biKey, 30)
  )

  const BREAK_TRIGGER_SECONDS = breakIntervalMins * 60

  // Initialise modal-triggered state based on resume position
  const modalTriggeredRef = useRef(initialElapsed >= BREAK_TRIGGER_SECONDS)

  const setPetHealth = useCallback((updater) => {
    setPetHealthRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const clamped = Math.max(0, Math.min(100, next))
      saveLS('bf_petHealth', clamped)
      return clamped
    })
  }, [])

  const setCheckpoints = useCallback((updater) => {
    setCheckpointsRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveLS('bf_checkpoints', next)
      saveLS('bf_habitDate', todayKey())
      return next
    })
  }, [])

  // Anchor the timer to now; used by break-complete, dismiss, and interval-change.
  const resetTimer = useCallback(() => {
    const now = Date.now()
    timerEpochRef.current = now
    lastDecaySecRef.current = 0
    try { sessionStorage.setItem('spos_timerEpoch', String(now)) } catch {}
    setBreakTimer(0)
    setShowBreakModal(false)
    modalTriggeredRef.current = false
  }, [])

  const setBreakIntervalMins = useCallback((mins) => {
    saveLS(`spos_bi_${username}`, mins)
    setBreakIntervalMinsRaw(mins)
    resetTimer()
  }, [username, resetTimer])

  const recordPostureScan = useCallback((isGood) => {
    setPostureScansRaw(prev => [...prev, isGood].slice(-3))
  }, [])

  const resetPostureScans = useCallback(() => {
    setPostureScansRaw([])
  }, [])

  // Main 1-second tick using real wall-clock elapsed time.
  // Re-runs when BREAK_TRIGGER_SECONDS changes (interval selector).
  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerEpochRef.current) / 1000)

      // Break modal
      if (elapsed >= BREAK_TRIGGER_SECONDS && !modalTriggeredRef.current) {
        modalTriggeredRef.current = true
        const challenge = BREAK_CHALLENGES[Math.floor(Math.random() * BREAK_CHALLENGES.length)]
        setCurrentChallenge(challenge)
        setShowBreakModal(true)
      }

      // Health decay — while-loop catches intervals missed while tab was backgrounded
      while (lastDecaySecRef.current + HEALTH_DECAY_INTERVAL <= elapsed) {
        lastDecaySecRef.current += HEALTH_DECAY_INTERVAL
        const extra = elapsed >= BREAK_TRIGGER_SECONDS ? HEALTH_DECAY_AMOUNT : 0
        setPetHealth(h => Math.max(0, h - HEALTH_DECAY_AMOUNT - extra))
      }

      setBreakTimer(elapsed)
    }, 1000)
    return () => clearInterval(id)
  }, [setPetHealth, BREAK_TRIGGER_SECONDS])

  const completeCheckpoint = useCallback(
    (habitKey, cpId) => {
      if (!checkpoints[habitKey]?.[cpId]) {
        setCheckpoints((prev) => ({
          ...prev,
          [habitKey]: { ...prev[habitKey], [cpId]: true },
        }))
        setPetHealth((h) => h + CHECKPOINT_HP)
      }
    },
    [checkpoints, setCheckpoints, setPetHealth],
  )

  const uncompleteCheckpoint = useCallback(
    (habitKey, cpId) => {
      if (checkpoints[habitKey]?.[cpId]) {
        setCheckpoints((prev) => ({
          ...prev,
          [habitKey]: { ...prev[habitKey], [cpId]: false },
        }))
        setPetHealth((h) => Math.max(0, h - CHECKPOINT_HP))
      }
    },
    [checkpoints, setCheckpoints, setPetHealth],
  )

  const completeBreakChallenge = useCallback(() => {
    setPetHealth((h) => h + BREAK_HEALTH_BONUS)
    resetTimer()
  }, [setPetHealth, resetTimer])

  const dismissBreakChallenge = useCallback(() => {
    setPetHealth((h) => Math.max(0, h - BREAK_DISMISS_PENALTY))
    resetTimer()
  }, [setPetHealth, resetTimer])

  const petMood =
    petHealth >= 75 ? 'happy' : petHealth >= 50 ? 'neutral' : petHealth >= 25 ? 'sad' : 'sick'

  const value = {
    petHealth,
    petMood,
    habits,
    checkpoints,
    breakTimer,
    showBreakModal,
    currentChallenge,
    isSlouching,
    setIsSlouching,
    postureEnabled,
    setPostureEnabled,
    postureScans,
    recordPostureScan,
    resetPostureScans,
    completeCheckpoint,
    uncompleteCheckpoint,
    completeBreakChallenge,
    dismissBreakChallenge,
    setPetHealth,
    breakIntervalMins,
    setBreakIntervalMins,
    BREAK_TRIGGER_SECONDS,
    CHECKPOINT_HP,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
