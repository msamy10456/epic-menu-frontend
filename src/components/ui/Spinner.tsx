import { cn } from '../../lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <span className="size-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  )
}
