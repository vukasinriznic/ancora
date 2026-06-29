// API klijent ka Ancora backendu. Bazni URL iz VITE_API_URL (fallback localhost:8000).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const TOKEN_KEY = 'ancora_token'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  description: string
  isVerified: boolean
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: User
}

export interface MessageResponse {
  message: string
  email?: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  description: string
}

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore (npr. privatni mod) */ }
}

/** Greška sa HTTP statusom — komponenta odlučuje koju poruku da prikaže. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    // Mreža/server nedostupan
    throw new ApiError(0, 'network')
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (typeof data.detail === 'string') detail = data.detail
      else if (Array.isArray(data.detail) && data.detail[0]?.msg) detail = data.detail[0].msg
    } catch { /* telo nije JSON */ }
    throw new ApiError(res.status, detail)
  }

  return res.json() as Promise<T>
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<MessageResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  verify: (token: string) =>
    request<AuthResponse>('/auth/verify', { method: 'POST', body: JSON.stringify({ token }) }),
  resendVerification: (email: string) =>
    request<MessageResponse>('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  me: () => request<User>('/auth/me', {}, true),
}
