import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

// ─── config ────────────────────────────────────────────────────────────────
const API_KEY      = 'ehRIPfDmfJeKN2n3Y3i2'
const API_URL      = `http://localhost:9001/posture_correction_v4-2aqwr/1?api_key=${API_KEY}`
const CAPTURE_SECS = 5
const WAIT_SECS    = 10
const HP_GOOD      = 5
const HP_BAD       = 3
const MAX_HISTORY  = 3

function isBadPosture(cls = '') {
  return cls.toLowerCase() !== 'looks good'
}

async function captureAndInfer(video) {
  const cvs = document.createElement('canvas')
  cvs.width  = video.videoWidth  || 640
  cvs.height = video.videoHeight || 480
  cvs.getContext('2d').drawImage(video, 0, 0)
  const base64 = cvs.toDataURL('image/jpeg', 0.85).split(',')[1]
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: base64,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let detail = ''
    try { detail = ': ' + JSON.parse(body).message } catch { detail = body ? ': ' + body.slice(0, 100) : '' }
    throw new Error(`API error ${res.status}${detail}`)
  }
  const data = await res.json()
  console.log('[PostureGuardian] raw output:', JSON.stringify(data))
  const topClass = data.predicted_class ?? data.top ?? data.class ?? ''
  return { isGood: !isBadPosture(topClass) }
}

