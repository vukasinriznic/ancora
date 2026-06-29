import { AnimatePresence, m } from 'framer-motion'

/* Animirani baner za greške na nivou forme (npr. pogrešni podaci, server nedostupan). */
export default function FormError({ message }: { message?: string | null }) {
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
          <div
            role="alert"
            className="rounded-xl border px-4 py-2.5 text-sm text-center"
            style={{
              backgroundColor: 'rgba(248,113,113,0.10)',
              borderColor: 'rgba(248,113,113,0.35)',
              color: '#FCA5A5',
            }}
          >
            {message}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
