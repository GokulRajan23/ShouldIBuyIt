// Fixture checks for the offline scoring engine. Plain node, no test framework.
//   node scripts/verify-scoring.mjs
import { scoreQuiz, parsePrice, savingsCoverage, shouldAskAboutSavings } from '../src/utils/scoring.js'
import { classifyProduct } from '../src/utils/classifier.js'
import { CATEGORIES, getQuestionsForCategory } from '../src/data/questionBanks.js'
import { PRODUCT_TYPES } from '../src/data/productTypes.js'
import { useQuizReducer } from '../src/hooks/useQuizReducer.js'

let failures = 0

function check(name, expectation, actual, detail = '') {
  const ok = expectation === actual
  if (!ok) failures++
  const tag = ok ? 'PASS' : 'FAIL'
  console.log(`${ok ? '✅' : '❌'} ${tag}  ${name}`)
  if (!ok) console.log(`        expected ${expectation}, got ${actual} ${detail}`)
  else if (detail) console.log(`        ${detail}`)
}

const price = (amount, payment, budgetBand, savedAmount = null) => ({
  amount, currency: '€', payment, budgetBand, savedAmount,
})

function run(category, answers, { skipped = [], prankMode = false, essential = false } = {}) {
  return scoreQuiz({
    product: 'fixture',
    category,
    questions: getQuestionsForCategory(category, { essential }),
    answers,
    skipped,
    prankMode,
  })
}

console.log('\n— Scoring fixtures —\n')

// 1. Obvious YES: cheap, daily use, old device, well-researched, can't wait, no hype.
const yes = run('tech', {
  price: price('120', 'full', '€700+'),
  canWait: false,
  fomo: false,
  usage: 'Daily',
  currentAge: '3+ years old',
  productivity: 5,
  researched: 'Thoroughly',
})
check('Obvious YES (cheap, daily, needed)', 'YES', yes.verdict, `score ${yes.score} — "${yes.reason}"`)

// 2. Obvious NO: expensive, rarely used, new device, unresearched, can wait, hype.
const no = run('tech', {
  price: price('1800', 'emi', 'Under €100'),
  canWait: true,
  fomo: true,
  usage: 'Rarely',
  currentAge: 'New',
  productivity: 1,
  researched: 'Not at all',
})
check('Obvious NO (pricey, redundant, hype)', 'NO', no.verdict, `score ${no.score} — "${no.reason}"`)

// 3. Everything skipped → neutral 50 → NO, and no crash.
const allSkipped = run('other', {}, {
  skipped: ['necessity', 'usageFrequency', 'duplicate', 'lifestyleFit', 'price', 'canWait', 'fomo'],
})
check('All questions skipped → NO', 'NO', allSkipped.verdict, `score ${allSkipped.score}`)
check('All skipped → just under neutral (no price ⇒ no yes)', 49, allSkipped.score)
check('All skipped → empty breakdown', 0, allSkipped.breakdown.length)

// 4. Gambling with sane answers still leans NO because of the risk prior.
const gambling = run('gambling', {
  price: price('20', 'full', '€700+'),
  canWait: false,
  fomo: false,
  budgetSet: true,
  lastResult: 'Broke even',
  mood: 'Pure fun',
  canAffordLoss: 5,
})
check('Gambling, best-case answers → NO', 'NO', gambling.verdict, `score ${gambling.score}`)

// 5. Price over 40% of monthly disposable income drags hard toward NO.
const overBudget = run('home', {
  price: price('600', 'full', '€100–300'),
  canWait: false,
  fomo: false,
  spaceFit: true,
  usageFrequency: 'Weekly',
  lifestyle: 4,
  quality: 'Mid-range',
})
check('600 EUR on a 200 EUR budget → NO', 'NO', overBudget.verdict, `score ${overBudget.score}`)

// 6. Food impulse splurge.
const foodNo = run('food', {
  price: price('45', 'full', 'Under €100'),
  canWait: true,
  fomo: true,
  budget: 'A splurge',
  healthy: 1,
  alternatives: true,
  cravingDuration: 'Just today',
})
check('Impulse food splurge → NO', 'NO', foodNo.verdict, `score ${foodNo.score}`)

