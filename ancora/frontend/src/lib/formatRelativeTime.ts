/* "2 hours ago" / "pre 2 sata" — koristi Intl.RelativeTimeFormat po aktivnom jeziku. */
export function formatRelativeTime(dateStr: string, lang: string): string {
  const diffMs = new Date(dateStr).getTime() - Date.now()
  const diffMin = Math.round(diffMs / 60000)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })

  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour')
  const diffDay = Math.round(diffHour / 24)
  return rtf.format(diffDay, 'day')
}
