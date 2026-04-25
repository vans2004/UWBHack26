import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

// ─── config ────────────────────────────────────────────────────────────────
const MODEL_ID        = '45cpgzIqMjWlhieTOpld'
const MODEL_VERSION   = 1
const INFER_MS        = 1500   // inference every 1.5 s
const SLOUCH_FRAMES   = 3      // consecutive bad frames before warning
const HP_PENALTY      = 2      // HP lost per slouch episode
const SDK_CDN         = 'https://cdn.jsdelivr.net/npm/roboflow@0.2.26/dist/roboflow.js'

// heuristic — covers common class name conventions
function isBadPosture(cls = '') {
  const l = cls.toLowerCase()
  return (
    l.includes('bad') || l.includes('slouch') || l.includes('poor') ||
    l.includes('incorrect') || l.includes('wrong') || l.includes('hunched') ||
    l.includes('forward') || l.includes('round')
  )
}

// ─── canvas helpers ────────────────────────────────────────────────────────
function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function paintBoxes(canvas, video, predictions) {
  if (!canvas || !video) return
  // canvas pixel dims = video natural dims → 1-to-1 coordinate mapping
  const natW = video.videoWidth  || 640
  const natH = video.videoHeight || 480
  canvas.width  = natW
  canvas.height = natH

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, natW, natH)

  predictions.forEach(({ x, y, width, height, class: cls, confidence }) => {
    const bad   = isBadPosture(cls)
    const color = bad ? '#FF8C5A' : '#72B896'
    const left  = x - width  / 2
    const top   = y - height / 2

    // box outline with rounded corners
    ctx.strokeStyle = color
    ctx.lineWidth   = 3
    drawRoundRect(ctx, left, top, width, height, 8)
    ctx.stroke()

    // semi-transparent box fill
    ctx.fillStyle = color + '22'
    drawRoundRect(ctx, left, top, width, height, 8)
    ctx.fill()

    // label pill
    const label   = `${cls}  ${Math.round(confidence * 100)}%`
    ctx.font      = 'bold 15px Nunito, sans-serif'
    const tw      = ctx.measureText(label).width
    const lpad    = 10
    const lh      = 26
    const lx      = left
    const ly      = top - lh - 6

    ctx.fillStyle = color
    drawRoundRect(ctx, lx, ly, tw + lpad * 2, lh, 6)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(label, lx + lpad, ly + lh - 7)
  })
}

// ─── SDK loader (idempotent) ────────────────────────────────────────────────
function loadSDK() {
  if (window.roboflow) return Promise.resolve(window.roboflow)
  return new Promise((resolve, reject) => {
    // avoid double-injecting
    if (document.querySelector(`script[src="${SDK_CDN}"]`)) {
      const poll = setInterval(() => {
        if (window.roboflow) { clearInterval(poll); resolve(window.roboflow) }
      }, 100)
      return
    }
    const s = document.createElement('script')
    s.src = SDK_CDN
    s.crossOrigin = 'anonymous'
    s.onload  = () => resolve(window.roboflow)
    s.onerror = () => reject(new Error('Failed to load Roboflow SDK from CDN.'))
    document.head.appendChild(s)
  })
}

