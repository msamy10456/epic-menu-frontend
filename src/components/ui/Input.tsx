import { cn } from '../../lib/cn'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-espresso">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl border bg-surface px-3 text-sm text-espresso outline-none transition-shadow placeholder:text-espresso-muted/60 focus:ring-2 focus:ring-gold/30',
          error ? 'border-red-400' : 'border-border',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {hint && !error ? <p className="text-xs text-espresso-muted">{hint}</p> : null}
    </div>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode
  error?: string
}

export function Textarea({ label, error, id, className, ...props }: TextareaProps) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-espresso">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn(
          'min-h-24 w-full rounded-xl border bg-surface px-3 py-2 text-sm text-espresso outline-none focus:ring-2 focus:ring-gold/30',
          error ? 'border-red-400' : 'border-border',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
