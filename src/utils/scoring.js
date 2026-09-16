// Deterministic, offline purchase-scoring engine. Replaces the old LLM verdict call.
// Pure: no React, no DOM, no I/O, no Math.random, no Date branching.
// Identical answers always produce an identical verdict.

import { CURRENCY_DEFAULT } from '../data/themes.js'

// ---------------------------------------------------------------------------
// Tunables — every weight and band lives here.
// ---------------------------------------------------------------------------

/** Relative importance of each signal. Denominator is recomputed per quiz. */
export const WEIGHTS = {
  affordability: 30,
  canWait: 12,
  fomo: 10,
  instalments: 8,
  // Category-specific weights are declared alongside their scorers below.
}

/** Monthly disposable income bands → midpoint used for the ratio math. */
export const BUDGET_BANDS = {
  'Under €100': 50,
  '€100–300': 200,
  '€300–700': 500,
  '€700+': 1000,
  'Rather not say': null,
}

export const BUDGET_BAND_OPTIONS = Object.keys(BUDGET_BANDS)

/**
 * How much of the price is already set aside. Affordability is judged on the
 * shortfall — the part still to find this month — not the sticker price, so
 * someone who saved deliberately isn't scored like an impulse buyer.
 */
export const SAVINGS_COVERAGE = {
  'All of it': 1,
  'Most of it': 0.7,
  'Some of it': 0.35,
  'None of it': 0,
}

export const SAVINGS_OPTIONS = Object.keys(SAVINGS_COVERAGE)

/** Below this share of monthly spare cash, asking about savings is silly. */
export const SAVINGS_PROMPT_RATIO = 0.2
/** Nobody saves up for a sandwich, whatever their income. */
export const SAVINGS_PROMPT_MIN = 80
/** Used instead of the ratio when the budget band is withheld. */
export const SAVINGS_PROMPT_ABSOLUTE = 150

/** True when a purchase is big enough that "have you saved for it?" is worth asking. */
export function shouldAskAboutSavings(price, budgetBand) {
  if (!Number.isFinite(price) || price < SAVINGS_PROMPT_MIN) return false
  const budget = BUDGET_BANDS[budgetBand] ?? null
  return budget === null ? price >= SAVINGS_PROMPT_ABSOLUTE : price / budget >= SAVINGS_PROMPT_RATIO
}

/** Choice label → how many times per month it gets used. */
const USES_PER_MONTH = {
  Daily: 30,
  Weekly: 4,
  Monthly: 1,
  Rarely: 0.25,
  Occasionally: 1,
  'Special occasions': 0.5,
  'Just once': 0.08,
  'One-time only': 0.08,
  '6+ times': 8,
  '3–5 times': 4,
  '1–2 times': 1.5,
}

/** How many months the thing realistically stays in service. */
const LIFESPAN_MONTHS = {
  tech: 36,
  auto: 60,
  home: 60,
  hobby: 36,
  fashion: 24,
  fitness: 24,
  beauty: 6,
  other: 24,
  food: 1,
  alcohol: 1,
  vape: 1,
  gambling: 1,
}

/**
 * Categories carrying inherent financial or health risk, applied as an offset.
 * Gambling sits low enough that it needs an overwhelming case to reach YES —
 * a deliberate conservative default for an app giving spending advice.
 */
const RISK_PRIORS = {
  gambling: -0.75,
  vape: -0.65,
  alcohol: -0.15,
}

/**
 * Hard constraint: once the price passes this share of monthly disposable
 * income, no combination of soft preference signals may carry it to YES.
 * Affordability is a fact; "I have space for it" is a preference.
 */
const AFFORDABILITY_VETO_RATIO = 0.4
/**
 * A vetoed purchase is always a NO, but the score still shows how far off it
 * is — so paying down the shortfall (by saving) visibly moves the number even
 * while the answer stays no. Bounds keep it strictly below the YES threshold.
 */
const VETO_CEILING_NEAR = -0.02
const VETO_CEILING_FAR = -0.35
const VETO_FALLOFF = 0.3

