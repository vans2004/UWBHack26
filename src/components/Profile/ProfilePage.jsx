import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const AVATAR_STYLES = [
  { id: 'green',  label: 'Sage',     color: '#72B896', bg: '#D4F0E0' },
  { id: 'purple', label: 'Lavender', color: '#9B87D4', bg: '#EDE8FB' },
  { id: 'peach',  label: 'Peach',    color: '#FF8C5A', bg: '#FFEEE6' },
  { id: 'blue',   label: 'Ocean',    color: '#8AAEE0', bg: '#E8F4FB' },
]

const NUDGE_TYPES = [
  { emoji: '💧', message: 'Drink some water!' },
  { emoji: '🧘', message: 'Fix your posture!' },
  { emoji: '🦕', message: 'Your dino needs you!' },
  { emoji: '🏃', message: 'Time to stretch!' },
]

const DEMO_FRIENDS = [
  { name: 'Alex', hp: 92, habits: 7 },
  { name: 'Maya', hp: 78, habits: 5 },
  { name: 'Jordan', hp: 61, habits: 4 },
  { name: 'Sam', hp: 45, habits: 2 },
]

const DEMO_NUDGES = [
  { from: 'Alex', emoji: '🧘', message: 'Fix your posture! 🧘', minsAgo: 2 },
  { from: 'Maya', emoji: '💧', message: 'Drink some water! 💧', minsAgo: 14 },
  { from: 'Jordan', emoji: '🦕', message: 'Your dino needs you! 🦕', minsAgo: 60 },
  { from: 'Alex', emoji: '🏃', message: 'Time to stretch! 🏃', minsAgo: 180 },
]

