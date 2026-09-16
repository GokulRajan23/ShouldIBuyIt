import { useState } from 'react'
import {
  BUDGET_BAND_OPTIONS,
  SAVINGS_OPTIONS,
  parsePrice,
  shouldAskAboutSavings,
} from '../utils/scoring.js'

const CURRENCY = '€'
const DEFAULT_BAND = BUDGET_BAND_OPTIONS[1]

export default function PriceInput({ onSubmit, disabled }) {
  const [amount, setAmount] = useState('')
  const [payment, setPayment] = useState('full')
  const [budgetBand, setBudgetBand] = useState(DEFAULT_BAND)
  const [savedUp, setSavedUp] = useState(null)

  // Only worth asking about savings once the amount is substantial.
  const askSavings = shouldAskAboutSavings(parsePrice(amount), budgetBand)

  const handleSubmit = () => {
    if (!amount.trim()) return
    onSubmit({
      amount: amount.trim(),
      currency: CURRENCY,
      payment,
      budgetBand,
      savedUp: askSavings ? savedUp : null,
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
            How much of this have you already saved?
          </legend>
          <div className="flex flex-wrap gap-2">
            {SAVINGS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSavedUp(option)}
                className={`min-h-12 flex-1 basis-[calc(50%-0.25rem)] rounded-2xl border-3 border-purple px-3 py-3 text-sm font-bold transition-colors ${
                  savedUp === option
                    ? 'bg-purple text-beige shadow-[3px_3px_0_#ff6b6b]'
                    : 'bg-white text-purple'
                }`}
                aria-pressed={savedUp === option}
              >
                {option}
              </button>
            ))}
          </div>
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
