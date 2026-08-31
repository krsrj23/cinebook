import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getShow, getShowSeats } from '../api/shows'
import { holdSeats } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SeatMap from '../components/SeatMap'
import { formatCurrency, formatDateTime } from '../utils/format'

const MAX_SEATS = 8

export default function SeatSelection() {
  const { showId } = useParams()
  const navigate = useNavigate()

  const [show, setShow] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [holdError, setHoldError] = useState('')
  const [holding, setHolding] = useState(false)
  const [selectedSeatIds, setSelectedSeatIds] = useState(new Set())

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId])

  function load() {
    setLoading(true)
    setLoadError('')
    Promise.all([getShow(showId), getShowSeats(showId)])
      .then(([showData, seatData]) => {
        setShow(showData)
        setSeats(seatData.seats)
      })
      .catch((err) => setLoadError(getErrorMessage(err, 'Could not load seats for this show.')))
      .finally(() => setLoading(false))
  }

  function toggleSeat(seat) {
    setHoldError('')
    setSelectedSeatIds((prev) => {
      const next = new Set(prev)
      if (next.has(seat.showSeatId)) {
        next.delete(seat.showSeatId)
      } else {
        if (next.size >= MAX_SEATS) return prev
        next.add(seat.showSeatId)
      }
      return next
    })
  }

  const selectedSeats = useMemo(() => seats.filter((s) => selectedSeatIds.has(s.showSeatId)), [seats, selectedSeatIds])
  const total = selectedSeats.reduce((sum, s) => sum + Number(s.price), 0)

  async function handleHold() {
    if (selectedSeatIds.size === 0) return
    setHolding(true)
    setHoldError('')
    try {
      const result = await holdSeats({ showId: Number(showId), showSeatIds: [...selectedSeatIds] })
      navigate(`/bookings/${result.bookingId}/payment`, { state: { hold: result, show } })
    } catch (err) {
      setHoldError(getErrorMessage(err, 'Some of those seats were just taken. Please pick again.'))
      // Refresh seat statuses so the user sees what's actually still available.
      load()
      setSelectedSeatIds(new Set())
    } finally {
      setHolding(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading seat map…" />
  if (loadError) {
    return (
      <div className="container-page py-10">
        <ErrorMessage message={loadError} onRetry={load} />
      </div>
    )
  }
  if (!show) return null

  return (
    <div className="container-page py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-cinema-400 hover:text-cinema-100"
      >
        ← Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{show.movieTitle}</h1>
        <p className="mt-1 text-sm text-cinema-400">
          {show.venueName} ({show.hallName}) · {show.city} · {formatDateTime(show.showDateTime)}
        </p>
      </div>

      {holdError ? (
        <div className="mb-4">
          <ErrorMessage message={holdError} />
        </div>
      ) : null}

      <div className="card p-4 sm:p-8">
        <SeatMap seats={seats} selectedSeatIds={selectedSeatIds} onToggleSeat={toggleSeat} />
      </div>

      <div className="mt-6 flex flex-col items-stretch justify-between gap-4 rounded-xl border border-cinema-700 bg-cinema-850 p-4 sm:flex-row sm:items-center">
        <div className="text-sm text-cinema-400">
          <p>
            Max {MAX_SEATS} seats per booking. Selected:{' '}
            <span className="font-semibold text-cinema-100">{selectedSeats.length}</span>
          </p>
          <p className="text-lg font-bold text-gold-300">{formatCurrency(total)}</p>
        </div>
        <button
          type="button"
          onClick={handleHold}
          disabled={selectedSeatIds.size === 0 || holding}
          className="btn-primary sm:w-56"
        >
          {holding ? 'Holding seats…' : `Hold ${selectedSeatIds.size || ''} Seat${selectedSeatIds.size === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  )
}
