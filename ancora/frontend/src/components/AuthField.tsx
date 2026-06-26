import { useState } from 'react'
import { m } from 'framer-motion'

interface Props {
  id: string
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  autoComplete?: string
  /* Textarea umesto inputa (npr. self-description na registraciji) */
  multiline?: boolean
  rows?: number
  /* Prikaz brojača karaktera (za polja sa min dužinom) */
  showCount?: boolean
  minCount?: number
  /* Redni broj polja → staggered ulazna animacija */
  index?: number
}

/*
  Input/textarea za auth glass kartice na tamnoj pozadini.
  - Poluprozirna bela pozadina, fokus pojačava zeleni border + glow
  - Password polja imaju show/hide toggle
*/
export default function AuthField({
  id, label, type = 'text', value, onChange, placeholder,
  error, autoComplete, multiline, rows = 4, showCount, minCount, index = 0,
}: Props) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && show ? 'text' : type

  const baseStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: error
      ? 'rgba(248,113,113,0.6)'
      : focused
        ? '#1FD65F'
        : 'rgba(255,255,255,0.14)',
    color: '#FFFFFF',
    boxShadow: focused && !error ? '0 0 0 3px rgba(31,214,95,0.15)' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  }

  return (
    <m.div
      className="mb-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: 'rgba(255,255,255,0.8)' }}
      >
        {label}
      </label>

      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            rows={rows}
            className="w-full rounded-xl border px-4 py-3 text-base sm:text-sm outline-none resize-none placeholder:text-white/30"
            style={baseStyle}
          />
        ) : (
          <input
            id={id}
            type={inputType}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full rounded-xl border px-4 py-3 text-base sm:text-sm outline-none placeholder:text-white/30"
            style={{ ...baseStyle, paddingRight: isPassword ? '3rem' : undefined }}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-1 py-0.5"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>

      {/* Brojač karaktera ili poruka o grešci */}
      <div className="flex items-center justify-between mt-1 min-h-[1rem]">
        <span className="text-xs" style={{ color: 'rgba(248,113,113,0.9)' }}>
          {error}
        </span>
        {showCount && minCount != null && (
          <span
            className="text-xs"
            style={{ color: value.length >= minCount ? '#54E98A' : 'rgba(255,255,255,0.4)' }}
          >
            {value.length}/{minCount}
          </span>
        )}
      </div>
    </m.div>
  )
}
