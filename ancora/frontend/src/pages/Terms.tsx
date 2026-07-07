import { useTranslation } from 'react-i18next'
import LegalLayout from '../components/LegalLayout'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Terms() {
  const { t } = useTranslation()
  usePageTitle(t('pageTitles.terms'))
  const sections = t('legal.terms.sections', { returnObjects: true }) as { heading: string; body: string }[]

  return (
    <LegalLayout title={t('legal.terms.title')} updated="July 1, 2026">
      {sections.map((s, i) => (
        <div key={i}>
          <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
            {s.heading}
          </h2>
          <p className="text-base leading-relaxed" style={{ color: '#4B5563' }}>
            {s.body}
          </p>
        </div>
      ))}
    </LegalLayout>
  )
}
