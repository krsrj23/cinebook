import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelBooking, getMyBookings } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { formatCurrency, formatDateTime } from '../utils/format'

const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
      <rect width="200" height="300" fill="#1f1b22"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#524a58" text-anchor="middle" dy=".3em">No Poster</text>
    </svg>
  `)

const CANCELLABLE = new Set(['PENDING', 'CONFIRMED'])

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    setError('')
    getMyBookings()
      .then(setBookings)
      .catch((err) => setError(getErrorMessage(err, 'Could not load your bookings.')))
      .finally(() => setLoading(false))
  }

  async function handleCancel(id) {
    setActionError('')
    setCancellingId(id)
    try {
      const result = await cancelBooking(id)
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: result.status } : b)))
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not cancel this booking.'))
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading your bookings…" />

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">My Bookings</h1>

      {error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No bookings yet"
          message="Once you book a show, it will show up here."
          action={
            <Link to="/" className="btn-primary">
              Browse movies
            </Link>
          }
        />
      ) : (
        <>
          {actionError ? (
            <div className="mb-4">
              <ErrorMessage message={actionError} />
            </div>
          ) : null}
          <div className="flex flex-col gap-4">
            {bookings
              .slice()
              .sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime))
              .map((booking) => (
                <div key={booking.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <img
                    src={booking.posterUrl || FALLBACK_POSTER}
                    alt={`${booking.movieTitle} poster`}
                    className="h-28 w-20 shrink-0 self-center rounded-md border border-cinema-700 object-cover sm:self-auto"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = FALLBACK_POSTER
                    }}
                  />

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-semibold text-cinema-50">{booking.movieTitle}</h2>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-1 text-sm text-cinema-400">
                      {booking.venueName} ({booking.hallName})
                    </p>
                    <p className="text-sm text-cinema-400">{formatDateTime(booking.showDateTime)}</p>
                    <p className="mt-2 text-sm">
                      <span className="text-cinema-500">Seats: </span>
                      <span className="font-medium text-cinema-100">{booking.seatNumbers?.join(', ')}</span>
                    </p>
                    <p className="text-xs text-cinema-500">Booked {formatDateTime(booking.bookingTime)}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="font-display text-lg font-bold text-gold-300">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                    {CANCELLABLE.has(booking.status) ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="btn-danger !px-3 !py-1.5 text-xs"
                      >
                        {cancellingId === booking.id ? 'Cancelling…' : 'Cancel booking'}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
