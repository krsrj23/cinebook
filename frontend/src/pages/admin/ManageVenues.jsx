import { useEffect, useState } from 'react'
import {
  adminAddHall,
  adminCreateVenue,
  adminDeleteHall,
  adminDeleteVenue,
  adminGetVenues,
  adminUpdateHall,
  adminUpdateVenue,
} from '../../api/admin'
import { getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'

const EMPTY_VENUE = { name: '', city: '', address: '' }
const EMPTY_HALL = { name: '', rows: '', seatsPerRow: '', premiumRows: '' }

export default function ManageVenues() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const [venueModalOpen, setVenueModalOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [venueForm, setVenueForm] = useState(EMPTY_VENUE)
  const [venueFormError, setVenueFormError] = useState('')
  const [savingVenue, setSavingVenue] = useState(false)
  const [deletingVenueId, setDeletingVenueId] = useState(null)

  const [hallModalOpen, setHallModalOpen] = useState(false)
  const [hallVenueId, setHallVenueId] = useState(null)
  const [editingHall, setEditingHall] = useState(null)
  const [hallForm, setHallForm] = useState(EMPTY_HALL)
  const [hallFormError, setHallFormError] = useState('')
  const [savingHall, setSavingHall] = useState(false)
  const [deletingHallId, setDeletingHallId] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    setError('')
    adminGetVenues()
      .then(setVenues)
      .catch((err) => setError(getErrorMessage(err, 'Could not load venues.')))
      .finally(() => setLoading(false))
  }

  // --- Venue CRUD ---
  function openCreateVenue() {
    setEditingVenue(null)
    setVenueForm(EMPTY_VENUE)
    setVenueFormError('')
    setVenueModalOpen(true)
  }

  function openEditVenue(venue) {
    setEditingVenue(venue)
    setVenueForm({ name: venue.name ?? '', city: venue.city ?? '', address: venue.address ?? '' })
    setVenueFormError('')
    setVenueModalOpen(true)
  }

  async function handleVenueSubmit(e) {
    e.preventDefault()
    setSavingVenue(true)
    setVenueFormError('')
    try {
      if (editingVenue) {
        const updated = await adminUpdateVenue(editingVenue.id, venueForm)
        setVenues((prev) => prev.map((v) => (v.id === editingVenue.id ? { ...v, ...updated } : v)))
      } else {
        const created = await adminCreateVenue(venueForm)
        setVenues((prev) => [{ ...created, halls: created.halls ?? [] }, ...prev])
      }
      setVenueModalOpen(false)
    } catch (err) {
      setVenueFormError(getErrorMessage(err, 'Could not save this venue.'))
    } finally {
      setSavingVenue(false)
    }
  }

  async function handleDeleteVenue(venue) {
    if (!window.confirm(`Delete "${venue.name}"? This removes its halls too.`)) return
    setDeletingVenueId(venue.id)
    setError('')
    try {
      await adminDeleteVenue(venue.id)
      setVenues((prev) => prev.filter((v) => v.id !== venue.id))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this venue.'))
    } finally {
      setDeletingVenueId(null)
    }
  }

  // --- Hall CRUD ---
  function openAddHall(venueId) {
    setHallVenueId(venueId)
    setEditingHall(null)
    setHallForm(EMPTY_HALL)
    setHallFormError('')
    setHallModalOpen(true)
  }

  function openEditHall(venueId, hall) {
    setHallVenueId(venueId)
    setEditingHall(hall)
    setHallForm({
      name: hall.name ?? '',
      rows: hall.rows ?? '',
      seatsPerRow: hall.seatsPerRow ?? '',
      premiumRows: hall.premiumRows ?? '',
    })
    setHallFormError('')
    setHallModalOpen(true)
  }

  async function handleHallSubmit(e) {
    e.preventDefault()
    setSavingHall(true)
    setHallFormError('')
    const payload = {
      name: hallForm.name,
      rows: Number(hallForm.rows),
      seatsPerRow: Number(hallForm.seatsPerRow),
      premiumRows: Number(hallForm.premiumRows),
    }
    try {
      if (editingHall) {
        const updated = await adminUpdateHall(editingHall.id, payload)
        setVenues((prev) =>
          prev.map((v) =>
            v.id === hallVenueId
              ? { ...v, halls: (v.halls ?? []).map((h) => (h.id === editingHall.id ? updated : h)) }
              : v,
          ),
        )
      } else {
        const created = await adminAddHall(hallVenueId, payload)
        setVenues((prev) =>
          prev.map((v) => (v.id === hallVenueId ? { ...v, halls: [...(v.halls ?? []), created] } : v)),
        )
      }
      setHallModalOpen(false)
    } catch (err) {
      setHallFormError(getErrorMessage(err, 'Could not save this hall.'))
    } finally {
      setSavingHall(false)
    }
  }

  async function handleDeleteHall(venueId, hall) {
    if (!window.confirm(`Delete hall "${hall.name}"?`)) return
    setDeletingHallId(hall.id)
    setError('')
    try {
      await adminDeleteHall(hall.id)
      setVenues((prev) =>
        prev.map((v) => (v.id === venueId ? { ...v, halls: (v.halls ?? []).filter((h) => h.id !== hall.id) } : v)),
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this hall.'))
    } finally {
      setDeletingHallId(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cinema-50">Venues &amp; Halls</h2>
        <button type="button" onClick={openCreateVenue} className="btn-primary">
          + Add Venue
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading venues…" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : venues.length === 0 ? (
        <EmptyState icon="🏛️" title="No venues yet" message="Add a venue to start creating halls and shows." />
      ) : (
        <div className="flex flex-col gap-3">
          {venues.map((venue) => {
            const expanded = expandedId === venue.id
            const halls = venue.halls ?? []
            return (
              <div key={venue.id} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : venue.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-cinema-800/40"
                >
                  <div>
                    <p className="font-display font-semibold text-cinema-50">{venue.name}</p>
                    <p className="text-sm text-cinema-400">
                      {venue.city} · {venue.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-gray">{halls.length} hall{halls.length === 1 ? '' : 's'}</span>
                    <span className="text-cinema-500">{expanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expanded ? (
                  <div className="border-t border-cinema-700 bg-cinema-900/40 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEditVenue(venue)} className="btn-secondary !px-3 !py-1.5 text-xs">
                          Edit venue
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVenue(venue)}
                          disabled={deletingVenueId === venue.id}
                          className="btn-danger !px-3 !py-1.5 text-xs"
                        >
                          {deletingVenueId === venue.id ? 'Deleting…' : 'Delete venue'}
                        </button>
                      </div>
                      <button type="button" onClick={() => openAddHall(venue.id)} className="btn-primary !px-3 !py-1.5 text-xs">
                        + Add Hall
                      </button>
                    </div>

                    {halls.length === 0 ? (
                      <p className="py-4 text-center text-sm text-cinema-500">No halls yet in this venue.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm">
                          <thead className="border-b border-cinema-700 text-xs uppercase tracking-wide text-cinema-500">
                            <tr>
                              <th className="px-3 py-2">Hall</th>
                              <th className="px-3 py-2">Rows</th>
                              <th className="px-3 py-2">Seats / row</th>
                              <th className="px-3 py-2">Premium rows</th>
                              <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-cinema-800">
                            {halls.map((hall) => (
                              <tr key={hall.id}>
                                <td className="px-3 py-2 font-medium text-cinema-100">{hall.name}</td>
                                <td className="px-3 py-2 text-cinema-400">{hall.rows}</td>
                                <td className="px-3 py-2 text-cinema-400">{hall.seatsPerRow}</td>
                                <td className="px-3 py-2 text-cinema-400">{hall.premiumRows}</td>
                                <td className="px-3 py-2">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openEditHall(venue.id, hall)}
                                      className="btn-secondary !px-2.5 !py-1 text-xs"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteHall(venue.id, hall)}
                                      disabled={deletingHallId === hall.id}
                                      className="btn-danger !px-2.5 !py-1 text-xs"
                                    >
                                      {deletingHallId === hall.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {venueModalOpen ? (
        <Modal title={editingVenue ? 'Edit Venue' : 'Add Venue'} onClose={() => setVenueModalOpen(false)}>
          <ErrorMessage message={venueFormError} />
          <form onSubmit={handleVenueSubmit} className="mt-3 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="venueName">
                Venue name
              </label>
              <input
                id="venueName"
                required
                value={venueForm.name}
                onChange={(e) => setVenueForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="venueCity">
                City
              </label>
              <input
                id="venueCity"
                required
                value={venueForm.city}
                onChange={(e) => setVenueForm((f) => ({ ...f, city: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="venueAddress">
                Address
              </label>
              <input
                id="venueAddress"
                required
                value={venueForm.address}
                onChange={(e) => setVenueForm((f) => ({ ...f, address: e.target.value }))}
                className="input"
              />
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setVenueModalOpen(false)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={savingVenue} className="btn-primary">
                {savingVenue ? 'Saving…' : editingVenue ? 'Save changes' : 'Add venue'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {hallModalOpen ? (
        <Modal title={editingHall ? 'Edit Hall' : 'Add Hall'} onClose={() => setHallModalOpen(false)}>
          <ErrorMessage message={hallFormError} />
          <form onSubmit={handleHallSubmit} className="mt-3 flex flex-col gap-4">
            <div>
              <label className="label" htmlFor="hallName">
                Hall name
              </label>
              <input
                id="hallName"
                required
                value={hallForm.name}
                onChange={(e) => setHallForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
                placeholder="Screen 1"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label" htmlFor="hallRows">
                  Rows
                </label>
                <input
                  id="hallRows"
                  type="number"
                  min="1"
                  required
                  value={hallForm.rows}
                  onChange={(e) => setHallForm((f) => ({ ...f, rows: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="hallSeatsPerRow">
                  Seats / row
                </label>
                <input
                  id="hallSeatsPerRow"
                  type="number"
                  min="1"
                  required
                  value={hallForm.seatsPerRow}
                  onChange={(e) => setHallForm((f) => ({ ...f, seatsPerRow: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="hallPremiumRows">
                  Premium rows
                </label>
                <input
                  id="hallPremiumRows"
                  type="number"
                  min="0"
                  required
                  value={hallForm.premiumRows}
                  onChange={(e) => setHallForm((f) => ({ ...f, premiumRows: e.target.value }))}
                  className="input"
                />
              </div>
            </div>
            <p className="text-xs text-cinema-500">
              Premium rows count from the front (row A). All seats are generated automatically.
            </p>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setHallModalOpen(false)} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={savingHall} className="btn-primary">
                {savingHall ? 'Saving…' : editingHall ? 'Save changes' : 'Add hall'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