function ls(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}
function sv(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

function fmtSecs(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${String(sec).padStart(2, '0')}s`
}

function habitsScore(checkpoints) {
  const all = Object.values(checkpoints).flatMap(cps => Object.values(cps))
  return all.length ? Math.round((all.filter(Boolean).length / all.length) * 100) : 0
}

function hpColor(hp) {
  return hp >= 75 ? '#72B896' : hp >= 50 ? '#8AAEE0' : hp >= 25 ? '#9B87D4' : '#FF8C5A'
}

function medal(i) {
  return ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`
}

export default function ProfilePage() {
  const { petHealth, checkpoints, breakTimer } = useApp()
  const { currentUser } = useAuth()

  const profileKey = `spos_profile_${currentUser}`
  const friendsKey = `spos_friends_${currentUser}`
  const publicKey  = `spos_public_${currentUser}`
  const nudgesKey  = `spos_nudges_${currentUser}`

  const [profile, setProfile] = useState(() =>
    ls(profileKey, { memberSince: new Date().toISOString().split('T')[0], avatarStyle: 'green' })
  )
  const [friends,       setFriends]       = useState(() => {
    const existing = ls(friendsKey, [])
    // Seed demo friends if list is empty
    if (existing.length === 0) {
      const demoFriendNames = DEMO_FRIENDS.map(f => f.name)
      // Add demo friends to localStorage
      sv(friendsKey, demoFriendNames)
      // Seed their public data
      DEMO_FRIENDS.forEach(friend => {
        sv(`spos_public_${friend.name}`, {
          username: friend.name,
          hp: friend.hp,
          habitsScore: friend.habits * 12.5, // Normalized to percentage
        })
      })
      return demoFriendNames
    }
    return existing
  })
  const [addInput,      setAddInput]      = useState('')
  const [addError,      setAddError]      = useState('')
  const [nudgeSelects,  setNudgeSelects]  = useState({})
  const [sentMap,       setSentMap]       = useState({})
  const [incomingNudges, setIncoming]     = useState(() => {
    const existing = ls(nudgesKey, [])
    // Seed demo nudges if list is empty
    if (existing.length === 0) {
      const demoNudges = DEMO_NUDGES.map(nudge => ({
        id: `demo_${Math.random().toString(36).slice(2)}`,
        from: nudge.from,
        emoji: nudge.emoji,
        message: nudge.message,
        timestamp: Date.now() - (nudge.minsAgo * 60 * 1000),
        shown: false,
      }))
      sv(nudgesKey, demoNudges)
      return demoNudges
    }
    return existing
  })

  const score = habitsScore(checkpoints)
  const hp    = Math.round(petHealth)

  // Keep public data fresh
  useEffect(() => {
    sv(publicKey, { username: currentUser, hp, habitsScore: score })
  }, [hp, score, currentUser, publicKey])

  // Poll incoming nudges
  useEffect(() => {
    const id = setInterval(() => setIncoming(ls(nudgesKey, [])), 30000)
    return () => clearInterval(id)
  }, [nudgesKey])

  const avatar = AVATAR_STYLES.find(a => a.id === profile.avatarStyle) ?? AVATAR_STYLES[0]

  const setAvatar = (id) => {
    const p = { ...profile, avatarStyle: id }
    setProfile(p)
    sv(profileKey, p)
  }

  const knownUsers = () => {
    try { return JSON.parse(localStorage.getItem('spos_users') || '[]').map(u => u.username) }
    catch { return [] }
  }

  const addFriend = () => {
    const name = addInput.trim()
    if (!name) return
    if (name === currentUser) { setAddError("That's you!"); return }
    if (!knownUsers().includes(name)) { setAddError('User not found'); return }
    if (friends.includes(name)) { setAddError('Already friends'); return }
    const next = [...friends, name]
    setFriends(next); sv(friendsKey, next)
    setAddInput(''); setAddError('')
  }

  const removeFriend = (u) => {
    const next = friends.filter(f => f !== u)
    setFriends(next); sv(friendsKey, next)
  }

  const sendNudge = (target) => {
    const idx = nudgeSelects[target] ?? 0
    const type = NUDGE_TYPES[idx]
    const nudge = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      from: currentUser,
      emoji: type.emoji,
      message: type.message,
      timestamp: Date.now(),
      shown: false,
    }
    const key = `spos_nudges_${target}`
    sv(key, [...ls(key, []), nudge])
    setSentMap(prev => ({ ...prev, [target]: true }))
    setTimeout(() => setSentMap(prev => { const n = { ...prev }; delete n[target]; return n }), 2500)
  }

  const getFriendData = (u) =>
    ls(`spos_public_${u}`, { username: u, hp: 0, habitsScore: 0 })

  const leaderboard = [{ username: currentUser, hp, habitsScore: score }, ...friends.map(getFriendData)]
    .sort((a, b) => b.hp - a.hp)

  return (
    <div className="space-y-5">

      {/* ── Profile Card ── */}
      <div className="card p-6">
        <h2 className="text-lg font-black text-ink mb-5">👤 My Profile</h2>
        <div className="flex items-start gap-5">
          <div
            className="w-20 h-20 rounded-4xl flex items-center justify-center text-4xl shadow-soft flex-shrink-0 border-4"
            style={{ backgroundColor: avatar.bg, borderColor: avatar.color }}
          >🦕</div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-black text-ink leading-tight">{currentUser}</p>
            <p className="text-xs text-ink-muted font-bold mb-2">Member since {profile.memberSince}</p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-black rounded-full px-3 py-1" style={{ backgroundColor: avatar.bg, color: avatar.color }}>
                {hp} HP
              </span>
              <span className="text-xs font-black rounded-full px-3 py-1 bg-sage-light text-sage-dark">
                {score}% habits
              </span>
              <span className="text-xs font-black rounded-full px-3 py-1 bg-lemon-light text-lemon-dark">
                ⏱ {fmtSecs(breakTimer)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold text-ink-muted mb-2">Dino colour</p>
          <div className="flex gap-2">
            {AVATAR_STYLES.map(a => (
              <button
                key={a.id}
                title={a.label}
                onClick={() => setAvatar(a.id)}
                className="w-9 h-9 rounded-full transition-all hover:scale-110"
                style={{
                  backgroundColor: a.color,
                  outline: profile.avatarStyle === a.id ? `3px solid ${a.color}` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Leaderboard ── */}
      <div className="card p-6">
        <h2 className="text-lg font-black text-ink mb-4">🏆 Leaderboard</h2>
        {leaderboard.length <= 1 && friends.length === 0 ? (
          <p className="text-sm text-ink-muted font-bold text-center py-3">Add friends to start competing!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((e, i) => (
              <div
                key={e.username}
                className={`flex items-center gap-3 p-3 rounded-2xl ${e.username === currentUser ? 'bg-lavender-light' : 'bg-cream'}`}
              >
                <span className="text-xl w-8 text-center flex-shrink-0">{medal(i)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-ink text-sm truncate">
                    {e.username}{e.username === currentUser ? ' (you)' : ''}
                  </p>
                  <p className="text-xs text-ink-muted font-bold">{e.habitsScore}% habits</p>
                </div>
                <span className="font-black text-sm flex-shrink-0" style={{ color: hpColor(e.hp) }}>
                  {e.hp} HP
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Friends ── */}
      <div className="card p-6">
        <h2 className="text-lg font-black text-ink mb-4">👥 Friends</h2>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add friend by username…"
            value={addInput}
            onChange={e => { setAddInput(e.target.value); setAddError('') }}
            onKeyDown={e => e.key === 'Enter' && addFriend()}
            className="flex-1 rounded-2xl border border-lavender-light px-4 py-2 text-sm font-bold text-ink bg-cream focus:outline-none focus:border-lavender focus:ring-2 focus:ring-lavender-light"
          />
          <button
            onClick={addFriend}
            className="px-4 py-2 rounded-2xl bg-lavender-light text-lavender-dark font-black text-sm hover:bg-lavender hover:text-white transition-all"
          >
            Add
          </button>
        </div>
        {addError && <p className="text-xs text-peach-dark font-bold mb-3">⚠ {addError}</p>}

        {friends.length === 0 ? (
          <p className="text-sm text-ink-muted font-bold text-center py-4">
            No friends yet — add someone by username!
          </p>
        ) : (
          <div className="space-y-3">
            {friends.map(u => {
              const d   = getFriendData(u)
              const idx = nudgeSelects[u] ?? 0
              return (
                <div key={u} className="flex items-center gap-3 p-3 bg-cream rounded-2xl">
                  <div className="w-10 h-10 rounded-2xl bg-lavender-light flex items-center justify-center text-xl flex-shrink-0">🦕</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-ink text-sm truncate">{u}</p>
                    <p className="text-xs text-ink-muted font-bold">
                      {d.habitsScore}% habits ·{' '}
                      <span style={{ color: hpColor(d.hp) }}>{d.hp} HP</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <select
                      value={idx}
                      onChange={e => setNudgeSelects(prev => ({ ...prev, [u]: Number(e.target.value) }))}
                      className="text-xs rounded-xl border border-lavender-light px-2 py-1.5 bg-white font-bold text-ink-muted max-w-[140px]"
                    >
                      {NUDGE_TYPES.map((n, i) => (
                        <option key={i} value={i}>{n.emoji} {n.message}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => sendNudge(u)}
                      disabled={sentMap[u]}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        sentMap[u]
                          ? 'bg-sage-light text-sage-dark cursor-default'
                          : 'bg-lavender-light text-lavender-dark hover:bg-lavender hover:text-white'
                      }`}
                    >
                      {sentMap[u] ? 'Sent ✓' : 'Nudge 👋'}
                    </button>
                    <button
                      onClick={() => removeFriend(u)}
                      className="px-2 py-1.5 rounded-xl text-xs font-bold text-ink-faint hover:text-peach-dark hover:bg-peach-light transition-all"
                    >✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Incoming Nudges ── */}
      <div className="card p-6">
        <h2 className="text-lg font-black text-ink mb-4">📬 Incoming Nudges</h2>
        {incomingNudges.length === 0 ? (
          <p className="text-sm text-ink-muted font-bold text-center py-4">No nudges yet!</p>
        ) : (
          <div className="space-y-2">
            {[...incomingNudges].reverse().map((n, i) => (
              <div key={n.id ?? i} className="flex items-center gap-3 p-3 bg-lavender-light rounded-2xl">
                <span className="text-2xl flex-shrink-0">{n.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-ink text-sm">
                    <span className="text-lavender-dark">{n.from}</span> says: {n.message}
                  </p>
                  <p className="text-xs text-ink-muted font-bold">
                    {new Date(n.timestamp).toLocaleString([], {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
