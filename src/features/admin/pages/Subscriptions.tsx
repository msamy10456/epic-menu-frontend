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
import { asList, getApiError } from '../../../lib/errors'
import { useToastStore } from '../../../store/toastStore'
import type { Subscription } from '../../../types'

export function AdminSubscriptionsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const [editing, setEditing] = useState<Subscription | null>(null)
  const [endsAt, setEndsAt] = useState('')
  const [status, setStatus] = useState('active')
  const [planId, setPlanId] = useState('')

  const query = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => adminApi.subscriptions(),
  })
  const plansQuery = useQuery({ queryKey: ['admin', 'plans'], queryFn: () => adminApi.plans() })
  const rows = asList(query.data)
  const plans = asList(plansQuery.data)

  const save = useMutation({
    mutationFn: () =>
      adminApi.updateSubscription(editing!.id, {
        ends_at: endsAt || undefined,
        status: status || undefined,
        plan_id: planId ? Number(planId) : undefined,
      }),
    onSuccess: async () => {
      push(t('toast.saved'), 'success')
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('admin.subscriptionsTitle')}</h1>
      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={rows.length === 0}>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-cream text-espresso-muted">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('nav.restaurants')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('nav.plans')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('common.status')}</th>
                <th className="px-4 py-3 text-start font-medium">ends_at</th>
                <th className="px-4 py-3 text-start font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3">{row.restaurant?.name ?? row.restaurant_id}</td>
                  <td className="px-4 py-3">{row.plan?.name ?? row.plan_id}</td>
                  <td className="px-4 py-3">
                    <Badge tone={row.status === 'active' ? 'success' : 'muted'}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{row.ends_at ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(row)
                        setEndsAt(row.ends_at?.slice(0, 10) ?? '')
                        setStatus(row.status)
                        setPlanId(String(row.plan_id))
                      }}
                    >
                      {t('common.extend')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={t('common.extend')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              {t('common.cancel')}
            </Button>
            <Button loading={save.isPending} onClick={() => save.mutate()}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="ends_at" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          <Select label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">{t('common.active')}</option>
            <option value="expired">expired</option>
            <option value="cancelled">cancelled</option>
            <option value="trialing">trialing</option>
          </Select>
          <Select label={t('nav.plans')} value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  )
}
