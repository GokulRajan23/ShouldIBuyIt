// Category-specific question banks. Each category contributes 4 specific
// questions; we always append 3 universal ones (price, canWait, fomo)
// → 7 questions total per quiz, or 3 for everyday essentials (see below).
//
// Labels use {item} for the thing being judged. A detected product type
// (productTypes.js) supplies it — "this phone", "this bottle of wine" — and may
// reword individual questions; otherwise {item} reads as "it".

import { PRODUCT_TYPES } from './productTypes.js'

export const CATEGORIES = [
  'tech',
  'fashion',
  'home',
  'food',
  'fitness',
  'beauty',
  'auto',
  'hobby',
  'alcohol',
  'gambling',
  'vape',
  'other',
]

export const PG18_CATEGORIES = ['alcohol', 'gambling', 'vape']

const UNIVERSAL_QUESTIONS = [
  {
    id: 'price',
    type: 'price',
    label: 'What does {item} cost? Paying in full or in instalments?',
  },
  {
    id: 'canWait',
    type: 'yesno',
    label: 'Could you wait a month to buy {item} without it affecting your life?',
  },
  {
    id: 'fomo',
    type: 'yesno',
    label: 'Are you buying {item} because of a sale, hype, or FOMO?',
  },
]

const CATEGORY_QUESTIONS = {
  tech: [
    {
      id: 'usage',
      type: 'choice',
      label: 'How often will you actually use {item}?',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    },
    {
      id: 'currentAge',
      type: 'choice',
      label: 'Your current equivalent device is…',
      options: ['New', '1–2 years old', '3+ years old', "Don't own one"],
    },
    {
      id: 'productivity',
      type: 'slider',
      label: 'How much will {item} boost your productivity?',
      min: 1,
      max: 5,
    },
    // NB: a "do you already own one?" question would be fully determined by
    // currentAge above (owning any equivalent device implies yes), so it can
    // carry no information. This asks something independent instead.
    {
      id: 'researched',
      type: 'choice',
      label: 'How much have you compared {item} against cheaper options?',
      options: ['Thoroughly', 'A bit', 'Barely', 'Not at all'],
    },
  ],
  fashion: [
    {
      id: 'occasions',
      type: 'choice',
      label: 'How often will you wear {item} per month?',
      options: ['1–2 times', '3–5 times', '6+ times', 'One-time only'],
    },
    {
      id: 'wardrobeGap',
      type: 'yesno',
      label: 'Does {item} fill a real gap in your wardrobe?',
    },
    {
      id: 'matchOutfits',
      type: 'choice',
      label: 'How many of your existing outfits does {item} match?',
      options: ['Many', 'A few', 'Just one', 'None yet'],
    },
    {
      id: 'season',
      type: 'choice',
      label: 'Is {item} right for the upcoming season?',
      options: ['In season now', 'Next season', 'Year-round', 'Off-season'],
    },
  ],
  home: [
    {
      id: 'spaceFit',
      type: 'yesno',
      label: 'Do you actually have space for {item}?',
    },
    {
      id: 'usageFrequency',
      type: 'choice',
      label: 'How often will {item} get used?',
      options: ['Daily', 'Weekly', 'Monthly', 'Special occasions'],
    },
    {
      id: 'lifestyle',
      type: 'slider',
      label: 'How well does {item} fit your day-to-day lifestyle?',
      min: 1,
      max: 5,
    },
    {
      id: 'quality',
      type: 'choice',
      label: 'What quality tier is {item}?',
      options: ['Premium', 'Mid-range', 'Budget', 'Cheapest possible'],
    },
  ],
  food: [
    {
      id: 'budget',
      type: 'choice',
      label: 'How does {item} fit your food budget?',
      options: ['Easily', 'A bit tight', 'A stretch', 'A splurge'],
    },
    {
      id: 'healthy',
      type: 'slider',
      label: 'How healthy is {item} on a 1–5 scale?',
      min: 1,
      max: 5,
    },
    {
      id: 'alternatives',
      type: 'yesno',
      label: 'Are there cheaper alternatives to {item} nearby?',
    },
    {
      id: 'cravingDuration',
      type: 'choice',
      label: 'How long have you wanted {item}?',
      options: ['Just today', 'This week', 'This month', 'Ages'],
    },
  ],
  fitness: [
    {
      id: 'consistency',
      type: 'choice',
      label: 'Did you use your last fitness purchase consistently?',
      options: ['Yes', 'Mostly', 'Sometimes', 'No'],
    },
    {
      id: 'routine',
      type: 'yesno',
      label: 'Do you have a routine that {item} fits into?',
    },
    {
      id: 'spaceForIt',
      type: 'yesno',
      label: 'Do you have space at home or a nearby place to use {item}?',
    },
    {
      id: 'alternatives',
      type: 'choice',
      label: 'How many cheaper alternatives to {item} exist?',
      options: ['None', 'A few', 'Many', 'Free options'],
    },
  ],
  beauty: [
    {
      id: 'tested',
      type: 'yesno',
      label: 'Have you tested or sampled {item} before?',
    },
    {
      id: 'dupeAvailable',
      type: 'yesno',
      label: 'Is there a known cheaper dupe for {item}?',
    },
    {
      id: 'usageFrequency',
      type: 'choice',
      label: 'How often will you use {item}?',
      options: ['Daily', 'Weekly', 'Occasionally', 'Just once'],
    },
    {
      id: 'finishExisting',
      type: 'yesno',
      label: 'Have you finished your current similar product?',
    },
  ],
  auto: [
    {
      id: 'necessity',
      type: 'slider',
      label: 'How necessary is {item} on a 1–5 scale?',
      min: 1,
      max: 5,
    },
    {
      id: 'financing',
      type: 'choice',
      label: 'How are you paying for {item}?',
      options: ['Cash', 'Short loan', 'Long loan', 'Lease'],
    },
    {
      id: 'longTermCost',
      type: 'choice',
      label: 'Will {item} lower your long-term costs?',
      options: ['Yes', 'Maybe', 'About the same', 'Higher'],
    },
    {
      id: 'duplicate',
      type: 'yesno',
      label: 'Do you already own a vehicle that does this job?',
    },
  ],
  hobby: [
    {
      id: 'timeForIt',
      type: 'choice',
      label: 'Realistic hours per week you’ll spend on {item}?',
      options: ['5+ hours', '2–5 hours', 'Under 2 hours', 'Almost none'],
    },
    {
      id: 'existingCollection',
      type: 'choice',
      label: 'How much similar stuff do you already own?',
      options: ['Nothing', 'A few', 'Many', 'Lots'],
    },
    {
      id: 'learningCurve',
      type: 'choice',
      label: 'Will you push through the learning curve?',
      options: ['Definitely', 'Probably', 'Unsure', 'Doubt it'],
    },
    {
      id: 'resaleValue',
      type: 'yesno',
      label: 'Does {item} hold resale value if it doesn’t click?',
    },
  ],
  alcohol: [
    {
      id: 'occasion',
      type: 'choice',
      label: 'What’s the occasion for {item}?',
      options: ['Party', 'Gift', 'Personal stash', 'Collection'],
    },
    {
      id: 'frequency',
      type: 'choice',
      label: 'How often do you drink?',
      options: ['Rarely', 'Weekly', 'Often', 'Daily'],
    },
    {
      id: 'alternatives',
      type: 'yesno',
      label: 'Is there a cheaper alternative to {item} that would do?',
    },
    {
      id: 'impulse',
      type: 'yesno',
      label: 'Is {item} an impulse purchase?',
    },
  ],
  gambling: [
    {
      id: 'budgetSet',
      type: 'yesno',
      label: 'Do you have a strict budget set for this?',
    },
    {
      id: 'lastResult',
      type: 'choice',
      label: 'How did your last attempt go?',
      options: ['Won big', 'Won small', 'Broke even', 'Lost'],
    },
    {
      id: 'mood',
      type: 'choice',
      label: 'Why are you doing this now?',
      options: ['Pure fun', 'Recouping a loss', 'Routine', 'Excitement'],
    },
    {
      id: 'canAffordLoss',
      type: 'slider',
      label: 'Can you comfortably afford to lose 100% of this? (1=no way, 5=easily)',
      min: 1,
      max: 5,
    },
  ],
  vape: [
    {
      id: 'quitting',
      type: 'choice',
      label: 'Are you using {item} to quit cigarettes?',
      options: ['Yes', 'Trying to', 'No', 'Never smoked'],
    },
    {
      id: 'frequency',
      type: 'choice',
      label: 'How often will you use {item}?',
      options: ['Rarely', 'Socially', 'Daily', 'Constantly'],
    },
    {
      id: 'monthlyCost',
      type: 'yesno',
      label: 'Have you worked out the monthly cost?',
    },
    {
      id: 'healthAware',
      type: 'yesno',
      label: 'Are you aware of the health risks?',
    },
  ],
  other: [
    {
      id: 'necessity',
      type: 'slider',
      label: 'How necessary is {item} on a 1–5 scale?',
      min: 1,
      max: 5,
    },
    {
      id: 'usageFrequency',
      type: 'choice',
      label: 'How often will you use {item}?',
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    },
    {
      id: 'duplicate',
      type: 'yesno',
      label: 'Do you own something that does the same job?',
    },
    {
      id: 'lifestyleFit',
      type: 'slider',
      label: 'How well does {item} fit your life?',
      min: 1,
      max: 5,
    },
  ],
}

