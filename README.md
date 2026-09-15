# 🛒 ShouldIBuyIt

> *Should you buy it — or just pass? Let the quiz decide.*

ShouldIBuyIt is a gamified web app for talking yourself out of impulse purchases. Answer seven timed questions and get a decisive **YES ✅** or **NO ❌** — no wishy-washy middle ground.

It used to ask an AI. Now it does the maths itself, in your browser, with no API key and no network calls.

**Live:** [should-i-buy-it-kappa.vercel.app](https://should-i-buy-it-kappa.vercel.app)

---

## 🎯 The Problem

You've been eyeing that product for days. Maybe it popped up in an ad. Maybe your friend has one. But do you *actually* need it — or is it just hype?

Most of us overthink purchases or, worse, buy impulsively and regret it. ShouldIBuyIt makes the decision fast, fun, and honest.

---

## ✨ Features

- **Timed question flow** — a countdown bar per question, sized to the work: 14s for a yes/no tap, 40s for the price screen
- **Category-aware questions** — a laptop and a bottle of wine get different questions; twelve categories, each with its own set
- **Runs entirely offline** — no API key, no backend, no network request, nothing to pay for
- **Deterministic verdicts** — the same answers always produce the same result, and you can see the arithmetic behind it
- **Shows its working** — tap "How we got here" to see every signal, its weight, and the final score out of 100
- **Age gate with a twist** — ask about something 18+, admit you're not, and the quiz pivots to a kid-safe substitute and judges that instead 🤡
- **Buzzer sound effects** — a YES sounds like a game show win; a NO sounds like a buzzer, straight Steve Harvey energy 🎤
- **Chunky tap targets** — thick sliders and big buttons, built for thumbs

---

## 🧠 How It Works

1. You type what you're thinking of buying.
2. A keyword classifier sorts it into one of twelve categories. If nothing wins clearly, you're shown a category picker rather than being guessed at.
3. Anything age-restricted (alcohol, vape, gambling) hits an age gate first.
4. You answer **seven questions** against a countdown: four specific to the category, plus three everyone gets — price, whether you could wait a month, and whether a sale or hype is driving it.
5. The scoring engine weighs every answer and returns **YES ✅** or **NO ❌** with a one-line reason built from whichever two signals mattered most.

A tech quiz, for example, asks how often you'll use it, how old your current one is, how much it helps your work, and how thoroughly you compared cheaper options — then the three universal questions.

Questions that time out are skipped, and a skipped question drops out of the maths entirely rather than counting as a neutral answer.

---

## 🎨 Design Language

Inspired by casual mobile puzzle games (bold outlines, chunky UI, playful fonts):

- **Font style:** Bold, rounded, high-contrast — think game UI, not corporate SaaS
- **Color palette:** Warm beige background, coral/red accents, deep purple headers
- **Verdict screens:**
  - ✅ YES → Full-screen large **green box**, celebratory buzzer sound
  - ❌ NO → Full-screen large **red box**, elimination buzzer sound
- **Timer bar:** Wide, flat horizontal progress bar — large breadth, short height. Duration scales with the input: 14s yes/no, 18s multiple choice, 20s slider, 40s for the price screen
- **Slider:** Thick pill-shaped track with a bold circular thumb (reference: Water Sort puzzle difficulty slider)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Styling | Tailwind CSS |
| Verdict engine | Local deterministic scoring (no API, no network) |
| Sound FX | HTML5 Audio API |
| State Management | React useState / useReducer |
| Deployment | Vercel (see below) |

---

## 🧮 Scoring Engine

This project runs **entirely in the browser**. There is no API key, no backend, and no
network request at runtime — it works offline and costs nothing to host.

The quiz collects only structured data (a price, two enums, booleans and 1–5 sliders), so the
verdict is arithmetic rather than a language model.

**`src/utils/scoring.js`** — weighted additive model:

- Every question maps to a scorer returning a contribution in `-1..+1`, plus a weight.
- Final score = weighted mean → mapped to `0–100`. Above 50 is YES; ties resolve to NO.
- Skipped questions contribute nothing **and** drop out of the denominator, so skipping
  never biases the result.
- Derived metrics: **affordability ratio** (price ÷ monthly disposable income) and
  **cost-per-use** (price ÷ projected lifetime uses).
- A **hard affordability veto** stops soft preference signals from carrying a purchase
  that costs over 40% of monthly disposable income.
- Risk priors push `gambling`, `vape` and `alcohol` toward NO.
- Fully deterministic — identical answers always produce an identical verdict.

All weights and bands live in one place (`WEIGHTS`, `BUDGET_BANDS`, `RISK_PRIORS`) so the
model can be re-tuned without touching logic.

**`src/utils/classifier.js`** — maps the typed product to one of 12 categories using a
keyword dictionary (`src/data/categoryKeywords.js`). When no category wins clearly, the app
shows a category picker instead of guessing.

Verify the model against its fixtures:

```bash
node scripts/verify-scoring.mjs
```

---

## 📁 Project Structure

```
shouldibuyit/
├── public/
│   ├── favicon.svg
│   └── sounds/
│       ├── yes-buzzer.wav
│       ├── no-buzzer.wav
│       └── prank-reveal.wav
├── src/
│   ├── components/
│   │   ├── ProductInput.jsx       # Opening screen — what are you buying?
│   │   ├── CategoryPicker.jsx     # Fallback when the classifier is unsure
│   │   ├── AgeGate.jsx            # 18+ check for restricted categories
│   │   ├── PrankReveal.jsx        # The kid-safe pivot 🤡
│   │   ├── QuestionCard.jsx       # One question + its timer
│   │   ├── TimerBar.jsx           # Countdown bar
│   │   ├── PriceInput.jsx         # Price, payment method, budget band
│   │   ├── SliderInput.jsx        # 1–5 scale slider
│   │   ├── YesNoButtons.jsx       # Binary answer buttons
│   │   ├── MultipleChoice.jsx     # Four-option questions
│   │   ├── LoadingScreen.jsx      # The suspense beat
│   │   ├── VerdictScreen.jsx      # YES/NO + reason + score breakdown
│   │   └── Background.jsx         # Per-category gradient mesh
│   ├── data/
│   │   ├── questionBanks.js       # Question sets for all 12 categories
│   │   ├── categoryKeywords.js    # Keyword dictionary for the classifier
│   │   └── themes.js              # Per-category gradient palettes
│   ├── hooks/
│   │   └── useQuizReducer.js      # Quiz state machine
│   ├── utils/
│   │   ├── classifier.js          # Offline product → category
│   │   └── scoring.js             # Deterministic verdict engine
│   ├── index.css
│   ├── App.jsx
│   └── main.jsx
├── scripts/
│   ├── generate-sounds.mjs        # Generates the buzzer .wav files
│   └── verify-scoring.mjs         # 31 fixture checks for the scoring model
├── vercel.json                    # SPA routing + security headers
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/GokulRajan23/ShouldIBuyIt.git
cd ShouldIBuyIt

# Install dependencies
npm install

# Start the dev server — no configuration, no API key
npm run dev
```

> **No setup required.** The app ships with no environment variables and makes no network
> requests. It runs as a fully static site and works offline.

### Deploy to Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Deploy. No environment variables needed.

[`vercel.json`](vercel.json) handles SPA routing and sets the security headers — a Content Security Policy, `X-Frame-Options`, `Referrer-Policy` and friends. The CSP pins `connect-src` to same-origin, which turns "this app makes no network calls" from a claim in a README into something the browser enforces.

---

## 🔮 Roadmap

- [x] Product name input at the start
- [x] Drop the API — run the verdict locally
- [x] Show the score breakdown behind each verdict
- [ ] Share verdict as image card
- [ ] History of past decisions (localStorage)
- [ ] Dark mode
- [ ] Mobile-first PWA support
- [ ] Leaderboard of most-passed products (fun social feature)

---

## 📄 License

MIT — do whatever you want with it, just don't buy things you don't need.

---

*Built solo with React + Tailwind. No AI at runtime, no API bills, no data leaving your browser. Inspired by the eternal human struggle of resisting online shopping.*