// 7. Fitness buy backed by a real routine and past consistency.
const fitnessYes = run('fitness', {
  price: price('80', 'full', '€300–700'),
  canWait: false,
  fomo: false,
  consistency: 'Yes',
  routine: true,
  spaceForIt: true,
  alternatives: 'None',
})
check('Consistent fitness buyer → YES', 'YES', fitnessYes.verdict, `score ${fitnessYes.score}`)

// 8. Vape, never smoked, constant use.
const vapeNo = run('vape', {
  price: price('30', 'full', '€700+'),
  canWait: false,
  fomo: false,
  quitting: 'Never smoked',
  frequency: 'Constantly',
  monthlyCost: false,
  healthAware: false,
})
check('Never-smoked constant vaper → NO', 'NO', vapeNo.verdict, `score ${vapeNo.score}`)

// 9. Fashion piece that fills a gap and gets worn often.
const fashionYes = run('fashion', {
  price: price('90', 'full', '€700+'),
  canWait: false,
  fomo: false,
  occasions: '6+ times',
  wardrobeGap: true,
  matchOutfits: 'Many',
  season: 'Year-round',
})
check('Well-justified fashion buy → YES', 'YES', fashionYes.verdict, `score ${fashionYes.score}`)

// 10. Determinism: identical input, identical output.
const a = run('tech', {
  price: price('300', 'full', '€300–700'),
  canWait: false, fomo: false, usage: 'Weekly',
  currentAge: '1–2 years old', productivity: 3, researched: 'A bit',
})
const b = run('tech', {
  price: price('300', 'full', '€300–700'),
  canWait: false, fomo: false, usage: 'Weekly',
  currentAge: '1–2 years old', productivity: 3, researched: 'A bit',
})
check('Deterministic (same in → same out)', JSON.stringify(a), JSON.stringify(b), `score ${a.score}`)

// 11. Skipping must not flip a clearly-positive verdict.
const partial = run('tech', {
  price: price('120', 'full', '€700+'),
  canWait: false,
  fomo: false,
  usage: 'Daily',
  researched: 'Thoroughly',
}, { skipped: ['currentAge', 'productivity'] })
check('Skips do not bias a clear YES', 'YES', partial.verdict, `score ${partial.score}`)

// 12. "Rather not say" is judged against the most generous band, not dropped.
const noBudget = run('tech', {
  price: price('120', 'full', 'Rather not say'),
  canWait: false, fomo: false, usage: 'Daily',
  currentAge: '3+ years old', productivity: 5, researched: 'Thoroughly',
})
check(
  'Budget withheld → still scored, not dropped',
  true,
  noBudget.breakdown.some((b) => b.label.startsWith('Affordability')),
  `score ${noBudget.score}`,
)

// 13. Affordability veto: flawless answers cannot carry an unaffordable buy.
const vetoed = run('tech', {
  price: price('900', 'full', '€100–300'),
  canWait: false,
  fomo: false,
  usage: 'Daily',
  currentAge: "Don't own one",
  productivity: 5,
  researched: 'Thoroughly',
})
check('Perfect answers but unaffordable → NO', 'NO', vetoed.verdict, `score ${vetoed.score} (veto)`)

// 14. Guard against re-introducing a question that another answer entails.
//     currentAge already tells us whether an equivalent device is owned.
const techIds = getQuestionsForCategory('tech').map((q) => q.id)
check('tech does not ask both currentAge and duplicate', false,
  techIds.includes('currentAge') && techIds.includes('duplicate'),
  `tech asks: ${techIds.join(', ')}`)
check('tech still asks 7 questions', 7, techIds.length)

console.log('\n— Savings —\n')

// The disciplined saver: everything positive, price well over a month's spare
// cash, but the money is already set aside. Must not be vetoed.
const techAnswers = (savedAmount) => ({
  price: price('1200', 'full', '€700+', savedAmount),
  canWait: false, fomo: false,
  usage: 'Daily', currentAge: '3+ years old', productivity: 5, researched: 'Thoroughly',
})

