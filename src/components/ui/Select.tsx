import { cn } from '../../lib/cn'
import type { ReactNode, SelectHTMLAttributes } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode
  error?: string
}

export function Select({ label, error, id, className, children, ...props }: Props) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-espresso">
          {label}
        </label>
      ) : null}
      <select
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl border bg-surface px-3 text-sm text-espresso outline-none focus:ring-2 focus:ring-gold/30',
          error ? 'border-red-400' : 'border-border',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
