import client from './client'

export function holdSeats({ showId, showSeatIds }) {
  return client.post('/bookings/hold', { showId, showSeatIds }).then((res) => res.data)
}

export function confirmBooking(id, paymentMethod) {
  return client.post(`/bookings/${id}/confirm`, { paymentMethod }).then((res) => res.data)
}

export function cancelBooking(id) {
  return client.post(`/bookings/${id}/cancel`).then((res) => res.data)
}

export function getMyBookings() {
  return client.get('/bookings/my').then((res) => res.data)
}

export function getBooking(id) {
  return client.get(`/bookings/${id}`).then((res) => res.data)
}
