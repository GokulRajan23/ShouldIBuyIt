import { useEffect, useMemo } from 'react'

const REVEAL_MS = 3200
const CONFETTI = ['🎉', '🤡', '🎈', '✨', '🎊', '🪅', '🎁', '🌟', '💥', '🤣']

function Confetti() {
  // 28 emojis sprinkled across the viewport with randomised drift/delay so it
  // looks chaotic without needing a particle library.
  const pieces = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const left = Math.random() * 100
      const delay = Math.random() * 0.8
      const duration = 2.4 + Math.random() * 1.6
      const size = 1.6 + Math.random() * 1.4 // rem
      const drift = (Math.random() - 0.5) * 30 // vw of horizontal drift
      const emoji = CONFETTI[i % CONFETTI.length]
      return { left, delay, duration, size, drift, emoji, id: i }
    })
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute -top-12 confetti-fall"
          style={{
            left: `${p.left}vw`,
            fontSize: `${p.size}rem`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}vw`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}

export default function PrankReveal({ originalProduct, newProduct, onDone }) {
  useEffect(() => {
    const audio = new Audio('/sounds/prank-reveal.wav')
    audio.volume = 0.7
    audio.play().catch(() => {})
    const t = setTimeout(() => onDone(), REVEAL_MS)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10">
      <Confetti />

      {/* Spinning Uno Reverse card */}
      <div className="prank-card-wrap relative mb-8">
        <div className="prank-card flex h-48 w-32 items-center justify-center rounded-2xl border-4 border-white bg-linear-to-br from-coral via-purple to-verdict-yes shadow-[8px_8px_0_rgba(74,21,75,0.5)] sm:h-56 sm:w-40">
          <div className="flex flex-col items-center justify-center text-white drop-shadow-lg">
            <span className="text-4xl sm:text-5xl">🔄</span>
            <span className="mt-2 text-center text-xs font-black uppercase leading-tight tracking-wider sm:text-sm">
              Uno
              <br />
              Reverse
            </span>
          </div>
        </div>
      </div>

      {/* GOTCHA banner */}
      <div className="prank-stamp relative z-10 mb-6">
        <h1 className="-rotate-4 rounded-2xl border-4 border-purple bg-coral px-8 py-3 text-4xl font-black uppercase tracking-widest text-white shadow-[6px_6px_0_#4a154b] sm:text-6xl">
          Gotcha!
        </h1>
      </div>

      {/* Pivot reveal: original product → kid-safe alternative */}
      <div className="prank-pivot z-10 w-full max-w-md rounded-3xl border-3 border-purple bg-white/95 p-6 text-center shadow-[6px_6px_0_#4a154b]">
        <p className="text-xs font-bold uppercase tracking-widest text-purple/70">
          You asked about
        </p>
        <p className="mt-1 text-lg font-bold text-purple line-through decoration-coral decoration-4">
          {originalProduct}
        </p>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-coral">
          Now grilling you on
        </p>
        <p className="mt-1 text-2xl font-black text-purple sm:text-3xl">{newProduct}</p>
        <p className="mt-4 text-sm font-medium text-purple/70">Buckle up, kiddo 🤡</p>
      </div>
    </div>
  )
}
