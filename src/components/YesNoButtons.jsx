export default function YesNoButtons({ onSelect, disabled }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(true)}
        className="min-h-14 flex-1 rounded-2xl border-3 border-purple bg-verdict-yes px-6 py-4 text-xl font-bold text-white shadow-[4px_4px_0_#4a154b] transition-transform active:scale-95 disabled:opacity-50"
      >
        Yes
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(false)}
        className="min-h-14 flex-1 rounded-2xl border-3 border-purple bg-verdict-no px-6 py-4 text-xl font-bold text-white shadow-[4px_4px_0_#4a154b] transition-transform active:scale-95 disabled:opacity-50"
      >
        No
      </button>
    </div>
  )
}
