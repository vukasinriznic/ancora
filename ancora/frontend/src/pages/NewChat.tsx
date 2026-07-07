import { useState } from 'react'
import { m } from 'framer-motion'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FormError from '../components/FormError'
import { usePageTitle } from '../hooks/usePageTitle'
import { chatApi, ApiError } from '../lib/api'
import type { ChatContext } from '../components/ChatShell'

const DESC_MIN = 20

/* Opis situacije/osobe pre nego što razgovor počne — kontekst za AI savet. */
export default function NewChat() {
  const { t } = useTranslation()
  usePageTitle(t('pageTitles.chat'))
  const navigate = useNavigate()
  const { refreshChats } = useOutletContext<ChatContext>()

  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = description.trim()
    if (trimmed.length < DESC_MIN) {
      setError(t('chat.new.errorMin', { min: DESC_MIN }))
      return
    }
    setError(null)
    setLoading(true)
    try {
      const chat = await chatApi.create(trimmed)
      refreshChats()
      navigate(`/chat/${chat.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('chat.new.errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-12">
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto"
      >
        <span className="text-xs font-semibold tracking-[0.2em] uppercase mb-3 block" style={{ color: '#15803D' }}>
          {t('chat.new.eyebrow')}
        </span>
        <h1
          className="text-3xl md:text-4xl font-semibold mb-2"
          style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}
        >
          {t('chat.new.title')}
        </h1>
        <p className="text-base leading-relaxed mb-8" style={{ color: '#6B7280' }}>
          {t('chat.new.subtitle')}
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('chat.new.placeholder')}
            rows={7}
            autoFocus
            className="w-full rounded-2xl border px-5 py-4 text-base outline-none resize-none transition-colors duration-200"
            style={{ borderColor: '#E5E7EB', color: '#1A1A1A' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1FD65F')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
          />
          <div className="flex items-center justify-between mt-2 mb-2">
            <FormError message={error} tone="light" />
            <span className="text-xs ml-auto" style={{ color: description.trim().length >= DESC_MIN ? '#15803D' : '#9CA3AF' }}>
              {description.trim().length}/{DESC_MIN}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full px-8 py-3.5 text-base font-medium mt-4 cursor-pointer transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1FD65F', color: '#FFFFFF' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#14B854')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1FD65F')}
          >
            {loading ? t('auth.loading') : t('chat.new.submit')}
          </button>
        </form>
      </m.div>
    </div>
  )
}
