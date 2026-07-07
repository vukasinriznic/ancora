import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthCard from '../components/AuthCard'
import DiamondButton from '../components/DiamondButton'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

type State = 'verifying' | 'success' | 'failed'

export default function Verify() {
  const { t } = useTranslation()
  usePageTitle(t('pageTitles.verify'))
  const navigate = useNavigate()
  const { verify } = useAuth()
  const [params] = useSearchParams()
  const [state, setState] = useState<State>('verifying')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return          // StrictMode dvostruki-mount guard
    ran.current = true
    const token = params.get('token')
    if (!token) { setState('failed'); return }
    verify(token)
      .then(() => {
        setState('success')
        setTimeout(() => navigate('/'), 1300)
      })
      .catch(() => setState('failed'))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const title =
    state === 'success' ? t('auth.verify.successTitle')
    : state === 'failed' ? t('auth.verify.failedTitle')
    : t('auth.verify.verifying')

  return (
    <AuthCard title={title}>
      <div className="text-center">
        {state === 'verifying' && (
          <svg className="mx-auto animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="#1FD65F" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}

        {state === 'success' && (
          <>
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(31,214,95,0.16)', color: '#54E98A' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('auth.verify.successText')}</p>
          </>
        )}

        {state === 'failed' && (
          <>
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(248,113,113,0.14)', color: '#FCA5A5' }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('auth.verify.failedText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <DiamondButton variant="secondary" icon="none" onClick={() => navigate('/register')} className="px-6 py-3 text-sm justify-center flex">
                {t('auth.verify.toRegister')}
              </DiamondButton>
              <DiamondButton variant="primary" icon="none" onClick={() => navigate('/login')} className="px-6 py-3 text-sm justify-center flex">
                {t('auth.verify.toLogin')}
              </DiamondButton>
            </div>
          </>
        )}
      </div>
    </AuthCard>
  )
}
