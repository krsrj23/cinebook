import { useEffect, useState } from 'react'
import { adminCreateMovie, adminDeleteMovie, adminGetMovies, adminUpdateMovie } from '../../api/admin'
import { getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import { formatDate, formatDuration } from '../../utils/format'

const EMPTY_FORM = {
  title: '',
  description: '',
  genre: '',
  language: '',
  durationMinutes: '',
  posterUrl: '',
  releaseDate: '',
}

export default function ManageMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    setError('')
    adminGetMovies()
      .then(setMovies)
      .catch((err) => setError(getErrorMessage(err, 'Could not load movies.')))
      .finally(() => setLoading(false))
  }

  function openCreate() {
    setEditingMovie(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(movie) {
    setEditingMovie(movie)
    setForm({
      title: movie.title ?? '',
      description: movie.description ?? '',
      genre: movie.genre ?? '',
      language: movie.language ?? '',
      durationMinutes: movie.durationMinutes ?? '',
      posterUrl: movie.posterUrl ?? '',
      releaseDate: movie.releaseDate ?? '',
    })
    setFormError('')
    setModalOpen(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = { ...form, durationMinutes: Number(form.durationMinutes) }
    try {
      if (editingMovie) {
        const updated = await adminUpdateMovie(editingMovie.id, payload)
        setMovies((prev) => prev.map((m) => (m.id === editingMovie.id ? updated : m)))
      } else {
        const created = await adminCreateMovie(payload)
        setMovies((prev) => [created, ...prev])
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save this movie.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(movie) {
    if (!window.confirm(`Delete "${movie.title}"? This cannot be undone.`)) return
    setDeletingId(movie.id)
    setError('')
    try {
      await adminDeleteMovie(movie.id)
      setMovies((prev) => prev.filter((m) => m.id !== movie.id))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this movie.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cinema-50">Movies</h2>
        <button type="button" onClick={openCreate} className="btn-primary">
          + Add Movie
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading movies…" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : movies.length === 0 ? (
        <EmptyState icon="🎬" title="No movies yet" message="Add your first movie to get started." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-cinema-700 text-xs uppercase tracking-wide text-cinema-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Genre</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Release date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cinema-800">
              {movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-cinema-800/40">
                  <td className="px-4 py-3 font-medium text-cinema-100">{movie.title}</td>
                  <td className="px-4 py-3 text-cinema-400">{movie.genre}</td>
                  <td className="px-4 py-3 text-cinema-400">{movie.language}</td>
                  <td className="px-4 py-3 text-cinema-400">{formatDuration(movie.durationMinutes)}</td>
                  <td className="px-4 py-3 text-cinema-400">{formatDate(movie.releaseDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEdit(movie)} className="btn-secondary !px-3 !py-1.5 text-xs">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(movie)}
                        disabled={deletingId === movie.id}
                        className="btn-danger !px-3 !py-1.5 text-xs"
                      >
                        {deletingId === movie.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen ? (
        <Modal title={editingMovie ? 'Edit Movie' : 'Add Movie'} onClose={() => setModalOpen(false)}>
          <ErrorMessage message={formError} />
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="title">
                Title
              </label>
              <input id="title" name="title" required value={form.title} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="input resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="genre">
                  Genre
                </label>
                <input id="genre" name="genre" required value={form.genre} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="language">
                  Language
                </label>
                <input
                  id="language"
                  name="language"
                  required
                  value={form.language}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="durationMinutes">
                  Duration (minutes)
                </label>
                <input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min="1"
                  required
                  value={form.durationMinutes}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="releaseDate">
                  Release date
                </label>
                <input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  required
                  value={form.releaseDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="posterUrl">
                Poster URL
              </label>
              <input
                id="posterUrl"
                name="posterUrl"
                value={form.posterUrl}
                onChange={handleChange}
                className="input"
                placeholder="https://…"
              />
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : editingMovie ? 'Save changes' : 'Add movie'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
