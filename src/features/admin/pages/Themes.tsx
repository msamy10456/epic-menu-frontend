import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { ImageUpload } from '../../../components/ui/ImageUpload'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { QueryState } from '../../../components/ui/QueryState'
import { asList, fieldError, getApiError, type FormErrors } from '../../../lib/errors'
import { mediaUrl } from '../../../lib/media'
import { useToastStore } from '../../../store/toastStore'
import { defaultThemeConfig } from '../../theme-builder/themeDefaults'
import type { Theme } from '../../../types'

export function AdminThemesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Theme | null>(null)
  const [name, setName] = useState('')
  const [configText, setConfigText] = useState(JSON.stringify(defaultThemeConfig, null, 2))
  const [planIds, setPlanIds] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')

  const query = useQuery({ queryKey: ['admin', 'themes'], queryFn: () => adminApi.themes() })
  const plansQuery = useQuery({ queryKey: ['admin', 'plans'], queryFn: () => adminApi.plans() })
  const themes = asList(query.data)
  const plans = asList(plansQuery.data)

  const openCreate = () => {
    setEditing(null)
    setName('')
    setConfigText(JSON.stringify(defaultThemeConfig, null, 2))
    setPlanIds('')
    setFile(null)
    setPreview(null)
    setErrors({})
    setMessage('')
    setOpen(true)
  }

  const openEdit = (theme: Theme) => {
    setEditing(theme)
    setName(theme.name)
    setConfigText(JSON.stringify(theme.config ?? defaultThemeConfig, null, 2))
    setPlanIds((theme.plan_ids ?? []).join(','))
    setFile(null)
    setPreview(theme.thumbnail)
    setErrors({})
    setMessage('')
    setOpen(true)
  }

  const save = useMutation({
    mutationFn: async () => {
      let config: unknown = defaultThemeConfig
      try {
        config = JSON.parse(configText)
      } catch {
        throw new Error('Invalid theme JSON')
      }
      const ids = planIds
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
      const form = new FormData()
      form.append('name', name)
      form.append('config', JSON.stringify(config))
      form.append('is_global', '1')
      ids.forEach((id) => form.append('plan_ids[]', String(id)))
      if (file) form.append('thumbnail', file)
      return editing ? adminApi.updateTheme(editing.id, form) : adminApi.createTheme(form)
    },
    onSuccess: async () => {
      push(editing ? t('toast.saved') : t('toast.created'), 'success')
      setOpen(false)
      await qc.invalidateQueries({ queryKey: ['admin', 'themes'] })
    },
    onError: (err) => {
      const parsed = getApiError(err)
      setMessage(parsed.message)
      setErrors(parsed.errors)
      push(parsed.message, 'error')
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteTheme(id),
    onSuccess: async () => {
      push(t('toast.deleted'), 'success')
      await qc.invalidateQueries({ queryKey: ['admin', 'themes'] })
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('admin.themesTitle')}</h1>
        <Button onClick={openCreate}>{t('common.create')}</Button>
      </div>
      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={themes.length === 0}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme.id} className="overflow-hidden p-0">
              <div
                className="h-32"
                style={{
                  background: theme.config?.style?.primaryColor || '#b8860b',
                  backgroundImage: mediaUrl(theme.thumbnail)
                    ? `url(${mediaUrl(theme.thumbnail)})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{theme.name}</p>
                  <p className="text-xs text-espresso-muted">{theme.config?.style?.primaryColor}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(theme)}>
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (window.confirm(t('common.confirmDelete'))) remove.mutate(theme.id)
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </QueryState>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t('common.edit') : t('common.create')}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button loading={save.isPending} onClick={() => save.mutate()}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p> : null}
          <Input label={t('common.name')} value={name} onChange={(e) => setName(e.target.value)} error={fieldError(errors, 'name')} />
          <ImageUpload
            label={t('common.image')}
            value={file ? URL.createObjectURL(file) : preview}
            onChange={() => {
              setFile(null)
              setPreview(null)
            }}
            onFile={(f) => {
              setFile(f)
              setPreview(URL.createObjectURL(f))
            }}
          />
          <Input
            label="Plan IDs"
            hint={plans.map((p) => `${p.id}:${p.name}`).join(' · ')}
            value={planIds}
            onChange={(e) => setPlanIds(e.target.value)}
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">config JSON</span>
            <textarea
              className="min-h-48 rounded-xl border border-border bg-cream p-3 font-mono text-xs"
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
            />
          </label>
        </div>
      </Modal>
    </div>
  )
}
