export default function LoadingSpinner({ label = 'Loading…', size = 'md', fullPage = false }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 text-cinema-300">
      <div
        className={`${sizes[size] ?? sizes.md} animate-spin rounded-full border-cinema-600 border-t-gold-400`}
        role="status"
        aria-label={label}
      />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  )

  if (fullPage) {
    return <div className="flex min-h-[50vh] w-full items-center justify-center py-24">{spinner}</div>
  }

  return spinner
}
