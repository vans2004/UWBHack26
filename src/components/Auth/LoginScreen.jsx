import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

export default function LoginScreen() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [shakeKey, setShakeKey] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const err = mode === 'login' ? login(username, password) : signup(username, password)
    if (err) {
      setError(err)
      setShakeKey(k => k + 1)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError(null)
    setUsername('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <motion.div
        key={shakeKey}
        className="w-full max-w-sm"
        animate={shakeKey > 0 ? { x: [-10, 10, -7, 7, -4, 4, 0] } : {}}
        transition={{ duration: 0.42 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/dino.jpg"
            alt="Spine-o-saur"
            className="w-20 h-20 rounded-3xl object-cover shadow-soft mb-4"
          />
          <h1 className="text-3xl font-black text-ink tracking-tight">Spine-o-saur</h1>
          <p className="text-ink-muted font-semibold text-sm mt-1">Posture Management Companion</p>
        </div>

        {/* Card */}
        <div className="card p-7">
          {/* Mode tabs */}
          <div className="flex bg-cream rounded-2xl p-1 mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  mode === m
                    ? 'bg-white text-ink shadow-softer'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1.5 ml-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. dino_fan"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-2xl bg-cream border-2 border-cream-dark focus:border-lavender focus:outline-none text-sm font-semibold text-ink placeholder:text-ink-faint transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1.5 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 rounded-2xl bg-cream border-2 border-cream-dark focus:border-lavender focus:outline-none text-sm font-semibold text-ink placeholder:text-ink-faint transition-colors"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs font-bold text-peach-dark text-center bg-peach-light px-3 py-2 rounded-xl"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-2xl bg-lavender text-white font-extrabold text-sm shadow-soft hover:bg-lavender-dark transition-colors mt-2"
            >
              {mode === 'login' ? '🦕 Log In' : '🦕 Create Account'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-faint font-bold mt-6">
          made with 🦕 at UWBHack '26
        </p>
      </motion.div>
    </div>
  )
}
