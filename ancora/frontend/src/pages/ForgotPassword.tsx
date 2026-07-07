import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthCard from '../components/AuthCard'
import AuthField from '../components/AuthField'
import DiamondButton from '../components/DiamondButton'
import FormError from '../components/FormError'
import { authApi, ApiError } from '../lib/api'
import { usePageTitle } from '../hooks/usePageTitle'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPassword() {
  const { t } = useTranslation()
  usePageTitle(t('auth.forgot.title'))

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!email.trim()) { setError(t('auth.errors.required')); return }
    if (!EMAIL_RE.test(email)) { setError(t('auth.errors.email')); return }
    setError(undefined)
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSentTo(email.trim())
    } catch (err) {
      setFormError(err instanceof ApiError && err.status === 0 ? t('auth.errors.network') : t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  if (sentTo) {
    return (
      <AuthCard
        title={t('auth.forgot.sentTitle')}
        footer={<Link to="/login" className="font-medium" style={{ color: '#54E98A' }}>{t('auth.forgot.backToLogin')}</Link>}
      >
        {/* Ista "proveri poštu" ilustracija; bez resend dugmeta jer je forgot bez otkrivanja postojanja naloga */}
        <p className="text-sm text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {t('auth.forgot.sentText', { email: sentTo })}
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      footer={<Link to="/login" className="font-medium" style={{ color: '#54E98A' }}>{t('auth.forgot.backToLogin')}</Link>}
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          id="email"
          label={t('auth.fields.email')}
          type="email"
          value={email}
          onChange={setEmail}
          error={error}
          autoComplete="email"
          index={0}
        />
        <FormError message={formError} />
        <DiamondButton
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full px-8 py-3.5 text-base mt-2 justify-center flex"
        >
          {loading ? t('auth.loading') : t('auth.forgot.submit')}
        </DiamondButton>
      </form>
    </AuthCard>
  )
}
