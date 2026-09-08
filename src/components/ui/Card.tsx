import { cn } from '../../lib/cn'
import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className, children, ...props }: Props) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-surface p-5 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}