// ─── component ─────────────────────────────────────────────────────────────
export default function PostureGuardian() {
  const { isSlouching, setIsSlouching, setPetHealth } = useApp()

  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const modelRef   = useRef(null)
  const streamRef  = useRef(null)
  const timerRef   = useRef(null)
  const slouchRef  = useRef(0)   // consecutive bad-frame counter
  const penaltyRef = useRef(false) // HP already deducted for this episode

  const [status,  setStatus]  = useState('idle')   // idle|loading|active|error
  const [label,   setLabel]   = useState(null)      // 'good'|'slouching'|null
  const [apiKey,  setApiKey]  = useState(() => localStorage.getItem('bf_rf_key') || '')
  const [errMsg,  setErrMsg]  = useState('')

  // ── stop (safe to call any time) ─────────────────────────────────────────
  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (modelRef.current?.teardown) modelRef.current.teardown()
    modelRef.current  = null
    streamRef.current = null
    slouchRef.current  = 0
    penaltyRef.current = false
    setIsSlouching(false)
    setLabel(null)
    setStatus('idle')
  }, [setIsSlouching])

  useEffect(() => () => stop(), [stop])

  // ── process one inference result ─────────────────────────────────────────
  const processResults = useCallback((predictions) => {
    if (!predictions.length) {
      slouchRef.current  = 0
      penaltyRef.current = false
      setIsSlouching(false)
      setLabel(null)
      return
    }

    // highest-confidence prediction drives the verdict
    const top = [...predictions].sort((a, b) => b.confidence - a.confidence)[0]
    const bad = isBadPosture(top.class)

    if (bad) {
      slouchRef.current++
      setLabel('slouching')
      if (slouchRef.current >= SLOUCH_FRAMES) {
        setIsSlouching(true)
        // deduct HP once per episode; reset when posture corrects
        if (!penaltyRef.current) {
          penaltyRef.current = true
          setPetHealth(h => Math.max(0, h - HP_PENALTY))
        }
      }
    } else {
      slouchRef.current  = 0
      penaltyRef.current = false
      setIsSlouching(false)
      setLabel('good')
    }
  }, [setIsSlouching, setPetHealth])

  // ── run one inference tick ────────────────────────────────────────────────
  const runInference = useCallback(async () => {
    const model = modelRef.current
    const video = videoRef.current
    if (!model || !video || video.readyState < 2) return
    try {
      const predictions = await model.detect(video)
      processResults(predictions)
      paintBoxes(canvasRef.current, video, predictions)
    } catch (e) {
      console.warn('[PostureGuardian] inference error', e)
    }
  }, [processResults])

  // ── start ─────────────────────────────────────────────────────────────────
  async function start() {
    const key = apiKey.trim()
    if (!key) { setErrMsg('Please enter your Roboflow publishable key.'); return }
    localStorage.setItem('bf_rf_key', key)
    setStatus('loading')
    setErrMsg('')

    try {
      // 1. load SDK
      const rf = await loadSDK()

      // 2. load model
      const model = await new Promise((resolve, reject) => {
        rf.auth({ publishable_key: key })
          .load({ model: MODEL_ID, version: MODEL_VERSION })
          .then(resolve)
          .catch(reject)
      })
      modelRef.current = model

      // 3. open webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      })
      streamRef.current = stream
      const video = videoRef.current
      video.srcObject = stream
      await new Promise(res => { video.onloadedmetadata = res })
      await video.play()

      setStatus('active')
      timerRef.current = setInterval(runInference, INFER_MS)
    } catch (e) {
      console.error('[PostureGuardian]', e)
      setErrMsg(e.message?.slice(0, 120) || 'Something went wrong. Check your key and try again.')
      setStatus('error')
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  const isActive = status === 'active'

  return (
    <>
      {/* ── global slouch banner ── */}
      <AnimatePresence>
        {isSlouching && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{    y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3
                       bg-lemon border-b-2 border-lemon-dark px-4 py-3 shadow-soft"
          >
            <span className="text-xl">⚠️</span>
            <span className="font-extrabold text-ink text-sm">
              Slouch detected — sit up tall and relax your shoulders!
            </span>
            <span className="text-xs font-bold text-ink-muted ml-1">−{HP_PENALTY} HP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── main card ── */}
      <div className="card p-6 space-y-4">

        {/* header row */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-ink">🧍 Posture Guardian</h2>
            <p className="text-sm text-ink-muted font-semibold mt-0.5">
              {isActive
                ? `Roboflow AI · inference every ${INFER_MS / 1000}s`
                : 'Real-time AI posture detection'}
            </p>
          </div>
          {isActive && (
            <motion.button
              onClick={stop}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="px-4 py-2 rounded-2xl text-sm font-extrabold bg-peach-light text-peach-dark
                         hover:bg-peach/40 transition-colors"
            >
              Stop
            </motion.button>
          )}
        </div>

        {/* ── IDLE / ERROR: key input + placeholder ── */}
        {(status === 'idle' || status === 'error') && (
          <div className="space-y-3">
            {errMsg && (
              <div className="flex items-start gap-2 bg-peach-light text-peach-dark text-sm
                              font-semibold px-4 py-3 rounded-2xl">
                <span>⚠️</span><span>{errMsg}</span>
              </div>
            )}

            <p className="text-sm text-ink-muted font-medium leading-relaxed">
              Enter your{' '}
              <a
                href="https://app.roboflow.com/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lavender-dark font-bold underline underline-offset-2"
              >
                Roboflow publishable key
              </a>{' '}
              to run model{' '}
              <code className="bg-cream-dark px-1.5 py-0.5 rounded text-xs font-mono text-ink-muted">
                {MODEL_ID}
              </code>
              .
            </p>

            {/* key input row */}
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && start()}
                placeholder="rf_xxxxxxxxxxxxxxxx"
                className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-lavender text-sm
                           font-semibold bg-cream-dark placeholder:text-ink-faint
                           focus:outline-none focus:border-lavender-dark transition-colors"
              />
              <motion.button
                onClick={start}
                whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-2xl bg-sage text-white font-extrabold text-sm
                           hover:bg-sage-dark transition-colors shadow-softer"
              >
                Start
              </motion.button>
            </div>

            {/* camera placeholder */}
            <div className="relative rounded-3xl overflow-hidden bg-cream-dark border-2
                            border-dashed border-lavender/40 flex flex-col items-center
                            justify-center gap-3 py-10">
              <span className="text-5xl">📷</span>
              <span className="text-sm font-bold text-ink-faint">
                Camera feed will appear here
              </span>
            </div>
          </div>
        )}

        {/* ── LOADING overlay ── */}
        {status === 'loading' && (
          <div className="rounded-3xl overflow-hidden bg-ink flex flex-col items-center
                          justify-center gap-4 py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-4 border-lavender/30 border-t-lavender"
            />
            <p className="text-white font-bold text-sm">Loading Roboflow model…</p>
            <p className="text-white/40 text-xs font-semibold">This may take a few seconds</p>
          </div>
        )}

        {/*
          Video element is ALWAYS in the DOM so videoRef stays stable across the
          loading→active transition. The wrapping div shows/hides it via `hidden`.

          Both video and canvas share scaleX(-1) so Roboflow's original-coordinate
          predictions land on top of the matching mirrored video pixels.
        */}
        <div
          className={`relative rounded-3xl overflow-hidden bg-slate-900 ${isActive ? '' : 'hidden'}`}
          style={{ aspectRatio: '4 / 3' }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-fill"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* LIVE badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/30
                          backdrop-blur-sm px-3 py-1.5 rounded-full">
            <motion.span
              className="w-2 h-2 rounded-full bg-red-400 block"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
            <span className="text-white text-xs font-extrabold tracking-wide">LIVE</span>
          </div>

          {/* Roboflow watermark */}
          <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm px-3 py-1
                          rounded-full text-white text-xs font-bold">
            🤖 Roboflow
          </div>

          {/* posture label pill — bottom-center */}
          <AnimatePresence mode="wait">
            {label && (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0,  scale: 1   }}
                exit={{    opacity: 0,         scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5
                            rounded-full text-sm font-extrabold backdrop-blur-md shadow-pop
                            whitespace-nowrap select-none ${
                              label === 'good'
                                ? 'bg-sage/90 text-white'
                                : 'bg-peach-dark/90 text-white'
                            }`}
              >
                {label === 'good' ? '✅ Good posture' : '⚠️ Slouching detected!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
