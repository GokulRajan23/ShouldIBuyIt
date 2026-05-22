import { useMemo } from 'react'

const DEFAULT_COLORS = ['#FFD9C2', '#D9C9FF', '#C2F0E8']

function hexToRgba(hex, alpha) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? '')
  if (!m) return `rgba(220, 220, 220, ${alpha})`
  const v = m[1]
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Soft-edged colored zones via radial-gradient alpha falloff — gives the
// diffused-color "mesh" feel WITHOUT any CSS blur() filter. Static (no
// drift animation), so it costs the browser exactly one paint per resize.
function orbStyle(color) {
  const inner = hexToRgba(color, 0.55)
  const outer = hexToRgba(color, 0)
  return {
    background: `radial-gradient(circle at center, ${inner} 0%, ${outer} 70%)`,
  }
}

export default function Background({ colors }) {
  const [a, b, c] = useMemo(() => {
    if (!Array.isArray(colors) || colors.length < 3) return DEFAULT_COLORS
    return colors.slice(0, 3)
  }, [colors])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ contain: 'paint' }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #fbf6ee 0%, #f5e6d3 100%)' }}
      />
      <div
        className="absolute top-[-15vmin] left-[-15vmin] h-[60vmin] w-[60vmin]"
        style={orbStyle(a)}
      />
      <div
        className="absolute top-[20%] right-[-15vmin] h-[65vmin] w-[65vmin]"
        style={orbStyle(b)}
      />
      <div
        className="absolute bottom-[-20vmin] left-[20%] h-[70vmin] w-[70vmin]"
        style={orbStyle(c)}
      />
    </div>
  )
}
