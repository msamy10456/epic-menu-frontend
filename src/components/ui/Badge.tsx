import { cn } from '../../lib/cn'
import type { ReactNode } from 'react'

type Tone = 'gold' | 'muted' | 'success' | 'danger'

export function Badge({
  children,
  tone = 'gold',
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  const tones: Record<Tone, string> = {
    gold: 'bg-gold/15 text-gold-dark',
    muted: 'bg-cream-dark text-espresso-muted',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-red-100 text-red-800',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