const saved = run('tech', techAnswers('1200'))
check('Fully saved €1200 → YES', 'YES', saved.verdict, `score ${saved.score} — "${saved.reason}"`)

const unsaved = run('tech', techAnswers('0'))
check('Same buy, nothing saved → NO', 'NO', unsaved.verdict, `score ${unsaved.score}`)

const partlySaved = run('tech', techAnswers('420'))
check('Same buy, some saved → still NO (but scores higher)', 'NO', partlySaved.verdict, `score ${partlySaved.score}`)

check('Saving strictly improves the score', true, saved.score > partlySaved.score && partlySaved.score > unsaved.score,
  `${unsaved.score} < ${partlySaved.score} < ${saved.score}`)

// Savings must not rescue a purchase that is absurd on every other axis.
const savedButPointless = run('tech', {
  price: price('1200', 'full', '€700+', '1200'),
  canWait: true, fomo: true,
  usage: 'Rarely', currentAge: 'New', productivity: 1, researched: 'Not at all',
})
check('Fully saved but pointless → NO', 'NO', savedButPointless.verdict, `score ${savedButPointless.score}`)

// Omitting savings entirely must behave exactly as before the feature.
const noField = run('tech', {
  price: price('1200', 'full', '€700+'),
  canWait: false, fomo: false,
  usage: 'Daily', currentAge: '3+ years old', productivity: 5, researched: 'Thoroughly',
})
check('No savings answer → unchanged legacy behaviour', unsaved.score, noField.score)

console.log('\n— Savings entered as an amount —\n')

const mostlySaved = run('tech', techAnswers('900'))
check('Saving more strictly improves the score', true,
  unsaved.score < partlySaved.score && partlySaved.score < mostlySaved.score && mostlySaved.score < saved.score,
  `€0 ${unsaved.score} < €420 ${partlySaved.score} < €900 ${mostlySaved.score} < €1200 ${saved.score}`)

const overSaved = run('tech', techAnswers('2000'))
check('Saved more than the price → same as saving exactly the price', saved.score, overSaved.score)

const blankSaved = run('tech', techAnswers(''))
const junkSaved = run('tech', techAnswers('lots'))
check('Blank savings → treated as unanswered', noField.score, blankSaved.score)
check('Unreadable savings → treated as unanswered', noField.score, junkSaved.score)
check('"1.200" saved parses as €1200', saved.score, run('tech', techAnswers('1.200')).score)

check('Partial savings reason quotes the real figures', true,
  /€420 saved, €780 still/.test(partlySaved.reason), partlySaved.reason)
check('Full savings reason says so', true, /saved the full €1200/.test(saved.reason), saved.reason)

check('savingsCoverage(600, 1200)', 0.5, savingsCoverage('600', 1200))
check('savingsCoverage caps at 1', 1, savingsCoverage('5000', 1200))
check('savingsCoverage("", 1200) is unanswered', null, savingsCoverage('', 1200))
check('savingsCoverage("0", 1200) is answered', 0, savingsCoverage('0', 1200))
check('savingsCoverage with no price is unanswered', null, savingsCoverage('100', null))

console.log('\n— Affordability cannot be bypassed —\n')

const bigBuy = (extra) => ({
  canWait: false, fomo: false,
  usage: 'Daily', currentAge: '3+ years old', productivity: 5, researched: 'Thoroughly',
  ...extra,
})

const honestBig = run('tech', bigBuy({ price: price('1200', 'full', '€700+', '0') }))
const withheldBig = run('tech', bigBuy({ price: price('1200', 'full', 'Rather not say') }))
const skippedBig = run('tech', bigBuy({}), { skipped: ['price'] })

check('Unaffordable buy, answered honestly → NO', 'NO', honestBig.verdict, `score ${honestBig.score}`)
check('Same buy, budget withheld → still NO', 'NO', withheldBig.verdict, `score ${withheldBig.score}`)
check('Withholding never beats answering', true, withheldBig.score <= honestBig.score,
  `withheld ${withheldBig.score} <= honest ${honestBig.score}`)

