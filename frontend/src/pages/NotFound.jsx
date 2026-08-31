import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">
        🎞️
      </span>
      <h1 className="text-3xl font-bold">Scene not found</h1>
      <p className="max-w-sm text-cinema-400">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to Home
      </Link>
    </div>
  )
}
