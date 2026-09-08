import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center',
        className,
      )}
    >
      <p className="text-base font-medium text-espresso">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm text-espresso-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
