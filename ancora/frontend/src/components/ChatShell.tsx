import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { chatApi, type ChatListItem } from '../lib/api'
import ChatSidebar from './ChatSidebar'
import AncoraSVGLogo from './AncoraSVGLogo'

export interface ChatContext {
  chats: ChatListItem[]
  refreshChats: () => void
}

/*
  Persistentni dashboard layout za /chat, /chat/new, /chat/:id.
  Sidebar (lista razgovora) ostaje mirno mounted; samo glavni sadržaj se menja.
  Na mobilnom sidebar je sakriven drawer koji se otvara preko hamburger dugmeta.
*/
export default function ChatShell() {
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const refreshChats = useCallback(() => {
    chatApi.list().then(setChats).catch(() => {})
  }, [])

  useEffect(() => { refreshChats() }, [refreshChats])

  return (
    <div className="flex bg-white" style={{ height: '100vh' }}>
      <ChatSidebar chats={chats} refreshChats={refreshChats} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobilna traka — hamburger za otvaranje sidebara, samo ispod md breakpointa */}
        <div className="md:hidden flex items-center gap-3 border-b px-4 py-3 flex-shrink-0" style={{ borderColor: '#EAEAEA' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
            className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ color: '#374151' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <AncoraSVGLogo size={22} color="#1FD65F" />
          <span className="text-base font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
            Ancora
          </span>
        </div>

        <main className="flex-1 min-h-0">
          <Outlet context={{ chats, refreshChats } satisfies ChatContext} />
        </main>
      </div>
    </div>
  )
}
