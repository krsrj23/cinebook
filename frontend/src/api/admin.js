import client from './client'

// --- Movies ---
export function adminGetMovies() {
  return client.get('/admin/movies').then((res) => res.data)
}
export function adminCreateMovie(payload) {
  return client.post('/admin/movies', payload).then((res) => res.data)
}
export function adminUpdateMovie(id, payload) {
  return client.put(`/admin/movies/${id}`, payload).then((res) => res.data)
}
export function adminDeleteMovie(id) {
  return client.delete(`/admin/movies/${id}`).then((res) => res.data)
}

// --- Venues ---
export function adminGetVenues() {
  return client.get('/admin/venues').then((res) => res.data)
}
export function adminCreateVenue(payload) {
  return client.post('/admin/venues', payload).then((res) => res.data)
}
export function adminUpdateVenue(id, payload) {
  return client.put(`/admin/venues/${id}`, payload).then((res) => res.data)
}
export function adminDeleteVenue(id) {
  return client.delete(`/admin/venues/${id}`).then((res) => res.data)
}

// --- Halls ---
export function adminAddHall(venueId, payload) {
  return client.post(`/admin/venues/${venueId}/halls`, payload).then((res) => res.data)
}
export function adminUpdateHall(id, payload) {
  return client.put(`/admin/halls/${id}`, payload).then((res) => res.data)
}
export function adminDeleteHall(id) {
  return client.delete(`/admin/halls/${id}`).then((res) => res.data)
}

// --- Shows ---
export function adminGetShows() {
  return client.get('/admin/shows').then((res) => res.data)
}
export function adminCreateShow(payload) {
  return client.post('/admin/shows', payload).then((res) => res.data)
}
export function adminUpdateShow(id, payload) {
  return client.put(`/admin/shows/${id}`, payload).then((res) => res.data)
}
export function adminDeleteShow(id) {
  return client.delete(`/admin/shows/${id}`).then((res) => res.data)
}

// --- Bookings & dashboard ---
export function adminGetBookings() {
  return client.get('/admin/bookings').then((res) => res.data)
}
export function adminGetDashboard() {
  return client.get('/admin/dashboard').then((res) => res.data)
}
