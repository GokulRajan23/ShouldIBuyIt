import { useState } from 'react'

export default function ProductInput({ onStart }) {
  const [product, setProduct] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = product.trim()
    if (!trimmed) {
      setError('Tell us what you are thinking of buying!')
      return
    }
    setError('')
    onStart(trimmed)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-purple drop-shadow-sm sm:text-6xl md:text-7xl">
          Should I buy it?
        </h1>
        <p className="mt-4 text-lg font-medium text-purple/80 sm:text-xl">
          Tell us what's tempting you. We'll grill you for 7 questions, then give a verdict.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg glass-card p-7 sm:p-9"
      >
        <label htmlFor="product" className="block text-sm font-semibold uppercase tracking-wider text-purple/70">
          What are you thinking of buying?
        </label>
        <input
          id="product"
          type="text"
          value={product}
          onChange={(e) => {
            setProduct(e.target.value)
            if (error) setError('')
          }}
          placeholder="e.g. Sony WH-1000XM5 headphones"
          className="mt-3 min-h-14 w-full rounded-2xl border-3 border-purple bg-white/70 px-4 text-lg font-semibold text-purple outline-none transition focus:bg-white focus:ring-4 focus:ring-coral/40"
          autoFocus
        />
        {error && (
          <p className="mt-2 text-sm font-semibold text-verdict-no" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="mt-6 min-h-14 w-full rounded-2xl border-3 border-purple bg-coral px-6 py-4 text-xl font-bold text-white shadow-[4px_4px_0_#4a154b] transition-transform active:scale-95"
        >
          Start the quiz
        </button>
        <p className="mt-4 text-center text-xs font-medium text-purple/60">
          Prices in € · Defaults to Germany · Works offline
        </p>
      </form>
    </div>
  )
}
