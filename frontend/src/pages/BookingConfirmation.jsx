import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { confirmBooking, getBooking } from '../api/bookings'
import { getErrorMessage } from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import CountdownTimer from '../components/CountdownTimer'
import { formatCurrency, formatDateTime } from '../utils/format'

const PAYMENT_METHODS = [
  { id: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'UPI', label: 'UPI', icon: '📱' },
]

export default function BookingConfirmation() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const holdState = location.state?.hold
  const showState = location.state?.show

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(!holdState)
  const [loadError, setLoadError] = useState('')

  const [method, setMethod] = useState('CARD')
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (holdState) return
    // Fallback for a page refresh: re-fetch the booking. expiresAt isn't part
    // of the booking DTO, so once the hold response is gone we can only
    // approximate the deadline from bookingTime + 5 minutes.
    setLoading(true)
    getBooking(bookingId)
      .then((data) => setBooking(data))
      .catch((err) => setLoadError(getErrorMessage(err, 'Could not load this booking.')))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const seats = holdState?.seats ?? []
  const totalAmount = holdState?.totalAmount ?? booking?.totalAmount
  const expiresAt = holdState?.expiresAt ?? (booking?.bookingTime ? addMinutes(booking.bookingTime, 5) : null)
  const movieTitle = showState?.movieTitle ?? booking?.movieTitle
  const venueLine = showState
    ? `${showState.venueName} (${showState.hallName}) · ${showState.city}`
    : booking
      ? `${booking.venueName} (${booking.hallName})`
      : ''
  const showDateTime = showState?.showDateTime ?? booking?.showDateTime

  async function handleConfirm() {
    setConfirming(true)
    setConfirmError('')
    try {
      const result = await confirmBooking(bookingId, method)
      setReceipt(result)
    } catch (err) {
      setConfirmError(getErrorMessage(err, 'Payment could not be completed. Your hold may have expired.'))
    } finally {
      setConfirming(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading booking…" />

  if (loadError) {
    return (
      <div className="container-page py-10">
        <ErrorMessage message={loadError} />
      </div>
    )
  }

  if (receipt) {
    return (
      <div className="container-page flex justify-center py-12">
        <div className="w-full max-w-lg">
          <div className="card overflow-hidden">
            <div className="flex flex-col items-center gap-2 bg-emerald-500/10 px-6 py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
                ✅
              </span>
              <h1 className="text-xl font-bold text-emerald-300">Booking confirmed!</h1>
              <p className="text-sm text-cinema-400">Your tickets are booked. Enjoy the show.</p>
            </div>

            <div className="flex flex-col gap-4 p-6">
              {movieTitle ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-cinema-500">Movie</p>
                  <p className="font-display text-lg font-semibold text-cinema-50">{movieTitle}</p>
                  {venueLine ? <p className="text-sm text-cinema-400">{venueLine}</p> : null}
                  {showDateTime ? <p className="text-sm text-cinema-400">{formatDateTime(showDateTime)}</p> : null}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 rounded-lg border border-cinema-700 bg-cinema-900/60 p-4 text-sm">
                <Detail label="Booking ID" value={`#${receipt.bookingId}`} />
                <Detail label="Status" value={receipt.status} />
                <Detail label="Transaction ID" value={receipt.transactionId} mono />
                <Detail label="Amount paid" value={formatCurrency(receipt.paidAmount)} />
                {seats.length > 0 ? (
                  <Detail label="Seats" value={seats.map((s) => s.seatNumber).join(', ')} span />
                ) : null}
              </div>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Link to="/my-bookings" className="btn-primary flex-1">
                  View my bookings
                </Link>
                <Link to="/" className="btn-secondary flex-1">
                  Book another movie
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page flex justify-center py-12">
      <div className="w-full max-w-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Complete your payment</h1>

        <div className="card p-6">
          {movieTitle ? (
            <div className="mb-5 border-b border-cinema-700 pb-5">
              <p className="font-display text-lg font-semibold text-cinema-50">{movieTitle}</p>
              {venueLine ? <p className="text-sm text-cinema-400">{venueLine}</p> : null}
              {showDateTime ? <p className="text-sm text-cinema-400">{formatDateTime(showDateTime)}</p> : null}
            </div>
          ) : null}

          {seats.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {seats.map((s) => (
                <span key={s.showSeatId} className="badge-gold">
                  {s.seatNumber} · {formatCurrency(s.price)}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mb-5 flex items-center justify-between rounded-lg border border-cinema-700 bg-cinema-900/60 px-4 py-3">
            <span className="text-sm text-cinema-400">Total amount</span>
            <span className="font-display text-xl font-bold text-gold-300">{formatCurrency(totalAmount)}</span>
          </div>

          {expiresAt ? (
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm text-cinema-400">Complete payment before</span>
              <CountdownTimer expiresAt={expiresAt} onExpire={() => setExpired(true)} />
            </div>
          ) : null}

          {expired ? (
            <div className="mb-4">
              <ErrorMessage message="Your seat hold has expired. Please go back and select seats again." />
            </div>
          ) : null}
          {confirmError ? (
            <div className="mb-4">
              <ErrorMessage message={confirmError} />
            </div>
          ) : null}

          <p className="label">Payment method</p>
          <div className="mb-6 grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={expired}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-4 py-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  method === m.id
                    ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                    : 'border-cinema-600 bg-cinema-900 text-cinema-300 hover:border-cinema-500'
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming || expired}
            className="btn-primary w-full"
          >
            {confirming ? 'Processing payment…' : `Pay ${formatCurrency(totalAmount)}`}
          </button>

          <p className="mt-3 text-center text-xs text-cinema-500">
            This is a mock payment — no real card or bank details are needed.
          </p>

          {expired ? (
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost mt-3 w-full">
              ← Choose seats again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value, mono = false, span = false }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <p className="text-xs uppercase tracking-wide text-cinema-500">{label}</p>
      <p className={`font-medium text-cinema-100 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}

function addMinutes(dateString, minutes) {
  const date = new Date(dateString)
  date.setMinutes(date.getMinutes() + minutes)
  return date.toISOString()
}
