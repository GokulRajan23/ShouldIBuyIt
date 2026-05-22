export default function MultipleChoice({ options, disabled, onSelect }) {
  return (
    <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className="min-h-14 rounded-2xl border-3 border-purple bg-white px-4 py-3 text-base font-bold text-purple shadow-[3px_3px_0_#4a154b] transition-transform active:scale-95 disabled:opacity-50 hover:bg-coral/10"
        >
          {option}
        </button>
      ))}
    </div>
  )
}
