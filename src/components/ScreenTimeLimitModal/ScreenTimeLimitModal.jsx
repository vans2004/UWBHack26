import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PRESETS = [
  { label: '1 hour',   mins: 60  },
  { label: '2 hours',  mins: 120 },
  { label: '3 hours',  mins: 180 },
  { label: 'Custom',   mins: null },
]

export default function ScreenTimeLimitModal({ onConfirm, onDismiss }) {
  const [selected, setSelected] = useState(null) // preset mins or 'custom'
  const [customMins, setCustomMins] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (selected === null) { setError('Please choose a duration.'); return }

    let mins
    if (selected === 'custom') {
      const parsed = parseInt(customMins, 10)
      if (!parsed || parsed < 1 || parsed > 1440) {
        setError('Enter a number between 1 and 1440 minutes.')
        return
      }
      mins = parsed
    } else {
      mins = selected
    }

    onConfirm(mins * 60) // pass limit in seconds
  }

  const pick = (mins) => {
    setSelected(mins ?? 'custom')
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        className="relative w-full max-w-md card p-7"
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">⏱️</span>
          <h2 className="text-xl font-extrabold text-ink">
            Set a screen time limit?
          </h2>
          <p className="text-sm text-ink-muted font-semibold mt-1.5 leading-snug">
            We'll warn you 10 minutes before your limit and again when you hit it.
          </p>
        </div>

        {/* Preset buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {PRESETS.map((opt) => {
            const val = opt.mins ?? 'custom'
            const active = selected === val
            return (
              <button
                key={val}
                onClick={() => pick(opt.mins)}
                className={`py-3.5 rounded-2xl text-sm font-extrabold transition-all border-2 ${
                  active
                    ? 'bg-lavender-light border-lavender text-lavender-dark'
                    : 'bg-cream border-cream-dark text-ink hover:border-lavender-light'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Custom minutes input */}
        <AnimatePresence initial={false}>
          {selected === 'custom' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex items-center gap-2 bg-cream rounded-2xl px-4 py-3 border-2 border-cream-dark focus-within:border-lavender transition-colors">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={customMins}
                  onChange={e => { setCustomMins(e.target.value); setError('') }}
                  placeholder="e.g. 90"
                  autoFocus
                  className="flex-1 bg-transparent text-sm font-bold text-ink focus:outline-none placeholder:text-ink-faint w-0"
                />
                <span className="text-xs font-bold text-ink-muted flex-shrink-0">minutes</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-bold text-peach-dark text-center bg-peach-light px-3 py-2 rounded-xl mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-ink-muted bg-cream hover:bg-cream-dark transition-colors"
          >
            No thanks
          </button>
          <motion.button
            onClick={handleConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-2xl text-sm font-extrabold bg-lavender text-white hover:bg-lavender-dark transition-colors shadow-soft"
          >
            Set limit
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