function vetoCeiling(shortfallRatio) {
  const over = shortfallRatio - AFFORDABILITY_VETO_RATIO
  return clamp(VETO_CEILING_NEAR - VETO_FALLOFF * over, VETO_CEILING_FAR, VETO_CEILING_NEAR)
}

const DURABLE_CATEGORIES = ['tech', 'fashion', 'home', 'fitness', 'beauty', 'auto', 'hobby', 'other']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp = (n, lo = -1, hi = 1) => Math.min(hi, Math.max(lo, n))

/** 1..5 slider → -1..+1. */
const fromSlider = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? clamp((n - 3) / 2) : null
}

/** Map a choice option to a score via a lookup table. */
const fromChoice = (table) => (value) => (value in table ? table[value] : null)

/** Yes/no → [falseScore, trueScore]. */
const fromYesNo = (whenFalse, whenTrue) => (value) =>
  typeof value === 'boolean' ? (value ? whenTrue : whenFalse) : null

/**
 * Parse the price string the UI collects. Handles "149", "€1,299.99", "1.299,99".
 * Returns null when nothing numeric is present.
 */
export function parsePrice(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) && raw >= 0 ? raw : null
  let s = String(raw ?? '').replace(/[^\d.,-]/g, '').trim()
  if (!s) return null

  const lastDot = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')
  if (lastDot !== -1 && lastComma !== -1) {
    // Whichever separator comes last is the decimal point.
    const decimalAt = Math.max(lastDot, lastComma)
    const intPart = s.slice(0, decimalAt).replace(/[.,]/g, '')
    s = `${intPart}.${s.slice(decimalAt + 1).replace(/[.,]/g, '')}`
  } else if (lastComma !== -1) {
    // A lone comma is a decimal separator only with 1-2 trailing digits.
    s = /,\d{1,2}$/.test(s) ? s.replace(',', '.') : s.replace(/,/g, '')
  } else if (lastDot !== -1 && !/\.\d{1,2}$/.test(s)) {
    s = s.replace(/\./g, '')
  }

  const n = Number.parseFloat(s)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** Price as a share of monthly disposable income → score. */
function affordabilityScore(ratio) {
  if (ratio < 0.02) return 1.0
  if (ratio < 0.05) return 0.6
  if (ratio < 0.1) return 0.2
  if (ratio < 0.2) return -0.3
  if (ratio < 0.4) return -0.7
  return -1.0
}

/** Cost per individual use → score. */
function costPerUseScore(cpu) {
  if (cpu < 0.5) return 1.0
  if (cpu < 1) return 0.7
  if (cpu < 3) return 0.4
  if (cpu < 6) return 0.0
  if (cpu < 12) return -0.5
  if (cpu < 20) return -0.8
  return -1.0
}

const money = (n) => `${CURRENCY_DEFAULT}${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`

// ---------------------------------------------------------------------------
// Frequency / cost-per-use signal
// ---------------------------------------------------------------------------

/**
 * Frequency questions are scored as cost-per-use when a price is known and the
 * category is durable — that folds usage and price into one honest number
 * instead of counting frequency twice.
 */
function frequencyScorer(ctx) {
  const uses = USES_PER_MONTH[ctx.value]
  if (uses === undefined) return null

  const lifespan = LIFESPAN_MONTHS[ctx.category] ?? 24
  if (ctx.price !== null && DURABLE_CATEGORIES.includes(ctx.category)) {
    const totalUses = Math.max(uses * lifespan, 0.5)
    const cpu = ctx.price / totalUses
    ctx.derived.costPerUse = cpu
    return costPerUseScore(cpu)
  }
  // No price to work with — fall back to raw usage intensity.
  if (uses >= 30) return 1
  if (uses >= 4) return 0.5
  if (uses >= 1) return 0
  return -0.8
}

function frequencyPhrase(ctx, positive) {
  const cpu = ctx.derived.costPerUse
  if (cpu !== undefined) {
    return positive
      ? `that works out to about ${money(cpu)} per use`
      : `that's roughly ${money(cpu)} every time you use it`
  }
  return positive ? "you'll use it constantly" : "you'll barely use it"
}

