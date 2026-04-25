import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

export default function ResetModal() {
  const { showBreakModal, currentChallenge, completeBreakChallenge } = useApp()

  return (
    <AnimatePresence>
      {showBreakModal && (
        <>
          <motion.div
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 40, scale: 0.88 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 40, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="bg-white rounded-5xl p-8 max-w-sm w-full shadow-pop text-center">
              <motion.div
                animate={{ rotate: [-8, 8, -8] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl mb-3 inline-block"
              >
                ⏰
              </motion.div>

              <h2 className="text-2xl font-black text-ink mb-1">Break time!</h2>
              <p className="text-sm text-ink-muted font-semibold mb-6">
                30 minutes on screen — let's get your body moving!
              </p>

              {currentChallenge && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: 0.1 }}
                  className="bg-sage-light rounded-3xl p-5 mb-6 text-left border-2 border-sage"
                >
                  <div className="text-4xl mb-2">{currentChallenge.emoji}</div>
                  <p className="font-bold text-ink text-base">{currentChallenge.text}</p>
                </motion.div>
              )}

              <motion.button
                onClick={completeBreakChallenge}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-3xl bg-sage text-white font-black text-base shadow-soft transition-colors hover:bg-sage-dark"
              >
                ✅ Done! Heal my buddy (+20 HP)
              </motion.button>
              <p className="text-xs text-ink-faint font-semibold mt-3">Your pet is counting on you 🐾</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