// ─── component ─────────────────────────────────────────────────────────────
export default function PostureGuardian() {
  const { isSlouching, setIsSlouching, setPetHealth, recordPostureScan, resetPostureScans } = useApp()

  const videoRef   = useRef(null)
  const streamRef  = useRef(null)
  const historyRef = useRef([])   // source-of-truth for comparison logic

  // phase: idle | starting | countdown | capturing | result | waiting
  const [phase,    setPhase]    = useState('idle')
  const [cdSecs,   setCdSecs]   = useState(CAPTURE_SECS)
  const [waitSecs, setWaitSecs] = useState(WAIT_SECS)
  const [result,   setResult]   = useState(null)
  const [history,  setHistory]  = useState([])   // for rendering dots
  const [errMsg,   setErrMsg]   = useState('')

  // ── stop / cleanup ────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsSlouching(false)
    resetPostureScans()
    historyRef.current = []
    setHistory([])
    setResult(null)
    setErrMsg('')
    setCdSecs(CAPTURE_SECS)
    setWaitSecs(WAIT_SECS)
    setPhase('idle')
  }, [setIsSlouching])

  useEffect(() => () => stopCamera(), [stopCamera])

  // ── scan ──────────────────────────────────────────────────────────────────
  const runScan = useCallback(async () => {
    setPhase('capturing')
    try {
      const { isGood } = await captureAndInfer(videoRef.current)

      if (isGood) {
        setPetHealth(h => Math.min(100, h + HP_GOOD))
        setIsSlouching(false)
      } else {
        setPetHealth(h => Math.max(0, h - HP_BAD))
        setIsSlouching(true)
      }

      const prevLen = historyRef.current.length
      let comparison = null
      if (prevLen > 0) {
        const prev = historyRef.current[prevLen - 1]
        if (!prev && isGood)  comparison = 'Better than last time! 🌟'
        if (!prev && !isGood) comparison = 'Still slouching — try adjusting your chair height.'
        if (prev  && isGood)  comparison = 'Keep it up! 💪'
        if (prev  && !isGood) comparison = 'Posture slipped — take a moment to reset.'
      }

      historyRef.current = [...historyRef.current, isGood].slice(-MAX_HISTORY)
      setHistory([...historyRef.current])
      setResult({ isGood, comparison })
      recordPostureScan(isGood)
      setPhase('result')
    } catch (e) {
      // stop camera and surface error
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
      setIsSlouching(false)
      historyRef.current = []
      setHistory([])
      setResult(null)
      setCdSecs(CAPTURE_SECS)
      setWaitSecs(WAIT_SECS)
      setErrMsg(e.message?.slice(0, 120) || 'Scan failed. Check your connection.')
      setPhase('idle')
    }
  }, [setPetHealth, setIsSlouching])

  // ── phase ticks ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'countdown') return
    if (cdSecs <= 0) { runScan(); return }
    const t = setTimeout(() => setCdSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, cdSecs, runScan])

  useEffect(() => {
    if (phase !== 'result') return
    const t = setTimeout(() => { setPhase('waiting'); setWaitSecs(WAIT_SECS) }, 3500)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'waiting') return
    if (waitSecs <= 0) { setCdSecs(CAPTURE_SECS); setPhase('countdown'); return }
    const t = setTimeout(() => setWaitSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, waitSecs])

  // ── start camera ──────────────────────────────────────────────────────────
  async function startScan() {
    setErrMsg('')
    setPhase('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      })
      streamRef.current = stream
      const video = videoRef.current
      video.srcObject = stream
      await new Promise(res => { video.onloadedmetadata = res })
      await video.play()
      setCdSecs(CAPTURE_SECS)
      setPhase('countdown')
    } catch (e) {
      setErrMsg(e.message?.slice(0, 120) || 'Could not access camera.')
      setPhase('idle')
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  const isLive = phase !== 'idle' && phase !== 'starting'

  return (
    <>
      {/* global slouch banner */}
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
            <span className="text-xs font-bold text-ink-muted ml-1">−{HP_BAD} HP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card p-6 space-y-4">

        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-ink">🧍 Posture Guardian</h2>
            <p className="text-sm text-ink-muted font-semibold mt-0.5">
              {isLive ? 'Roboflow AI · scan-based detection' : 'AI-powered posture scan'}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1 flex-shrink-0">
            {/* scan history dots */}
            {history.length > 0 && (
              <div className="flex items-center gap-1.5">
                {history.map((good, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-3 h-3 rounded-full border-2 ${
                      good ? 'bg-sage border-sage-dark' : 'bg-peach border-peach-dark'
                    }`}
                  />
                ))}
              </div>
            )}
            {isLive && (
              <motion.button
                onClick={stopCamera}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-2xl text-sm font-extrabold bg-peach-light text-peach-dark
                           hover:bg-peach/40 transition-colors"
              >
                Stop
              </motion.button>
            )}
          </div>
        </div>

        {/* ── idle ── */}
        {phase === 'idle' && (
          <div className="space-y-3">
            {errMsg && (
              <div className="flex items-start gap-2 bg-peach-light text-peach-dark text-sm
                              font-semibold px-4 py-3 rounded-2xl">
                <span>⚠️</span><span>{errMsg}</span>
              </div>
            )}
            <div className="relative rounded-3xl overflow-hidden bg-cream-dark border-2
                            border-dashed border-lavender/40 flex flex-col items-center
                            justify-center gap-4 py-10">
              <span className="text-5xl">📷</span>
              <span className="text-sm font-bold text-ink-faint">
                Camera feed will appear here
              </span>
              <motion.button
                onClick={startScan}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                className="px-8 py-3 rounded-2xl bg-sage text-white font-extrabold text-sm
                           hover:bg-sage-dark transition-colors shadow-soft"
              >
                Start Scan
              </motion.button>
            </div>
          </div>
        )}

        {/* ── starting ── */}
        {phase === 'starting' && (
          <div className="rounded-3xl bg-ink flex flex-col items-center justify-center gap-4 py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-4 border-lavender/30 border-t-lavender"
            />
            <p className="text-white font-bold text-sm">Starting camera…</p>
          </div>
        )}

        {/*
          Video wrapper is always in the DOM so videoRef stays stable across
          starting → countdown. The div is hidden until camera is live.
        */}
        <div
          className={`relative rounded-3xl overflow-hidden bg-slate-900 ${isLive ? '' : 'hidden'}`}
          style={{ aspectRatio: '4 / 3' }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-fill"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
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

          {/* Roboflow badge */}
          <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm px-3 py-1
                          rounded-full text-white text-xs font-bold">
            🤖 Roboflow
          </div>

          {/* 5-second countdown overlay */}
          <AnimatePresence>
            {phase === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center
                           bg-black/45 backdrop-blur-[2px] gap-2"
              >
                <motion.span
                  key={cdSecs}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="text-8xl font-black text-white tabular-nums leading-none"
                >
                  {cdSecs}
                </motion.span>
                <p className="text-white/80 font-bold text-sm mt-2">
                  Hold still — scanning soon
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysing overlay */}
          <AnimatePresence>
            {phase === 'capturing' && (
              <motion.div
                key="capturing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center
                           bg-black/55 backdrop-blur-sm gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white"
                />
                <p className="text-white font-bold text-sm">Analysing posture…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result overlay (auto-advances after 3.5 s) */}
          <AnimatePresence>
            {phase === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-4 right-4 space-y-2"
              >
                <div className={`px-5 py-3.5 rounded-2xl backdrop-blur-md font-extrabold text-sm
                                 text-center text-white shadow-pop ${
                                   result.isGood ? 'bg-sage/90' : 'bg-peach-dark/90'
                                 }`}>
                  {result.isGood
                    ? `✅ Great posture! 🎉  +${HP_GOOD} HP`
                    : `⚠️  You're slouching! Sit up straighter.  −${HP_BAD} HP`}
                </div>
                {result.comparison && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl
                               text-white text-xs font-semibold text-center"
                  >
                    {result.comparison}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next-scan countdown pill */}
          <AnimatePresence>
            {phase === 'waiting' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2
                           bg-black/40 backdrop-blur-sm px-5 py-2 rounded-full whitespace-nowrap"
              >
                <span className="text-white/70 text-xs font-semibold">Next scan in</span>
                <span className="text-white text-xs font-black tabular-nums">{waitSecs}s</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* last-result summary card (visible while waiting) */}
        <AnimatePresence>
          {phase === 'waiting' && result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm ${
                result.isGood
                  ? 'bg-sage/10 border border-sage/30 text-sage-dark'
                  : 'bg-peach-light border border-peach text-peach-dark'
              }`}
            >
              <span className="text-lg flex-shrink-0">{result.isGood ? '✅' : '⚠️'}</span>
              <span className="font-extrabold flex-1">
                {result.isGood ? 'Good posture last scan' : 'Slouching detected last scan'}
              </span>
              {result.comparison && (
                <span className="text-xs opacity-60 text-right leading-snug max-w-[130px]">
                  {result.comparison}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}