const FREQUENCY_SIGNAL = {
  weight: 14,
  label: 'Cost per use',
  score: frequencyScorer,
  phrase: frequencyPhrase,
}

// ---------------------------------------------------------------------------
// Scorers, keyed by category then question id. Falls back to UNIVERSAL.
// ---------------------------------------------------------------------------

const sig = (weight, label, score, negative, positive) => ({
  weight,
  label,
  score: (ctx) => score(ctx.value, ctx),
  phrase: (_ctx, isPositive) => (isPositive ? positive : negative),
})

const UNIVERSAL = {
  canWait: sig(
    WEIGHTS.canWait,
    'Could wait a month',
    fromYesNo(0.8, -0.8),
    'you said you could wait a month',
    "waiting isn't realistic here",
  ),
  fomo: sig(
    WEIGHTS.fomo,
    'Sale / hype driven',
    fromYesNo(0.5, -1),
    "it's the hype talking, not the need",
    "it isn't a hype purchase",
  ),
}

const CATEGORY_SCORERS = {
  tech: {
    usage: FREQUENCY_SIGNAL,
    // Carries the redundancy signal on its own — "do you already own one?"
    // is entailed by this answer, so scoring it separately double-counted.
    currentAge: sig(
      12,
      'Age of current device',
      fromChoice({ New: -0.8, '1–2 years old': -0.2, '3+ years old': 0.7, "Don't own one": 1 }),
      'what you already have is still fine',
      "what you have is past it",
    ),
    productivity: sig(
      10,
      'Productivity boost',
      fromSlider,
      "it won't move the needle on your work",
      "it's a real productivity gain",
    ),
    researched: sig(
      10,
      'Compared against alternatives',
      fromChoice({ Thoroughly: 0.8, 'A bit': 0.2, Barely: -0.4, 'Not at all': -0.8 }),
      "you haven't compared it against cheaper options",
      "you've compared it against the alternatives",
    ),
  },
  fashion: {
    occasions: FREQUENCY_SIGNAL,
    wardrobeGap: sig(
      10,
      'Fills a wardrobe gap',
      fromYesNo(-0.7, 0.9),
      "it doesn't fill a real gap",
      'it fills a genuine gap',
    ),
    matchOutfits: sig(
      9,
      'Matches your outfits',
      fromChoice({ Many: 1, 'A few': 0.4, 'Just one': -0.4, 'None yet': -1 }),
      'it barely matches anything you own',
      'it works with plenty you already own',
    ),
    season: sig(
      7,
      'Season fit',
      fromChoice({ 'In season now': 0.8, 'Year-round': 1, 'Next season': -0.1, 'Off-season': -0.7 }),
      "you can't even wear it yet",
      "it's right for the season",
    ),
  },
  home: {
    usageFrequency: FREQUENCY_SIGNAL,
    spaceFit: sig(
      12,
      'Space for it',
      fromYesNo(-1, 0.6),
      "you don't have the space",
      'you have room for it',
    ),
    lifestyle: sig(
      10,
      'Lifestyle fit',
      fromSlider,
      "it doesn't fit how you actually live",
      'it fits your day-to-day',
    ),
    quality: sig(
      8,
      'Quality tier',
      fromChoice({ Premium: -0.2, 'Mid-range': 0.8, Budget: 0.3, 'Cheapest possible': -0.5 }),
      "the cheapest option won't last",
      "the tier you picked is sensible",
    ),
  },
  food: {
    budget: sig(
      12,
      'Fits food budget',
      fromChoice({ Easily: 1, 'A bit tight': 0.2, 'A stretch': -0.6, 'A splurge': -1 }),
      'it stretches your food budget',
      'it sits comfortably in your budget',
    ),
    healthy: sig(10, 'Healthiness', fromSlider, "it's not doing your health any favours", "it's a healthy pick"),
    alternatives: sig(
      9,
      'Cheaper alternatives nearby',
      fromYesNo(0.4, -0.6),
      'cheaper options are right there',
      'there is no cheaper option nearby',
    ),
    cravingDuration: sig(
      9,
      'How long wanted',
      fromChoice({ 'Just today': -0.6, 'This week': 0, 'This month': 0.4, Ages: 0.8 }),
      "you've only wanted it since today",
      "you've wanted it for a while",
    ),
  },
  fitness: {
    consistency: sig(
      14,
      'Past consistency',
      fromChoice({ Yes: 1, Mostly: 0.5, Sometimes: -0.3, No: -1 }),
      'your last fitness buy went unused',
      'you actually stuck with the last one',
    ),
    routine: sig(
      12,
      'Existing routine',
      fromYesNo(-0.8, 0.9),
      'you have no routine that uses it',
      'it slots into a routine you already have',
    ),
    spaceForIt: sig(
      9,
      'Space to use it',
      fromYesNo(-1, 0.5),
      'you have nowhere to use it',
      'you have somewhere to use it',
    ),
    alternatives: sig(
      9,
      'Cheaper alternatives',
      fromChoice({ None: 0.8, 'A few': 0.1, Many: -0.5, 'Free options': -1 }),
      'free alternatives do the same job',
      'there is no real substitute',
    ),
  },
  beauty: {
    usageFrequency: { ...FREQUENCY_SIGNAL, weight: 12 },
    tested: sig(
      10,
      'Tested it before',
      fromYesNo(-0.5, 0.8),
      "you've never tested it",
      "you've already tested it",
    ),
    dupeAvailable: sig(
      10,
      'Cheaper dupe exists',
      fromYesNo(0.4, -0.8),
      'a cheaper dupe exists',
      'there is no known dupe',
    ),
    finishExisting: sig(
      12,
      'Finished current product',
      fromYesNo(-0.9, 0.7),
      "you haven't finished the one you own",
      "you've finished your current one",
    ),
  },
  auto: {
    necessity: sig(14, 'Necessity', fromSlider, "it isn't necessary", "it's genuinely necessary"),
    financing: sig(
      12,
      'How you are paying',
      fromChoice({ Cash: 1, 'Short loan': 0.2, 'Long loan': -0.7, Lease: -0.3 }),
      'a long loan makes it cost far more',
      "you're paying outright",
    ),
    longTermCost: sig(
      10,
      'Long-term cost',
      fromChoice({ Yes: 1, Maybe: 0.3, 'About the same': -0.2, Higher: -0.9 }),
      'it raises your running costs',
      'it lowers your long-term costs',
    ),
    duplicate: sig(
      12,
      'Owns a duplicate',
      fromYesNo(0.5, -1),
      'you already own a vehicle that does this',
      'nothing you own covers this',
    ),
  },
  hobby: {
    timeForIt: sig(
      14,
      'Time available',
      fromChoice({ '5+ hours': 1, '2–5 hours': 0.5, 'Under 2 hours': -0.4, 'Almost none': -1 }),
      "you have almost no time for it",
      'you have real time for it',
    ),
    existingCollection: sig(
      11,
      'Similar stuff owned',
      fromChoice({ Nothing: 0.6, 'A few': 0.2, Many: -0.5, Lots: -1 }),
      'you already own plenty like it',
      'you own nothing like it yet',
    ),
    learningCurve: sig(
      10,
      'Learning curve',
      fromChoice({ Definitely: 1, Probably: 0.4, Unsure: -0.4, 'Doubt it': -1 }),
      "you doubt you'll push through the learning curve",
      "you'll push through the learning curve",
    ),
    resaleValue: sig(
      7,
      'Resale value',
      fromYesNo(-0.4, 0.5),
      "it's worth nothing if it doesn't click",
      'you can resell it if it flops',
    ),
  },
  alcohol: {
    occasion: sig(
      8,
      'Occasion',
      fromChoice({ Party: 0.4, Gift: 0.5, 'Personal stash': -0.4, Collection: 0 }),
      "it's just for the stash",
      "there's a real occasion for it",
    ),
    frequency: sig(
      12,
      'Drinking frequency',
      fromChoice({ Rarely: 0.5, Weekly: 0, Often: -0.5, Daily: -1 }),
      'you already drink most days',
      'you rarely drink',
    ),
    alternatives: sig(
      9,
      'Cheaper alternatives',
      fromYesNo(0.4, -0.6),
      'a cheaper bottle would do the same job',
      'there is no acceptable cheaper option',
    ),
    impulse: sig(
      11,
      'Impulse purchase',
      fromYesNo(0.5, -0.9),
      "it's a pure impulse grab",
      "it isn't an impulse buy",
    ),
  },
  gambling: {
    budgetSet: sig(
      12,
      'Strict budget set',
      fromYesNo(-1, 0.5),
      'you have no budget set for this',
      'you have a strict budget set',
    ),
    lastResult: sig(
      9,
      'Last attempt',
      fromChoice({ 'Won big': -0.3, 'Won small': 0, 'Broke even': 0, Lost: -0.8 }),
      'you lost last time',
      'last time was a wash',
    ),
    mood: sig(
      12,
      'Reason for playing',
      fromChoice({ 'Pure fun': 0.3, 'Recouping a loss': -1, Routine: -0.6, Excitement: -0.3 }),
      "you're chasing a loss",
      "you're in it purely for fun",
    ),
    canAffordLoss: sig(
      14,
      'Can afford total loss',
      fromSlider,
      "you can't afford to lose this",
      'losing it all would not hurt you',
    ),
  },
  vape: {
    quitting: sig(
      12,
      'Quitting cigarettes',
      fromChoice({ Yes: 0.6, 'Trying to': 0.3, No: -0.8, 'Never smoked': -1 }),
      "you never smoked — this starts a habit",
      "you're using it to quit cigarettes",
    ),
    frequency: sig(
      11,
      'Usage frequency',
      fromChoice({ Rarely: 0.2, Socially: -0.2, Daily: -0.8, Constantly: -1 }),
      "you'd be on it constantly",
      "you'd barely touch it",
    ),
    monthlyCost: sig(
      9,
      'Knows monthly cost',
      fromYesNo(-0.6, 0.4),
      "you haven't worked out the monthly cost",
      "you've done the monthly maths",
    ),
    healthAware: sig(
      8,
      'Health risk awareness',
      fromYesNo(-0.7, 0.2),
      "you haven't looked at the health risks",
      "you know the health risks",
    ),
  },
  other: {
    usageFrequency: { ...FREQUENCY_SIGNAL, weight: 12 },
    necessity: sig(14, 'Necessity', fromSlider, "it isn't necessary", "it's genuinely necessary"),
    duplicate: sig(
      12,
      'Owns a duplicate',
      fromYesNo(0.5, -1),
      'you already own something that does this job',
      'nothing you own covers this',
    ),
    lifestyleFit: sig(
      10,
      'Lifestyle fit',
      fromSlider,
      "it doesn't fit your life",
      'it fits your life well',
    ),
  },
}

