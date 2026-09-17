// Fixture checks for the offline scoring engine. Plain node, no test framework.
//   node scripts/verify-scoring.mjs
import { scoreQuiz, parsePrice, shouldAskAboutSavings } from '../src/utils/scoring.js'
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

const price = (amount, payment, budgetBand, savedUp = null) => ({
  amount, currency: '€', payment, budgetBand, savedUp,
})

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
const techAnswers = (savedUp) => ({
  price: price('1200', 'full', '€700+', savedUp),
  canWait: false, fomo: false,
  usage: 'Daily', currentAge: '3+ years old', productivity: 5, researched: 'Thoroughly',
})

const saved = run('tech', techAnswers('All of it'))
check('Fully saved €1200 → YES', 'YES', saved.verdict, `score ${saved.score} — "${saved.reason}"`)

const unsaved = run('tech', techAnswers('None of it'))
check('Same buy, nothing saved → NO', 'NO', unsaved.verdict, `score ${unsaved.score}`)

const partlySaved = run('tech', techAnswers('Some of it'))
check('Same buy, some saved → still NO (but scores higher)', 'NO', partlySaved.verdict, `score ${partlySaved.score}`)

check('Saving strictly improves the score', true, saved.score > partlySaved.score && partlySaved.score > unsaved.score,
  `${unsaved.score} < ${partlySaved.score} < ${saved.score}`)

// Savings must not rescue a purchase that is absurd on every other axis.
const savedButPointless = run('tech', {
  price: price('1200', 'full', '€700+', 'All of it'),
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

console.log('\n— Affordability cannot be bypassed —\n')

const bigBuy = (extra) => ({
  canWait: false, fomo: false,
  usage: 'Daily', currentAge: '3+ years old', productivity: 5, researched: 'Thoroughly',
  ...extra,
})

const honestBig = run('tech', bigBuy({ price: price('1200', 'full', '€700+', 'None of it') }))
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
const savedWithheld = run('tech', bigBuy({ price: price('1200', 'full', 'Rather not say', 'All of it') }))
const savedHonest = run('tech', bigBuy({ price: price('1200', 'full', '€700+', 'All of it') }))
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

console.log(`\n${failures === 0 ? '✅ All checks passed' : `❌ ${failures} check(s) failed`}\n`)
process.exit(failures === 0 ? 0 : 1)
