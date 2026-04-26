import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

function Toast({ id, emoji, message, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="flex items-start gap-3 bg-white rounded-2xl shadow-pop border border-lavender-light px-4 py-3.5 max-w-xs w-full pointer-events-auto"
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
      <p className="text-sm font-semibold text-ink flex-1 leading-snug">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 w-6 h-6 rounded-full bg-cream hover:bg-cream-dark flex items-center justify-center text-xs font-black text-ink-muted transition-colors"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  )
}

export default function Notifications() {
  const { postureScans, checkpoints } = useApp()
  const { currentUser } = useAuth()
  const [toasts, setToasts] = useState([])

  const checkpointsRef = useRef(checkpoints)
  checkpointsRef.current = checkpoints

  const addToast = useCallback((toast) => {
    setToasts(prev =>
      prev.find(t => t.id === toast.id) ? prev : [...prev, toast]
    )
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // ── Camera notification ───────────────────────────────────────────────────
  // Fires once per camera session when EITHER:
  //   (A) camera has been active for 2 continuous minutes, OR
  //   (B) ≥2 scans completed with at least one "good posture" result
  // "Active" is proxied by postureScans being non-empty (cleared on stopCamera).
  const cameraToastShownRef = useRef(false)
  const cameraActive = postureScans.length > 0

  // Condition A — 2-minute timer, starts when first scan arrives
  useEffect(() => {
    if (!cameraActive) {
      cameraToastShownRef.current = false // reset for next session
      return
    }

    const timer = setTimeout(() => {
      if (cameraToastShownRef.current) return
      cameraToastShownRef.current = true
      addToast({
        id: 'camera-suggest-off',
        emoji: '📷',
        message: "Great posture work! Consider turning off your camera to save battery 📷",
      })
    }, 2 * 60 * 1000)

    return () => clearTimeout(timer)
  }, [cameraActive, addToast])

  // Condition B — ≥2 scans with ≥1 good result
  useEffect(() => {
    if (cameraToastShownRef.current) return
    if (postureScans.length < 2) return
    if (!postureScans.some(g => g)) return

    cameraToastShownRef.current = true
    addToast({
      id: 'camera-suggest-off',
      emoji: '📷',
      message: "Great posture work! Consider turning off your camera to save battery 📷",
    })
  }, [postureScans, addToast])

  // ── Screen time limit notifications ───────────────────────────────────────
  useEffect(() => {
    let stored = null
    try {
      stored = JSON.parse(localStorage.getItem(`spos_stlimit_${currentUser}`))
    } catch {}
    if (!stored?.limitSecs) return

    const { limitSecs, startedAt } = stored
    const TEN_MIN = 10 * 60
    let warnFired = false
    let limitFired = false
    let intervalId = null

    const check = () => {
      const elapsed = (Date.now() - startedAt) / 1000

      if (!warnFired && elapsed >= limitSecs - TEN_MIN && elapsed < limitSecs) {
        warnFired = true
        addToast({
          id: 'screen-time-warn',
          emoji: '⏳',
          message: 'Your screen time limit is almost up — 10 minutes left!',
        })
      }

      if (!limitFired && elapsed >= limitSecs) {
        limitFired = true
        addToast({
          id: 'screen-time-limit',
          emoji: '🛑',
          message: "You've reached your screen time limit for this session. Time to step away!",
        })
        clearInterval(intervalId)
      }
    }

    check()
    intervalId = setInterval(check, 30_000)
    return () => clearInterval(intervalId)
  }, [currentUser, addToast])

  // ── Daily Check-In reminder ───────────────────────────────────────────────
  // Once per day after 2 PM if < 3 items completed.
  // Reads checkpoints via ref so this effect stays stable.
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const shownKey = `spos_checkin_reminder_${today}`

    const tryShow = () => {
      if (localStorage.getItem(shownKey)) return
      if (new Date().getHours() < 14) return

      const totalDone = Object.values(checkpointsRef.current).reduce(
        (sum, habit) => sum + Object.values(habit).filter(Boolean).length,
        0
      )
      if (totalDone < 3) {
        localStorage.setItem(shownKey, '1')
        addToast({
          id: 'checkin-reminder',
          emoji: '🦕',
          message: "Don't forget your Daily Check-In! Your buddy needs you 🦕",
        })
      }
    }

    tryShow()
    const id = setInterval(tryShow, 60_000)
    return () => clearInterval(id)
  }, [addToast])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
