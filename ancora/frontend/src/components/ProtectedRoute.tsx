import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* Redirect na /login dok se ne potvrdi da je korisnik ulogovan (čeka /auth/me na startu). */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null   // kratak trenutak dok proveravamo postojeći token
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
