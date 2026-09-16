import { useCallback, useEffect, useRef, useState } from 'react'
import TimerBar from './TimerBar.jsx'
import SliderInput from './SliderInput.jsx'
import YesNoButtons from './YesNoButtons.jsx'
import PriceInput from './PriceInput.jsx'
import MultipleChoice from './MultipleChoice.jsx'

// Time per question scales with how much there is to do. The price question
// collects three fields (amount, payment method, budget band), so a flat
// timer left no chance of finishing it.
const TIMER_SECONDS_BY_TYPE = {
  price: 45,
  slider: 20,
  choice: 18,
  yesno: 14,
}
const DEFAULT_TIMER_SECONDS = 18

function timerSecondsFor(question) {
  return question.timerSeconds ?? TIMER_SECONDS_BY_TYPE[question.type] ?? DEFAULT_TIMER_SECONDS
}

export default function QuestionCard({ question, index, total, product, prankMode, onAnswer }) {
  const answeredRef = useRef(false)
  const [disabled, setDisabled] = useState(false)
  const [sliderValue, setSliderValue] = useState(question.min ?? 3)

  const handleExpire = useCallback(() => {
    if (answeredRef.current) return
    answeredRef.current = true
    setDisabled(true)
    onAnswer({ skipped: true })
  }, [onAnswer])

  // Reset interaction state when the question changes. The TimerBar
  // remounts on its own via `key={question.id}` below.
  useEffect(() => {
    answeredRef.current = false
    setDisabled(false)
    setSliderValue(question.min ?? 3)
  }, [question.id, question.min])

  const submitAnswer = (value) => {
    if (answeredRef.current) return
    answeredRef.current = true
    setDisabled(true)
    onAnswer({ value })
  }

  const renderInput = () => {
    switch (question.type) {
      case 'slider':
        return (
          <div className="flex flex-col items-center gap-6">
            <SliderInput
              min={question.min}
              max={question.max}
              value={sliderValue}
              disabled={disabled}
              onChange={setSliderValue}
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => submitAnswer(sliderValue)}
              className="min-h-14 w-full max-w-sm rounded-2xl border-3 border-purple bg-coral px-6 py-4 text-xl font-bold text-white shadow-[4px_4px_0_#4a154b] transition-transform active:scale-95 disabled:opacity-50"
            >
              Lock in answer
            </button>
          </div>
        )
      case 'yesno':
        return <YesNoButtons disabled={disabled} onSelect={(v) => submitAnswer(v)} />
      case 'choice':
        return (
          <MultipleChoice
            options={question.options}
            disabled={disabled}
            onSelect={(v) => submitAnswer(v)}
          />
        )
      case 'price':
        return <PriceInput disabled={disabled} onSubmit={(v) => submitAnswer(v)} />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-purple/70">
        <span>
          Q{index + 1} / {total}
        </span>
        <span className="truncate pl-4 text-right" title={product}>
          {prankMode ? `🤡 ${product}` : product}
        </span>
      </div>

      {prankMode && (
        <div className="prank-wobble mb-4 rounded-2xl border-4 border-coral bg-linear-to-r from-coral via-purple to-verdict-yes px-4 py-3 text-center shadow-[4px_4px_0_#4a154b]">
          <p className="text-sm font-black uppercase tracking-widest text-white drop-shadow-md">
            🔄 Prank mode · Uno reverse 🤡
          </p>
          <p className="mt-1 text-xs font-bold text-white/95">
            Judging <span className="font-black underline">{product}</span> instead
          </p>
        </div>
      )}

      <TimerBar
        key={question.id}
        durationSeconds={timerSecondsFor(question)}
        onExpire={handleExpire}
      />

      <div className="mt-8 flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-2xl glass-card p-6 sm:p-10">
          <h2 className="mb-8 text-center text-2xl font-bold leading-snug text-purple sm:text-3xl">
            {question.label}
          </h2>
          <div className="flex flex-col items-center">{renderInput()}</div>
        </div>
      </div>
    </div>
  )
}
