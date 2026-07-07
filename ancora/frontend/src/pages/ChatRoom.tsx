import { useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import AncoraSVGLogo from '../components/AncoraSVGLogo'
import { usePageTitle } from '../hooks/usePageTitle'
import { chatApi, ApiError, type ChatMessage } from '../lib/api'
import type { ChatContext } from '../components/ChatShell'

interface Bubble {
  id: string
  role: 'user' | 'assistant'
  content: string
}

/* Minimalna markdown stilizacija — u skladu sa brendom, bez tipografskog plugina. */
const markdownComponents = {
  p: (props: React.ComponentPropsWithoutRef<'p'>) => <p className="mb-2 last:mb-0" {...props} />,
  strong: (props: React.ComponentPropsWithoutRef<'strong'>) => <strong className="font-semibold" {...props} />,
  ul: (props: React.ComponentPropsWithoutRef<'ul'>) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
  ol: (props: React.ComponentPropsWithoutRef<'ol'>) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
  li: (props: React.ComponentPropsWithoutRef<'li'>) => <li {...props} />,
  code: (props: React.ComponentPropsWithoutRef<'code'>) => (
    <code className="px-1 py-0.5 rounded text-[13px]" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} {...props} />
  ),
  a: (props: React.ComponentPropsWithoutRef<'a'>) => (
    <a className="underline" style={{ color: '#14B854' }} target="_blank" rel="noreferrer" {...props} />
  ),
}

function AssistantBubble({ content }: { content: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard nedostupan — tiho ignoriši */ }
  }

  return (
    <div className="group/bubble">
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed"
        style={{ backgroundColor: '#F5F5F5', color: '#1A1A1A', borderBottomLeftRadius: 6 }}
      >
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown>
        ) : (
          <span className="inline-flex gap-1 items-center" style={{ color: '#9CA3AF' }}>
            {t('chat.room.thinking')}
          </span>
        )}
      </div>
      {content && (
        <button
          onClick={handleCopy}
          className="mt-1 flex items-center gap-1 text-xs opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-150 cursor-pointer"
          style={{ color: '#9CA3AF' }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {t('chat.room.copied')}
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {t('chat.room.copy')}
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default function ChatRoom() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { chats, refreshChats } = useOutletContext<ChatContext>()

  const [title, setTitle] = useState('')
  const [bubbles, setBubbles] = useState<Bubble[] | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chatId = id!
  // Naslov prati sidebar listu (odmah odražava preimenovanje); pada nazad na fetch-ovan naslov.
  const displayTitle = chats.find(c => c.id === chatId)?.title ?? title
  usePageTitle(displayTitle || t('pageTitles.chat'))

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatApi.get(chatId)
      .then(chat => {
        setTitle(chat.title)
        setBubbles(chat.messages.map((m: ChatMessage) => ({ id: m.id, role: m.role, content: m.content })))
      })
      .catch(() => navigate('/chat', { replace: true }))
  }, [chatId, navigate])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [bubbles])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return

    setError(null)
    setInput('')
    const userBubbleId = `local-user-${Date.now()}`
    const assistantBubbleId = `local-assistant-${Date.now()}`
    setBubbles(prev => [
      ...(prev ?? []),
      { id: userBubbleId, role: 'user', content },
      { id: assistantBubbleId, role: 'assistant', content: '' },
    ])
    setSending(true)

    try {
      await chatApi.streamMessage(chatId, content, chunk => {
        setBubbles(prev =>
          (prev ?? []).map(b => (b.id === assistantBubbleId ? { ...b, content: b.content + chunk } : b))
        )
      })
      refreshChats()   // osveži redosled/vreme u sidebaru
    } catch (err) {
      const code = err instanceof ApiError ? err.message : ''
      setError(code === 'rate_limit' ? t('chat.room.rateLimited') : t('chat.room.errorSending'))
      setBubbles(prev => (prev ?? []).filter(b => b.id !== assistantBubbleId))
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header — samo naslov, navigacija je u sidebaru */}
      <header className="border-b px-6 py-4 flex items-center flex-shrink-0" style={{ borderColor: '#EAEAEA' }}>
        <h1
          className="text-base font-medium truncate"
          style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
        >
          {displayTitle}
        </h1>
      </header>

      {/* Poruke */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-5">
          {bubbles === null && (
            <div className="flex justify-center py-10">
              <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="#1FD65F" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {bubbles?.map(b => (
            <div key={b.id} className={`flex ${b.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {b.role === 'assistant' ? (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5"
                    style={{ backgroundColor: 'rgba(31,214,95,0.12)' }}
                  >
                    <AncoraSVGLogo size={16} color="#1FD65F" />
                  </div>
                  <AssistantBubble content={b.content} />
                </>
              ) : (
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap"
                  style={{ backgroundColor: '#1FD65F', color: '#FFFFFF', borderBottomRightRadius: 6 }}
                >
                  {b.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t px-6 py-4 flex-shrink-0" style={{ borderColor: '#EAEAEA' }}>
        <form onSubmit={handleSend} className="max-w-2xl mx-auto">
          {error && (
            <p className="text-sm mb-2 text-center" style={{ color: '#B91C1C' }}>{error}</p>
          )}
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.room.inputPlaceholder')}
              rows={1}
              disabled={sending}
              className="flex-1 rounded-2xl border px-4 py-3 text-[15px] outline-none resize-none transition-colors duration-200"
              style={{ borderColor: '#E5E7EB', color: '#1A1A1A', maxHeight: 160 }}
              onFocus={e => (e.currentTarget.style.borderColor = '#1FD65F')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-opacity duration-200 disabled:opacity-40 cursor-pointer"
              style={{ backgroundColor: '#1FD65F' }}
              aria-label={t('chat.room.send')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
