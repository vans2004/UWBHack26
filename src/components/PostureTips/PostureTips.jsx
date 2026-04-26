import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const TIPS = [
  {
    id: 'eye-level',
    emoji: '👁️',
    title: 'Screen at Eye Level',
    tip: 'Keep your screen at eye level — the top of your monitor should sit at or just below eye height.',
    why: 'For every inch your head tilts forward, the effective load on your cervical spine roughly doubles. Proper eye-level positioning keeps your spine in a neutral curve and dramatically reduces chronic neck pain and headaches over time.',
  },
  {
    id: '90-rule',
    emoji: '📐',
    title: '90-90-90 Rule',
    tip: '90-90-90 rule: hips, knees, and ankles should all be at 90° when seated.',
    why: 'This angle distributes body weight evenly across your joints, minimizing pressure on your lumbar discs and hip flexors. Deviating even slightly can increase spinal disc pressure by up to 40% over a full workday.',
  },
  {
    id: 'feet-flat',
    emoji: '🦶',
    title: 'Feet Flat on Floor',
    tip: "Keep both feet flat on the floor. Use a footrest if your feet don't reach comfortably.",
    why: 'Dangling feet cut off circulation to your lower legs and create uneven hip loading. Flat feet anchor your pelvis in a neutral position, which in turn prevents your lumbar spine from collapsing into a slouch.',
  },
  {
    id: 'elbow-height',
    emoji: '⌨️',
    title: 'Keyboard at Elbow Height',
    tip: 'Place your keyboard and mouse at elbow height so your forearms can rest naturally.',
    why: 'Reaching up or down forces your shoulders and wrists into strained positions, contributing to carpal tunnel syndrome and shoulder impingement. Neutral forearm position can reduce muscle fatigue by up to 50%.',
  },
  {
    id: 'arms-length',
    emoji: '🔆',
    title: "Arm's Length Distance",
    tip: "Position your monitor 20–30 inches (arm's length) from your eyes to reduce eye strain.",
    why: 'At this distance your eyes can focus comfortably without straining the ciliary muscles. Combined with the 20-20-20 rule, it significantly reduces digital eye strain and tension headaches throughout the day.',
  },
  {
    id: 'lumbar',
    emoji: '🧱',
    title: 'Support Your Lower Back',
    tip: "Support your lower back — use a lumbar cushion or adjust your chair's lumbar support.",
    why: 'Without lumbar support, your lower back muscles must constantly work to hold the spine upright, causing fatigue and pain. Proper support maintains the natural inward curve of the lumbar spine and reduces disc pressure by ~30%.',
  },
  {
    id: 'shoulders',
    emoji: '💪',
    title: 'Relax Your Shoulders',
    tip: 'Relax your shoulders down and back. Avoid raising them toward your ears.',
    why: 'Elevated or forward-rolled shoulders compress the nerves running from your neck to your arms (brachial plexus), causing tingling and chronic upper-back tightness. Consciously dropping your shoulders even once an hour resets this tension pattern.',
  },
  {
    id: 'breaks',
    emoji: '⏰',
    title: 'Take Regular Breaks',
    tip: 'Every 20–30 minutes, look away from your screen and stand up — even just for 30 seconds.',
    why: 'Prolonged static posture causes muscle fatigue and reduces blood flow to spinal discs, which rely on movement to absorb nutrients. Even brief movement every 30 minutes has been shown to reduce back pain intensity by up to 60%.',
  },
]