check('Skipped price → NO', 'NO', skippedBig.verdict, `score ${skippedBig.score}`)
check('Skipped price → says why', true, /without a price/i.test(skippedBig.reason), skippedBig.reason)
check('Skipping never beats answering', true, skippedBig.score <= 50,
  `skipped ${skippedBig.score}`)

// A modest purchase with the budget withheld is still allowed to be a YES.
const smallWithheld = run('tech', bigBuy({ price: price('40', 'full', 'Rather not say') }))
check('Small buy, budget withheld → YES still possible', 'YES', smallWithheld.verdict,
  `score ${smallWithheld.score}`)

// Savings still work through the withheld path, but with capped upside.
const savedWithheld = run('tech', bigBuy({ price: price('1200', 'full', 'Rather not say', '1200') }))
const savedHonest = run('tech', bigBuy({ price: price('1200', 'full', '€700+', '1200') }))
check('Savings still count when budget withheld', 'YES', savedWithheld.verdict, `score ${savedWithheld.score}`)
check('Best-case assumption cannot outscore the truth', true, savedWithheld.score <= savedHonest.score,
  `withheld ${savedWithheld.score} <= honest ${savedHonest.score}`)

console.log('\n— Savings prompt threshold —\n')
check('€12 lunch is never asked', false, shouldAskAboutSavings(12, 'Under €100'))
check('€40 on a big budget is not asked', false, shouldAskAboutSavings(40, '€700+'))
check('€1200 laptop is asked', true, shouldAskAboutSavings(1200, '€700+'))
check('€80 on a small budget is asked', true, shouldAskAboutSavings(80, '€100–300'))
check('band withheld: €100 not asked', false, shouldAskAboutSavings(100, 'Rather not say'))
check('band withheld: €200 asked', true, shouldAskAboutSavings(200, 'Rather not say'))

console.log('\n— Price parsing —\n')
check('parsePrice("149")', 149, parsePrice('149'))
check('parsePrice("€1,299.99")', 1299.99, parsePrice('€1,299.99'))
check('parsePrice("1.299,99")', 1299.99, parsePrice('1.299,99'))
check('parsePrice("")', null, parsePrice(''))
check('parsePrice("abc")', null, parsePrice('abc'))

console.log('\n— Classifier —\n')
check('"Sony WH-1000XM5 headphones" → tech', 'tech', classifyProduct('Sony WH-1000XM5 headphones').category)
check('"bottle of red wine" → alcohol', 'alcohol', classifyProduct('bottle of red wine').category)
check('"lottery tickets" → gambling', 'gambling', classifyProduct('lottery tickets').category)
check('"elf bar" → vape', 'vape', classifyProduct('elf bar').category)
check('"running shoes" → fitness', 'fitness', classifyProduct('running shoes').category)
check('"a whatsit thingamajig" → other', 'other', classifyProduct('a whatsit thingamajig').category)
check('unknown input → low confidence', 'low', classifyProduct('a whatsit thingamajig').confidence)
check('wine is PG18', true, classifyProduct('wine').isPG18)
check('laptop is not PG18', false, classifyProduct('laptop').isPG18)

console.log('\n— Everyday essentials —\n')

for (const product of ['milk', '2 litres of milk', 'oat milk', 'eggs', 'bread', 'rice', 'groceries']) {
  check(`"${product}" is an essential`, true, classifyProduct(product).isEssential)
}
for (const product of ['milk chocolate', 'pizza', 'eggs benedict at brunch', 'coffee', 'laptop', 'wine']) {
  check(`"${product}" is not an essential`, false, classifyProduct(product).isEssential)
}
check('"rice cooker" → home, not food', 'home', classifyProduct('rice cooker').category)
check('"bread maker" → home, not food', 'home', classifyProduct('bread maker').category)

const essentialIds = getQuestionsForCategory('food', { essential: true }).map((q) => q.id)
check('Essentials ask exactly 3 questions', 'healthy,alternatives,price', essentialIds.join(','))
check('Non-essential food still asks 7', 7, getQuestionsForCategory('food').length)
check('Essentials price screen hides instalments', false,
  getQuestionsForCategory('food', { essential: true }).find((q) => q.id === 'price').instalments)

