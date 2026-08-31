import { useEffect, useState } from 'react'

function getRemainingSeconds(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.floor(diff / 1000))
}

/**
 * Countdown to `expiresAt` (an ISO datetime string). Calls `onExpire` once
 * the timer reaches zero.
 */
export default function CountdownTimer({ expiresAt, onExpire, className = '' }) {
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(expiresAt))

  useEffect(() => {
    setRemaining(getRemainingSeconds(expiresAt))
    const interval = setInterval(() => {
      setRemaining(getRemainingSeconds(expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  useEffect(() => {
    if (remaining === 0 && onExpire) {
      onExpire()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isUrgent = remaining <= 60

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold ${
        isUrgent
          ? 'border-marquee-red/50 bg-marquee-red/10 text-red-300 animate-pulse'
          : 'border-gold-400/40 bg-gold-400/10 text-gold-300'
      } ${className}`}
    >
      <span aria-hidden="true">⏱</span>
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="hidden font-sans font-normal text-cinema-400 sm:inline">seats held</span>
    </div>
  )
}
