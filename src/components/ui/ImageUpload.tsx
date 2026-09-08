import { Upload } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'
import { cn } from '../../lib/cn'
import { mediaUrl } from '../../lib/media'
import { Button } from './Button'

export function ImageUpload({
  label,
  value,
  onChange,
  onFile,
  uploading,
}: {
  label: string
  value?: string | null
  onChange: (url: string) => void
  onFile?: (file: File) => void
  uploading?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = mediaUrl(value)

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (onFile) {
      onFile(file)
    } else {
      onChange(URL.createObjectURL(file))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-espresso">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-cream',
          )}
        >
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <Upload className="size-5 text-espresso-muted" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {label}
          </Button>
          {value ? (
            <button
              type="button"
              className="text-start text-xs text-espresso-muted underline"
              onClick={() => onChange('')}
            >
              Remove
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
      </div>
    </div>
  )
}
