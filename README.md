# 🛒 ShouldIBuyIt

> *Should you buy it — or just pass? Let the quiz decide.*

ShouldIBuyIt is a gamified, AI-powered decision-making web app that helps you cut through the noise of impulsive buying. Answer a quick set of timed questions, and get a decisive **YES ✅** or **NO ❌** — no wishy-washy middle ground.

---

## 🎯 The Problem

You've been eyeing that product for days. Maybe it popped up in an ad. Maybe your friend has one. But do you *actually* need it — or is it just hype?

Most of us overthink purchases or, worse, buy impulsively and regret it. ShouldIBuyIt makes the decision fast, fun, and honest.

---

## ✨ Features

- **Timed Question Flow** — Each question comes with a 10-second countdown bar, pushing you to answer from the gut, not the wallet
- **Gamified UX** — Inspired by mystery quiz aesthetics; bold fonts, sliders, and yes/no buttons that feel satisfying to tap
- **AI-Powered Verdict** — Answers are processed by GPT to deliver a single, confident decision: Buy it or Pass
- **Buzzer Sound Effects** — A YES sounds like a game show win; a NO sounds like a buzzer — straight Steve Harvey energy 🎤
- **One-Line Reason** — The AI explains *why* in a single punchy sentence below the verdict
- **1–5 Necessity Slider** — A chunky, satisfying slider (à la Water Sort puzzle UI) for scale-based questions
- **Yes / No Quick Buttons** — Binary questions get clean, large tap targets

---

## 🧠 How It Works

1. User enters the product name/description
2. A series of questions are presented one by one, each with a **10-second timer bar**
3. Questions include:
   - On a scale of 1–5, how necessary is this product in your life right now?
   - What is the price? Are you paying in full or via EMI?
   - Could you buy this later without it affecting your life?
   - How much will this improve your productivity?
   - Have you wanted this for more than 2 weeks?
   - Are you buying this because of a sale/FOMO?
   - Do you already own something that does the same job?
4. Answers are sent to the AI via the OpenRouter API
5. A **YES ✅** or **NO ❌** verdict is returned with a one-line justification

---

## 🎨 Design Language

Inspired by casual mobile puzzle games (bold outlines, chunky UI, playful fonts):

- **Font style:** Bold, rounded, high-contrast — think game UI, not corporate SaaS
- **Color palette:** Warm beige background, coral/red accents, deep purple headers
- **Verdict screens:**
  - ✅ YES → Full-screen large **green box**, celebratory buzzer sound
  - ❌ NO → Full-screen large **red box**, elimination buzzer sound
- **Timer bar:** Wide, flat horizontal progress bar — large breadth, short height — depletes in 10 seconds
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
│   └── sounds/
│       ├── yes-buzzer.wav
│       └── no-buzzer.wav
├── src/
│   ├── components/
│   │   ├── QuestionCard.jsx       # Individual question with timer
│   │   ├── TimerBar.jsx           # 10-second countdown bar
│   │   ├── SliderInput.jsx        # 1–5 scale slider
│   │   ├── YesNoButtons.jsx       # Binary answer buttons
│   │   ├── VerdictScreen.jsx      # Final YES/NO display
│   │   └── ProductInput.jsx       # Initial product entry screen
│   ├── data/
│   │   └── questions.js           # Question list and types
│   │   ├── categoryKeywords.js    # Keyword dictionary for the classifier
│   │   └── themes.js              # Per-category gradient palettes
│   ├── hooks/
│   │   └── useQuizReducer.js      # Quiz state machine
│   ├── utils/
│   │   ├── classifier.js          # Offline product → category
│   │   └── scoring.js             # Deterministic verdict engine
│   ├── App.jsx
│   └── main.jsx
├── scripts/
│   └── verify-scoring.mjs         # Fixture checks for the scoring model
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/shouldibuyit.git
cd shouldibuyit

# Install dependencies
npm install

# Start the dev server — no configuration, no API key
npm run dev
```

> **No setup required.** The app ships with no environment variables and makes no network
> requests. It runs as a fully static site and works offline.

### Deploy to Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Deploy. No environment variables needed. SPA routing is handled by [`vercel.json`](vercel.json).

---

## 🔮 Roadmap

- [x] Product name input at the start
- [ ] Share verdict as image card
- [ ] History of past decisions (localStorage)
- [ ] Dark mode
- [ ] Mobile-first PWA support
- [ ] Leaderboard of most-passed products (fun social feature)

---

## 📄 License

MIT — do whatever you want with it, just don't buy things you don't need.

---

*Built solo with React + Tailwind. Powered by AI. Inspired by the eternal human struggle of resisting online shopping.*
