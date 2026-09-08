import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { adminApi } from '../../../api/admin'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { QueryState } from '../../../components/ui/QueryState'
import { asList, fieldError, getApiError, type FormErrors } from '../../../lib/errors'
import { useToastStore } from '../../../store/toastStore'

export function AdminRestaurantsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    slug: '',
    email: '',
    owner_name: '',
    phone: '',
    address: '',
  })

  const query = useQuery({
    queryKey: ['admin', 'restaurants'],
    queryFn: () => adminApi.restaurants(),
  })
  const restaurants = asList(query.data).filter((r) =>
    r.name.toLowerCase().includes(q.toLowerCase()),
  )

  const create = useMutation({
    mutationFn: () => adminApi.createRestaurant(form),
    onSuccess: async () => {
      push(t('toast.created'), 'success')
      setOpen(false)
      await qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
    },
    onError: (err) => {
      const parsed = getApiError(err)
      setMessage(parsed.message)
      setErrors(parsed.errors)
      push(parsed.message, 'error')
    },
  })

  const toggle = useMutation({
    mutationFn: (row: { id: number; is_active: boolean }) =>
      row.is_active ? adminApi.suspendRestaurant(row.id) : adminApi.activateRestaurant(row.id),
    onSuccess: async () => {
      push(t('toast.saved'), 'success')
      await qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('admin.restaurantsTitle')}</h1>
        <Button onClick={() => setOpen(true)}>{t('common.create')}</Button>
      </div>
      <Input
        placeholder={t('common.search')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />
      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={restaurants.length === 0}>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead className="bg-cream text-espresso-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{t('common.name')}</th>
                <th className="px-4 py-3 font-medium">{t('common.slug')}</th>
                <th className="px-4 py-3 font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-espresso-muted">{r.slug}</td>
                  <td className="px-4 py-3">
                    <Badge tone={r.is_active ? 'success' : 'danger'}>
                      {r.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/admin/restaurants/${r.id}`}>
                        <Button size="sm" variant="outline">
                          {t('common.view')}
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant={r.is_active ? 'danger' : 'secondary'}
                        onClick={() => toggle.mutate(r)}
                      >
                        {r.is_active ? t('common.suspend') : t('common.activate')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('common.create')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button loading={create.isPending} onClick={() => create.mutate()}>
              {t('common.create')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p> : null}
          <Input label={t('common.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={fieldError(errors, 'name')} />
          <Input label={t('common.slug')} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} error={fieldError(errors, 'slug')} />
          <Input label={t('admin.ownerName')} value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} error={fieldError(errors, 'owner_name')} />
          <Input label={t('admin.ownerEmail')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={fieldError(errors, 'email')} />
          <Input label={t('common.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label={t('common.address')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
