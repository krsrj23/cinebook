import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/movies', label: 'Movies', icon: '🎬' },
  { to: '/admin/venues', label: 'Venues & Halls', icon: '🏛️' },
  { to: '/admin/shows', label: 'Shows', icon: '🗓️' },
  { to: '/admin/bookings', label: 'All Bookings', icon: '🎟️' },
]

export default function AdminLayout() {
  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">Admin</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Control Panel</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-400/15 text-gold-300 ring-1 ring-inset ring-gold-400/30'
                    : 'text-cinema-300 hover:bg-cinema-800'
                }`
              }
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