const ARTICLES = [
  {
    id: 'forward-head',
    emoji: '🦴',
    title: 'How to Fix Forward Head Posture',
    summary: 'Learn why "text neck" happens and the exact exercises to reverse it.',
    readTime: '3 min read',
    color: '#EDE8FB',
    accent: '#9B87D4',
    body: 'Forward head posture occurs when your head sits in front of your shoulders rather than directly above them. For every inch your head moves forward, it effectively adds ~10 lbs of extra load on your cervical spine. The fix involves strengthening the deep neck flexors, stretching the suboccipital muscles, and building awareness of "text neck." Start by gently tucking your chin in and imagining a string pulling the crown of your head toward the ceiling.',
  },
  {
    id: 'desk-stretches',
    emoji: '🧘',
    title: 'Best Stretches for Desk Workers',
    summary: '5 minutes of targeted stretching beats a sporadic 30-minute session every time.',
    readTime: '4 min read',
    color: '#D4F0E0',
    accent: '#72B896',
    body: 'Sitting for long hours tightens your hip flexors, chest, and neck — the three biggest trouble areas for desk workers. The most effective counterbalance stretches are the hip flexor lunge, the doorframe chest opener, and chin tucks. Aim to do these three stretches once in the morning and once after work. Even 5 minutes daily beats a 30-minute session done sporadically.',
  },
  {
    id: '90-rule-article',
    emoji: '📐',
    title: 'The 90-90-90 Sitting Rule Explained',
    summary: 'Why this simple angle check is the gold standard of ergonomic seating.',
    readTime: '2 min read',
    color: '#FFF8D6',
    accent: '#F4C256',
    body: 'The 90-90-90 rule states that when sitting, your hips, knees, and ankles should each form a 90-degree angle. Your thighs should be parallel to the floor, your feet flat, and your lower back supported. This position distributes body weight evenly, reduces spinal compression, and keeps your musculoskeletal system in a neutral, low-tension state. Adjust your chair height and desk height to achieve all three angles.',
  },
  {
    id: 'energy-posture',
    emoji: '⚡',
    title: 'Why Posture Affects Your Energy Levels',
    summary: "Slouching can cut your lung capacity by 30% — here's the science.",
    readTime: '3 min read',
    color: '#FFEEE6',
    accent: '#FF8C5A',
    body: 'Research shows that slouching restricts lung capacity by up to 30%, reducing oxygen delivered to the brain and contributing to afternoon fatigue. Good posture also influences your nervous system — upright posture is associated with higher testosterone, lower cortisol, and a more confident mental state. Simply sitting or standing straighter for a few minutes can measurably shift your mood and energy throughout the day.',
  },
]

const QUIZ_QUESTIONS = [
  {
    id: 'monitor',
    question: 'How high is your monitor?',
    emoji: '🖥️',
    options: [
      { label: 'At or just below eye level', score: 2 },
      { label: 'I have to look up to see it', score: 0 },
      { label: 'I look down at a laptop on a desk', score: 0 },
      { label: "I don't use a monitor", score: 1 },
    ],
  },
  {
    id: 'feet',
    question: 'Do your feet touch the floor when sitting?',
    emoji: '🦶',
    options: [
      { label: 'Yes, flat on the floor', score: 2 },
      { label: 'I use a footrest', score: 2 },
      { label: 'They dangle a bit', score: 0 },
      { label: 'I mostly work standing', score: 1 },
    ],
  },
  {
    id: 'breaks',
    question: 'How often do you take screen breaks?',
    emoji: '⏰',
    options: [
      { label: 'Every 20–30 minutes', score: 2 },
      { label: 'About once an hour', score: 1 },
      { label: 'Rarely — I get absorbed in work', score: 0 },
      { label: 'I use a reminder app', score: 2 },
    ],
  },
  {
    id: 'keyboard',
    question: 'Where does your keyboard sit?',
    emoji: '⌨️',
    options: [
      { label: 'At elbow height, arms relaxed', score: 2 },
      { label: 'Higher than my elbows', score: 0 },
      { label: 'Lower than my elbows', score: 0 },
      { label: 'I use a standing desk', score: 1 },
    ],
  },
  {
    id: 'posture',
    question: 'How would you describe your usual sitting posture?',
    emoji: '🪑',
    options: [
      { label: 'Upright with back fully supported', score: 2 },
      { label: 'Slightly slouched', score: 1 },
      { label: 'Leaning forward toward the screen', score: 0 },
      { label: 'Varies a lot throughout the day', score: 1 },
    ],
  },
]

