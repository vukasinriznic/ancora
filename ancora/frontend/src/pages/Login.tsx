import { useState } from 'react'
import { m } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthCard from '../components/AuthCard'
import AuthField from '../components/AuthField'
import DiamondButton from '../components/DiamondButton'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({})
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
    if (!validate()) return
    setLoading(true)
    try {
      // TODO: povezati sa POST /auth/login kada backend bude gotov
      await new Promise(r => setTimeout(r, 700))
      navigate('/')
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
