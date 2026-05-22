import { useEffect, useState, useRef } from 'react'

// Self-contained timer. The parent passes durationSeconds + onExpire and
// remounts via `key` when the question changes. We avoid driving parent
// re-renders entirely: the bar fill is a CSS animation (transform:scaleX),
// and the "Xs left" text ticks at 1 Hz locally inside this component.
export default function TimerBar({ durationSeconds, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    const expireTimer = setTimeout(() => {
      onExpireRef.current?.()
    }, durationSeconds * 1000)

    const tickTimer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)

    return () => {
      clearTimeout(expireTimer)
      clearInterval(tickTimer)
    }
  }, [durationSeconds])

  return (
    <div>
      <div
        className="h-4 w-full overflow-hidden rounded-full border-3 border-purple bg-beige/60"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={durationSeconds}
        aria-valuenow={secondsLeft}
        aria-label="Time remaining"
      >
        <div
          className="h-full origin-left rounded-full bg-coral"
          style={{
            animation: `timer-fill ${durationSeconds}s linear forwards`,
          }}
        />
      </div>
      <p className="mt-1 text-center text-xs font-semibold text-purple/60" aria-hidden="true">
        {secondsLeft}s left
      </p>
    </div>
  )
}
