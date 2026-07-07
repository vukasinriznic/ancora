import { m } from 'framer-motion'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AncoraSVGLogo from '../components/AncoraSVGLogo'
import { usePageTitle } from '../hooks/usePageTitle'
import type { ChatContext } from '../components/ChatShell'

/* Prikazuje se na /chat kad nijedan razgovor nije otvoren — dobrodošlica + CTA. */
export default function Chat() {
  const { t } = useTranslation()
  usePageTitle(t('pageTitles.chat'))
  const navigate = useNavigate()
  const { chats } = useOutletContext<ChatContext>()
  const hasChats = chats.length > 0

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center">
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(31,214,95,0.12)' }}
        >
          <AncoraSVGLogo size={28} color="#1FD65F" />
        </div>
        <h1
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
        >
          {hasChats ? t('chat.list.title') : t('chat.list.emptyTitle')}
        </h1>
        <p className="text-base mb-6 max-w-sm mx-auto" style={{ color: '#6B7280' }}>
          {hasChats ? t('chat.list.subtitle') : t('chat.list.emptyText')}
        </p>
        <button
          onClick={() => navigate('/chat/new')}
          className="rounded-full px-7 py-3 text-sm font-medium cursor-pointer transition-colors duration-200"
          style={{ backgroundColor: '#1FD65F', color: '#FFFFFF' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#14B854')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1FD65F')}
        >
          {hasChats ? t('chat.list.newButton') : t('chat.list.emptyButton')}
        </button>
      </m.div>
    </div>
  )
}
