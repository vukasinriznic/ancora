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

export interface ProfileUpdatePayload {
  firstName?: string
  lastName?: string
  description?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ChatListItem {
  id: string
  title: string
  updatedAt: string
}

export interface ChatDetail {
  id: string
  title: string
  personDescription: string
  createdAt: string
  messages: ChatMessage[]
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

  if (res.status === 204) return undefined as T
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
  forgotPassword: (email: string) =>
    request<MessageResponse>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request<MessageResponse>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  me: () => request<User>('/auth/me', {}, true),
  updateProfile: (payload: ProfileUpdatePayload) =>
    request<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }, true),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<MessageResponse>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }, true),
  deleteAccount: () => request<void>('/auth/me', { method: 'DELETE' }, true),
}

export const chatApi = {
  list: () => request<ChatListItem[]>('/chats', {}, true),
  create: (personDescription: string) =>
    request<ChatDetail>('/chats', { method: 'POST', body: JSON.stringify({ personDescription }) }, true),
  get: (chatId: string) => request<ChatDetail>(`/chats/${chatId}`, {}, true),
  rename: (chatId: string, title: string) =>
    request<ChatListItem>(`/chats/${chatId}`, { method: 'PATCH', body: JSON.stringify({ title }) }, true),
  remove: (chatId: string) => request<void>(`/chats/${chatId}`, { method: 'DELETE' }, true),

  /** Streamuje AI odgovor — poziva onChunk za svaki komad teksta kako stiže. */
  streamMessage: async (chatId: string, content: string, onChunk: (text: string) => void): Promise<void> => {
    const token = getToken()
    let res: Response
    try {
      res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content }),
      })
    } catch {
      throw new ApiError(0, 'network')
    }

    if (!res.ok || !res.body) {
      let detail = `Request failed (${res.status})`
      try {
        const data = await res.json()
        if (typeof data.detail === 'string') detail = data.detail
      } catch { /* telo nije JSON */ }
      throw new ApiError(res.status, detail)
    }

    // Backend šalje sentinel "[[ANCORA_ERR:<code>]]" (i ništa drugo) ako AI padne pre
    // ijednog tokena (npr. rate limit). Bufferujemo početak dok ne odlučimo je li greška
    // ili pravi sadržaj, pa u slučaju greške bacamo ApiError sa kodom.
    const ERR_PREFIX = '[[ANCORA_ERR:'
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let decided = false
    let buffer = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value, { stream: true })
      if (decided) { onChunk(text); continue }

      buffer += text
      // Još uvek može biti početak sentinela — sačekaj još podataka
      if (buffer.length < ERR_PREFIX.length && ERR_PREFIX.startsWith(buffer)) continue

      if (buffer.startsWith(ERR_PREFIX)) {
        const match = buffer.match(/^\[\[ANCORA_ERR:([a-z_]+)\]\]/)
        if (match) throw new ApiError(0, match[1])   // 'rate_limit' | 'generic'
        continue  // sentinel još nije kompletan
      }

      // Nije greška — pravi sadržaj
      decided = true
      onChunk(buffer)
      buffer = ''
    }
    if (!decided && buffer && !buffer.startsWith(ERR_PREFIX)) onChunk(buffer)
  },
}
