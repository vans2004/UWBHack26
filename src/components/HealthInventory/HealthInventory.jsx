import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const HABITS = [
  {
    key: 'water', emoji: '💧', label: 'Drank Water', desc: '8+ glasses today',
    bg: '#EFF6FF', check: '#60A5FA', ring: '#BFDBFE',
    checkpoints: [
      { id: 'morning',   label: 'Morning Glass',   time: '8 AM',  tip: 'Start your day hydrated' },
      { id: 'midday',    label: 'Lunch Glass',      time: '12 PM', tip: 'Refill during lunch' },
      { id: 'afternoon', label: 'Afternoon Glass',  time: '3 PM',  tip: 'Beat the afternoon slump' },
      { id: 'evening',   label: 'Evening Glass',    time: '6 PM',  tip: 'Wind down hydrated' },
    ],
  },
  {
    key: 'sleep', emoji: '🌙', label: 'Slept 7+ hrs', desc: 'Restful night',
    bg: '#F5F3FF', check: '#8B5CF6', ring: '#DDD6FE',
    checkpoints: [
      { id: 'noscreen', label: 'No Screens 30 min', time: 'Before Bed', tip: 'Reduce blue light exposure' },
      { id: 'bedtime',  label: 'Set Bedtime',       time: 'Tonight',    tip: 'Consistent schedule helps' },
      { id: 'slept',    label: 'Got 7+ Hours',      time: 'Morning',    tip: 'Log your sleep' },
    ],
  },
  {
    key: 'move', emoji: '🏃', label: 'Moved Today', desc: 'Walk, gym, stretch',
    bg: '#FFFBEB', check: '#F59E0B', ring: '#FDE68A',
    checkpoints: [
      { id: 'stretch', label: 'Morning Stretch', time: '9 AM',    tip: '5 min gentle stretching' },
      { id: 'walk',    label: 'Mid-day Walk',    time: '12 PM',   tip: '10+ min walk outside' },
      { id: 'workout', label: 'Full Workout',    time: 'Anytime', tip: '20+ mins of activity' },
    ],
  },
  {
    key: 'outside', emoji: '🌿', label: 'Outside Break', desc: 'Fresh air & sun',
    bg: '#F0FDF4', check: '#22C55E', ring: '#BBF7D0',
    checkpoints: [
      { id: 'morning', label: 'Morning Air',    time: '9 AM',  tip: 'Start the day outside' },
      { id: 'lunch',   label: 'Lunch Outdoors', time: '12 PM', tip: 'Eat lunch in fresh air' },
      { id: 'evening', label: 'Evening Stroll', time: '6 PM',  tip: 'Wind down with a walk' },
    ],
  },
]

// Total possible checkpoints across all habits
const TOTAL_CHECKPOINTS = HABITS.reduce((sum, h) => sum + h.checkpoints.length, 0)

const R = 18
const CIRC = 2 * Math.PI * R

function CircleProgress({ done, total }) {
  const fraction = total > 0 ? done / total : 0
  const offset = CIRC * (1 - fraction)
  const color = fraction >= 1 ? '#72B896' : fraction >= 0.5 ? '#9B87D4' : '#C4B5E8'

  return (
    <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56" className="absolute inset-0"
           style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="28" cy="28" r={R} fill="none" stroke="#EDE8FB" strokeWidth="5" />
        <circle
          cx="28" cy="28" r={R}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.45s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="z-10 text-center leading-none">
        <div className="text-[11px] font-black" style={{ color }}>{done}</div>
        <div className="text-[9px] font-bold text-ink-faint">/{total}</div>
      </div>
    </div>
  )
}

