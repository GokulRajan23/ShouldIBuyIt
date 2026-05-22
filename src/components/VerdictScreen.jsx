import { useEffect } from 'react'

export default function VerdictScreen({
  verdict,
  reason,
  product,
  originalProduct,
  prankMode,
  onReset,
}) {
  const isYes = verdict === 'YES'

  useEffect(() => {
    const src = isYes ? '/sounds/yes-buzzer.wav' : '/sounds/no-buzzer.wav'
    const audio = new Audio(src)
    audio.volume = 0.6
    audio.play().catch(() => {})
  }, [isYes])

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10 pb-[max(2rem,env(safe-area-inset-bottom))]">
      {prankMode && (
        <div className="prank-stamp pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2 sm:top-10">
          <span className="block -rotate-6 rounded-2xl border-4 border-purple bg-coral px-6 py-2 text-2xl font-black uppercase tracking-widest text-white shadow-[5px_5px_0_#4a154b] sm:text-3xl">
            🤡 Pranked!
          </span>
        </div>
      )}
      <div
        className={`w-full max-w-xl rounded-3xl border-4 p-8 text-center sm:p-10 ${
          isYes
            ? 'border-verdict-yes bg-verdict-yes shadow-[8px_8px_0_rgba(22,163,74,0.4)]'
            : 'border-verdict-no bg-verdict-no shadow-[8px_8px_0_rgba(220,38,38,0.4)]'
        }`}
      >
        {prankMode && (
          <div className="mb-5 rounded-2xl border-4 border-white bg-linear-to-r from-verdict-yes via-purple to-coral px-4 py-3 text-center shadow-[4px_4px_0_rgba(255,255,255,0.3)]">
            <p className="text-sm font-black uppercase tracking-widest text-white drop-shadow-md">
              🔄 Uno Reverse Activated!
            </p>
            <p className="mt-1 text-xs font-bold text-white/95">
              You really asked about{' '}
              <span className="font-black italic line-through decoration-2">
                {originalProduct}
              </span>
              {' '}— we trolled you with{' '}
              <span className="font-black underline">{product}</span>
            </p>
          </div>
        )}
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">{product}</p>
        <p
          className="mt-3 text-6xl font-bold text-white drop-shadow-md sm:text-8xl"
          aria-live="polite"
        >
          {isYes ? 'YES ✅' : 'NO ❌'}
        </p>
        <p className="mt-6 text-xl font-semibold leading-relaxed text-white sm:text-2xl">
          {reason}
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-10 min-h-14 rounded-2xl border-3 border-purple bg-white px-8 py-4 text-lg font-bold text-purple shadow-[4px_4px_0_#4a154b] transition-transform active:scale-95"
      >
        Try another product
      </button>
    </div>
  )
}
