import { AnimatePresence, m } from 'framer-motion'

interface Props {
  message?: string | null
  /* 'dark' = auth kartice (tamna pozadina, svetlo roze tekst). 'light' = bele stranice (tamnocrven tekst). */
  tone?: 'dark' | 'light'
}

/* Animirani baner za greške na nivou forme (npr. pogrešni podaci, server nedostupan). */
export default function FormError({ message, tone = 'dark' }: Props) {
  const style = tone === 'light'
    ? { backgroundColor: 'rgba(220,38,38,0.06)', borderColor: 'rgba(220,38,38,0.25)', color: '#B91C1C' }
    : { backgroundColor: 'rgba(248,113,113,0.10)', borderColor: 'rgba(248,113,113,0.35)', color: '#FCA5A5' }

  return (
    <AnimatePresence>
      {message && (
        <m.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div role="alert" className="rounded-xl border px-4 py-2.5 text-sm text-center" style={style}>
            {message}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
