export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-marquee-red/40 bg-marquee-red/10 px-4 py-3 text-sm text-red-300">
      <div className="flex items-start gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="shrink-0 font-semibold text-gold-300 hover:text-gold-200">
          Retry
        </button>
      ) : null}
    </div>
  )
}
