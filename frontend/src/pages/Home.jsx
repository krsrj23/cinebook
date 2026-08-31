import { useEffect, useMemo, useState } from 'react'
import { getMovies } from '../api/movies'
import { getErrorMessage } from '../api/client'
import MovieCard from '../components/MovieCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('ALL')

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    setError('')
    getMovies()
      .then(setMovies)
      .catch((err) => setError(getErrorMessage(err, 'Could not load movies.')))
      .finally(() => setLoading(false))
  }

  const genres = useMemo(() => {
    const set = new Set(movies.map((m) => m.genre).filter(Boolean))
    return ['ALL', ...set]
  }, [movies])

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(search.trim().toLowerCase())
      const matchesGenre = genre === 'ALL' || m.genre === genre
      return matchesSearch && matchesGenre
    })
  }, [movies, search, genre])

  return (
    <div>
      <section className="border-b border-cinema-800 bg-gradient-to-b from-cinema-900/60 to-transparent">
        <div className="container-page py-12 sm:py-16">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">Now showing</p>
          <h1 className="max-w-2xl text-3xl font-extrabold sm:text-4xl">
            Book the best seats in the house, in a few clicks.
          </h1>
          <p className="mt-3 max-w-xl text-cinema-400">
            Browse what&apos;s playing, pick your show, choose your seats, and you&apos;re set.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cinema-500">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies by title…"
              className="input pl-9"
              aria-label="Search movies"
            />
          </div>
          {genres.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    genre === g
                      ? 'bg-gold-400 text-cinema-950'
                      : 'bg-cinema-800 text-cinema-300 hover:bg-cinema-700'
                  }`}
                >
                  {g === 'ALL' ? 'All genres' : g}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {loading ? (
          <LoadingSpinner fullPage label="Loading movies…" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎥"
            title="No movies found"
            message={search ? `No results for "${search}". Try a different search.` : 'Check back soon for showtimes.'}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
