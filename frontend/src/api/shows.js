import client from './client'

export function getShow(id) {
  return client.get(`/shows/${id}`).then((res) => res.data)
}

export function getShowSeats(id) {
  return client.get(`/shows/${id}/seats`).then((res) => res.data)
}