const QUIZ_RESULTS = {
  high: {
    label: 'Posture Pro',
    emoji: '🏆',
    color: '#D4F0E0',
    accent: '#72B896',
    message: "You're already doing great! Here are some refinements to stay sharp:",
    tips: [
      'Try a lumbar support roll to maintain your curve during long sessions.',
      'Consider a monitor arm to dial in the exact height and distance.',
      'Add a brief walking break in addition to your seated micro-breaks.',
    ],
  },
  mid: {
    label: 'On the Right Track',
    emoji: '🌱',
    color: '#FFF8D6',
    accent: '#F4C256',
    message: 'Good foundation — a few tweaks will make a big difference:',
    tips: [
      'Set a 25-minute timer to remind you to check your posture and stand up.',
      "Raise or lower your chair so your feet rest flat without your thighs angling down.",
      "Pull your monitor back to arm's length if you lean forward to read it.",
    ],
  },
  low: {
    label: 'Room to Grow',
    emoji: '💪',
    color: '#FFEEE6',
    accent: '#FF8C5A',
    message: "No worries — small changes add up fast. Start here:",
    tips: [
      'Use a book or laptop stand to get your screen closer to eye level today.',
      'Put a folded towel behind your lower back for instant lumbar support.',
      'Set one alarm per hour just to stand up and shake out your shoulders.',
    ],
  },
}

