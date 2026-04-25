import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { PetSprite } from '../VirtualPet/PetSprites'

const COUNTDOWN_SECS = 30

// ── Countdown ring ────────────────────────────────────────────────────────────
const R = 40
const CIRC = 2 * Math.PI * R

function CountdownRing({ seconds }) {
  const fraction = seconds / COUNTDOWN_SECS
  const offset   = CIRC * (1 - fraction)
  const color    = seconds > 15 ? '#72B896' : seconds > 7 ? '#F4C256' : '#FF8C5A'

  return (
    <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
      <svg
        width="96" height="96" viewBox="0 0 100 100"
        className="absolute inset-0"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* track */}
        <circle cx="50" cy="50" r={R} fill="none" stroke="#F0EEF8" strokeWidth="8" />
        {/* progress arc */}
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.85s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <motion.span
          key={seconds}
          initial={{ scale: 1.35, opacity: 0.6 }}
          animate={{ scale: 1,    opacity: 1   }}
          className="text-2xl font-black text-ink tabular-nums block leading-none"
          style={{ color }}
        >
          {seconds}
        </motion.span>
        <span className="text-[10px] font-bold text-ink-faint">sec</span>
      </div>
    </div>
  )
}

// ── Pet speech-bubble illustration ────────────────────────────────────────────
function PetIllustration() {
  return (
    <div className="relative flex items-end justify-center gap-3 pb-2">
      {/* floating sparkles */}
      {[
        { x: '-left-2', y: 'top-0',  delay: 0,    emoji: '✨', size: 'text-base' },
        { x: 'right-0', y: 'top-2',  delay: 0.4,  emoji: '⭐', size: 'text-sm'  },
        { x: 'left-6',  y: '-top-1', delay: 0.8,  emoji: '💫', size: 'text-xs'  },
      ].map((s, i) => (
        <motion.span
          key={i}
          className={`absolute ${s.x} ${s.y} ${s.size} pointer-events-none select-none`}
          animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.2, delay: s.delay, ease: 'easeInOut' }}
        >
          {s.emoji}
        </motion.span>
      ))}

      {/* pet — sad mood, looking up at user */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 8px 16px rgba(100,80,160,0.18))' }}
      >
        <PetSprite mood="sad" size={110} />
      </motion.div>

      {/* speech bubble */}
      <div className="relative mb-6">
        {/* bubble tail */}
        <div
          className="absolute -left-3 bottom-3 w-0 h-0"
          style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '12px solid #EDE8FB',
          }}
        />
        <div className="bg-lavender-light border-2 border-lavender rounded-3xl rounded-bl-sm px-4 py-3 max-w-[140px]">
          <p className="text-xs font-extrabold text-ink leading-snug">
            I'm getting tired… please take a break! 🥺
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Challenge illustration SVGs ───────────────────────────────────────────────
// Small thematic icon per challenge type
function ChallengeIcon({ emoji }) {
  const map = {
    '🤸': { bg: '#D4F0E0', ring: '#72B896' },
    '👀': { bg: '#DBEAFE', ring: '#60A5FA' },
    '💧': { bg: '#DBEAFE', ring: '#60A5FA' },
    '🧘': { bg: '#EDE8FB', ring: '#9B87D4' },
    '🚶': { bg: '#FFF8D6', ring: '#F4C256' },
    '✋': { bg: '#FFE8F0', ring: '#FF7BAC' },
    '🙆': { bg: '#FFEEE6', ring: '#FFB997' },
    '🌬️': { bg: '#D4F0E0', ring: '#72B896' },
  }
  const theme = map[emoji] ?? { bg: '#EDE8FB', ring: '#9B87D4' }

  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2"
      style={{ backgroundColor: theme.bg, borderColor: theme.ring }}
    >
      {emoji}
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ResetModal() {
  const { showBreakModal, currentChallenge, completeBreakChallenge, dismissBreakChallenge } = useApp()
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS)
  const [skipping,  setSkipping]  = useState(false)  // confirm step

  // countdown tick
  useEffect(() => {
    if (!showBreakModal) { setCountdown(COUNTDOWN_SECS); setSkipping(false); return }
    if (countdown <= 0)  { dismissBreakChallenge(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [showBreakModal, countdown, dismissBreakChallenge])

  return (
    <AnimatePresence>
      {showBreakModal && (
        <>
          {/* blurred backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* modal wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              className="bg-white rounded-5xl shadow-pop w-full max-w-sm mx-auto"
              initial={{ opacity: 0, scale: 0.55, y: 50 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.75,  y: 30 }}
              transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            >
              {/* ── top colour band ── */}
              <div className="bg-gradient-to-br from-lavender-light to-cream rounded-t-5xl px-6 pt-6 pb-2 text-center">
                <motion.div
                  animate={{ rotate: [-6, 6, -6] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                  className="text-4xl mb-1 inline-block"
                >
                  ⏰
                </motion.div>
                <h2 className="text-2xl font-black text-ink leading-tight">Time for a break!</h2>
                <p className="text-sm text-ink-muted font-semibold mt-1 mb-3">
                  30 minutes of screen time — your body needs a rest
                </p>
              </div>

              <div className="px-6 pb-6 space-y-4">
                {/* pet illustration */}
                <PetIllustration />

                {/* challenge card */}
                {currentChallenge && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="flex items-center gap-4 bg-lavender-light border-2 border-lavender rounded-3xl p-4"
                  >
                    <ChallengeIcon emoji={currentChallenge.emoji} />
                    <p className="font-extrabold text-ink text-sm leading-snug flex-1">
                      {currentChallenge.text}
                    </p>
                  </motion.div>
                )}

                {/* countdown row */}
                <div className="flex items-center gap-4 bg-cream-dark rounded-3xl p-4">
                  <CountdownRing seconds={countdown} />
                  <div className="flex-1">
                    <p className="font-extrabold text-ink text-sm">Complete it in time!</p>
                    <p className="text-xs text-ink-muted font-semibold mt-0.5">
                      {countdown > 0
                        ? `Auto-skips in ${countdown}s (costs −${10} HP)`
                        : 'Time\'s up…'}
                    </p>
                    {/* mini bar mirroring the ring */}
                    <div className="h-1.5 bg-lavender-light rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: countdown > 15 ? '#72B896' : countdown > 7 ? '#F4C256' : '#FF8C5A',
                          width: `${(countdown / COUNTDOWN_SECS) * 100}%`,
                          transition: 'width 0.85s linear, background-color 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* skip confirm prompt (replaces buttons when skipping) */}
                <AnimatePresence mode="wait">
                  {skipping ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{    opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-peach-light border-2 border-peach rounded-3xl p-4 text-center space-y-3">
                        <p className="text-sm font-extrabold text-ink">
                          😢 Your buddy will lose <span className="text-peach-dark">−10 HP</span> if you skip!
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSkipping(false)}
                            className="flex-1 py-2.5 rounded-2xl bg-white border-2 border-lavender text-sm font-extrabold text-ink hover:bg-lavender-light transition-colors"
                          >
                            Go back
                          </button>
                          <button
                            onClick={dismissBreakChallenge}
                            className="flex-1 py-2.5 rounded-2xl bg-peach-light border-2 border-peach-dark text-sm font-extrabold text-peach-dark hover:bg-peach/30 transition-colors"
                          >
                            Skip anyway
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{    opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {/* complete button */}
                      <motion.button
                        onClick={completeBreakChallenge}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 rounded-3xl bg-sage hover:bg-sage-dark text-white
                                   font-black text-base shadow-soft transition-colors"
                      >
                        I did it! 💪 <span className="font-semibold opacity-80 text-sm">(+15 HP)</span>
                      </motion.button>

                      {/* skip link */}
                      <button
                        onClick={() => setSkipping(true)}
                        className="w-full py-2 text-xs font-bold text-ink-faint hover:text-ink-muted transition-colors"
                      >
                        Skip for now (−10 HP)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
