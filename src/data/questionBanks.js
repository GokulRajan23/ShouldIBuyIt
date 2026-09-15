// Category-specific question banks. Each category contributes 4 specific
// questions; we always append 3 universal ones (price, canWait, fomo)
// → 7 questions total per quiz.

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
    label: 'What does it cost? Paying in full or in instalments?',
  },
  {
    id: 'canWait',
    type: 'yesno',
    label: 'Could you wait a month to buy this without it affecting your life?',
  },
  {
    id: 'fomo',
    type: 'yesno',
    label: 'Are you buying this because of a sale, hype, or FOMO?',
  },
]

const CATEGORY_QUESTIONS = {
  tech: [
    {
      id: 'usage',
      type: 'choice',
      label: 'How often will you actually use it?',
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
      label: 'How much will this boost your productivity?',
      min: 1,
      max: 5,
    },
    // NB: a "do you already own one?" question would be fully determined by
    // currentAge above (owning any equivalent device implies yes), so it can
    // carry no information. This asks something independent instead.
    {
      id: 'researched',
      type: 'choice',
      label: 'How much have you compared it against cheaper options?',
      options: ['Thoroughly', 'A bit', 'Barely', 'Not at all'],
    },
  ],
  fashion: [
    {
      id: 'occasions',
      type: 'choice',
      label: 'How often will you wear it per month?',
      options: ['1–2 times', '3–5 times', '6+ times', 'One-time only'],
    },
    {
      id: 'wardrobeGap',
      type: 'yesno',
      label: 'Does it fill a real gap in your wardrobe?',
    },
    {
      id: 'matchOutfits',
      type: 'choice',
      label: 'How many of your existing outfits does it match?',
      options: ['Many', 'A few', 'Just one', 'None yet'],
    },
    {
      id: 'season',
      type: 'choice',
      label: 'Is it right for the upcoming season?',
      options: ['In season now', 'Next season', 'Year-round', 'Off-season'],
    },
  ],
  home: [
    {
      id: 'spaceFit',
      type: 'yesno',
      label: 'Do you actually have space for it?',
    },
    {
      id: 'usageFrequency',
      type: 'choice',
      label: 'How often will it get used?',
      options: ['Daily', 'Weekly', 'Monthly', 'Special occasions'],
    },
    {
      id: 'lifestyle',
      type: 'slider',
      label: 'How well does it fit your day-to-day lifestyle?',
      min: 1,
      max: 5,
    },
    {
      id: 'quality',
      type: 'choice',
      label: 'Quality tier you’re looking at?',
      options: ['Premium', 'Mid-range', 'Budget', 'Cheapest possible'],
    },
  ],
  food: [
    {
      id: 'budget',
      type: 'choice',
      label: 'How does this fit your food budget?',
      options: ['Easily', 'A bit tight', 'A stretch', 'A splurge'],
    },
    {
      id: 'healthy',
      type: 'slider',
      label: 'How healthy is it on a 1–5 scale?',
      min: 1,
      max: 5,
    },
    {
      id: 'alternatives',
      type: 'yesno',
      label: 'Are there cheaper alternatives nearby?',
    },
    {
      id: 'cravingDuration',
      type: 'choice',
      label: 'How long have you wanted it?',
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
      label: 'Do you have a routine that already uses this?',
    },
    {
      id: 'spaceForIt',
      type: 'yesno',
      label: 'Do you have space at home or a nearby place to use it?',
    },
    {
      id: 'alternatives',
      type: 'choice',
      label: 'How many cheaper alternatives exist?',
      options: ['None', 'A few', 'Many', 'Free options'],
    },
  ],
  beauty: [
    {
      id: 'tested',
      type: 'yesno',
      label: 'Have you tested or sampled it before?',
    },
    {
      id: 'dupeAvailable',
      type: 'yesno',
      label: 'Is there a known cheaper dupe?',
    },
    {
      id: 'usageFrequency',
      type: 'choice',
      label: 'How often will you use it?',
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
      label: 'How necessary is it on a 1–5 scale?',
      min: 1,
      max: 5,
    },
    {
      id: 'financing',
      type: 'choice',
      label: 'How are you paying?',
      options: ['Cash', 'Short loan', 'Long loan', 'Lease'],
    },
    {
      id: 'longTermCost',
      type: 'choice',
      label: 'Will it lower your long-term costs?',
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
      label: 'Realistic hours per week you’ll spend on it?',
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
      label: 'Does it hold resale value if it doesn’t click?',
    },
  ],
  alcohol: [
    {
      id: 'occasion',
      type: 'choice',
      label: 'What’s the occasion?',
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
      label: 'Are there cheaper, acceptable alternatives?',
    },
    {
      id: 'impulse',
      type: 'yesno',
      label: 'Is this an impulse purchase?',
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
      label: 'Are you using this to quit cigarettes?',
      options: ['Yes', 'Trying to', 'No', 'Never smoked'],
    },
    {
      id: 'frequency',
      type: 'choice',
      label: 'How often will you use it?',
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
      label: 'How necessary is it on a 1–5 scale?',
      min: 1,
      max: 5,
    },
    {
      id: 'usageFrequency',
      type: 'choice',
      label: 'How often will you use it?',
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
      label: 'How well does it fit your life?',
      min: 1,
      max: 5,
    },
  ],
}

export function getQuestionsForCategory(category) {
  const specific = CATEGORY_QUESTIONS[category] ?? CATEGORY_QUESTIONS.other
  return [...specific, ...UNIVERSAL_QUESTIONS]
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
