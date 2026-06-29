import { useState } from 'react'
import { m } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthCard from '../components/AuthCard'
import AuthField from '../components/AuthField'
import DiamondButton from '../components/DiamondButton'
import FormError from '../components/FormError'
import CheckEmailPanel from '../components/CheckEmailPanel'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DESC_MIN = 40

type Fields = 'firstName' | 'lastName' | 'email' | 'password' | 'description'

export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()

  const [values, setValues] = useState<Record<Fields, string>>({
    firstName: '', lastName: '', email: '', password: '', description: '',
  })
  const [errors, setErrors]   = useState<Partial<Record<Fields, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo]   = useState<string | null>(null)  // email na koji je poslata potvrda

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
    setFormError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const email = await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        description: values.description.trim(),
      })
      setSentTo(email)   // prikaži "proveri poštu" ekran (korisnik nije ulogovan dok ne potvrdi)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setErrors(prev => ({ ...prev, email: t('auth.errors.emailTaken') }))
      else if (err instanceof ApiError && err.status === 0) setFormError(t('auth.errors.network'))
      else setFormError(t('auth.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  // Posle uspešne registracije — "proveri poštu" ekran umesto forme
  if (sentTo) {
    return (
      <AuthCard
        title={t('auth.checkEmail.title')}
        footer={
          <>
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="font-medium" style={{ color: '#54E98A' }}>
              {t('auth.register.logIn')}
            </Link>
          </>
        }
      >
        <CheckEmailPanel email={sentTo} />
      </AuthCard>
    )
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

        <FormError message={formError} />

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
