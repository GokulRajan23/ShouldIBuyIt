export default function SliderInput({ min, max, value, onChange, disabled }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-purple bg-white text-3xl font-bold text-purple"
        aria-live="polite"
      >
        {value}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-thumb h-6 w-full max-w-sm cursor-pointer appearance-none rounded-full border-3 border-purple bg-purple/20 disabled:opacity-50"
        aria-label={`Scale from ${min} to ${max}`}
      />
      <div className="flex w-full max-w-sm justify-between text-sm font-semibold text-purple/70">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