function getScorer(category, id) {
  return CATEGORY_SCORERS[category]?.[id] ?? UNIVERSAL[id] ?? null
}

// ---------------------------------------------------------------------------
// Reason assembly
// ---------------------------------------------------------------------------

const MAX_REASON_WORDS = 22

function buildReason(contributions, verdict) {
  const ranked = [...contributions]
    .filter((c) => Math.abs(c.points) > 0.05)
    .sort((a, b) => Math.abs(b.points * b.weight) - Math.abs(a.points * a.weight))

  // Prefer clauses that argue the same way the verdict landed.
  const wantPositive = verdict === 'YES'
  const aligned = ranked.filter((c) => c.points > 0 === wantPositive)
  const picked = (aligned.length >= 2 ? aligned : ranked).slice(0, 2)

  if (picked.length === 0) {
    return verdict === 'YES'
      ? 'Nothing here argues against it, so go ahead.'
      : 'You skipped the questions, so there is nothing here justifying the spend.'
  }

  const clauses = picked.map((c) => c.phrase)
  let sentence = clauses.length > 1 ? `${clauses[0]}, and ${clauses[1]}` : clauses[0]
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)

  const words = sentence.split(/\s+/)
  if (words.length > MAX_REASON_WORDS) sentence = words.slice(0, MAX_REASON_WORDS).join(' ')
  return sentence.replace(/[.\s]+$/, '') + '.'
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Score a completed quiz.
 * @returns {{verdict:'YES'|'NO', reason:string, score:number,
 *            breakdown:Array<{label:string, points:number, weight:number}>}}
 */
