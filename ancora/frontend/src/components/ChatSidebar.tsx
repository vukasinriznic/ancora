import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AncoraSVGLogo from './AncoraSVGLogo'
import { useAuth } from '../context/AuthContext'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { chatApi, type ChatListItem } from '../lib/api'

interface Props {
  chats: ChatListItem[]
  refreshChats: () => void
  open: boolean
  onClose: () => void
}

/* Sidebar sa listom razgovora (kao Claude) — logo, "New chat", pretraga, lista, korisnik+logout. */
export default function ChatSidebar({ chats, refreshChats, open, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  // ChatSidebar je renderovan direktno (ne kroz <Outlet/>), pa useParams() ovde ne vidi
  // ':id' rutu — čitamo aktivan chat iz pathname-a preko useLocation() umesto toga.
  const { pathname } = useLocation()
  const activeId = pathname.match(/^\/chat\/([^/]+)$/)?.[1]
  const { user, logout } = useAuth()

  const [query, setQuery] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Drawer transform računamo u JS-u (inline style) umesto Tailwind translate-x utility
  // klasa — na ovom elementu su korektno postavljale --tw-translate-x, ali je computed
  // `transform` i dalje ostajao na staroj vrednosti (cascade/@property kolizija u
  // Tailwind v4 + Vite HMR). Inline style ima najveću specifičnost i uvek pobeđuje.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!menuOpenId) return
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenId(null)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpenId])

  const filteredChats = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chats
    return chats.filter(c => c.title.toLowerCase().includes(q))
  }, [chats, query])

  const startRename = (chat: ChatListItem) => {
    setMenuOpenId(null)
    setRenamingId(chat.id)
    setRenameValue(chat.title)
  }

  const commitRename = async (chatId: string) => {
    const title = renameValue.trim()
    setRenamingId(null)
    if (!title) return
    try {
      await chatApi.rename(chatId, title)
      refreshChats()
    } catch { /* tiho — sidebar ostaje na starom nazivu */ }
  }

  const handleDelete = async (chat: ChatListItem) => {
    setMenuOpenId(null)
    if (!window.confirm(t('chat.sidebar.deleteConfirm'))) return
    try {
      await chatApi.remove(chat.id)
      refreshChats()
      if (activeId === chat.id) navigate('/chat')
    } catch { /* tiho */ }
  }

  const handleNavClick = () => onClose()

  return (
    <>
      {/* Backdrop — samo mobilni, kad je sidebar otvoren preko drawer-a */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={onClose} aria-hidden />
      )}

      <aside
        className="fixed md:static inset-y-0 left-0 z-40 w-72 flex-shrink-0 border-r flex flex-col h-full overflow-hidden transition-transform duration-300"
        style={{
          borderColor: '#EAEAEA',
          backgroundColor: '#FAFAFA',
          transform: isDesktop ? 'none' : `translateX(${open ? '0' : '-100%'})`,
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <AncoraSVGLogo size={26} color="#1FD65F" />
            <span
              className="text-lg font-semibold tracking-tight transition-opacity duration-200 group-hover:opacity-80"
              style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
            >
              Ancora
            </span>
          </Link>
        </div>

        {/* Novi razgovor — kompaktno dugme, bez diamond-fill efekta */}
        <div className="px-4 mb-3 flex-shrink-0">
          <button
            onClick={() => { navigate('/chat/new'); handleNavClick() }}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors duration-150"
            style={{ backgroundColor: '#1FD65F', color: '#FFFFFF' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#14B854')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1FD65F')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('chat.list.newButton')}
          </button>
        </div>

        {/* Pretraga */}
        {chats.length > 0 && (
          <div className="px-4 mb-2 flex-shrink-0">
            <div className="relative">
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('chat.sidebar.searchPlaceholder')}
                className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-sm outline-none transition-colors duration-150"
                style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#1FD65F')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
              />
            </div>
          </div>
        )}

        {/* Lista razgovora */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {filteredChats.length === 0 && query && (
            <p className="px-3 py-2 text-xs" style={{ color: '#9CA3AF' }}>{t('chat.sidebar.noResults')}</p>
          )}

          {filteredChats.map(c => {
            const active = c.id === activeId
            const isRenaming = renamingId === c.id
            return (
              <div key={c.id} className="group relative">
                {isRenaming ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(c.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); commitRename(c.id) }
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
                    style={{ borderColor: '#1FD65F', color: '#1A1A1A' }}
                  />
                ) : (
                  <Link
                    to={`/chat/${c.id}`}
                    onClick={handleNavClick}
                    className="block rounded-xl pl-3 pr-9 py-2.5 text-sm transition-colors duration-150"
                    style={{
                      backgroundColor: active ? 'rgba(31,214,95,0.10)' : 'transparent',
                      color: active ? '#14532D' : '#374151',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#F0F0F0' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div className="truncate font-medium">{c.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                      {formatRelativeTime(c.updatedAt, i18n.language)}
                    </div>
                  </Link>
                )}

                {!isRenaming && (
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                    aria-label={t('chat.sidebar.moreOptions')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                    style={{ color: '#6B7280', backgroundColor: menuOpenId === c.id ? '#E5E7EB' : 'transparent' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="1.8" />
                      <circle cx="12" cy="12" r="1.8" />
                      <circle cx="19" cy="12" r="1.8" />
                    </svg>
                  </button>
                )}

                {menuOpenId === c.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-1.5 top-10 z-10 w-36 rounded-xl border py-1 shadow-lg"
                    style={{ borderColor: '#EAEAEA', backgroundColor: '#FFFFFF' }}
                  >
                    <button
                      onClick={() => startRename(c)}
                      className="w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors duration-100"
                      style={{ color: '#374151' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {t('chat.sidebar.rename')}
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors duration-100"
                      style={{ color: '#DC2626' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {t('chat.sidebar.delete')}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Korisnik + logout — pravi red, dovoljno velik klik cilj */}
        {user && (
          <div
            className="border-t px-4 py-3 flex items-center justify-between gap-2 flex-shrink-0"
            style={{ borderColor: '#EAEAEA' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                style={{ backgroundColor: 'rgba(31,214,95,0.15)', color: '#14B854', fontFamily: 'Playfair Display, serif' }}
              >
                {user.firstName[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate" style={{ color: '#1A1A1A' }}>{user.firstName}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => { navigate('/settings'); handleNavClick() }}
              aria-label={t('pageTitles.settings')}
              title={t('pageTitles.settings')}
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-150"
              style={{ color: '#6B7280' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EFEFEF'; e.currentTarget.style.color = '#14B854' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button
              onClick={logout}
              aria-label={t('nav.logout')}
              title={t('nav.logout')}
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-150"
              style={{ color: '#6B7280' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EFEFEF'; e.currentTarget.style.color = '#DC2626' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
