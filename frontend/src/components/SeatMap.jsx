import { useMemo } from 'react'
import { formatCurrency } from '../utils/format'
import CountdownTimer from './CountdownTimer'

/**
 * Cinema-style seat grid.
 *
 * Props:
 * - seats: [{showSeatId, seatId, seatRow, seatNumber, seatType, price, status}]
 *     status is one of AVAILABLE | HELD | BOOKED, driven by the backend.
 * - selectedSeatIds: Set of showSeatId currently selected by this user (pre-hold).
 * - onToggleSeat(seat): called when a selectable seat is clicked.
 * - locked: true once a hold exists — seats can no longer be toggled, and the
 *     selected set instead reflects the held seats.
 * - holdExpiresAt: ISO datetime — when present, a countdown is shown.
 * - onHoldExpire: called when the hold countdown reaches zero.
 */
export default function SeatMap({
  seats,
  selectedSeatIds,
  onToggleSeat,
  locked = false,
  holdExpiresAt,
  onHoldExpire,
}) {
  const rows = useMemo(() => {
    const byRow = new Map()
    for (const seat of seats) {
      if (!byRow.has(seat.seatRow)) byRow.set(seat.seatRow, [])
      byRow.get(seat.seatRow).push(seat)
    }
    return [...byRow.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([row, rowSeats]) => [
        row,
        rowSeats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true })),
      ])
  }, [seats])

  const selectedSeats = useMemo(() => seats.filter((s) => selectedSeatIds.has(s.showSeatId)), [seats, selectedSeatIds])
  const runningTotal = selectedSeats.reduce((sum, s) => sum + Number(s.price), 0)
  const middleIndex = (rows.length - 1) / 2

  function seatClasses(seat) {
    const isSelected = selectedSeatIds.has(seat.showSeatId)
    const isPremium = seat.seatType === 'PREMIUM'
    const base =
      'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-t-md rounded-b-[3px] text-[10px] font-semibold transition-all duration-150 sm:h-9 sm:w-9 sm:text-xs'

    if (isSelected) {
      return `${base} bg-seat-selected text-cinema-950 shadow-glow scale-105 cursor-pointer`
    }
    if (seat.status === 'BOOKED') {
      return `${base} bg-seat-booked/40 text-cinema-500 cursor-not-allowed`
    }
    if (seat.status === 'HELD') {
      return `${base} bg-seat-held/30 text-gold-200/70 cursor-not-allowed`
    }
    // AVAILABLE
    const ring = isPremium ? 'ring-1 ring-inset ring-gold-400/60' : 'ring-1 ring-inset ring-cinema-600'
    return `${base} bg-cinema-800 text-cinema-300 hover:bg-emerald-600/30 hover:text-emerald-200 ${ring} cursor-pointer`
  }

  function handleClick(seat) {
    if (locked) return
    if (seat.status !== 'AVAILABLE' && !selectedSeatIds.has(seat.showSeatId)) return
    onToggleSeat(seat)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Screen */}
      <div className="flex w-full max-w-3xl flex-col items-center gap-1.5">
        <div
          className="h-2 w-full rounded-b-full bg-gradient-to-b from-gold-400/70 to-gold-400/5"
          style={{ boxShadow: '0 6px 24px -4px rgba(232,179,76,0.45)' }}
        />
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cinema-500">Screen</span>
      </div>

      <div className="w-full overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-max flex-col items-center gap-2 px-4">
          {rows.map(([row, rowSeats], idx) => {
            const distanceFromMiddle = Math.abs(idx - middleIndex)
            const curveOffset = Math.min(distanceFromMiddle * 3, 14)
            return (
              <div key={row} className="flex items-center gap-3" style={{ marginTop: idx === 0 ? 0 : `${0}px` }}>
                <span className="w-4 shrink-0 text-right text-xs font-semibold text-cinema-500">{row}</span>
                <div
                  className="flex gap-1.5 sm:gap-2"
                  style={{ transform: `translateY(${curveOffset}px)`, transition: 'transform 150ms' }}
                >
                  {rowSeats.map((seat) => (
                    <button
                      key={seat.showSeatId}
                      type="button"
                      title={`${seat.seatNumber} · ${seat.seatType === 'PREMIUM' ? 'Premium' : 'Regular'} · ${formatCurrency(seat.price)}${
                        seat.status !== 'AVAILABLE' ? ` · ${seat.status}` : ''
                      }`}
                      disabled={locked || (seat.status !== 'AVAILABLE' && !selectedSeatIds.has(seat.showSeatId))}
                      onClick={() => handleClick(seat)}
                      className={seatClasses(seat)}
                    >
                      {seat.seatNumber.replace(/^[A-Za-z]+/, '')}
                    </button>
                  ))}
                </div>
                <span className="w-4 shrink-0 text-xs font-semibold text-cinema-500">{row}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-cinema-400">
        <LegendSwatch className="bg-cinema-800 ring-1 ring-inset ring-cinema-600" label="Available" />
        <LegendSwatch className="bg-cinema-800 ring-1 ring-inset ring-gold-400/60" label="Available (Premium)" />
        <LegendSwatch className="bg-seat-selected" label="Selected" />
        <LegendSwatch className="bg-seat-held/30" label="Held by others" />
        <LegendSwatch className="bg-seat-booked/40" label="Booked" />
      </div>

      {/* Running total / countdown */}
      <div className="sticky bottom-0 flex w-full flex-col items-center gap-3 border-t border-cinema-800 bg-cinema-950/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cinema-500">Selected seats</p>
            <p className="text-sm font-medium text-cinema-100">
              {selectedSeats.length === 0
                ? 'None yet'
                : selectedSeats
                    .map((s) => s.seatNumber)
                    .sort()
                    .join(', ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {holdExpiresAt ? <CountdownTimer expiresAt={holdExpiresAt} onExpire={onHoldExpire} /> : null}
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-cinema-500">Total</p>
            <p className="font-display text-xl font-bold text-gold-300">{formatCurrency(runningTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendSwatch({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded-[3px] ${className}`} />
      {label}
    </span>
  )
}
