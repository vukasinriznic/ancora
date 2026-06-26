import { useState } from 'react'
import { m } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthCard from '../components/AuthCard'
import AuthField from '../components/AuthField'
import DiamondButton from '../components/DiamondButton'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DESC_MIN = 40

type Fields = 'firstName' | 'lastName' | 'email' | 'password' | 'description'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [values, setValues] = useState<Record<Fields, string>>({
    firstName: '', lastName: '', email: '', password: '', description: '',
  })
  const [errors, setErrors]   = useState<Partial<Record<Fields, string>>>({})
  const [loading, setLoading] = useState(false)

  const set = (field: Fields) => (v: string) =>
    setValues(prev => ({ ...prev, [field]: v }))

  const validate = () => {
    const next: Partial<Record<Fields, string>> = {}
    if (!values.firstName.trim()) next.firstName = t('auth.errors.required')
    if (!values.lastName.trim())  next.lastName  = t('auth.errors.required')
    if (!values.email.trim())     next.email     = t('auth.errors.required')
    else if (!EMAIL_RE.test(values.email)) next.email = t('auth.errors.email')
    if (!values.password)         next.password  = t('auth.errors.required')
    else if (values.password.length < 8) next.password = t('auth.errors.passwordMin')
    if (values.description.trim().length < DESC_MIN)
      next.description = t('auth.errors.descriptionMin', { min: DESC_MIN })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      // TODO: povezati sa POST /auth/register kada backend bude gotov
      await new Promise(r => setTimeout(r, 700))
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footer={
        <>
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-medium" style={{ color: '#54E98A' }}>
            {t('auth.register.logIn')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <AuthField
            id="firstName"
            label={t('auth.fields.firstName')}
            value={values.firstName}
            onChange={set('firstName')}
            error={errors.firstName}
            autoComplete="given-name"
            index={0}
          />
          <AuthField
            id="lastName"
            label={t('auth.fields.lastName')}
            value={values.lastName}
            onChange={set('lastName')}
            error={errors.lastName}
            autoComplete="family-name"
            index={1}
          />
        </div>

        <AuthField
          id="email"
          label={t('auth.fields.email')}
          type="email"
          value={values.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
          index={2}
        />
        <AuthField
          id="password"
          label={t('auth.fields.password')}
          type="password"
          value={values.password}
          onChange={set('password')}
          error={errors.password}
          autoComplete="new-password"
          index={3}
        />
        <AuthField
          id="description"
          label={t('auth.fields.description')}
          value={values.description}
          onChange={set('description')}
          error={errors.description}
          placeholder={t('auth.fields.descriptionPlaceholder')}
          multiline
          rows={4}
          showCount
          minCount={DESC_MIN}
          index={4}
        />

        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 + 5 * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <DiamondButton
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full px-8 py-3.5 text-base mt-2 justify-center flex"
          >
            {loading ? t('auth.loading') : t('auth.register.submit')}
          </DiamondButton>
        </m.div>
      </form>
    </AuthCard>
  )
}