export default function PostureTips() {
  const todayIndex = Math.floor(Date.now() / 86400000) % TIPS.length
  const tipOfTheDay = TIPS[todayIndex]

  const [followedTips, setFollowedTips] = useState(() =>
    JSON.parse(localStorage.getItem('bf_followedTips') || '[]')
  )
  const [savedArticles, setSavedArticles] = useState(() =>
    JSON.parse(localStorage.getItem('bf_savedArticles') || '[]')
  )
  const [expandedTip, setExpandedTip] = useState(null)
  const [expandedArticles, setExpandedArticles] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizDone, setQuizDone] = useState(false)

  const toggleFollowed = (id) => {
    const next = followedTips.includes(id)
      ? followedTips.filter(t => t !== id)
      : [...followedTips, id]
    setFollowedTips(next)
    localStorage.setItem('bf_followedTips', JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('bf-followed-tips-updated', { detail: next }))
  }

  const toggleSaved = (id) => {
    const next = savedArticles.includes(id)
      ? savedArticles.filter(a => a !== id)
      : [...savedArticles, id]
    setSavedArticles(next)
    localStorage.setItem('bf_savedArticles', JSON.stringify(next))
  }

  const toggleExpandArticle = (id) => {
    setExpandedArticles(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const quizScore = QUIZ_QUESTIONS.reduce((sum, q) => {
    const idx = quizAnswers[q.id]
    return idx !== undefined ? sum + q.options[idx].score : sum
  }, 0)
  const maxScore = QUIZ_QUESTIONS.length * 2
  const quizResult =
    quizScore >= Math.floor(maxScore * 0.8)
      ? QUIZ_RESULTS.high
      : quizScore >= Math.floor(maxScore * 0.5)
      ? QUIZ_RESULTS.mid
      : QUIZ_RESULTS.low

  const savedArticleObjects = ARTICLES.filter(a => savedArticles.includes(a.id))
  const progress = (followedTips.length / TIPS.length) * 100

  const resetQuiz = () => {
    setQuizStarted(false)
    setQuizDone(false)
    setQuizAnswers({})
    setQuizStep(0)
  }

  return (
    <div className="space-y-5">

      {/* ── Tip of the Day ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #EDE8FB 0%, #D4EEFF 100%)',
          boxShadow: '0 0 0 2px #9B87D4, 0 0 24px 6px #9B87D430',
        }}
      >
        <div className="absolute top-0 right-0 text-[90px] opacity-10 pointer-events-none select-none leading-none -mt-3 -mr-3">
          {tipOfTheDay.emoji}
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block mb-3"
          style={{ backgroundColor: '#9B87D428', color: '#7B67C4' }}
        >
          ✨ Tip of the Day
        </span>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{tipOfTheDay.emoji}</span>
          <div>
            <h3 className="text-base font-extrabold text-ink mb-1">{tipOfTheDay.title}</h3>
            <p className="text-sm font-semibold text-ink-muted leading-snug">{tipOfTheDay.tip}</p>
            <p className="text-xs font-semibold mt-2.5 leading-snug" style={{ color: '#7B67C4' }}>
              💡 {tipOfTheDay.why}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Saved Articles ── */}
      <AnimatePresence>
        {savedArticleObjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 overflow-hidden"
          >
            <h2 className="text-base font-extrabold text-ink mb-3">🔖 Saved Articles</h2>
            <div className="space-y-2">
              {savedArticleObjects.map(article => (
                <div
                  key={article.id}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ backgroundColor: article.color }}
                >
                  <span className="text-lg">{article.emoji}</span>
                  <span className="flex-1 text-sm font-bold text-ink leading-tight">{article.title}</span>
                  <button
                    onClick={() => toggleSaved(article.id)}
                    className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: article.accent + '28', color: article.accent }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress Tracker ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-extrabold text-ink">
            You follow {followedTips.length}/{TIPS.length} posture habits
            {followedTips.length === TIPS.length ? ' 🎉' : ''}
          </h2>
          <span className="text-xs font-bold" style={{ color: '#9B87D4' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E2F0' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#9B87D4' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {followedTips.length === TIPS.length && (
          <p className="text-xs font-bold mt-2 text-center" style={{ color: '#9B87D4' }}>
            Amazing — you've mastered all posture habits! 🏆
          </p>
        )}
      </div>

      {/* ── Quick Posture Tips ── */}
      <div className="card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-ink">💡 Quick Posture Tips</h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">
            Tap a card to learn why it matters
          </p>
        </div>

        <div className="space-y-2.5">
          {TIPS.map((item, i) => {
            const isExpanded = expandedTip === item.id
            const isFollowed = followedTips.includes(item.id)
            const isTod = item.id === tipOfTheDay.id

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: isFollowed ? '#EDE8FB' : '#F5F3FF',
                  border: `2px solid ${isFollowed ? '#9B87D4' : 'transparent'}`,
                }}
              >
                {/* collapsed row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedTip(isExpanded ? null : item.id)}
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-extrabold text-ink">{item.title}</span>
                      {isTod && (
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: '#9B87D428', color: '#7B67C4' }}
                        >
                          Today
                        </span>
                      )}
                    </div>
                    {!isExpanded && (
                      <p className="text-[10px] font-bold" style={{ color: '#9B87D4' }}>
                        Tap to learn more ↓
                      </p>
                    )}
                  </div>
                  {/* inline "I do this" check */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFollowed(item.id) }}
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                    style={{
                      backgroundColor: isFollowed ? '#9B87D4' : 'rgba(155,135,212,0.15)',
                      color: isFollowed ? 'white' : '#9B87D4',
                      border: `2px solid ${isFollowed ? '#9B87D4' : '#C5BAF0'}`,
                    }}
                    title={isFollowed ? 'Unmark' : 'I do this!'}
                  >
                    {isFollowed ? '✓' : ''}
                  </button>
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-[10px] flex-shrink-0"
                    style={{ color: '#9B87D4' }}
                  >
                    ▼
                  </motion.span>
                </div>

                {/* expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-4 pb-4">
                        <p className="text-xs font-semibold text-ink-muted leading-snug mb-3">
                          {item.tip}
                        </p>
                        <div
                          className="rounded-2xl p-3 mb-3 text-xs font-semibold leading-relaxed"
                          style={{ backgroundColor: '#9B87D418', color: '#5D4A9C' }}
                        >
                          <span className="font-extrabold block mb-1">Why this matters:</span>
                          {item.why}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleFollowed(item.id)}
                          className="w-full py-2 rounded-2xl text-sm font-extrabold transition-colors"
                          style={{
                            backgroundColor: isFollowed ? '#9B87D4' : 'rgba(155,135,212,0.15)',
                            color: isFollowed ? 'white' : '#9B87D4',
                          }}
                        >
                          {isFollowed ? '✓ I do this!' : 'I do this!'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Quick Posture Quiz ── */}
      <div className="card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-ink">🧠 Quick Posture Quiz</h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">
            Find out how posture-smart your setup is
          </p>
        </div>

        {!quizStarted ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setQuizStarted(true); setQuizStep(0); setQuizAnswers({}); setQuizDone(false) }}
            className="w-full py-3 rounded-2xl font-extrabold text-sm text-white"
            style={{ backgroundColor: '#9B87D4' }}
          >
            Start Quiz →
          </motion.button>
        ) : quizDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-5"
            style={{ backgroundColor: quizResult.color }}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{quizResult.emoji}</div>
              <h3 className="text-xl font-black text-ink">{quizResult.label}</h3>
              <p className="text-sm font-bold mt-1" style={{ color: quizResult.accent }}>
                Score: {quizScore} / {maxScore}
              </p>
            </div>
            <p className="text-sm font-bold text-ink mb-3">{quizResult.message}</p>
            <ul className="space-y-2 mb-4">
              {quizResult.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-semibold text-ink-muted">
                  <span className="flex-shrink-0" style={{ color: quizResult.accent }}>•</span>
                  {tip}
                </li>
              ))}
            </ul>
            <button
              onClick={resetQuiz}
              className="w-full py-2 rounded-2xl text-sm font-extrabold"
              style={{ backgroundColor: quizResult.accent + '28', color: quizResult.accent }}
            >
              Retake Quiz
            </button>
          </motion.div>
        ) : (
          <div>
            {/* step progress bar */}
            <div className="flex gap-1.5 mb-5">
              {QUIZ_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: i <= quizStep ? '#9B87D4' : '#E5E2F0' }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={quizStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
              >
                <div className="mb-4">
                  <span className="text-2xl">{QUIZ_QUESTIONS[quizStep].emoji}</span>
                  <h3 className="text-base font-extrabold text-ink mt-2">
                    {QUIZ_QUESTIONS[quizStep].question}
                  </h3>
                  <p className="text-xs text-ink-muted font-semibold mt-0.5">
                    Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, j) => {
                    const selected = quizAnswers[QUIZ_QUESTIONS[quizStep].id] === j
                    return (
                      <motion.button
                        key={j}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setQuizAnswers(prev => ({ ...prev, [QUIZ_QUESTIONS[quizStep].id]: j }))
                        }
                        className="w-full text-left p-3 rounded-2xl text-sm font-semibold transition-all duration-150"
                        style={{
                          backgroundColor: selected ? '#9B87D4' : '#F5F3FF',
                          color: selected ? 'white' : '#3D3460',
                          border: `2px solid ${selected ? '#9B87D4' : 'transparent'}`,
                        }}
                      >
                        {opt.label}
                      </motion.button>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  {quizStep > 0 && (
                    <button
                      onClick={() => setQuizStep(s => s - 1)}
                      className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold"
                      style={{ backgroundColor: '#F5F3FF', color: '#9B87D4' }}
                    >
                      ← Back
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (quizAnswers[QUIZ_QUESTIONS[quizStep].id] === undefined) return
                      if (quizStep < QUIZ_QUESTIONS.length - 1) {
                        setQuizStep(s => s + 1)
                      } else {
                        setQuizDone(true)
                      }
                    }}
                    disabled={quizAnswers[QUIZ_QUESTIONS[quizStep].id] === undefined}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white transition-opacity"
                    style={{
                      backgroundColor: '#9B87D4',
                      opacity: quizAnswers[QUIZ_QUESTIONS[quizStep].id] === undefined ? 0.4 : 1,
                    }}
                  >
                    {quizStep === QUIZ_QUESTIONS.length - 1 ? 'See Results →' : 'Next →'}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Learn More Articles ── */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-ink">📖 Learn More</h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">
            Deeper dives into posture health — tap to expand
          </p>
        </div>

        <div className="space-y-3">
          {ARTICLES.map((article, i) => {
            const isExpanded = expandedArticles.includes(article.id)
            const isSaved = savedArticles.includes(article.id)

            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-3xl overflow-hidden"
                style={{ backgroundColor: article.color }}
              >
                <button
                  className="w-full text-left p-5"
                  onClick={() => toggleExpandArticle(article.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{article.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-extrabold text-ink leading-tight">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSaved(article.id) }}
                            className="text-base leading-none transition-transform active:scale-90"
                            title={isSaved ? 'Remove bookmark' : 'Save article'}
                          >
                            {isSaved ? '🔖' : '🏷️'}
                          </button>
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="text-[10px]"
                            style={{ color: article.accent }}
                          >
                            ▼
                          </motion.span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-ink-muted leading-snug mb-1.5">
                        {article.summary}
                      </p>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                        style={{ backgroundColor: article.accent + '28', color: article.accent }}
                      >
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-5 pb-5">
                        <div
                          className="h-px mb-4"
                          style={{ backgroundColor: article.accent + '40' }}
                        />
                        <p className="text-sm text-ink-muted font-semibold leading-relaxed">
                          {article.body}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