function CheckInModal({ habit, habitCheckpoints, onToggle, onClose }) {
  const { CHECKPOINT_HP } = useApp()
  const done = habit.checkpoints.filter(cp => habitCheckpoints?.[cp.id]).length
  const total = habit.checkpoints.length
  const progress = total > 0 ? (done / total) * 100 : 0
  const hpEarned = done * CHECKPOINT_HP

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: habit.bg }}
        initial={{ scale: 0.82, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.82, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-ink font-black text-xs transition-colors z-10"
        >
          ✕
        </button>

        {/* header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{habit.emoji}</span>
            <div>
              <h3 className="text-xl font-black text-ink">{habit.label}</h3>
              <p className="text-sm text-ink-muted font-semibold">{habit.desc}</p>
            </div>
          </div>

          {/* progress bar */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-ink-muted">{done}/{total} checkpoints</span>
            <motion.span
              key={hpEarned}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-xs font-black"
              style={{ color: habit.check }}
            >
              +{hpEarned} HP earned
            </motion.span>
          </div>
          <div className="h-2.5 rounded-full bg-white/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: habit.check }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* deselect all button */}
        {done > 0 && (
          <div className="px-4 pb-2 flex justify-end">
            <button
              onClick={() => habit.checkpoints.filter(cp => habitCheckpoints?.[cp.id]).forEach(cp => onToggle(cp.id))}
              className="text-xs font-bold px-3 py-1 rounded-full transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.6)', color: habit.check }}
            >
              Deselect All
            </button>
          </div>
        )}

        {/* checkpoint rows */}
        <div className="px-4 pb-4 space-y-2">
          {habit.checkpoints.map((cp, i) => {
            const checked = habitCheckpoints?.[cp.id] ?? false
            return (
              <motion.button
                key={cp.id}
                onClick={() => onToggle(cp.id)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-150"
                style={{
                  backgroundColor: checked ? `${habit.ring}BB` : 'rgba(255,255,255,0.6)',
                  border: `2px solid ${checked ? habit.ring : 'transparent'}`,
                }}
              >
                {/* checkbox circle */}
                <motion.div
                  animate={{ scale: checked ? [1.2, 1] : 1 }}
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black transition-colors"
                  style={{
                    backgroundColor: checked ? habit.check : 'rgba(255,255,255,0.8)',
                    color: checked ? 'white' : '#A89DC4',
                    border: `2px solid ${checked ? habit.check : '#D4CCF0'}`,
                  }}
                >
                  {checked ? '✓' : ''}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-ink">{cp.label}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: habit.check + '28', color: habit.check }}
                    >
                      {cp.time}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted font-semibold">{cp.tip}</div>
                </div>

                <AnimatePresence>
                  {checked && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="text-xs font-black flex-shrink-0"
                      style={{ color: habit.check }}
                    >
                      +{CHECKPOINT_HP} HP
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>

        {/* all-done banner */}
        <AnimatePresence>
          {done === total && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-4 mb-4 py-2.5 rounded-2xl text-sm font-extrabold text-center"
              style={{ backgroundColor: habit.check + '28', color: habit.check }}
            >
              🎉 All checkpoints done! Your buddy is thriving!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function HealthInventory() {
  const { checkpoints, completeCheckpoint, uncompleteCheckpoint } = useApp()
  const [openHabit, setOpenHabit] = useState(null)

  const totalDone = HABITS.reduce((sum, h) =>
    sum + h.checkpoints.filter(cp => checkpoints[h.key]?.[cp.id]).length, 0)

  const allFullyDone = HABITS.every(h =>
    h.checkpoints.every(cp => checkpoints[h.key]?.[cp.id]))

  const handleToggle = (habitKey, cpId) => {
    if (checkpoints[habitKey]?.[cpId]) {
      uncompleteCheckpoint(habitKey, cpId)
    } else {
      completeCheckpoint(habitKey, cpId)
    }
  }

  const isReminderActive = (() => {
    const h = new Date().getHours()
    return h >= 14 && totalDone < 3
  })()

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <motion.h2
            className="text-lg font-extrabold text-ink"
            animate={isReminderActive ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={isReminderActive ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
          >
            ✅ Daily Check-In
          </motion.h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">
            Check in at each checkpoint to heal your buddy
          </p>
        </div>
        <motion.div
          key={totalDone}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <CircleProgress done={totalDone} total={TOTAL_CHECKPOINTS} />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {HABITS.map((habit, i) => {
          const cpDone = habit.checkpoints.filter(cp => checkpoints[habit.key]?.[cp.id]).length
          const cpTotal = habit.checkpoints.length
          const anyDone = cpDone > 0
          const allDone = cpDone === cpTotal

          return (
            <motion.button
              key={habit.key}
              onClick={() => setOpenHabit(habit.key)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="relative text-left rounded-3xl p-4 border-2 transition-all duration-200 overflow-hidden"
              style={{
                backgroundColor: anyDone ? habit.bg : '#FAFAFA',
                borderColor: anyDone ? habit.ring : '#F0EEF8',
              }}
            >
              {/* all-done check badge */}
              <AnimatePresence>
                {allDone && (
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
                style={{ color: anyDone ? habit.check : '#3D3250' }}
              >
                {habit.label}
              </div>
              <div className="text-xs text-ink-muted font-semibold mb-2">{habit.desc}</div>

              {/* checkpoint progress dots */}
              <div className="flex items-center gap-1.5">
                {habit.checkpoints.map(cp => (
                  <div
                    key={cp.id}
                    className="w-2 h-2 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: checkpoints[habit.key]?.[cp.id] ? habit.check : '#E5E2F0',
                    }}
                  />
                ))}
                <span className="text-xs font-bold ml-1" style={{ color: anyDone ? habit.check : '#A89DC4' }}>
                  {cpDone}/{cpTotal}
                </span>
              </div>

              {/* tap hint */}
              {!anyDone && (
                <div className="text-xs text-ink-faint font-semibold mt-1.5">Tap to check in</div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* all done banner */}
      <AnimatePresence>
        {allFullyDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="mt-4 py-3.5 bg-sage-light text-sage-dark rounded-3xl text-sm font-extrabold text-center border-2 border-sage"
          >
            🏆 All checkpoints done! Your buddy loves you! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check-In Modal */}
      <AnimatePresence>
        {openHabit && (() => {
          const habit = HABITS.find(h => h.key === openHabit)
          return (
            <CheckInModal
              key={openHabit}
              habit={habit}
              habitCheckpoints={checkpoints[openHabit]}
              onToggle={(cpId) => handleToggle(openHabit, cpId)}
              onClose={() => setOpenHabit(null)}
            />
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
