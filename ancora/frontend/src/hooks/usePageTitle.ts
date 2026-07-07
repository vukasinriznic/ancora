import { useEffect } from 'react'

/* Postavlja document.title za trenutnu stranicu (re-run kad se jezik promeni preko t()). */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — Ancora` : 'Ancora'
  }, [title])
}
