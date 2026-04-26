import { motion } from 'framer-motion'

const TIPS = [
  { emoji: '👁️', tip: 'Keep your screen at eye level — the top of your monitor should sit at or just below eye height.' },
  { emoji: '📐', tip: '90-90-90 rule: hips, knees, and ankles should all be at 90° when seated.' },
  { emoji: '🦶', tip: 'Keep both feet flat on the floor. Use a footrest if your feet don\'t reach comfortably.' },
  { emoji: '⌨️', tip: 'Place your keyboard and mouse at elbow height so your forearms can rest naturally.' },
  { emoji: '🔆', tip: 'Position your monitor 20–30 inches (arm\'s length) from your eyes to reduce eye strain.' },
  { emoji: '🧱', tip: 'Support your lower back — use a lumbar cushion or adjust your chair\'s lumbar support.' },
  { emoji: '💪', tip: 'Relax your shoulders down and back. Avoid raising them toward your ears.' },
  { emoji: '⏰', tip: 'Every 20–30 minutes, look away from your screen and stand up — even just for 30 seconds.' },
]

const ARTICLES = [
  {
    emoji: '🦴',
    title: 'How to Fix Forward Head Posture',
    readTime: '3 min read',
    color: '#EDE8FB',
    accent: '#9B87D4',
    body: 'Forward head posture occurs when your head sits in front of your shoulders rather than directly above them. For every inch your head moves forward, it effectively adds ~10 lbs of extra load on your cervical spine. The fix involves strengthening the deep neck flexors, stretching the suboccipital muscles, and building awareness of "text neck." Start by gently tucking your chin in and imagining a string pulling the crown of your head toward the ceiling.',
  },
  {
    emoji: '🧘',
    title: 'Best Stretches for Desk Workers',
    readTime: '4 min read',
    color: '#D4F0E0',
    accent: '#72B896',
    body: 'Sitting for long hours tightens your hip flexors, chest, and neck — the three biggest trouble areas for desk workers. The most effective counterbalance stretches are the hip flexor lunge, the doorframe chest opener, and chin tucks. Aim to do these three stretches once in the morning and once after work. Even 5 minutes daily beats a 30-minute session done sporadically.',
  },
  {
    emoji: '📐',
    title: 'The 90-90-90 Sitting Rule Explained',
    readTime: '2 min read',
    color: '#FFF8D6',
    accent: '#F4C256',
    body: 'The 90-90-90 rule states that when sitting, your hips, knees, and ankles should each form a 90-degree angle. Your thighs should be parallel to the floor, your feet flat, and your lower back supported. This position distributes body weight evenly, reduces spinal compression, and keeps your musculoskeletal system in a neutral, low-tension state. Adjust your chair height and desk height to achieve all three angles.',
  },
  {
    emoji: '⚡',
    title: 'Why Posture Affects Your Energy Levels',
    readTime: '3 min read',
    color: '#FFEEE6',
    accent: '#FF8C5A',
    body: 'Research shows that slouching restricts lung capacity by up to 30%, reducing oxygen delivered to the brain and contributing to afternoon fatigue. Good posture also influences your nervous system — upright posture is associated with higher testosterone, lower cortisol, and a more confident mental state. Simply sitting or standing straighter for a few minutes can measurably shift your mood and energy throughout the day.',
  },
]

export default function PostureTips() {
  return (
    <div className="space-y-5">
      {/* Quick Tips */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-ink">💡 Quick Posture Tips</h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">
            Small adjustments, big impact
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TIPS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-lavender-light rounded-3xl p-4 flex gap-3 items-start"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
              <p className="text-sm font-semibold text-ink leading-snug">{item.tip}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-ink">📖 Learn More</h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">
            Deeper dives into posture health
          </p>
        </div>

        <div className="space-y-4">
          {ARTICLES.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-3xl p-5 border-2"
              style={{ backgroundColor: article.color, borderColor: article.color }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{article.emoji}</span>
                <div className="flex-1 flex items-start justify-between gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-ink leading-tight">
                    {article.title}
                  </h3>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: article.accent + '28', color: article.accent }}
                  >
                    {article.readTime}
                  </span>
                </div>
              </div>
              <p className="text-sm text-ink-muted font-semibold leading-relaxed">
                {article.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
