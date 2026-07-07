import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthCard from '../components/AuthCard'
import AuthField from '../components/AuthField'
import DiamondButton from '../components/DiamondButton'
import FormError from '../components/FormError'
import { authApi, ApiError } from '../lib/api'
import { usePageTitle } from '../hooks/usePageTitle'

type State = 'form' | 'success' | 'failed'

export default function ResetPassword() {
  const { t } = useTranslation()
  usePageTitle(t('auth.reset.title'))
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<State>(token ? 'form' : 'failed')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (password.length < 8) { setError(t('auth.errors.passwordMin')); return }
    setError(undefined)
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setState('success')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setState('failed')
      else setFormError(err instanceof ApiError && err.status === 0 ? t('auth.errors.network') : t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  if (state === 'success') {
    return (
      <AuthCard title={t('auth.reset.successTitle')}>
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(31,214,95,0.16)', color: '#54E98A' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('auth.reset.successText')}</p>
        </div>
      </AuthCard>
    )
  }

  if (state === 'failed') {
    return (
      <AuthCard
        title={t('auth.reset.failedTitle')}
        footer={<Link to="/login" className="font-medium" style={{ color: '#54E98A' }}>{t('auth.reset.toLogin')}</Link>}
      >
        <p className="text-sm text-center leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {t('auth.reset.failedText')}
        </p>
        <DiamondButton variant="primary" icon="none" onClick={() => navigate('/forgot-password')} className="w-full px-8 py-3.5 text-base justify-center flex">
          {t('auth.reset.requestNew')}
        </DiamondButton>
      </AuthCard>
    )
  }

  return (
    <AuthCard title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')}>
      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          id="password"
          label={t('auth.fields.password')}
          type="password"
          value={password}
          onChange={setPassword}
          error={error}
          autoComplete="new-password"
          index={0}
        />
        <FormError message={formError} />
        <DiamondButton
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full px-8 py-3.5 text-base mt-2 justify-center flex"
        >
          {loading ? t('auth.loading') : t('auth.reset.submit')}
        </DiamondButton>
      </form>
    </AuthCard>
  )
}
