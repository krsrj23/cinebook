export default function EmptyState({ icon = '🎬', title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cinema-700 bg-cinema-900/40 px-6 py-16 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-2 text-lg font-semibold text-cinema-100">{title}</h3>
      {message ? <p className="max-w-sm text-sm text-cinema-400">{message}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
