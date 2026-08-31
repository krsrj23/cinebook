import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-gold-300' : 'text-cinema-300 hover:text-cinema-50'
  }`

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cinema-800 bg-cinema-950/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-cinema-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-400 text-cinema-950">🎬</span>
          Cine<span className="text-gold-400">Book</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Movies
          </NavLink>
          {isAuthenticated && !isAdmin ? (
            <NavLink to="/my-bookings" className={navLinkClass}>
              My Bookings
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin" className={navLinkClass}>
              Admin Dashboard
            </NavLink>
          ) : null}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-cinema-400">
                Hi, <span className="text-cinema-100">{user?.name?.split(' ')[0]}</span>
              </span>
              <button type="button" onClick={handleLogout} className="btn-ghost">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-cinema-700 text-cinema-200 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-cinema-800 bg-cinema-950 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Movies
            </NavLink>
            {isAuthenticated && !isAdmin ? (
              <NavLink to="/my-bookings" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                My Bookings
              </NavLink>
            ) : null}
            {isAdmin ? (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Admin Dashboard
              </NavLink>
            ) : null}
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-cinema-800 pt-3">
            {isAuthenticated ? (
              <>
                <span className="px-3 text-sm text-cinema-400">
                  Signed in as <span className="text-cinema-100">{user?.name}</span>
                </span>
                <button type="button" onClick={handleLogout} className="btn-secondary w-full">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary w-full" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
