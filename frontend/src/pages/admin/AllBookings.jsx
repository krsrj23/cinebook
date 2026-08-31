import { useEffect, useMemo, useState } from 'react'
import { adminGetBookings } from '../../api/admin'
import { getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import { formatCurrency, formatDateTime } from '../../utils/format'

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED']

export default function AllBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    setError('')
    adminGetBookings()
      .then(setBookings)
      .catch((err) => setError(getErrorMessage(err, 'Could not load bookings.')))
      .finally(() => setLoading(false))
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return bookings
      .filter((b) => statusFilter === 'ALL' || b.status === statusFilter)
      .filter(
        (b) =>
          !term ||
          b.customerName?.toLowerCase().includes(term) ||
          b.customerEmail?.toLowerCase().includes(term) ||
          b.movieTitle?.toLowerCase().includes(term),
      )
      .sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime))
  }, [bookings, statusFilter, search])

  if (loading) return <LoadingSpinner label="Loading bookings…" />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-cinema-50">All Bookings</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or movie…"
            className="input sm:w-64"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input sm:w-40">
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎟️" title="No bookings found" message="Try a different search or filter." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-cinema-700 text-xs uppercase tracking-wide text-cinema-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Movie</th>
                <th className="px-4 py-3">Venue / Hall</th>
                <th className="px-4 py-3">Show time</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-800">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-cinema-800/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-cinema-100">{booking.customerName}</p>
                    <p className="text-xs text-cinema-500">{booking.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-cinema-300">{booking.movieTitle}</td>
                  <td className="px-4 py-3 text-cinema-400">
                    {booking.venueName} ({booking.hallName})
                  </td>
                  <td className="px-4 py-3 text-cinema-400">{formatDateTime(booking.showDateTime)}</td>
                  <td className="px-4 py-3 text-cinema-400">{booking.seatNumbers?.join(', ')}</td>
                  <td className="px-4 py-3 font-medium text-gold-300">{formatCurrency(booking.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
