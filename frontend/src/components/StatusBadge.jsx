const STATUS_STYLES = {
  CONFIRMED: 'badge-green',
  PENDING: 'badge-gold',
  CANCELLED: 'badge-gray',
  EXPIRED: 'badge-red',
}

export default function StatusBadge({ status }) {
  const className = STATUS_STYLES[status] || 'badge-gray'
  return <span className={className}>{status}</span>
}
