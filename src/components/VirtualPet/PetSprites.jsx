// Smooth SVG blob creature — 200×220 viewBox
// Replaces the original pixel-grid pet

const MOODS = {
  happy:   { body: '#B8E8D0', bodyDark: '#80C8A8', bodyLight: '#D8F4EA', eyelid: null,    pupil: '#3D3250' },
  neutral: { body: '#BDD0F0', bodyDark: '#8AAEE0', bodyLight: '#D8E8FA', eyelid: null,    pupil: '#3D3250' },
  sad:     { body: '#C0C8E8', bodyDark: '#8890CC', bodyLight: '#D8DEF4', eyelid: '#A0A8D8', pupil: '#3D3250' },
  sick:    { body: '#D4E8B0', bodyDark: '#9CC870', bodyLight: '#E8F4D0', eyelid: null,    pupil: '#5A7040' },
}

// --- sub-components ---

function Eyes({ mood, c }) {
  if (mood === 'sick') {
    return (
      <>
        {/* sick: X eyes */}
        {[[68, 88], [132, 88]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={20} fill="white" />
            <line x1={cx-11} y1={cy-11} x2={cx+11} y2={cy+11} stroke={c.bodyDark} strokeWidth={5} strokeLinecap="round"/>
            <line x1={cx+11} y1={cy-11} x2={cx-11} y2={cy+11} stroke={c.bodyDark} strokeWidth={5} strokeLinecap="round"/>
          </g>
        ))}
      </>
    )
  }

  return (
    <>
      {/* left eye */}
      <circle cx={68} cy={88} r={22} fill="white" />
      {/* right eye */}
      <circle cx={132} cy={88} r={22} fill="white" />

      {mood === 'sad' && (
        <>
          {/* droopy eyelids */}
          <clipPath id="cl"><circle cx={68} cy={88} r={22}/></clipPath>
          <clipPath id="cr"><circle cx={132} cy={88} r={22}/></clipPath>
          <rect x={46} y={68} width={44} height={22} fill={c.eyelid} clipPath="url(#cl)" opacity={0.85}/>
          <rect x={110} y={68} width={44} height={22} fill={c.eyelid} clipPath="url(#cr)" opacity={0.85}/>
        </>
      )}

      {/* pupils */}
      <circle cx={mood === 'sad' ? 68 : 71} cy={mood === 'sad' ? 93 : 91} r={13} fill={c.pupil} />
      <circle cx={mood === 'sad' ? 132 : 135} cy={mood === 'sad' ? 93 : 91} r={13} fill={c.pupil} />

      {/* shine — only for happy/neutral */}
      {mood !== 'sad' && (
        <>
          <circle cx={77} cy={84} r={5} fill="white" />
          <circle cx={141} cy={84} r={5} fill="white" />
          <circle cx={74} cy={96} r={2.5} fill="white" />
          <circle cx={138} cy={96} r={2.5} fill="white" />
        </>
      )}

      {/* sad tear */}
      {mood === 'sad' && (
        <ellipse cx={58} cy={115} rx={5} ry={8} fill="#93C5FD" opacity={0.8}/>
      )}
    </>
  )
}

function Mouth({ mood, c }) {
  if (mood === 'happy')   return <path d="M 72 128 Q 100 154 128 128" stroke={c.pupil} strokeWidth={5} fill="none" strokeLinecap="round"/>
  if (mood === 'neutral') return <path d="M 76 132 L 124 132" stroke={c.pupil} strokeWidth={4.5} fill="none" strokeLinecap="round"/>
  if (mood === 'sad')     return <path d="M 72 142 Q 100 126 128 142" stroke={c.pupil} strokeWidth={5} fill="none" strokeLinecap="round"/>
  // sick — wavy
  return <path d="M 68 136 Q 80 128 92 136 Q 104 144 116 136 Q 128 128 140 136" stroke={c.bodyDark} strokeWidth={4} fill="none" strokeLinecap="round"/>
}

export function PetSprite({ mood = 'happy', size = 220 }) {
  const c = MOODS[mood]
  const id = `grad-${mood}`

  return (
    <svg
      width={size}
      height={size * (220 / 200)}
      viewBox="0 0 200 220"
      fill="none"
      aria-label={`Pet — ${mood}`}
      overflow="visible"
    >
      <defs>
        <radialGradient id={id} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={c.bodyLight} />
          <stop offset="100%" stopColor={c.body} />
        </radialGradient>
      </defs>

      {/* ear bumps — behind the body */}
      <ellipse cx={52}  cy={44} rx={24} ry={30} fill={c.bodyDark} />
      <ellipse cx={148} cy={44} rx={24} ry={30} fill={c.bodyDark} />
      <ellipse cx={52}  cy={46} rx={15} ry={22} fill={c.body} />
      <ellipse cx={148} cy={46} rx={15} ry={22} fill={c.body} />

      {/* main blob body */}
      <path
        d="M 100 10 C 148 8 192 46 192 100 C 192 154 152 202 100 204 C 48 206 8 158 8 100 C 8 42 52 12 100 10 Z"
        fill={`url(#${id})`}
      />

      {/* sick forehead sweat */}
      {mood === 'sick' && (
        <ellipse cx={140} cy={52} rx={6} ry={9} fill="#93C5FD" opacity={0.75} />
      )}

      {/* happy blush */}
      {mood === 'happy' && (
        <>
          <ellipse cx={50}  cy={118} rx={18} ry={11} fill="#FFB3C6" opacity={0.45}/>
          <ellipse cx={150} cy={118} rx={18} ry={11} fill="#FFB3C6" opacity={0.45}/>
        </>
      )}

      <Eyes mood={mood} c={c} />
      <Mouth mood={mood} c={c} />

      {/* stub feet */}
      <ellipse cx={74}  cy={198} rx={22} ry={14} fill={c.bodyDark} />
      <ellipse cx={126} cy={198} rx={22} ry={14} fill={c.bodyDark} />
      <ellipse cx={74}  cy={198} rx={16} ry={10} fill={c.body} />
      <ellipse cx={126} cy={198} rx={16} ry={10} fill={c.body} />
    </svg>
  )
}
