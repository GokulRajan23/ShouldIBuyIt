import { getQuestionsForCategory } from '../data/questionBanks.js'

export const PHASE = {
  PRODUCT: 'product',
  CLASSIFYING: 'classifying',
  AGE_GATE: 'age_gate',
  PRANK_REVEAL: 'prank_reveal',
  QUIZ: 'quiz',
  LOADING: 'loading',
  VERDICT: 'verdict',
  ERROR: 'error',
}

const initialState = {
  phase: PHASE.PRODUCT,
  originalProduct: '', // what the user typed
  product: '', // what we're actually judging (may differ if prankMode)
  classification: null, // { category, isPG18, kidSafeAlternative, themeColors, normalizedProduct }
  prankMode: false,
  questions: [], // resolved question list for the chosen category
  questionIndex: 0,
  answers: {}, // { [questionId]: value }
  skipped: [], // questionIds that timed out
  verdict: null,
  error: null,
}

function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCT':
      return {
        ...state,
        originalProduct: action.product,
        product: action.product,
        phase: PHASE.CLASSIFYING,
        error: null,
      }

    case 'SET_CLASSIFICATION': {
      const { classification } = action
      // PG18+ → ask age first. Otherwise go straight into the quiz.
      if (classification.isPG18) {
        return {
          ...state,
          classification,
          phase: PHASE.AGE_GATE,
        }
      }
      return {
        ...state,
        classification,
        product: classification.normalizedProduct || state.originalProduct,
        questions: getQuestionsForCategory(classification.category),
        questionIndex: 0,
        answers: {},
        skipped: [],
        phase: PHASE.QUIZ,
      }
    }

    case 'CONFIRM_AGE': {
      const isAdult = action.isAdult
      const cls = state.classification
      if (!cls) return state
      if (isAdult) {
        return {
          ...state,
          prankMode: false,
          product: cls.normalizedProduct || state.originalProduct,
          questions: getQuestionsForCategory(cls.category),
          questionIndex: 0,
          answers: {},
          skipped: [],
          phase: PHASE.QUIZ,
        }
      }
      // Under 18 → prank mode: pivot to kid-safe alternative, treat as 'other'.
      // Stage the new product + questions now, but route through the reveal
      // screen so the pivot lands with theatrics before the quiz starts.
      const newProduct = cls.kidSafeAlternative || 'bubble blower'
      return {
        ...state,
        prankMode: true,
        product: newProduct,
        questions: getQuestionsForCategory('other'),
        questionIndex: 0,
        answers: {},
        skipped: [],
        phase: PHASE.PRANK_REVEAL,
      }
    }

    case 'PRANK_REVEAL_DONE':
      return { ...state, phase: PHASE.QUIZ }

    case 'ANSWER_QUESTION': {
      const question = state.questions[state.questionIndex]
      if (!question) return state
      const { value, skipped } = action
      const nextAnswers = { ...state.answers }
      const nextSkipped = [...state.skipped]

      if (skipped) {
        nextSkipped.push(question.id)
      } else {
        nextAnswers[question.id] = value
      }

      const nextIndex = state.questionIndex + 1
      if (nextIndex >= state.questions.length) {
        return {
          ...state,
          answers: nextAnswers,
          skipped: nextSkipped,
          phase: PHASE.LOADING,
        }
      }
      return {
        ...state,
        answers: nextAnswers,
        skipped: nextSkipped,
        questionIndex: nextIndex,
      }
    }

    case 'SET_VERDICT':
      return { ...state, phase: PHASE.VERDICT, verdict: action.verdict, error: null }

    case 'SET_ERROR':
      return { ...state, phase: PHASE.ERROR, error: action.error }

    case 'RETRY_VERDICT':
      return { ...state, phase: PHASE.LOADING, error: null }

    case 'RETRY_CLASSIFY':
      return { ...state, phase: PHASE.CLASSIFYING, error: null }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

export function useQuizReducer() {
  return { initialState, quizReducer, PHASE }
}
