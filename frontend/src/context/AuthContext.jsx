import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as authApi from '../api/auth'

const TOKEN_KEY = 'cinebook_token'
const USER_KEY = 'cinebook_user'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)

  const persist = useCallback((data) => {
    // data: {token, id, name, email, role}
    const { token: jwt, ...userInfo } = data
    localStorage.setItem(TOKEN_KEY, jwt)
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    setToken(jwt)
    setUser(userInfo)
  }, [])

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials)
      persist(data)
      return data
    },
    [persist],
  )

  const register = useCallback(async (payload) => {
    return authApi.register(payload)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role ?? null,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
