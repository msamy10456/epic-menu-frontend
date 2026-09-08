import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { restaurantApi } from '../../../api/restaurant'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { QueryState } from '../../../components/ui/QueryState'
import { Select } from '../../../components/ui/Select'
import { asList, getApiError } from '../../../lib/errors'
import { formatMoney } from '../../../lib/media'
import { useToastStore } from '../../../store/toastStore'
import type { PaymentGateway, Plan } from '../../../types'

export function SubscriptionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const [planId, setPlanId] = useState<number | null>(null)
  const [gateway, setGateway] = useState<PaymentGateway>('mock')

  const subQuery = useQuery({
    queryKey: ['restaurant', 'subscription'],
    queryFn: () => restaurantApi.subscription(),
  })
  const plansQuery = useQuery({
    queryKey: ['restaurant', 'plans'],
    queryFn: () => restaurantApi.plans(),
  })
  const paymentsQuery = useQuery({
    queryKey: ['restaurant', 'payments'],
    queryFn: () => restaurantApi.payments(),
  })

  const plans: Plan[] = [
    ...asList(plansQuery.data),
    ...asList(subQuery.data?.plans),
  ].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)

  const checkout = useMutation({
    mutationFn: () => restaurantApi.checkout({ plan_id: planId!, gateway }),
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ['restaurant', 'payments'] })
      if (gateway === 'mock') {
        navigate(`/payment/mock/${data.payment_id}`)
        return
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const subscription = subQuery.data?.subscription
  const payments = asList(paymentsQuery.data)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('restaurant.subscriptionTitle')}</h1>
      <QueryState isLoading={subQuery.isLoading} error={subQuery.error}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-2 font-semibold">{t('restaurant.currentPlan')}</h2>
            <p className="text-lg">{subscription?.plan?.name ?? '—'}</p>
            <Badge className="mt-2" tone={subscription?.status === 'active' ? 'success' : 'muted'}>
              {subscription?.status ?? '—'}
            </Badge>
            <p className="mt-2 text-sm text-espresso-muted">{subscription?.ends_at}</p>
          </Card>
          <Card className="space-y-3">
            <Select
              label={t('nav.plans')}
              value={planId ?? ''}
              onChange={(e) => setPlanId(Number(e.target.value))}
            >
              <option value="">—</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatMoney(p.price)} / {p.billing_cycle}
                </option>
              ))}
            </Select>
            <Select
              label={t('restaurant.chooseGateway')}
              value={gateway}
              onChange={(e) => setGateway(e.target.value as PaymentGateway)}
            >
              <option value="mock">mock</option>
              <option value="paymob">paymob</option>
              <option value="fawry">fawry</option>
            </Select>
            <Button
              className="w-full"
              disabled={!planId}
              loading={checkout.isPending}
              onClick={() => checkout.mutate()}
            >
              {t('restaurant.checkout')}
            </Button>
          </Card>
        </div>
      </QueryState>

      <Card>
        <h2 className="mb-3 font-semibold">{t('restaurant.payments')}</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-espresso-muted">{t('common.empty')}</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-sm">
                <span>
                  #{p.id} · {formatMoney(p.amount)} · {p.gateway}
                </span>
                <Badge tone={p.status === 'paid' ? 'success' : 'muted'}>{p.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
