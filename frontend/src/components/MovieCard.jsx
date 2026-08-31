import { Link } from 'react-router-dom'
import { formatDate, formatDuration } from '../utils/format'

const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
      <rect width="400" height="600" fill="#1f1b22"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#524a58" text-anchor="middle" dy=".3em">No Poster</text>
    </svg>
  `)

export default function MovieCard({ movie }) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group card flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:border-gold-400/50"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-800">
        <img
          src={movie.posterUrl || FALLBACK_POSTER}
          alt={`${movie.title} poster`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = FALLBACK_POSTER
          }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cinema-950/90 to-transparent p-3 pt-8">
          <span className="badge-gold">{movie.genre}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 font-display text-base font-semibold text-cinema-50 group-hover:text-gold-300">
          {movie.title}
        </h3>
        <p className="text-xs text-cinema-400">
          {movie.language} · {formatDuration(movie.durationMinutes)}
        </p>
        <p className="mt-auto pt-2 text-xs text-cinema-500">In theatres {formatDate(movie.releaseDate)}</p>
      </div>
    </Link>
  )
}
