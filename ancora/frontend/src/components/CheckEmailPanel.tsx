import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DiamondButton from './DiamondButton'
import { authApi } from '../lib/api'

/* Prikazuje se posle registracije — uputstvo da korisnik potvrdi email + resend. */
export default function CheckEmailPanel({ email }: { email: string }) {
  const { t } = useTranslation()
  const [resent, setResent] = useState(false)
  const [sending, setSending] = useState(false)

  const resend = async () => {
    setSending(true)
    try {
      await authApi.resendVerification(email)
      setResent(true)
    } catch { /* tiho — backend uvek vraća isti odgovor */ }
    finally { setSending(false) }
  }

  return (
    <div className="text-center">
      {/* Mail ikonica u zelenom krugu */}
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(31,214,95,0.14)', color: '#54E98A' }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
        {t('auth.checkEmail.text', { email })}
      </p>
      <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {t('auth.checkEmail.hint')}
      </p>

      <DiamondButton
        variant="secondary"
        icon="none"
        onClick={resend}
        disabled={sending || resent}
        className="px-7 py-3 text-sm justify-center flex mx-auto"
      >
        {resent ? t('auth.checkEmail.resent') : t('auth.checkEmail.resend')}
      </DiamondButton>
    </div>
  )
}
