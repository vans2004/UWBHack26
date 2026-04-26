import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const REMINDERS = [
  {
    id: 'posture',
    emoji: '🦕',
    title: 'Hey! Sit up straight!',
    subtitle: 'Your dino is suffering 🦕💔',
    bg: 'from-rose-light to-peach-light',
    accent: '#FF7BAC',
    emojiAnim: 'animate-shiver',
  },
  {
    id: 'water',
    emoji: '💧',
    title: "You haven't had water in a while!",
    subtitle: 'Drink up! Stay hydrated! 💧',
    bg: 'from-lavender-light to-lemon-light',
    accent: '#8AAEE0',
    emojiAnim: 'animate-float',
  },
  {
    id: 'shoulders',
    emoji: '🤸',
    title: 'Roll your shoulders back!',
    subtitle: 'Do it now — 5 rolls each way. Your spine will thank you.',
    bg: 'from-sage-light to-lemon-light',
    accent: '#72B896',
    emojiAnim: 'animate-sway',
  },
  {
    id: 'checkin',
    emoji: '✅',
    title: 'Your buddy misses you!',
    subtitle: 'Do a Check-In and make your dino happy! ✅',
    bg: 'from-lemon-light to-cream-dark',
    accent: '#F4C256',
    emojiAnim: 'animate-wiggle',
  },
]

function randInterval() {
  return (Math.floor(Math.random() * 8) + 8) * 60_000
}

function pickReminder(lastId) {
  const pool = REMINDERS.filter(r => r.id !== lastId)
  return pool[Math.floor(Math.random() * pool.length)]
}

function readHistory(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

function pushHistory(key, id) {
  try {
    const arr = readHistory(key)
    arr.push(id)
    if (arr.length > 10) arr.splice(0, arr.length - 10)
    localStorage.setItem(key, JSON.stringify(arr))
  } catch {}
}

export default function PostureReminder() {
  const { setPetHealth } = useApp()
  const { currentUser } = useAuth()

  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(null)
  const [animStyle, setAnimStyle] = useState('slide')

  const timerRef   = useRef(null)
  const snoozeRef  = useRef(null)
  const nudgeRef   = useRef(null)
  const missedRef  = useRef({ missed: false, reminder: null })

  const histKey  = `spos_remhist_${currentUser}`
  const nudgeKey = `spos_nudges_${currentUser}`

  const show = useCallback((reminder, style) => {
    if (!reminder.isNudge) pushHistory(histKey, reminder.id)
    setAnimStyle(style ?? (Math.random() > 0.5 ? 'slide' : 'pop'))
    setCurrent(reminder)
    setVisible(true)
    missedRef.current = { missed: false, reminder: null }
  }, [histKey])

  const schedule = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      const last = readHistory(histKey).at(-1) ?? null
      const reminder = pickReminder(last)
      if (document.hidden) {
        missedRef.current = { missed: true, reminder }
      } else {
        show(reminder)
      }
    }, randInterval())
  }, [histKey, show])

  const checkNudges = useCallback(() => {
    try {
      const nudges = JSON.parse(localStorage.getItem(nudgeKey) || '[]')
      const pending = nudges.find(n => !n.shown)
      if (!pending) return
      const updated = nudges.map(n => n.id === pending.id ? { ...n, shown: true } : n)
      localStorage.setItem(nudgeKey, JSON.stringify(updated))
      show({
        id: 'nudge_' + pending.id,
        emoji: pending.emoji,
        title: `${pending.from} says:`,
        subtitle: pending.message,
        bg: 'from-lavender-light to-rose-light',
        accent: '#9B87D4',
        emojiAnim: 'animate-wiggle',
        isNudge: true,
      }, 'pop')
    } catch {}
  }, [nudgeKey, show])

  useEffect(() => {
    schedule()
    nudgeRef.current = setInterval(checkNudges, 15_000)
    checkNudges()

    const onVisibility = () => {
      if (!document.hidden && missedRef.current.missed) {
        const { reminder } = missedRef.current
        missedRef.current = { missed: false, reminder: null }
        show(reminder)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(snoozeRef.current)
      clearInterval(nudgeRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [schedule, checkNudges, show])

  const handleDone = () => {
    if (!current?.isNudge) setPetHealth(h => Math.min(100, h + 2))
    setVisible(false)
    setCurrent(null)
    schedule()
  }

  const handleSnooze = () => {
    const saved = current
    setVisible(false)
    setCurrent(null)
    clearTimeout(snoozeRef.current)
    snoozeRef.current = window.setTimeout(() => show(saved, 'pop'), 5 * 60_000)
  }

  const slideVariants = {
    initial:    { y: '110%', opacity: 0 },
    animate:    { y: 0, opacity: 1, transition: { type: 'spring', damping: 22, stiffness: 280 } },
    exit:       { y: '110%', opacity: 0, transition: { duration: 0.25 } },
  }
  const popVariants = {
    initial:    { scale: 0.4, opacity: 0 },
    animate:    { scale: 1, opacity: 1, transition: { type: 'spring', damping: 16, stiffness: 380 } },
    exit:       { scale: 0.4, opacity: 0, transition: { duration: 0.2 } },
  }

  return (
    <AnimatePresence>
      {visible && current && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-8">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSnooze}
          />
          <motion.div
            className={`relative w-full max-w-md bg-gradient-to-br ${current.bg} rounded-4xl shadow-pop p-8 border-4`}
            style={{ borderColor: current.accent }}
            variants={animStyle === 'slide' ? slideVariants : popVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center">
              <div className={`text-7xl mb-4 inline-block ${current.emojiAnim}`}>
                {current.emoji}
              </div>
              <h2 className="text-2xl font-black text-ink mb-2 leading-tight">
                {current.title}
              </h2>
              <p className="text-ink-muted font-bold text-base mb-7">
                {current.subtitle}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSnooze}
                  className="px-5 py-2.5 rounded-full bg-white/60 hover:bg-white/80 text-ink-muted font-bold text-sm transition-all"
                >
                  Snooze 5 min 😴
                </button>
                <button
                  onClick={handleDone}
                  className="px-6 py-2.5 rounded-full font-black text-sm text-white hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: current.accent }}
                >
                  {current.isNudge ? 'Got it! 👍' : 'Done! ✅ +2 HP'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