const { initialState, quizReducer } = useQuizReducer()
const milkQuiz = quizReducer(
  { ...initialState, originalProduct: 'milk' },
  { type: 'SET_CLASSIFICATION', classification: classifyProduct('milk') },
)
check('Typing "milk" starts a 3-question quiz', 3, milkQuiz.questions.length, `phase ${milkQuiz.phase}`)
const pizzaQuiz = quizReducer(
  { ...initialState, originalProduct: 'pizza' },
  { type: 'SET_CLASSIFICATION', classification: classifyProduct('pizza') },
)
check('Typing "pizza" still starts the full quiz', 7, pizzaQuiz.questions.length)

const milk = run('food', {
  price: price('1.29', null, 'Under €100'),
  healthy: 4,
  alternatives: false,
}, { essential: true })
check('Ordinary milk run → YES', 'YES', milk.verdict, `score ${milk.score} — "${milk.reason}"`)
check('No payment signal when instalments were never offered', false,
  milk.breakdown.some((b) => b.label === 'Payment method'))

const pricyMilk = run('food', {
  price: price('40', null, 'Under €100'),
  healthy: 4,
  alternatives: false,
}, { essential: true })
check('Essentials still hit the affordability veto', 'NO', pricyMilk.verdict, `score ${pricyMilk.score}`)

console.log('\n— Product-specific questions —\n')

const detections = [
  ['iPhone 15 Pro', 'tech', 'phone'],
  ['Sony WH-1000XM5 headphones', 'tech', 'headphones'],
  ['AirPods Pro', 'tech', 'headphones'],
  ['PS5', 'tech', 'console'],
  ['MacBook Air', 'tech', 'computer'],
  ['iPad', 'tech', 'tablet'],
  ['Nike running shoes', 'fitness', 'gear'],
  ['gym membership', 'fitness', 'membership'],
  ['gym bag', 'fitness', 'gear'],
  ['winter coat', 'fashion', 'outerwear'],
  ['standing desk', 'home', 'furniture'],
  ['air fryer', 'home', 'appliance'],
  ['pizza', 'food', 'takeaway'],
  ['milk', 'food', 'staple'],
  ['milk chocolate', 'food', 'treat'],
  ['acoustic guitar', 'hobby', 'instrument'],
  ['LEGO Millennium Falcon', 'hobby', 'collectible'],
  ['new car', 'auto', 'car'],
  ['red wine', 'alcohol', 'wine'],
  ['lottery tickets', 'gambling', 'lottery'],
  ['elf bar', 'vape', 'disposable'],
  ['a whatsit thingamajig', 'other', null],
]
for (const [product, category, type] of detections) {
  const result = classifyProduct(product)
  check(`"${product}" → ${category}/${type}`, `${category}/${type}`, `${result.category}/${result.productType}`)
}

const phoneLabels = getQuestionsForCategory('tech', { productType: 'phone' }).map((q) => q.label)
check('Phone quiz names the phone', true, phoneLabels.filter((l) => /phone/.test(l)).length >= 6,
  phoneLabels.join(' | '))
check('Untyped quiz still reads naturally', 'What does it cost? Paying in full or in instalments?',
  getQuestionsForCategory('other').find((q) => q.id === 'price').label)

