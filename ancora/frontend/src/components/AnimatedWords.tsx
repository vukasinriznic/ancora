import { m } from 'framer-motion'

interface Props {
  children: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'blockquote'
  className?: string
  style?: React.CSSProperties
  delay?: number
  stagger?: number
  isInView: boolean
}

export default function AnimatedWords({
  children,
  as: Tag = 'span',
  className,
  style,
  delay   = 0,
  stagger = 0.055,
  isInView,
}: Props) {
  const words = children.split(' ')

  return (
    <Tag className={className} style={style}>
      {words.map((word, i) => (
        <m.span
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: delay + i * stagger, ease: 'easeOut' }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </m.span>
      ))}
    </Tag>
  )
}
