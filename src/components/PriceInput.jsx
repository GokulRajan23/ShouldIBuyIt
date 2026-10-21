import { useState } from 'react'
import {
  BUDGET_BAND_OPTIONS,
  parsePrice,
  savingsCoverage,
  shouldAskAboutSavings,
} from '../utils/scoring.js'

const CURRENCY = '€'
const DEFAULT_BAND = BUDGET_BAND_OPTIONS[1]

/** Live feedback under the savings field, so the number typed visibly means something. */
function coverageHint(coverage) {
  if (coverage === null) return null
  if (coverage >= 1) return 'That covers the whole price.'
  if (coverage === 0) return 'Nothing saved yet.'
  return `Covers ${Math.max(1, Math.floor(coverage * 100))}% of the price.`
}

export default function PriceInput({ onSubmit, disabled, allowInstalments = true }) {
  const [amount, setAmount] = useState('')
  const [payment, setPayment] = useState('full')
  const [budgetBand, setBudgetBand] = useState(DEFAULT_BAND)
  const [savedAmount, setSavedAmount] = useState('')

  const price = parsePrice(amount)
  // Only worth asking about savings once the amount is substantial.
  const askSavings = shouldAskAboutSavings(price, budgetBand)
  const hint = coverageHint(savingsCoverage(savedAmount, price))

  const handleSubmit = () => {
    if (!amount.trim()) return
    onSubmit({
      amount: amount.trim(),
      currency: CURRENCY,
      // No payment signal when the choice was never offered (everyday essentials).
      payment: allowInstalments ? payment : null,
      budgetBand,
      savedAmount: askSavings && savedAmount.trim() ? savedAmount.trim() : null,
    })
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-purple/80">Amount (EUR)</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-purple">{CURRENCY}</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            disabled={disabled}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="149"
            className="min-h-14 flex-1 rounded-2xl border-3 border-purple bg-white px-4 text-xl font-semibold text-purple outline-none focus:ring-4 focus:ring-coral/40"
            aria-label="Product price in euros"
            autoFocus
          />
        </div>
      </label>

      {allowInstalments && (
        <fieldset className="flex flex-col gap-2" disabled={disabled}>
          <legend className="text-sm font-semibold text-purple/80">Payment</legend>
          <div className="flex gap-3">
            {[
              { id: 'full', label: 'Full payment' },
              { id: 'emi', label: 'Instalments' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPayment(id)}
                className={`min-h-12 flex-1 rounded-2xl border-3 border-purple px-4 py-3 text-base font-bold transition-colors ${
                  payment === id
                    ? 'bg-purple text-beige shadow-[3px_3px_0_#ff6b6b]'
                    : 'bg-white text-purple'
                }`}
                aria-pressed={payment === id}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2" disabled={disabled}>
        <legend className="text-sm font-semibold text-purple/80">
          Spare cash left over each month
        </legend>
        <div className="flex flex-wrap gap-2">
          {BUDGET_BAND_OPTIONS.map((band) => (
            <button
              key={band}
              type="button"
              onClick={() => setBudgetBand(band)}
              className={`min-h-12 flex-1 basis-[calc(50%-0.25rem)] rounded-2xl border-3 border-purple px-3 py-3 text-sm font-bold transition-colors ${
                budgetBand === band
                  ? 'bg-purple text-beige shadow-[3px_3px_0_#ff6b6b]'
                  : 'bg-white text-purple'
              }`}
              aria-pressed={budgetBand === band}
            >
              {band}
            </button>
          ))}
        </div>
      </fieldset>

      {askSavings && (
        <fieldset className="flex flex-col gap-2" disabled={disabled}>
          <legend className="text-sm font-semibold text-purple/80">
            How much have you already saved for it?
          </legend>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple">{CURRENCY}</span>
            <input
              type="text"
              inputMode="decimal"
              value={savedAmount}
              disabled={disabled}
              onChange={(e) => setSavedAmount(e.target.value)}
              placeholder="0"
              className="min-h-14 min-w-0 flex-1 rounded-2xl border-3 border-purple bg-white px-4 text-xl font-semibold text-purple outline-none focus:ring-4 focus:ring-coral/40"
              aria-label="Amount already saved in euros"
              aria-describedby="savings-hint"
            />
          </div>
          <button
            type="button"
            onClick={() => setSavedAmount(amount.trim())}
            className="min-h-12 rounded-2xl border-3 border-purple bg-white px-4 py-3 text-sm font-bold text-purple transition-colors"
          >
            I&apos;ve saved all of it
          </button>
          <p id="savings-hint" aria-live="polite" className="min-h-5 text-sm font-semibold text-purple/70">
            {hint}
          </p>
        </fieldset>
      )}

      <button
        type="button"
        disabled={disabled || !amount.trim()}
        onClick={handleSubmit}
        className="min-h-14 rounded-2xl border-3 border-purple bg-coral px-6 py-4 text-xl font-bold text-white shadow-[4px_4px_0_#4a154b] transition-transform active:scale-95 disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )
}
