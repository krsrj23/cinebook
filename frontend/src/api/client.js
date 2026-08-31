import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the stored JWT to every outgoing request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinebook_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to /login whenever the API says the token is missing/expired,
// unless we're already on an auth page (avoids redirect loops on bad login attempts).
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cinebook_token')
      localStorage.removeItem('cinebook_user')
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// Pulls the API's `{message}` error shape into a plain string, with a fallback.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback
}

export default client
