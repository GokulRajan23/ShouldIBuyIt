import { isApiKeyConfigured, API_KEY_SETUP_MESSAGE } from './env.js'
import { CATEGORIES, PG18_CATEGORIES } from '../data/questionBanks.js'

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openai/gpt-oss-120b:free'
const GEO_DEFAULT = 'Germany'
const CURRENCY_DEFAULT = '€'

const DEFAULT_THEME = {
  colors: ['#FFD9C2', '#D9C9FF', '#C2F0E8'],
  name: 'neutral',
}

const CATEGORY_THEMES = {
  tech: { colors: ['#BCD9FF', '#D0C7FF', '#9FE8F5'], name: 'electric' },
  fashion: { colors: ['#FFC2DD', '#FFE0A8', '#E1BEFF'], name: 'runway' },
  home: { colors: ['#F2E1C2', '#D4E5B9', '#F1C5B2'], name: 'cozy' },
  food: { colors: ['#FFD08A', '#FFB082', '#FFE49E'], name: 'warm' },
  fitness: { colors: ['#A8F0C2', '#B4E5FF', '#FFD27A'], name: 'energy' },
  beauty: { colors: ['#FFC9D6', '#F0D9FF', '#FFE8C9'], name: 'glow' },
  auto: { colors: ['#9FB7CC', '#C9CFD9', '#7FA3C2'], name: 'asphalt' },
  hobby: { colors: ['#D9C2FF', '#FFD9A8', '#A8E5FF'], name: 'playful' },
  alcohol: { colors: ['#8B2E3B', '#D4A857', '#3D1F2E'], name: 'cellar' },
  gambling: { colors: ['#1F4D2E', '#D4A857', '#0F2A18'], name: 'felt' },
  vape: { colors: ['#5A6B7A', '#B4C4D1', '#3D4A57'], name: 'smoke' },
  other: DEFAULT_THEME,
}

function extractJson(text) {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fenceMatch) return JSON.parse(fenceMatch[1].trim())
    const objectMatch = trimmed.match(/\{[\s\S]*\}/)
    if (objectMatch) return JSON.parse(objectMatch[0])
    throw new Error('Could not parse AI response')
  }
}

async function callOpenRouter(prompt, { strictJson = false } = {}) {
  if (!isApiKeyConfigured()) throw new Error(API_KEY_SETUP_MESSAGE)
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY.trim()

  const userContent = strictJson
    ? `${prompt}\n\nRespond ONLY with valid JSON, no markdown, no commentary.`
    : prompt

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'ShouldIBuyIt',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: userContent }],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`OpenRouter error (${response.status}): ${errBody || response.statusText}`)
  }
  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from AI')
  return content
}

async function callJson(prompt) {
  try {
    return extractJson(await callOpenRouter(prompt))
  } catch {
    return extractJson(await callOpenRouter(prompt, { strictJson: true }))
  }
}

function sanitizeCategory(raw) {
  if (typeof raw !== 'string') return 'other'
  const lower = raw.toLowerCase().trim()
  return CATEGORIES.includes(lower) ? lower : 'other'
}

function sanitizeHexList(raw) {
  if (!Array.isArray(raw)) return null
  const cleaned = raw
    .filter((c) => typeof c === 'string')
    .map((c) => c.trim())
    .filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c))
  return cleaned.length >= 3 ? cleaned.slice(0, 3) : null
}

export async function classifyProduct(product) {
  const prompt = `You are classifying a consumer purchase to drive a "should I buy it?" quiz.

Product the user wants to buy: "${product}"
The user is in: ${GEO_DEFAULT}. Treat all prices as € EUR.

Decide:
1. category — exactly one of: ${CATEGORIES.join(', ')}.
2. isPG18 — true ONLY if the product legally requires the buyer to be 18+ (alcohol, tobacco/vape, gambling, adult content, firearms). Otherwise false.
3. kidSafeAlternative — if isPG18 is true, give a fun kid-safe substitute product (e.g. wine → "grape juice in a fancy glass", vape → "bubble blower", lottery ticket → "scratch-and-sniff sticker"). Otherwise null.
4. themeColors — three hex colors (e.g. "#A1B2C3") that evoke the product visually, for an Apple-style gradient mesh background. Pastels for everyday items, deeper tones for adult/auto items.
5. normalizedProduct — a short canonical name of the product.

Respond with JSON only, exactly this shape:
{"category": "<one of the categories>", "isPG18": <bool>, "kidSafeAlternative": <string|null>, "themeColors": ["#xxxxxx","#xxxxxx","#xxxxxx"], "normalizedProduct": "<string>"}`

  let raw
  try {
    raw = await callJson(prompt)
  } catch {
    return {
      category: 'other',
      isPG18: false,
      kidSafeAlternative: null,
      themeColors: DEFAULT_THEME.colors,
      normalizedProduct: product,
    }
  }

  const category = sanitizeCategory(raw?.category)
  const fallbackPG18 = PG18_CATEGORIES.includes(category)
  const isPG18 = typeof raw?.isPG18 === 'boolean' ? raw.isPG18 : fallbackPG18

  const themeColors =
    sanitizeHexList(raw?.themeColors) ?? (CATEGORY_THEMES[category] ?? DEFAULT_THEME).colors

  return {
    category,
    isPG18,
    kidSafeAlternative:
      isPG18 && typeof raw?.kidSafeAlternative === 'string' && raw.kidSafeAlternative.trim()
        ? raw.kidSafeAlternative.trim()
        : isPG18
          ? 'bubble blower'
          : null,
    themeColors,
    normalizedProduct:
      typeof raw?.normalizedProduct === 'string' && raw.normalizedProduct.trim()
        ? raw.normalizedProduct.trim()
        : product,
  }
}

