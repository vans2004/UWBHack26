import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const AppContext = createContext(null)

const BREAK_TRIGGER_SECONDS = 30 * 60 // 30 minutes
const HEALTH_DECAY_INTERVAL = 120      // every 2 min, lose 1 hp
const HEALTH_DECAY_AMOUNT = 1
const HABIT_HEALTH_BONUS = 10
const BREAK_HEALTH_BONUS = 20

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

const DEFAULT_HABITS = { water: false, sleep: false, move: false, outside: false }

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

export function AppProvider({ children }) {
  // petHealth persisted
  const [petHealth, setPetHealthRaw] = useState(() => loadLS('bf_petHealth', 70))

  // habits with daily reset
  const [habits, setHabitsRaw] = useState(() => {
    const savedDate = loadLS('bf_habitDate', '')
    const today = todayKey()
    if (savedDate !== today) {
      saveLS('bf_habitDate', today)
      saveLS('bf_habits', DEFAULT_HABITS)
      return DEFAULT_HABITS
    }
    return loadLS('bf_habits', DEFAULT_HABITS)
  })

  // session timer (resets on page load — not persisted)
  const [breakTimer, setBreakTimer] = useState(0)
  const [showBreakModal, setShowBreakModal] = useState(false)
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [isSlouching, setIsSlouching] = useState(false)
  const [postureEnabled, setPostureEnabled] = useState(false)

  // track whether modal was already triggered this cycle
  const modalTriggeredRef = useRef(false)

  const setPetHealth = useCallback((updater) => {
    setPetHealthRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const clamped = Math.max(0, Math.min(100, next))
      saveLS('bf_petHealth', clamped)
      return clamped
    })
  }, [])

  const setHabits = useCallback((updater) => {
    setHabitsRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveLS('bf_habits', next)
      saveLS('bf_habitDate', todayKey())
      return next
    })
  }, [])

  // main 1-second tick
  useEffect(() => {
    const id = setInterval(() => {
      setBreakTimer((prev) => {
        const next = prev + 1

        // trigger break modal
        if (next >= BREAK_TRIGGER_SECONDS && !modalTriggeredRef.current) {
          modalTriggeredRef.current = true
          const challenge = BREAK_CHALLENGES[Math.floor(Math.random() * BREAK_CHALLENGES.length)]
          setCurrentChallenge(challenge)
          setShowBreakModal(true)
        }

        // health decay every HEALTH_DECAY_INTERVAL seconds
        if (next % HEALTH_DECAY_INTERVAL === 0) {
          const extra = next >= BREAK_TRIGGER_SECONDS ? HEALTH_DECAY_AMOUNT : 0
          setPetHealth((h) => Math.max(0, h - HEALTH_DECAY_AMOUNT - extra))
        }

        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [setPetHealth])

  const completeHabit = useCallback(
    (name) => {
      if (!habits[name]) {
        setHabits((h) => ({ ...h, [name]: true }))
        setPetHealth((h) => h + HABIT_HEALTH_BONUS)
      }
    },
    [habits, setHabits, setPetHealth],
  )

  const uncompleteHabit = useCallback(
    (name) => {
      if (habits[name]) {
        setHabits((h) => ({ ...h, [name]: false }))
        setPetHealth((h) => h - HABIT_HEALTH_BONUS)
      }
    },
    [habits, setHabits, setPetHealth],
  )

  const completeBreakChallenge = useCallback(() => {
    setPetHealth((h) => h + BREAK_HEALTH_BONUS)
    setBreakTimer(0)
    setShowBreakModal(false)
    modalTriggeredRef.current = false
  }, [setPetHealth])

  const petMood =
    petHealth >= 75 ? 'happy' : petHealth >= 50 ? 'neutral' : petHealth >= 25 ? 'sad' : 'sick'

  const value = {
    petHealth,
    petMood,
    habits,
    breakTimer,
    showBreakModal,
    currentChallenge,
    isSlouching,
    setIsSlouching,
    postureEnabled,
    setPostureEnabled,
    completeHabit,
    uncompleteHabit,
    completeBreakChallenge,
    setPetHealth,
    BREAK_TRIGGER_SECONDS,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
