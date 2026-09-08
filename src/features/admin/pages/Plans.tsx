import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../api/admin'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { QueryState } from '../../../components/ui/QueryState'
import { Select } from '../../../components/ui/Select'
import { asList, fieldError, getApiError, type FormErrors } from '../../../lib/errors'
import { formatMoney } from '../../../lib/media'
import { useToastStore } from '../../../store/toastStore'
import type { Plan } from '../../../types'

const emptyPlan: Partial<Plan> = {
  name: '',
  price: 0,
  billing_cycle: 'monthly',
  max_categories: 10,
  max_items: 50,
  max_themes: 3,
  allow_custom_domain: false,
  allow_analytics: true,
  allow_multi_branch: false,
  is_active: true,
  is_trial: false,
  trial_days: 14,
}

export function AdminPlansPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [form, setForm] = useState<Partial<Plan>>(emptyPlan)
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')

  const query = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminApi.plans(),
  })
  const plans = asList(query.data)

  const save = useMutation({
    mutationFn: () =>
      editing ? adminApi.updatePlan(editing.id, form) : adminApi.createPlan(form),
    onSuccess: async () => {
      push(editing ? t('toast.saved') : t('toast.created'), 'success')
      setOpen(false)
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['admin', 'plans'] })
    },
    onError: (err) => {
      const parsed = getApiError(err)
      setMessage(parsed.message)
      setErrors(parsed.errors)
      push(parsed.message, 'error')
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deletePlan(id),
    onSuccess: async () => {
      push(t('toast.deleted'), 'success')
      await qc.invalidateQueries({ queryKey: ['admin', 'plans'] })
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyPlan)
    setErrors({})
    setMessage('')
    setOpen(true)
  }

  const openEdit = (plan: Plan) => {
    setEditing(plan)
    setForm(plan)
    setErrors({})
    setMessage('')
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('admin.plansTitle')}</h1>
        <Button onClick={openCreate}>{t('common.create')}</Button>
      </div>
      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={plans.length === 0}>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-cream text-espresso-muted">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('common.name')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('plan.price')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('plan.billing')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3">{formatMoney(plan.price)}</td>
                  <td className="px-4 py-3">{t(`common.${plan.billing_cycle}`)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={plan.is_active ? 'success' : 'muted'}>
                      {plan.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) remove.mutate(plan.id)
                        }}
                      >
                        {t('common.delete')}
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
        <div className="grid gap-3 sm:grid-cols-2">
          {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2">{message}</p> : null}
          <Input label={t('common.name')} value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} error={fieldError(errors, 'name')} />
          <Input label={t('plan.price')} type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} error={fieldError(errors, 'price')} />
          <Select label={t('plan.billing')} value={form.billing_cycle} onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as Plan['billing_cycle'] })}>
            <option value="monthly">{t('common.monthly')}</option>
            <option value="yearly">{t('common.yearly')}</option>
          </Select>
          <Input label={t('plan.maxCategories')} type="number" value={form.max_categories ?? 0} onChange={(e) => setForm({ ...form, max_categories: Number(e.target.value) })} />
          <Input label={t('plan.maxItems')} type="number" value={form.max_items ?? 0} onChange={(e) => setForm({ ...form, max_items: Number(e.target.value) })} />
          <Input label={t('plan.maxThemes')} type="number" value={form.max_themes ?? 0} onChange={(e) => setForm({ ...form, max_themes: Number(e.target.value) })} />
          <Input label={t('plan.trialDays')} type="number" value={form.trial_days ?? 0} onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            {t('common.active')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.is_trial)} onChange={(e) => setForm({ ...form, is_trial: e.target.checked })} />
            {t('plan.trial')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.allow_analytics)} onChange={(e) => setForm({ ...form, allow_analytics: e.target.checked })} />
            {t('plan.analytics')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.allow_custom_domain)} onChange={(e) => setForm({ ...form, allow_custom_domain: e.target.checked })} />
            {t('plan.customDomain')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(form.allow_multi_branch)} onChange={(e) => setForm({ ...form, allow_multi_branch: e.target.checked })} />
            {t('plan.multiBranch')}
          </label>
        </div>
      </Modal>
    </div>
  )
}
