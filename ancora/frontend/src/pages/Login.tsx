import { useState } from 'react'
import { m } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthCard from '../components/AuthCard'
import AuthField from '../components/AuthField'
import DiamondButton from '../components/DiamondButton'
import FormError from '../components/FormError'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const validate = () => {
    const next: typeof errors = {}
    if (!email.trim()) next.email = t('auth.errors.required')
    else if (!EMAIL_RE.test(email)) next.email = t('auth.errors.email')
    if (!password) next.password = t('auth.errors.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setFormError(t('auth.errors.invalidCredentials'))
      else if (err instanceof ApiError && err.status === 403) setFormError(t('auth.errors.notVerified'))
      else if (err instanceof ApiError && err.status === 0) setFormError(t('auth.errors.network'))
      else setFormError(t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="font-medium" style={{ color: '#54E98A' }}>
            {t('auth.login.signUp')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          id="email"
          label={t('auth.fields.email')}
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          index={0}
        />
        <AuthField
          id="password"
          label={t('auth.fields.password')}
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
          index={1}
        />

        <FormError message={formError} />

        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 + 2 * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <DiamondButton
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full px-8 py-3.5 text-base mt-2 justify-center flex"
          >
            {loading ? t('auth.loading') : t('auth.login.submit')}
          </DiamondButton>
        </m.div>
      </form>
    </AuthCard>
  )
}
