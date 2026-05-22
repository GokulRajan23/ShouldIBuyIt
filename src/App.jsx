import { useReducer, useEffect, useCallback, useRef } from 'react'
import { useQuizReducer, PHASE } from './hooks/useQuizReducer.js'
import { classifyProduct, fetchVerdict } from './utils/aiAdvisor.js'
import ProductInput from './components/ProductInput.jsx'
import QuestionCard from './components/QuestionCard.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import VerdictScreen from './components/VerdictScreen.jsx'
import AgeGate from './components/AgeGate.jsx'
import PrankReveal from './components/PrankReveal.jsx'
import Background from './components/Background.jsx'

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
  const verdictRequestRef = useRef(0)
  const classifyRequestRef = useRef(0)

  // Classification call when the user submits a product.
  const runClassify = useCallback(async () => {
    const requestId = ++classifyRequestRef.current
    try {
      const classification = await classifyProduct(state.originalProduct)
      if (requestId !== classifyRequestRef.current) return
      dispatch({ type: 'SET_CLASSIFICATION', classification })
    } catch (err) {
      if (requestId !== classifyRequestRef.current) return
      dispatch({
        type: 'SET_ERROR',
        error: err instanceof Error ? err.message : 'Could not classify product',
      })
    }
  }, [state.originalProduct])

  // Verdict call once the quiz is done.
  const runVerdict = useCallback(async () => {
    const requestId = ++verdictRequestRef.current
    try {
      const result = await fetchVerdict({
        product: state.product,
        category: state.classification?.category ?? 'other',
        questions: state.questions,
        answers: state.answers,
        skipped: state.skipped,
        prankMode: state.prankMode,
      })
      if (requestId !== verdictRequestRef.current) return
      dispatch({ type: 'SET_VERDICT', verdict: result })
    } catch (err) {
      if (requestId !== verdictRequestRef.current) return
      dispatch({
        type: 'SET_ERROR',
        error: err instanceof Error ? err.message : 'Failed to get verdict',
      })
    }
  }, [
    state.product,
    state.classification,
    state.questions,
    state.answers,
    state.skipped,
    state.prankMode,
  ])

  useEffect(() => {
    if (state.phase === PHASE.CLASSIFYING) runClassify()
  }, [state.phase, runClassify])

  useEffect(() => {
    if (state.phase === PHASE.LOADING) runVerdict()
  }, [state.phase, runVerdict])

  const handleStart = (product) => dispatch({ type: 'SET_PRODUCT', product })
  const handleAnswer = ({ value, skipped }) =>
    dispatch({ type: 'ANSWER_QUESTION', value, skipped: !!skipped })
  const handleAge = (isAdult) => dispatch({ type: 'CONFIRM_AGE', isAdult })

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
