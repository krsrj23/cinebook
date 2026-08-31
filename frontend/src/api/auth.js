import client from './client'

export function register({ name, email, password, phone }) {
  return client.post('/auth/register', { name, email, password, phone }).then((res) => res.data)
}

export function login({ email, password }) {
  return client.post('/auth/login', { email, password }).then((res) => res.data)
}