/**
 * Everyday essentials (milk, bread, eggs) skip the impulse questions: nobody
 * waits a month for milk, buys it from FOMO or has craved it for ages. The food
 * budget question goes too, because the price screen already asks for spare
 * cash. Price stays — without it the engine will not say yes.
 */
export const ESSENTIAL_SKIPPED_IDS = ['budget', 'cravingDuration', 'canWait', 'fomo']

const DEFAULT_ITEM = 'it'

export function getProductType(category, productType) {
  return PRODUCT_TYPES[category]?.find((type) => type.id === productType) ?? null
}

/**
 * Apply a product type's rewording to one question. Only wording changes: id,
 * type and options stay as they are, so every scorer keeps working. When the
 * rewording changes what an answer means, the override brings matching reason
 * phrases ([negative, positive]) and a breakdown label (signal).
 */
function resolveQuestion(question, type) {
  const override = type?.questions?.[question.id]
  const spec = typeof override === 'string' ? { label: override } : (override ?? {})
  const item = type?.item ?? DEFAULT_ITEM
  const fill = (text) => text.replaceAll('{item}', item)

  const resolved = { ...question, label: fill(spec.label ?? question.label) }
  if (spec.phrases) resolved.phrases = spec.phrases.map(fill)
  if (spec.signal) resolved.signal = spec.signal
  return resolved
}

export function getQuestionsForCategory(category, { essential = false, productType = null } = {}) {
  const type = getProductType(category, productType)
  const specific = CATEGORY_QUESTIONS[category] ?? CATEGORY_QUESTIONS.other
  const questions = [...specific, ...UNIVERSAL_QUESTIONS]
  const resolve = (q) => resolveQuestion(q, type)
  if (!essential) return questions.map(resolve)
  return questions
    .filter((q) => !ESSENTIAL_SKIPPED_IDS.includes(q.id))
    // Nobody finances a carton of milk.
    .map((q) => (q.id === 'price' ? { ...q, label: 'What does {item} cost?', instalments: false } : q))
    .map(resolve)
}

const CATEGORY_LABELS = {
  tech: 'Necessity',
  fashion: 'Wardrobe gap',
  home: 'Lifestyle fit',
  food: 'Healthiness',
  fitness: 'Consistency',
  beauty: 'Existing product use',
  auto: 'Necessity',
  hobby: 'Time for it',
  alcohol: 'Frequency',
  gambling: 'Budget set',
  vape: 'Health awareness',
  other: 'Necessity',
}

export function describeCategory(category) {
  return CATEGORY_LABELS[category] ?? 'this purchase'
}