export function scoreQuiz({ category = 'other', questions = [], answers = {}, skipped = [], prankMode = false }) {
  const priceAnswer = answers.price
  const price = priceAnswer ? parsePrice(priceAnswer.amount) : null
  const budget = priceAnswer ? (BUDGET_BANDS[priceAnswer.budgetBand] ?? null) : null
  const derived = {}

  const contributions = []
  const add = (label, points, weight, phrase) => {
    if (points === null || points === undefined || !Number.isFinite(points)) return
    contributions.push({ label, points: clamp(points), weight, phrase })
  }

  const isSkipped = (id) => skipped.includes(id) || answers[id] === undefined

  // --- Universal price-derived signals -------------------------------------
  if (!isSkipped('price') && price !== null && budget !== null) {
    // Only the unsaved portion has to come out of this month's money.
    const answeredSavings = priceAnswer?.savedUp in SAVINGS_COVERAGE
    const coverage = answeredSavings ? SAVINGS_COVERAGE[priceAnswer.savedUp] : 0
    const shortfall = price * (1 - coverage)
    const ratio = shortfall / budget
    derived.affordabilityRatio = ratio
    derived.savingsCoverage = coverage
    const pct = Math.round(ratio * 100)
    const points = affordabilityScore(ratio)

    let phrase
    if (coverage >= 1) {
      phrase = `you've already saved the full ${money(price)}`
    } else if (coverage > 0 && points < 0) {
      phrase = `even after your savings, ${money(shortfall)} still has to come from somewhere`
    } else if (coverage > 0) {
      phrase = `your savings cover most of the ${money(price)}`
    } else if (points >= 0) {
      phrase = `${money(price)} barely dents your monthly spare cash`
    } else if (answeredSavings) {
      phrase = `${money(price)} is ${pct}% of your monthly spare cash and none of it is saved`
    } else {
      phrase = `${money(price)} is ${pct}% of your monthly spare cash`
    }

    add('Affordability', points, WEIGHTS.affordability, phrase)
  }

  if (!isSkipped('price') && priceAnswer?.payment) {
    const onInstalments = priceAnswer.payment === 'emi'
    add(
      'Payment method',
      onInstalments ? -0.7 : 0.4,
      WEIGHTS.instalments,
      onInstalments ? "you'd be paying it off in instalments" : "you can pay for it outright",
    )
  }

  // --- Every remaining question -------------------------------------------
  for (const question of questions) {
    if (question.id === 'price' || isSkipped(question.id)) continue
    const scorer = getScorer(category, question.id)
    if (!scorer) continue

    const ctx = { value: answers[question.id], question, category, price, budget, answers, derived }
    const points = scorer.score(ctx)
    if (points === null || points === undefined) continue
    add(scorer.label, points, scorer.weight, scorer.phrase(ctx, points >= 0))
  }

  // --- Aggregate ------------------------------------------------------------
  const totalWeight = contributions.reduce((sum, c) => sum + c.weight, 0)
  const weighted = contributions.reduce((sum, c) => sum + c.points * c.weight, 0)
  let normalized = totalWeight > 0 ? weighted / totalWeight : 0

  if (!prankMode && RISK_PRIORS[category]) normalized += RISK_PRIORS[category]

  // Hard affordability veto — soft signals cannot outvote the maths. Measured
  // on the shortfall, so money already saved for this purchase lifts it.
  if (derived.affordabilityRatio >= AFFORDABILITY_VETO_RATIO) {
    normalized = Math.min(normalized, vetoCeiling(derived.affordabilityRatio))
  }

  normalized = clamp(normalized)

  const score = Math.round(((normalized + 1) / 2) * 100)
  const verdict = score > 50 ? 'YES' : 'NO'

  return {
    verdict,
    reason: buildReason(contributions, verdict),
    score,
    breakdown: contributions.map(({ label, points, weight }) => ({
      label,
      points: Math.round(points * 100) / 100,
      weight,
    })),
  }
}
