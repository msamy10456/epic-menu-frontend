import { cn } from '../../lib/cn'
import { useToastStore } from '../../store/toastStore'

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed end-4 top-4 z-[70] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismiss(toast.id)}
          className={cn(
            'pointer-events-auto rounded-2xl border px-4 py-3 text-start text-sm shadow-lg',
            toast.kind === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
            toast.kind === 'error' && 'border-red-200 bg-red-50 text-red-900',
            toast.kind === 'info' && 'border-border bg-surface text-espresso',
          )}
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}