const ANSWER_LABELS = {
  price: 'Price',
  canWait: 'Could wait to buy',
  fomo: 'Buying due to sale/FOMO',
  duplicate: 'Owns something similar',
  necessity: 'Necessity (1-5)',
  productivity: 'Productivity boost (1-5)',
  usage: 'Usage frequency',
  currentAge: 'Current device age',
  occasions: 'Wear frequency',
  wardrobeGap: 'Fills wardrobe gap',
  matchOutfits: 'Matches existing outfits',
  season: 'Right for the season',
  spaceFit: 'Has space for it',
  usageFrequency: 'Usage frequency',
  lifestyle: 'Lifestyle fit (1-5)',
  quality: 'Quality tier',
  budget: 'Fits food budget',
  healthy: 'Healthy (1-5)',
  alternatives: 'Cheaper alternatives exist',
  cravingDuration: 'How long wanted',
  consistency: 'Used last fitness purchase consistently',
  routine: 'Has routine that uses it',
  spaceForIt: 'Space at home/nearby',
  tested: 'Tested before',
  dupeAvailable: 'Cheaper dupe exists',
  finishExisting: 'Finished current similar product',
  financing: 'Payment method',
  longTermCost: 'Long-term cost impact',
  timeForIt: 'Hours per week available',
  existingCollection: 'Existing similar items',
  learningCurve: 'Will push through learning curve',
  resaleValue: 'Has resale value',
  occasion: 'Occasion',
  frequency: 'Usage frequency',
  impulse: 'Impulse purchase',
  budgetSet: 'Has strict budget',
  lastResult: 'Last attempt outcome',
  mood: 'Reason for doing it now',
  canAffordLoss: 'Can afford full loss (1-5)',
  quitting: 'Quitting cigarettes',
  monthlyCost: 'Knows monthly cost',
  healthAware: 'Aware of health risks',
  lifestyleFit: 'Fits life (1-5)',
}

function formatAnswerLine(question, answers, skipped) {
  const label = ANSWER_LABELS[question.id] ?? question.id
  if (skipped.includes(question.id)) return `${label}: (skipped — timed out)`
  const value = answers[question.id]
  if (value === undefined) return `${label}: (no answer)`
  if (question.type === 'price') {
    const payment = value.payment === 'emi' ? 'Instalments' : 'Full payment'
    return `${label}: ${value.currency}${value.amount} (${payment})`
  }
  if (question.type === 'yesno') return `${label}: ${value ? 'Yes' : 'No'}`
  if (question.type === 'choice') return `${label}: ${value}`
  return `${label}: ${value}`
}

function buildKnowledgeSummary(product, category, questions, answers, skipped) {
  const lines = questions.map((q) => formatAnswerLine(q, answers, skipped)).join('\n')
  return `Product: "${product}"
Category: ${category}
Geography: ${GEO_DEFAULT} (prices in ${CURRENCY_DEFAULT})

Knowledge graph (user's answers):
${lines}`
}

export async function fetchVerdict({ product, category, questions, answers, skipped, prankMode }) {
  const summary = buildKnowledgeSummary(product, category, questions, answers, skipped)
  const prankNote = prankMode
    ? '\nNOTE: The user is under 18 and originally asked about a PG18+ product. We pivoted to this kid-safe substitute. Keep the verdict playful but still useful for the substitute item.'
    : ''

  const prompt = `You are a sharp, no-nonsense financial advisor. Decide strictly YES (buy it) or NO (don't buy it) — no middle ground.${prankNote}

${summary}

Respond in this JSON format only:
{"verdict": "YES" | "NO", "reason": "<one sentence, max 22 words, specific to their answers>"}`

  const raw = await callJson(prompt)
  const verdict = raw?.verdict?.toUpperCase()
  const reason = raw?.reason?.trim()
  if ((verdict !== 'YES' && verdict !== 'NO') || !reason) {
    throw new Error('Invalid verdict format from AI')
  }
  return { verdict, reason }
}

export { DEFAULT_THEME, CATEGORY_THEMES, CURRENCY_DEFAULT, GEO_DEFAULT }
