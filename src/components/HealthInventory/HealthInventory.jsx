import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

const HABITS = [
  { key: 'water',   emoji: '💧', label: 'Drank Water',   desc: '8+ glasses today',    bg: '#EFF6FF', check: '#60A5FA', ring: '#BFDBFE' },
  { key: 'sleep',   emoji: '🌙', label: 'Slept 7+ hrs',  desc: 'Restful night',        bg: '#F5F3FF', check: '#8B5CF6', ring: '#DDD6FE' },
  { key: 'move',    emoji: '🏃', label: 'Moved Today',   desc: 'Walk, gym, stretch',  bg: '#FFFBEB', check: '#F59E0B', ring: '#FDE68A' },
  { key: 'outside', emoji: '🌿', label: 'Outside Break', desc: 'Fresh air & sun',     bg: '#F0FDF4', check: '#22C55E', ring: '#BBF7D0' },
]

const CONFETTI_COLORS = ['#FFB3CE', '#FFE0A3', '#A8D8B9', '#C4B5E8', '#FFB997', '#93C5FD']

function ConfettiBurst({ active }) {
  const pieces = Array.from({ length: 10 }, (_, i) => ({
    angle: (i / 10) * 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + (i % 3) * 3,
    dist: 38 + (i % 4) * 10,
  }))

  return (
    <AnimatePresence>
      {active && pieces.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        return (
          <motion.div
            key={`${active}-${i}`}
            className="absolute rounded-full pointer-events-none z-20"
            style={{
              width: p.size, height: p.size,
              backgroundColor: p.color,
              left: '50%', top: '50%',
              marginLeft: -p.size / 2, marginTop: -p.size / 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * p.dist,
              y: Math.sin(rad) * p.dist,
              opacity: 0,
              scale: 0.2,
            }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.015 }}
          />
        )
      })}
    </AnimatePresence>
  )
}

export default function HealthInventory() {
  const { habits, completeHabit, uncompleteHabit } = useApp()
  const completedCount = Object.values(habits).filter(Boolean).length

  const prevHabits = useRef(habits)
  const [bursts, setBursts] = useState({})

  useEffect(() => {
    const newlyDone = HABITS.filter(h => habits[h.key] && !prevHabits.current[h.key])
    if (newlyDone.length) {
      const key = newlyDone[0].key
      setBursts(b => ({ ...b, [key]: Date.now() }))
    }
    prevHabits.current = { ...habits }
  }, [habits])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-ink">✅ Daily Check-In</h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">Each habit heals your buddy +10 HP</p>
        </div>
        <motion.span
          key={completedCount}
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="text-sm font-extrabold text-lavender-dark bg-lavender-light px-3 py-1.5 rounded-full"
        >
          {completedCount}/4
        </motion.span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {HABITS.map((habit, i) => {
          const done = habits[habit.key]
          return (
            <motion.button
              key={habit.key}
              onClick={() => done ? uncompleteHabit(habit.key) : completeHabit(habit.key)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="relative text-left rounded-3xl p-4 border-2 transition-all duration-200 overflow-hidden"
              style={{
                backgroundColor: done ? habit.bg : '#FAFAFA',
                borderColor: done ? habit.ring : '#F0EEF8',
              }}
            >
              <ConfettiBurst active={done ? bursts[habit.key] : null} />

              {/* check badge */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-black shadow-sm"
                    style={{ backgroundColor: habit.check }}
                  >
                    ✓
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-2xl mb-2">{habit.emoji}</div>
              <div
                className="text-sm font-extrabold mb-0.5 leading-tight"
                style={{ color: done ? habit.check : '#3D3250' }}
              >
                {habit.label}
              </div>
              <div className="text-xs text-ink-muted font-semibold">{habit.desc}</div>

              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs font-bold mt-1.5 overflow-hidden"
                    style={{ color: habit.check }}
                  >
                    +10 HP ✨
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {completedCount === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1,   y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="mt-4 py-3.5 bg-sage-light text-sage-dark rounded-3xl text-sm font-extrabold text-center border-2 border-sage"
          >
            🏆 All habits done! Your buddy loves you! 🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
