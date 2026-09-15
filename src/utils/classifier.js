// Offline product classifier. Replaces the old LLM classification call.
// Pure and synchronous: no fetch, no async, no DOM.

import { CATEGORIES, PG18_CATEGORIES } from '../data/questionBanks.js'
import { CATEGORY_KEYWORDS } from '../data/categoryKeywords.js'
import { getThemeColors } from '../data/themes.js'

const KID_SAFE_ALTERNATIVES = {
  alcohol: 'grape juice in a fancy glass',
  vape: 'bubble blower',
  gambling: 'scratch-and-sniff sticker',
}

const FALLBACK_KID_SAFE = 'bubble blower'

/** Lowercase, strip punctuation, collapse whitespace. */
function normalize(raw) {
  return String(raw ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Naive singularization so "headphones" matches "headphone". */
function singularize(word) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.length > 4 && (word.endsWith('ches') || word.endsWith('shes') || word.endsWith('sses')))
    return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

/** Normalized text plus a singularized variant, so both forms can be matched. */
function buildHaystack(rawInput) {
  const normalized = normalize(rawInput)
  const singular = normalized.split(' ').map(singularize).join(' ')
  return { normalized, singular }
}

function matchesTerm(haystack, term) {
  // Word-boundary match so "pc" does not hit "pcs of fruit" mid-word.
  const pattern = new RegExp(`(?:^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`)
  return pattern.test(haystack.normalized) || pattern.test(haystack.singular)
}

/**
 * Score one category. Longer (multi-word) terms weigh more, so "vape juice"
 * beats an incidental single-word hit.
 */
function scoreCategory(haystack, terms) {
  let score = 0
  let bestTermLength = 0
  for (const term of terms) {
    if (!matchesTerm(haystack, term)) continue
    const words = term.split(' ').length
    score += words * words
    bestTermLength = Math.max(bestTermLength, words)
  }
  return { score, bestTermLength }
}

/**
 * Classify free text into one of CATEGORIES.
 * Returns confidence "high" only when a single category clearly wins.
 */
export function classifyProduct(rawInput) {
  const haystack = buildHaystack(rawInput)
  const trimmed = String(rawInput ?? '').trim()

  const ranked = CATEGORIES.filter((c) => c !== 'other')
    .map((category) => ({ category, ...scoreCategory(haystack, CATEGORY_KEYWORDS[category] ?? []) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.bestTermLength - a.bestTermLength)

  const winner = ranked[0]
  const runnerUp = ranked[1]

  let category = 'other'
  let confidence = 'low'

  if (winner) {
    category = winner.category
    // Clear win = no runner-up, or at least double the runner-up's score.
    const clearWin = !runnerUp || winner.score >= runnerUp.score * 2
    confidence = clearWin ? 'high' : 'low'
  }

  const isPG18 = PG18_CATEGORIES.includes(category)

  return {
    category,
    confidence,
    isPG18,
    kidSafeAlternative: isPG18 ? (KID_SAFE_ALTERNATIVES[category] ?? FALLBACK_KID_SAFE) : null,
    themeColors: getThemeColors(category),
    normalizedProduct: trimmed || 'this purchase',
  }
}

/** Build the same shape once the user has picked a category by hand. */
export function classificationFromCategory(rawInput, category) {
  const safeCategory = CATEGORIES.includes(category) ? category : 'other'
  const isPG18 = PG18_CATEGORIES.includes(safeCategory)
  const trimmed = String(rawInput ?? '').trim()
  return {
    category: safeCategory,
    confidence: 'high',
    isPG18,
    kidSafeAlternative: isPG18
      ? (KID_SAFE_ALTERNATIVES[safeCategory] ?? FALLBACK_KID_SAFE)
      : null,
    themeColors: getThemeColors(safeCategory),
    normalizedProduct: trimmed || 'this purchase',
  }
}