// Structural invariants over every category × product type × question.
const universalIds = ['price', 'canWait', 'fomo']
let badKeys = [], badText = [], unscorable = [], idDrift = []
const textOf = (q) => [q.label, ...(q.phrases ?? [])]
for (const category of CATEGORIES) {
  const baseQuestions = getQuestionsForCategory(category)
  const validIds = baseQuestions.map((q) => q.id)
  for (const type of [null, ...(PRODUCT_TYPES[category] ?? [])]) {
    if (type) {
      for (const id of Object.keys(type.questions)) {
        if (!validIds.includes(id) || id === 'price') badKeys.push(`${category}/${type.id}.${id}`)
      }
      if (/^(these|those)\b/i.test(type.item)) badText.push(`${category}/${type.id} item "${type.item}"`)
    }
    for (const essential of category === 'food' ? [false, true] : [false]) {
      const questions = getQuestionsForCategory(category, { productType: type?.id, essential })
      for (const q of questions) {
        const base = baseQuestions.find((b) => b.id === q.id)
        if (q.type !== base.type || JSON.stringify(q.options) !== JSON.stringify(base.options)) {
          idDrift.push(`${category}/${type?.id}.${q.id}`)
        }
        for (const text of textOf(q)) {
          if (/[{}]/.test(text) || /^[a-z]/.test(text) && text === q.label) {
            badText.push(`${category}/${type?.id}.${q.id}: "${text}"`)
          }
        }
        if (q.phrases && q.phrases.length !== 2) badText.push(`${category}/${type?.id}.${q.id} phrases`)
        if (universalIds.includes(q.id)) continue
        const values = q.type === 'choice' ? q.options : q.type === 'yesno' ? [true, false] : [1, 2, 3, 4, 5]
        for (const value of values) {
          const result = scoreQuiz({ category, questions, answers: { [q.id]: value } })
          if (result.breakdown.length !== 1) unscorable.push(`${category}/${type?.id}.${q.id}=${value}`)
        }
      }
    }
  }
}
check('Every override targets a real, non-price question', 0, badKeys.length, badKeys.join(', '))
check('No unresolved placeholders, lowercase labels or plural items', 0, badText.length, badText.join(' | '))
check('Rewording never changes a question type or its options', 0, idDrift.length, idDrift.join(', '))
check('Every answer to every reworded question still scores', 0, unscorable.length, unscorable.slice(0, 5).join(', '))

// Rewording that changes an answer's meaning brings its own reason.
const headphonesQuiz = getQuestionsForCategory('tech', { productType: 'headphones' })
const headphones = scoreQuiz({
  category: 'tech',
  questions: headphonesQuiz,
  answers: {
    price: price('60', 'full', '€700+'),
    canWait: false, fomo: false,
    usage: 'Daily', currentAge: '3+ years old', productivity: 5, researched: 'Thoroughly',
  },
})
check('Headphones reason talks about sound, not productivity', true,
  headphones.breakdown.some((b) => b.label === 'Day-to-day difference') &&
  !headphones.breakdown.some((b) => b.label === 'Productivity boost'),
  headphones.breakdown.map((b) => b.label).join(', '))
const phoneQuiz = getQuestionsForCategory('tech', { productType: 'phone' })
const phoneNo = scoreQuiz({
  category: 'tech',
  questions: phoneQuiz,
  answers: {
    price: price('1200', 'full', '€700+', '1200'),
    canWait: true, fomo: true,
    usage: 'Rarely', currentAge: 'New', productivity: 1, researched: 'Not at all',
  },
})
check('Phone override phrase reaches the verdict reason', true,
  phoneNo.breakdown.some((b) => b.label === 'Current phone holds you back'), phoneNo.reason)
check('Wording does not change scores', run('tech', {
  price: price('1200', 'full', '€700+', '1200'), canWait: true, fomo: true,
  usage: 'Rarely', currentAge: 'New', productivity: 1, researched: 'Not at all',
}).score, phoneNo.score)

const wineQuiz = quizReducer(
  { ...initialState, originalProduct: 'red wine' },
  { type: 'SET_CLASSIFICATION', classification: classifyProduct('red wine') },
)
const adultWine = quizReducer(wineQuiz, { type: 'CONFIRM_AGE', isAdult: true })
check('Adult-confirmed wine quiz is worded for wine', true,
  adultWine.questions.some((q) => /wine/.test(q.label)))
const kidWine = quizReducer(wineQuiz, { type: 'CONFIRM_AGE', isAdult: false })
check('Prank mode stays generic', false, kidWine.questions.some((q) => /wine/.test(q.label)))

console.log(`\n${failures === 0 ? '✅ All checks passed' : `❌ ${failures} check(s) failed`}\n`)
process.exit(failures === 0 ? 0 : 1)
