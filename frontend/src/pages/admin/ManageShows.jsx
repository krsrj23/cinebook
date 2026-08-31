import { useEffect, useMemo, useState } from 'react'
import { adminCreateShow, adminDeleteShow, adminGetShows, adminGetVenues } from '../../api/admin'
import { getMovies } from '../../api/movies'
import { getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import EmptyState from '../../components/EmptyState'
import { formatCurrency, formatDateTime } from '../../utils/format'

const EMPTY_FORM = { movieId: '', hallId: '', showDateTime: '', basePrice: '' }

export default function ManageShows() {
  const [shows, setShows] = useState([])
  const [movies, setMovies] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    setError('')
    Promise.all([adminGetShows(), getMovies(), adminGetVenues()])
      .then(([showData, movieData, venueData]) => {
        setShows(showData)
        setMovies(movieData)
        setVenues(venueData)
      })
      .catch((err) => setError(getErrorMessage(err, 'Could not load shows.')))
      .finally(() => setLoading(false))
  }

  const hallOptions = useMemo(() => {
    const options = []
    for (const venue of venues) {
      for (const hall of venue.halls ?? []) {
        options.push({ id: hall.id, label: `${venue.name} — ${hall.name}` })
      }
    }
    return options
  }, [venues])

  function movieTitleFor(show) {
    return show.movieTitle ?? movies.find((m) => m.id === show.movieId)?.title ?? `Movie #${show.movieId}`
  }

  function hallLabelFor(show) {
    if (show.venueName || show.hallName) return `${show.venueName ?? ''}${show.hallName ? ` — ${show.hallName}` : ''}`
    const found = hallOptions.find((h) => h.id === show.hallId)
    return found?.label ?? `Hall #${show.hallId}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setCreating(true)
    setFormError('')
    try {
      const created = await adminCreateShow({
        movieId: Number(form.movieId),
        hallId: Number(form.hallId),
        showDateTime: form.showDateTime,
        basePrice: Number(form.basePrice),
      })
      setShows((prev) => [created, ...prev])
      setForm(EMPTY_FORM)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not create this show.'))
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(show) {
    if (!window.confirm(`Delete this show (${movieTitleFor(show)})?`)) return
    setDeletingId(show.id)
    setError('')
    try {
      await adminDeleteShow(show.id)
      setShows((prev) => prev.filter((s) => s.id !== show.id))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this show.'))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading shows…" />

  return (
    <div>
      <div className="card mb-6 p-5">
        <h2 className="mb-4 text-lg font-semibold text-cinema-50">Schedule a Show</h2>
        <ErrorMessage message={formError} />
        <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="movieId">
              Movie
            </label>
            <select
              id="movieId"
              required
              value={form.movieId}
              onChange={(e) => setForm((f) => ({ ...f, movieId: e.target.value }))}
              className="input"
            >
              <option value="" disabled>
                Select movie
              </option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="hallId">
              Hall
            </label>
            <select
              id="hallId"
              required
              value={form.hallId}
              onChange={(e) => setForm((f) => ({ ...f, hallId: e.target.value }))}
              className="input"
            >
              <option value="" disabled>
                Select hall
              </option>
              {hallOptions.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="showDateTime">
              Date &amp; time
            </label>
            <input
              id="showDateTime"
              type="datetime-local"
              required
              value={form.showDateTime}
              onChange={(e) => setForm((f) => ({ ...f, showDateTime: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="basePrice">
              Base price (₹)
            </label>
            <input
              id="basePrice"
              type="number"
              min="1"
              step="1"
              required
              value={form.basePrice}
              onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
              className="input"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" disabled={creating || hallOptions.length === 0} className="btn-primary">
              {creating ? 'Creating…' : 'Create Show'}
            </button>
            {hallOptions.length === 0 ? (
              <span className="ml-3 text-xs text-cinema-500">Add a venue and hall first.</span>
            ) : null}
          </div>
        </form>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-cinema-50">Scheduled Shows</h2>
      {error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : shows.length === 0 ? (
        <EmptyState icon="🗓️" title="No shows scheduled" message="Create a show using the form above." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-cinema-700 text-xs uppercase tracking-wide text-cinema-500">
              <tr>
                <th className="px-4 py-3">Movie</th>
                <th className="px-4 py-3">Venue / Hall</th>
                <th className="px-4 py-3">Date &amp; time</th>
                <th className="px-4 py-3">Base price</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-800">
              {shows
                .slice()
                .sort((a, b) => new Date(a.showDateTime) - new Date(b.showDateTime))
                .map((show) => (
                  <tr key={show.id} className="hover:bg-cinema-800/40">
                    <td className="px-4 py-3 font-medium text-cinema-100">{movieTitleFor(show)}</td>
                    <td className="px-4 py-3 text-cinema-400">{hallLabelFor(show)}</td>
                    <td className="px-4 py-3 text-cinema-400">{formatDateTime(show.showDateTime)}</td>
                    <td className="px-4 py-3 text-cinema-400">{formatCurrency(show.basePrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(show)}
                          disabled={deletingId === show.id}
                          className="btn-danger !px-3 !py-1.5 text-xs"
                        >
                          {deletingId === show.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
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
