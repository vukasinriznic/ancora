import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, getToken, setToken, type RegisterPayload, type User } from '../lib/api'

interface AuthContextValue {
  user: User | null
  loading: boolean           // dok proveravamo postojeći token na startu
  login: (email: string, password: string) => Promise<void>
  // register vraća email na koji je poslata potvrda (NE loguje korisnika)
  register: (payload: RegisterPayload) => Promise<string>
  verify: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Na startu: ako postoji token, vrati sesiju preko /auth/me
  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    authApi.me()
      .then(setUser)
      .catch(() => setToken(null))   // istekao/nevažeći token
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    setToken(res.accessToken)
    setUser(res.user)
  }

  const register = async (payload: RegisterPayload): Promise<string> => {
    // Ne loguje — backend šalje verifikacioni email. Vraćamo email za "proveri poštu" ekran.
    const res = await authApi.register(payload)
    return res.email ?? payload.email
  }

  const verify = async (token: string) => {
    const res = await authApi.verify(token)
    setToken(res.accessToken)
    setUser(res.user)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verify, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
