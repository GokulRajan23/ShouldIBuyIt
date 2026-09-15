import { useReducer, useEffect, useRef } from 'react'
import { useQuizReducer, PHASE } from './hooks/useQuizReducer.js'
import { classifyProduct, classificationFromCategory } from './utils/classifier.js'
import { scoreQuiz } from './utils/scoring.js'
import ProductInput from './components/ProductInput.jsx'
import QuestionCard from './components/QuestionCard.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import VerdictScreen from './components/VerdictScreen.jsx'
import AgeGate from './components/AgeGate.jsx'
import PrankReveal from './components/PrankReveal.jsx'
import CategoryPicker from './components/CategoryPicker.jsx'
import Background from './components/Background.jsx'

// Scoring is instant, but the suspense is the product — hold the loading screen.
const CLASSIFY_DELAY_MS = 900
const VERDICT_DELAY_MS = 1200

function ErrorScreen({ message, onRetry, onReset }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 text-center">
      <div className="w-full max-w-md glass-card p-8">
        <h2 className="text-2xl font-bold text-verdict-no">Something went wrong</h2>
        <p className="mt-4 font-medium text-purple/80">{message}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="min-h-12 rounded-2xl border-3 border-purple bg-coral px-6 py-3 font-bold text-white shadow-[3px_3px_0_#4a154b]"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={onReset}
            className="min-h-12 rounded-2xl border-3 border-purple bg-white px-6 py-3 font-bold text-purple"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { initialState, quizReducer, PHASE: Phases } = useQuizReducer()
  const [state, dispatch] = useReducer(quizReducer, initialState)
  const timerRef = useRef(null)

  // Both "calls" are local and synchronous; the timeout only paces the reveal.
  useEffect(() => {
    if (state.phase !== PHASE.CLASSIFYING) return
    const classification = classifyProduct(state.originalProduct)
    timerRef.current = setTimeout(
      () => dispatch({ type: 'SET_CLASSIFICATION', classification }),
      CLASSIFY_DELAY_MS,
    )
    return () => clearTimeout(timerRef.current)
  }, [state.phase, state.originalProduct])

  useEffect(() => {
    if (state.phase !== PHASE.LOADING) return
    const result = scoreQuiz({
      product: state.product,
      category: state.classification?.category ?? 'other',
      questions: state.questions,
      answers: state.answers,
      skipped: state.skipped,
      prankMode: state.prankMode,
    })
    timerRef.current = setTimeout(
      () => dispatch({ type: 'SET_VERDICT', verdict: result }),
      VERDICT_DELAY_MS,
    )
    return () => clearTimeout(timerRef.current)
  }, [
    state.phase,
    state.product,
    state.classification,
    state.questions,
    state.answers,
    state.skipped,
    state.prankMode,
  ])

  const handleStart = (product) => dispatch({ type: 'SET_PRODUCT', product })
  const handleAnswer = ({ value, skipped }) =>
    dispatch({ type: 'ANSWER_QUESTION', value, skipped: !!skipped })
  const handleAge = (isAdult) => dispatch({ type: 'CONFIRM_AGE', isAdult })
  const handlePickCategory = (category) =>
    dispatch({
      type: 'PICK_CATEGORY',
      classification: classificationFromCategory(state.originalProduct, category),
    })

  const themeColors = state.classification?.themeColors

  const renderPhase = () => {
    const currentQuestion = state.questions[state.questionIndex]

    switch (state.phase) {
      case Phases.PRODUCT:
        return <ProductInput onStart={handleStart} />

      case Phases.CLASSIFYING:
        return (
          <LoadingScreen
            product={state.originalProduct}
            message="Figuring out what kind of buy this is…"
          />
        )

      case Phases.CATEGORY_PICK:
        return (
          <CategoryPicker
            product={state.classification?.normalizedProduct ?? state.originalProduct}
            onPick={handlePickCategory}
          />
        )

      case Phases.AGE_GATE:
        return (
          <AgeGate
            product={state.classification?.normalizedProduct ?? state.originalProduct}
            kidSafeAlternative={state.classification?.kidSafeAlternative}
            onConfirm={handleAge}
          />
        )

      case Phases.PRANK_REVEAL:
        return (
          <PrankReveal
            originalProduct={state.classification?.normalizedProduct ?? state.originalProduct}
            newProduct={state.product}
            onDone={() => dispatch({ type: 'PRANK_REVEAL_DONE' })}
          />
        )

      case Phases.QUIZ:
        if (!currentQuestion) return null
        return (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            index={state.questionIndex}
            total={state.questions.length}
            product={state.product}
            prankMode={state.prankMode}
            onAnswer={handleAnswer}
          />
        )

      case Phases.LOADING:
        return <LoadingScreen product={state.product} />

      case Phases.VERDICT:
        return (
          <VerdictScreen
            verdict={state.verdict.verdict}
            reason={state.verdict.reason}
            score={state.verdict.score}
            breakdown={state.verdict.breakdown}
            product={state.product}
            originalProduct={state.originalProduct}
            prankMode={state.prankMode}
            onReset={() => dispatch({ type: 'RESET' })}
          />
        )

      case Phases.ERROR:
        return (
          <ErrorScreen
            message={state.error}
            onRetry={() =>
              dispatch({
                type: state.classification ? 'RETRY_VERDICT' : 'RETRY_CLASSIFY',
              })
            }
            onReset={() => dispatch({ type: 'RESET' })}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      <Background colors={themeColors} />
      {renderPhase()}
    </>
  )
}
