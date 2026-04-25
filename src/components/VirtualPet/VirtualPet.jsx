import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

const MOOD_META = {
  happy:   { label: '😄 Happy!',          bg: 'from-sage-light to-white',     bar: '#72B896', badge: 'bg-sage-light   text-sage-dark'   },
  neutral: { label: '😐 Doing okay',       bg: 'from-blue-50     to-white',     bar: '#8AAEE0', badge: 'bg-blue-100    text-blue-600'     },
  sad:     { label: '😢 A little sad…',    bg: 'from-lavender-light to-white',  bar: '#9B87D4', badge: 'bg-lavender-light text-lavender-dark' },
  sick:    { label: '😷 Not feeling well', bg: 'from-lemon-light  to-white',    bar: '#9CC870', badge: 'bg-lemon-light  text-lemon-dark'   },
}

const PET_MOTION = {
  happy:   { animate: { y: [0, -12, 0] },                         transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' } },
  neutral: { animate: { rotate: [-2, 2, -2], y: [0, -5, 0] },    transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' } },
  sad:     { animate: { rotate: [-3, 3, -3] },                    transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } },
  sick:    { animate: { x: [-4, 4, -4] },                         transition: { repeat: Infinity, duration: 0.28, ease: 'easeInOut' } },
}

// Floating heart that pops up when health increases
function HeartPop({ trigger }) {
  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          key={trigger}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 text-3xl pointer-events-none z-10 select-none"
          initial={{ y: 0, opacity: 1, scale: 0.6 }}
          animate={{ y: -70, opacity: 0, scale: 1.4 }}
          exit={{}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          💚
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function VirtualPet() {
  const { petHealth, petMood } = useApp()
  const meta = MOOD_META[petMood]
  const pm = PET_MOTION[petMood]

  const prevHealth = useRef(petHealth)
  const [heartKey, setHeartKey] = useState(null)

  useEffect(() => {
    if (petHealth > prevHealth.current) setHeartKey(Date.now())
    prevHealth.current = petHealth
  }, [petHealth])

  const barColor = petHealth >= 75 ? '#72B896' : petHealth >= 50 ? '#8AAEE0' : petHealth >= 25 ? '#9B87D4' : '#FF8C5A'

  return (
    <div className={`card p-8 flex flex-col min-h-[540px] bg-gradient-to-b ${meta.bg}`}>
      {/* header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink">Your Buddy</h2>
          <p className="text-sm text-ink-muted mt-0.5 font-medium">Responds to your habits ✨</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={petMood}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            exit={{    scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className={`px-4 py-1.5 rounded-full text-sm font-bold ${meta.badge}`}
          >
            {meta.label}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* pet + heart pop */}
      <div className="relative flex-1 flex items-center justify-center py-2">
        <HeartPop trigger={heartKey} />
        <motion.img
          src="/dino-avatar.png"
          alt={`Spine-o-saur — ${petMood}`}
          animate={pm.animate}
          transition={pm.transition}
          className="w-56 h-56 object-contain"
          style={{
            filter: {
              happy:   'drop-shadow(0 12px 24px rgba(100,160,120,0.25)) saturate(1.15) brightness(1.05)',
              neutral: 'drop-shadow(0 10px 20px rgba(100,120,180,0.2)) saturate(0.85)',
              sad:     'drop-shadow(0 10px 20px rgba(80,90,160,0.2)) saturate(0.55) brightness(0.88)',
              sick:    'drop-shadow(0 10px 20px rgba(80,160,80,0.2)) saturate(0.6) brightness(0.85) hue-rotate(15deg)',
            }[petMood],
          }}
        />
      </div>

      {/* health bar */}
      <div className="mt-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="font-bold text-ink text-sm">Health</span>
          <motion.span
            key={Math.round(petHealth)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="font-extrabold text-sm tabular-nums"
            style={{ color: barColor }}
          >
            {Math.round(petHealth)}<span className="font-semibold text-ink-faint">/100</span>
          </motion.span>
        </div>

        <div className="h-3 bg-cream-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: barColor }}
            animate={{ width: `${petHealth}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>

        <div className="flex justify-between text-lg pt-0.5">
          {[
            { e: '😷', lo: 0,  hi: 25  },
            { e: '😢', lo: 25, hi: 50  },
            { e: '😐', lo: 50, hi: 75  },
            { e: '😄', lo: 75, hi: 101 },
          ].map(({ e, lo, hi }) => (
            <span
              key={lo}
              className="transition-all duration-300 cursor-default"
              style={{ opacity: petHealth >= lo && petHealth < hi ? 1 : 0.18, transform: petHealth >= lo && petHealth < hi ? 'scale(1.25)' : 'scale(1)' }}
            >
              {e}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={petMood}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -4 }}
            className="text-xs text-center text-ink-muted font-semibold pt-1"
          >
            {petMood === 'happy'   && '✨ Thriving! Keep the good habits going.'}
            {petMood === 'neutral' && '💧 A habit or two would really help!'}
            {petMood === 'sad'     && '🌿 Time for a break — they need fresh air.'}
            {petMood === 'sick'    && '⚠️ Complete a challenge to recover!'}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
