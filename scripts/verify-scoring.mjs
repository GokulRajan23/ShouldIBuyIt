// Fixture checks for the offline scoring engine. Plain node, no test framework.
//   node scripts/verify-scoring.mjs
import { scoreQuiz, parsePrice } from '../src/utils/scoring.js'
import { classifyProduct } from '../src/utils/classifier.js'
import { getQuestionsForCategory } from '../src/data/questionBanks.js'

let failures = 0

function check(name, expectation, actual, detail = '') {
  const ok = expectation === actual
  if (!ok) failures++
  const tag = ok ? 'PASS' : 'FAIL'
  console.log(`${ok ? '✅' : '❌'} ${tag}  ${name}`)
  if (!ok) console.log(`        expected ${expectation}, got ${actual} ${detail}`)
  else if (detail) console.log(`        ${detail}`)
}

const price = (amount, payment, budgetBand) => ({ amount, currency: '€', payment, budgetBand })

function run(category, answers, { skipped = [], prankMode = false } = {}) {
  return scoreQuiz({
    product: 'fixture',
    category,
    questions: getQuestionsForCategory(category),
    answers,
    skipped,
    prankMode,
  })
}

console.log('\n— Scoring fixtures —\n')

// 1. Obvious YES: cheap, daily use, old device, no duplicate, can't wait, no hype.
const yes = run('tech', {
  price: price('120', 'full', '€700+'),
  canWait: false,
  fomo: false,
  usage: 'Daily',
  currentAge: '3+ years old',
  productivity: 5,
  duplicate: false,
})
check('Obvious YES (cheap, daily, needed)', 'YES', yes.verdict, `score ${yes.score} — "${yes.reason}"`)

// 2. Obvious NO: expensive, rarely used, new device, duplicate, can wait, hype.
const no = run('tech', {
  price: price('1800', 'emi', 'Under €100'),
  canWait: true,
  fomo: true,
  usage: 'Rarely',
  currentAge: 'New',
  productivity: 1,
  duplicate: true,
})
check('Obvious NO (pricey, redundant, hype)', 'NO', no.verdict, `score ${no.score} — "${no.reason}"`)

// 3. Everything skipped → neutral 50 → NO, and no crash.
const allSkipped = run('other', {}, {
  skipped: ['necessity', 'usageFrequency', 'duplicate', 'lifestyleFit', 'price', 'canWait', 'fomo'],
})
check('All questions skipped → NO', 'NO', allSkipped.verdict, `score ${allSkipped.score}`)
check('All skipped → neutral score 50', 50, allSkipped.score)
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
  currentAge: '1–2 years old', productivity: 3, duplicate: false,
})
const b = run('tech', {
  price: price('300', 'full', '€300–700'),
  canWait: false, fomo: false, usage: 'Weekly',
  currentAge: '1–2 years old', productivity: 3, duplicate: false,
})
check('Deterministic (same in → same out)', JSON.stringify(a), JSON.stringify(b), `score ${a.score}`)

// 11. Skipping must not flip a clearly-positive verdict.
const partial = run('tech', {
  price: price('120', 'full', '€700+'),
  canWait: false,
  fomo: false,
  usage: 'Daily',
  duplicate: false,
}, { skipped: ['currentAge', 'productivity'] })
check('Skips do not bias a clear YES', 'YES', partial.verdict, `score ${partial.score}`)

// 12. "Rather not say" budget drops the affordability signal instead of guessing.
const noBudget = run('tech', {
  price: price('120', 'full', 'Rather not say'),
  canWait: false, fomo: false, usage: 'Daily',
  currentAge: '3+ years old', productivity: 5, duplicate: false,
})
check(
  'Budget withheld → affordability dropped',
  false,
  noBudget.breakdown.some((b) => b.label === 'Affordability'),
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
  duplicate: false,
})
check('Perfect answers but unaffordable → NO', 'NO', vetoed.verdict, `score ${vetoed.score} (veto)`)

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

console.log(`\n${failures === 0 ? '✅ All checks passed' : `❌ ${failures} check(s) failed`}\n`)
process.exit(failures === 0 ? 0 : 1)
