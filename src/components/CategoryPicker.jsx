import { CATEGORIES } from '../data/questionBanks.js'

const CATEGORY_META = {
  tech: { emoji: '💻', label: 'Tech' },
  fashion: { emoji: '👕', label: 'Fashion' },
  home: { emoji: '🛋️', label: 'Home' },
  food: { emoji: '🍕', label: 'Food' },
  fitness: { emoji: '🏋️', label: 'Fitness' },
  beauty: { emoji: '💄', label: 'Beauty' },
  auto: { emoji: '🚗', label: 'Auto' },
  hobby: { emoji: '🎸', label: 'Hobby' },
  alcohol: { emoji: '🍷', label: 'Alcohol' },
  gambling: { emoji: '🎰', label: 'Gambling' },
  vape: { emoji: '💨', label: 'Vape' },
  other: { emoji: '📦', label: 'Other' },
}

export default function CategoryPicker({ product, onPick }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-lg glass-card p-7 sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple/70">
          Help us out
        </p>
        <h2 className="mt-2 text-2xl font-bold text-purple sm:text-3xl">
          What kind of thing is “{product}”?
        </h2>
        <p className="mt-2 text-base font-medium text-purple/80">
          We couldn’t place it. Pick a category so we ask you the right questions.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category] ?? CATEGORY_META.other
            return (
              <button
                key={category}
                type="button"
                onClick={() => onPick(category)}
                className="flex min-h-12 flex-col items-center gap-1 rounded-2xl border-3 border-purple bg-white px-3 py-3 font-bold text-purple shadow-[3px_3px_0_#4a154b] transition-transform active:scale-95 hover:bg-beige"
              >
                <span aria-hidden="true" className="text-2xl">{meta.emoji}</span>
                <span className="text-sm">{meta.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
