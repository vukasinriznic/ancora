import { useState } from 'react'
import { m } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FormError from '../components/FormError'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../context/AuthContext'
import { authApi, ApiError } from '../lib/api'

const DESC_MIN = 40

/* Podešavanja naloga — bela tema kao chat. Tri sekcije: profil, lozinka, brisanje naloga. */
export default function Settings() {
  const { t } = useTranslation()
  usePageTitle(t('pageTitles.settings'))
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()

  // --- Profil ---
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [description, setDescription] = useState(user?.description ?? '')
  const [profileErr, setProfileErr] = useState<string | null>(null)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErr(null); setProfileSaved(false)
    if (description.trim().length < DESC_MIN) {
      setProfileErr(t('settings.errors.descriptionMin', { min: DESC_MIN }))
      return
    }
    setProfileLoading(true)
    try {
      const updated = await authApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        description: description.trim(),
      })
      updateUser(updated)
      setProfileSaved(true)
    } catch (err) {
      setProfileErr(err instanceof ApiError ? err.message : t('settings.errors.generic'))
    } finally {
      setProfileLoading(false)
    }
  }

  // --- Lozinka ---
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwErr, setPwErr] = useState<string | null>(null)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwErr(null); setPwSaved(false)
    if (next.length < 8) { setPwErr(t('auth.errors.passwordMin')); return }
    if (next !== confirm) { setPwErr(t('settings.password.mismatch')); return }
    setPwLoading(true)
    try {
      await authApi.changePassword(current, next)
      setPwSaved(true)
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setPwErr(t('settings.password.wrongCurrent'))
      else setPwErr(err instanceof ApiError ? err.message : t('settings.errors.generic'))
    } finally {
      setPwLoading(false)
    }
  }

  // --- Brisanje naloga ---
  const [deleting, setDeleting] = useState(false)

  const deleteAccount = async () => {
    if (!window.confirm(t('settings.danger.confirm'))) return
    setDeleting(true)
    try {
      await authApi.deleteAccount()
      logout()
      navigate('/')
    } catch {
      setDeleting(false)
    }
  }

  const labelCls = 'block text-sm font-medium mb-1.5'
  const inputCls = 'w-full rounded-xl border px-4 py-2.5 text-base outline-none transition-colors duration-200'
  const inputStyle = { borderColor: '#E5E7EB', color: '#1A1A1A' } as const
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#1FD65F')
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = '#E5E7EB')
  const btnStyle = { backgroundColor: '#1FD65F', color: '#FFFFFF' } as const
  const btnCls = 'rounded-full px-7 py-3 text-base font-medium cursor-pointer transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <div className="h-full overflow-y-auto px-6 py-12">
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto"
      >
        <button
          onClick={() => navigate('/chat')}
          className="text-sm font-medium mb-6 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#14B854')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('settings.back')}
        </button>

        <h1 className="text-3xl md:text-4xl font-semibold mb-10" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
          {t('settings.title')}
        </h1>

        {/* Profil */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#1A1A1A' }}>{t('settings.profile.title')}</h2>
          <p className="text-sm mb-5" style={{ color: '#6B7280' }}>{t('settings.profile.subtitle')}</p>
          <form onSubmit={saveProfile}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls} style={{ color: '#374151' }}>{t('settings.profile.firstName')}</label>
                <input className={inputCls} style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className={labelCls} style={{ color: '#374151' }}>{t('settings.profile.lastName')}</label>
                <input className={inputCls} style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <label className={labelCls} style={{ color: '#374151' }}>{t('settings.profile.description')}</label>
            <textarea
              className={`${inputCls} resize-none`} style={inputStyle} rows={5}
              value={description} onChange={e => setDescription(e.target.value)} onFocus={onFocus} onBlur={onBlur}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs" style={{ color: '#9CA3AF' }}>{t('settings.profile.descriptionHint')}</span>
              <span className="text-xs" style={{ color: description.trim().length >= DESC_MIN ? '#15803D' : '#9CA3AF' }}>
                {description.trim().length}/{DESC_MIN}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button type="submit" disabled={profileLoading} className={btnCls} style={btnStyle}
                onMouseEnter={e => !profileLoading && (e.currentTarget.style.backgroundColor = '#14B854')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1FD65F')}>
                {profileLoading ? t('auth.loading') : t('settings.profile.save')}
              </button>
              {profileSaved && <span className="text-sm font-medium" style={{ color: '#15803D' }}>{t('settings.profile.saved')}</span>}
            </div>
            <div className="mt-2"><FormError message={profileErr} tone="light" /></div>
          </form>
        </section>

        {/* Lozinka */}
        <section className="mb-12 pt-10 border-t" style={{ borderColor: '#EAEAEA' }}>
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#1A1A1A' }}>{t('settings.password.title')}</h2>
          <p className="text-sm mb-5" style={{ color: '#6B7280' }}>{t('settings.password.subtitle')}</p>
          <form onSubmit={savePassword} className="max-w-md">
            <label className={labelCls} style={{ color: '#374151' }}>{t('settings.password.current')}</label>
            <input type="password" autoComplete="current-password" className={`${inputCls} mb-4`} style={inputStyle} value={current} onChange={e => setCurrent(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            <label className={labelCls} style={{ color: '#374151' }}>{t('settings.password.new')}</label>
            <input type="password" autoComplete="new-password" className={`${inputCls} mb-4`} style={inputStyle} value={next} onChange={e => setNext(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            <label className={labelCls} style={{ color: '#374151' }}>{t('settings.password.confirm')}</label>
            <input type="password" autoComplete="new-password" className={inputCls} style={inputStyle} value={confirm} onChange={e => setConfirm(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            <div className="mt-4 flex items-center gap-4">
              <button type="submit" disabled={pwLoading} className={btnCls} style={btnStyle}
                onMouseEnter={e => !pwLoading && (e.currentTarget.style.backgroundColor = '#14B854')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1FD65F')}>
                {pwLoading ? t('auth.loading') : t('settings.password.save')}
              </button>
              {pwSaved && <span className="text-sm font-medium" style={{ color: '#15803D' }}>{t('settings.password.saved')}</span>}
            </div>
            <div className="mt-2"><FormError message={pwErr} tone="light" /></div>
          </form>
        </section>

        {/* Danger zone */}
        <section className="pt-10 border-t" style={{ borderColor: '#EAEAEA' }}>
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#B91C1C' }}>{t('settings.danger.title')}</h2>
          <p className="text-sm mb-5" style={{ color: '#6B7280' }}>{t('settings.danger.subtitle')}</p>
          <button
            onClick={deleteAccount}
            disabled={deleting}
            className="rounded-full px-7 py-3 text-base font-medium cursor-pointer transition-colors duration-200 border disabled:opacity-60"
            style={{ borderColor: '#DC2626', color: '#DC2626', backgroundColor: 'transparent' }}
            onMouseEnter={e => { if (!deleting) { e.currentTarget.style.backgroundColor = '#DC2626'; e.currentTarget.style.color = '#FFFFFF' } }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#DC2626' }}
          >
            {deleting ? t('auth.loading') : t('settings.danger.button')}
          </button>
        </section>
      </m.div>
    </div>
  )
}
