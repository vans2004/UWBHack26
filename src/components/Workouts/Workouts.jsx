import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DIFFICULTY_STYLE = {
  Easy:   { bg: 'bg-sage-light',  text: 'text-sage-dark'  },
  Medium: { bg: 'bg-lemon-light', text: 'text-lemon-dark' },
  Hard:   { bg: 'bg-peach-light', text: 'text-peach-dark' },
}

const WORKOUTS = [
  {
    id: 'neck-rolls',
    name: 'Neck Rolls',
    emoji: '🔄',
    duration: '2 min',
    difficulty: 'Easy',
    description: 'Gently release neck tension built up from hours of screen time.',
    steps: [
      'Sit up straight with shoulders relaxed and feet flat on the floor.',
      'Slowly drop your right ear toward your right shoulder.',
      'Hold for 5 seconds, feeling the stretch on the left side of your neck.',
      'Gently roll your chin down toward your chest.',
      'Continue to the left side and hold for 5 seconds.',
      'Roll back to center and repeat the full circle 5 times in each direction.',
    ],
  },
  {
    id: 'chest-opener',
    name: 'Chest Opener Stretch',
    emoji: '🫁',
    duration: '3 min',
    difficulty: 'Easy',
    description: 'Counteract the "desk hunch" by opening up your chest and shoulders.',
    steps: [
      'Stand or sit upright at the edge of your chair.',
      'Clasp your hands behind your back with fingers interlaced.',
      'Straighten your arms and gently squeeze your shoulder blades together.',
      'Lift your chest upward and slightly tilt your head back.',
      'Hold for 20–30 seconds, breathing deeply.',
      'Release slowly and repeat 3 times.',
    ],
  },
  {
    id: 'hip-flexor',
    name: 'Hip Flexor Stretch',
    emoji: '🧘',
    duration: '5 min',
    difficulty: 'Medium',
    description: 'Loosen tight hip flexors that shorten from prolonged sitting.',
    steps: [
      'Step away from your desk and find a clear space.',
      'Kneel on your right knee with your left foot forward (lunge position).',
      'Keep your torso upright — do not lean forward.',
      'Gently push your hips forward until you feel a stretch in your right hip.',
      'Hold for 30 seconds. Squeeze your right glute for a deeper stretch.',
      'Switch sides and repeat. Do 2–3 sets per side.',
    ],
  },
  {
    id: 'shoulder-blade-squeeze',
    name: 'Shoulder Blade Squeeze',
    emoji: '🤸',
    duration: '2 min',
    difficulty: 'Easy',
    description: 'Strengthen the muscles that hold your shoulders back and down.',
    steps: [
      'Sit or stand with good posture, shoulders relaxed.',
      'Roll your shoulders back and down, away from your ears.',
      'Squeeze your shoulder blades together as if pinching a pencil between them.',
      'Hold the squeeze for 5 seconds.',
      'Slowly release back to neutral.',
      'Repeat 10–15 times.',
    ],
  },
  {
    id: 'cat-cow',
    name: 'Cat–Cow Stretch',
    emoji: '🐱',
    duration: '3 min',
    difficulty: 'Easy',
    description: 'Mobilize your entire spine and relieve back stiffness.',
    steps: [
      'Sit at the edge of your chair, hands resting on your thighs.',
      'COW: Inhale slowly — arch your lower back, push chest forward, lift chin slightly.',
      'CAT: Exhale fully — round your back, tuck chin to chest, hollow your belly.',
      'Flow smoothly between cow and cat with each breath.',
      'Move slowly and intentionally, feeling each vertebra.',
      'Repeat for 8–10 full breath cycles.',
    ],
  },
  {
    id: 'wrist-stretch',
    name: 'Wrist & Finger Stretch',
    emoji: '✋',
    duration: '2 min',
    difficulty: 'Easy',
    description: 'Prevent carpal tunnel and repetitive strain from hours of typing.',
    steps: [
      'Extend your right arm forward with palm facing up.',
      'Use your left hand to gently pull your right fingers back toward you.',
      'Hold for 15 seconds, feeling the stretch in your wrist and forearm.',
      'Flip your palm to face down and gently pull fingers downward.',
      'Hold for 15 seconds.',
      'Shake out your hands gently, then repeat on the left arm.',
    ],
  },
  {
    id: 'spinal-twist',
    name: 'Seated Spinal Twist',
    emoji: '🌀',
    duration: '3 min',
    difficulty: 'Medium',
    description: 'Decompress your spine and improve thoracic mobility.',
    steps: [
      'Sit up straight at the edge of your chair, feet flat on the floor.',
      'Place your right hand on your left knee.',
      'Inhale to lengthen your spine.',
      'Exhale and rotate your torso to the left, looking over your left shoulder.',
      'Hold for 20–30 seconds, breathing normally.',
      'Return to center on an inhale. Switch sides and repeat for 2 rounds each.',
    ],
  },
]

function WorkoutCard({ workout, index }) {
  const [open, setOpen] = useState(false)
  const diff = DIFFICULTY_STYLE[workout.difficulty]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-3xl border-2 border-lavender-light bg-white overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        <span className="text-3xl flex-shrink-0">{workout.emoji}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-extrabold text-ink">{workout.name}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${diff.bg} ${diff.text}`}>
              {workout.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs font-bold text-ink-muted">⏱ {workout.duration}</span>
            <span className="text-xs text-ink-faint font-semibold">{workout.description}</span>
          </div>
        </div>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-ink-faint font-black text-lg flex-shrink-0"
        >
          ↓
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 border-t border-lavender-light pt-4">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-3">
                Step-by-step instructions
              </p>
              <ol className="space-y-2.5">
                {workout.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-lavender-light text-lavender-dark font-black text-xs flex items-center justify-center mt-0.5"
                    >
                      {i + 1}
                    </span>
                    <span className="text-ink font-semibold leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Workouts() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-ink">💪 Desk Workouts</h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">
            Guided stretches & routines for desk workers — tap any card to expand
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {Object.entries(DIFFICULTY_STYLE).map(([label, s]) => (
            <span key={label} className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {WORKOUTS.map((w, i) => (
          <WorkoutCard key={w.id} workout={w} index={i} />
        ))}
      </div>
    </div>
  )
}
