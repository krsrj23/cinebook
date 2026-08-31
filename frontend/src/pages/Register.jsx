import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import ErrorMessage from '../components/ErrorMessage'

const EMPTY_FORM = { name: '', email: '', password: '', phone: '' }

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      // Auto-login right after registering so the flow feels seamless.
      await login({ email: form.email, password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your account.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-cinema-400">Join CineBook to start booking tickets.</p>
          </div>

          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Jordan Smith"
              />
            </div>
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
              <label className="label" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                required
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                className="input"
                placeholder="+91 98765 43210"
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
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-cinema-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gold-400 hover:text-gold-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
