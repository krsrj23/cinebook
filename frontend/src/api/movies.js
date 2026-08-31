import client from './client'

export function getMovies() {
  return client.get('/movies').then((res) => res.data)
}

export function getMovie(id) {
  return client.get(`/movies/${id}`).then((res) => res.data)
}

export function getShowsForMovie(id) {
  return client.get(`/movies/${id}/shows`).then((res) => res.data)
}
