import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import ErrorMessage from '../components/ErrorMessage'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/'

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await login(form)
      navigate(data.role === 'ADMIN' ? '/admin' : redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password.'))
    } finally {
      setSubmitting(false)
    }
  }

  function fillDemo(role) {
    if (role === 'admin') {
      setForm({ email: 'admin@cinebook.dev', password: 'Admin@123' })
    } else {
      setForm({ email: 'demo@cinebook.dev', password: 'Demo@123' })
    }
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-cinema-400">Log in to book your next show.</p>
          </div>

          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-cinema-700 bg-cinema-900/60 p-3 text-xs text-cinema-400">
            <p className="mb-2 font-semibold text-cinema-300">Try a demo account</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => fillDemo('customer')} className="btn-ghost flex-1 !py-1.5 text-xs">
                Customer
              </button>
              <button type="button" onClick={() => fillDemo('admin')} className="btn-ghost flex-1 !py-1.5 text-xs">
                Admin
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-cinema-400">
            New here?{' '}
            <Link to="/register" className="font-semibold text-gold-400 hover:text-gold-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
