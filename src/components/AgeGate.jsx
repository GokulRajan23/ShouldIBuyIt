export default function AgeGate({ product, kidSafeAlternative, onConfirm }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md glass-card p-8">
        <p className="text-sm font-bold uppercase tracking-wider text-coral">Quick check</p>
        <h2 className="mt-2 text-3xl font-bold text-purple sm:text-4xl">Are you 18 or older?</h2>
        <p className="mt-3 text-base font-medium text-purple/70">
          You asked about <span className="font-bold text-purple">{product}</span> — that's an
          18+ product. If you're under 18, we'll switch to{' '}
          <span className="font-bold text-purple">{kidSafeAlternative}</span> instead.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onConfirm(true)}
            className="min-h-14 flex-1 rounded-2xl border-3 border-purple bg-verdict-yes px-6 py-4 text-lg font-bold text-white shadow-[4px_4px_0_#4a154b] transition-transform active:scale-95"
          >
            Yes, I'm 18+
          </button>
          <button
            type="button"
            onClick={() => onConfirm(false)}
            className="min-h-14 flex-1 rounded-2xl border-3 border-purple bg-white px-6 py-4 text-lg font-bold text-purple shadow-[4px_4px_0_#4a154b] transition-transform active:scale-95"
          >
            No, I'm under 18
          </button>
        </div>
      </div>
    </div>
  )
}
