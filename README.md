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
| AI / LLM | OpenRouter API (`openai/gpt-oss-120b:free`) |
| Sound FX | HTML5 Audio API |
| State Management | React useState / useReducer |
| Deployment | Vercel (see below) |

---

## 🔌 API Integration

This project uses the **OpenRouter API** to process user answers and generate the verdict.

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
**Model:** `openai/gpt-oss-120b:free`

The prompt sends all answers as structured context and instructs the model to respond with:
- A strict `YES` or `NO` (no maybes)
- A single sentence reason (max 20 words)

Example prompt structure:

```
You are a no-nonsense financial advisor. Based on the user's answers below, decide strictly YES (buy it) or NO (don't buy it). No middle ground. Reply in this JSON format: {"verdict": "YES" | "NO", "reason": "<one sentence max 20 words>"}

Answers:
- Necessity (1-5): 3
- Price: ₹4,500 (Full payment)
- Can it wait?: Yes
- Productivity improvement (1-5): 2
- Owned something similar?: Yes
- Buying due to FOMO?: Yes
- Wanted for 2+ weeks?: No
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
│   ├── hooks/
│   │   └── useTimer.js            # Timer logic
│   ├── utils/
│   │   └── aiVerdict.js           # OpenRouter API call
│   ├── App.jsx
│   └── main.jsx
├── .env                           # VITE_OPENROUTER_API_KEY=...
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

# Copy env template and add your OpenRouter key
cp .env.example .env
# Edit .env — set VITE_OPENROUTER_API_KEY=sk-or-...

# Start the dev server
npm run dev
```

> **API key note:** `VITE_` variables are embedded in the client bundle. This is fine for a personal MVP; do not use a key with billing limits you cannot afford.

### Deploy to Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add environment variable `VITE_OPENROUTER_API_KEY` in Project Settings → Environment Variables.
3. Deploy. SPA routing is handled by [`vercel.json`](vercel.json).

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
