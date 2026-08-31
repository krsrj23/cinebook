import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMovie, getShowsForMovie } from '../api/movies'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import { formatCurrency, formatDate, formatDuration, formatTime } from '../utils/format'

const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="400" height="600" fill="#1f1b22"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#524a58" text-anchor="middle" dy=".3em">No Poster</text>
    </svg>
  `)

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function load() {
    setLoading(true)
    setError('')
    Promise.all([getMovie(id), getShowsForMovie(id)])
      .then(([movieData, showData]) => {
        setMovie(movieData)
        setShows(showData)
      })
      .catch((err) => setError(getErrorMessage(err, 'Could not load this movie.')))
      .finally(() => setLoading(false))
  }

  const groupedByVenue = useMemo(() => {
    const byVenue = new Map()
    for (const show of shows) {
      const key = `${show.venueName}__${show.city}`
      if (!byVenue.has(key)) byVenue.set(key, { venueName: show.venueName, city: show.city, byDate: new Map() })
      const venue = byVenue.get(key)
      const dateKey = formatDate(show.showDateTime)
      if (!venue.byDate.has(dateKey)) venue.byDate.set(dateKey, [])
      venue.byDate.get(dateKey).push(show)
    }
    return [...byVenue.values()].map((v) => ({
      ...v,
      byDate: [...v.byDate.entries()].sort(
        (a, b) => new Date(a[1][0].showDateTime) - new Date(b[1][0].showDateTime),
      ),
    }))
  }, [shows])

  function handleShowClick(show) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/shows/${show.id}/seats` } } })
      return
    }
    navigate(`/shows/${show.id}/seats`)
  }

  if (loading) return <LoadingSpinner fullPage label="Loading movie…" />
  if (error) {
    return (
      <div className="container-page py-10">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    )
  }
  if (!movie) return null

  return (
    <div className="container-page py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-cinema-400 hover:text-cinema-100">
        ← Back to movies
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <div className="mx-auto w-full max-w-xs md:mx-0">
          <img
            src={movie.posterUrl || FALLBACK_POSTER}
            alt={`${movie.title} poster`}
            className="aspect-[2/3] w-full rounded-xl border border-cinema-700 object-cover shadow-card"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = FALLBACK_POSTER
            }}
          />
        </div>

        <div>
          <span className="badge-gold">{movie.genre}</span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{movie.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cinema-400">
            <span>{movie.language}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDuration(movie.durationMinutes)}</span>
            <span aria-hidden="true">·</span>
            <span>Released {formatDate(movie.releaseDate)}</span>
          </div>
          <p className="mt-5 max-w-2xl leading-relaxed text-cinema-300">{movie.description}</p>

          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold">Showtimes</h2>
            {groupedByVenue.length === 0 ? (
              <EmptyState icon="🗓️" title="No shows scheduled" message="Check back later for showtimes." />
            ) : (
              <div className="flex flex-col gap-6">
                {groupedByVenue.map((venue) => (
                  <div key={`${venue.venueName}-${venue.city}`} className="card p-5">
                    <div className="mb-4 flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-cinema-50">{venue.venueName}</h3>
                      <span className="text-sm text-cinema-400">{venue.city}</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {venue.byDate.map(([date, dateShows]) => (
                        <div key={date}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cinema-500">{date}</p>
                          <div className="flex flex-wrap gap-2">
                            {dateShows
                              .sort((a, b) => new Date(a.showDateTime) - new Date(b.showDateTime))
                              .map((show) => {
                                const soldOut = show.availableSeats <= 0
                                return (
                                  <button
                                    key={show.id}
                                    type="button"
                                    disabled={soldOut}
                                    onClick={() => handleShowClick(show)}
                                    title={
                                      soldOut
                                        ? 'Sold out'
                                        : `${show.hallName} · ${show.availableSeats}/${show.totalSeats} seats left`
                                    }
                                    className="flex flex-col items-center gap-0.5 rounded-lg border border-cinema-600 bg-cinema-900 px-4 py-2 text-sm font-semibold text-cinema-100 transition-colors hover:border-gold-400 hover:text-gold-300 disabled:cursor-not-allowed disabled:border-cinema-800 disabled:bg-cinema-900/50 disabled:text-cinema-600"
                                  >
                                    <span>{formatTime(show.showDateTime)}</span>
                                    <span className="text-[10px] font-normal text-cinema-500">
                                      {soldOut ? 'Sold out' : formatCurrency(show.basePrice)}
                                    </span>
                                  </button>
                                )
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
