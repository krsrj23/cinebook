import { useEffect, useState } from 'react'
import { adminGetDashboard } from '../../api/admin'
import { getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import { formatCurrency } from '../../utils/format'

const CARDS = [
  { key: 'totalMovies', label: 'Total Movies', icon: '🎬', format: (v) => v },
  { key: 'totalShows', label: 'Total Shows', icon: '🗓️', format: (v) => v },
  { key: 'totalBookings', label: 'Total Bookings', icon: '🎟️', format: (v) => v },
  { key: 'totalRevenue', label: 'Total Revenue', icon: '💰', format: (v) => formatCurrency(v) },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    setError('')
    adminGetDashboard()
      .then(setStats)
      .catch((err) => setError(getErrorMessage(err, 'Could not load dashboard stats.')))
      .finally(() => setLoading(false))
  }

  if (loading) return <LoadingSpinner label="Loading dashboard…" />
  if (error) return <ErrorMessage message={error} onRetry={load} />

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => (
          <div key={card.key} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-cinema-400">{card.label}</p>
              <span className="text-xl" aria-hidden="true">
                {card.icon}
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-gold-300">
              {card.format(stats?.[card.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6 text-sm text-cinema-400">
        <p>
          Use the sidebar to manage movies, venues and halls, shows, and to review every booking made across the
          platform.
        </p>
      </div>
    </div>
  )
}
