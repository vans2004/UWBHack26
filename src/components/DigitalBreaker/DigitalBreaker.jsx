import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function DigitalBreaker() {
  const { breakTimer, BREAK_TRIGGER_SECONDS } = useApp()
  const pct = Math.min(1, breakTimer / BREAK_TRIGGER_SECONDS)
  const remaining = Math.max(0, BREAK_TRIGGER_SECONDS - breakTimer)
  const isWarning = pct > 0.7
  const isDanger  = pct >= 1

  const accent  = isDanger ? '#FF8C5A' : isWarning ? '#F4C256' : '#72B896'
  const bgPill  = isDanger ? 'bg-peach-light text-peach-dark' : isWarning ? 'bg-lemon-light text-lemon-dark' : 'bg-sage-light text-sage-dark'

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-ink">⏱️ Screen Timer</h2>
          <p className="text-sm text-ink-muted font-semibold mt-0.5">Take a break every 30 minutes</p>
        </div>
        <motion.span
          className={`px-3 py-1.5 rounded-full text-xs font-bold ${bgPill}`}
          animate={isDanger ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.9 }}
        >
          {isDanger ? '🚨 Break now!' : isWarning ? '⚡ Almost time' : '🟢 Active'}
        </motion.span>
      </div>

      {/* big time display */}
      <div className="flex items-end gap-3 mb-5">
        <span
          className="text-6xl font-black tabular-nums tracking-tight leading-none"
          style={{ color: isDanger ? accent : '#3D3250' }}
        >
          {fmt(breakTimer)}
        </span>
        <span className="text-sm text-ink-faint font-bold mb-1">elapsed</span>
      </div>

      {/* progress track */}
      <div className="space-y-2">
        <div className="h-3 bg-cream-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: accent }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between text-xs font-bold text-ink-faint">
          <span>0:00</span>
          <span style={{ color: accent }}>
            {isDanger ? '😅 Seriously, stretch!' : `${fmt(remaining)} to break`}
          </span>
          <span>30:00</span>
        </div>
      </div>
    </div>
  )
}
