import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { adminApi } from '../../../api/admin'
import { Badge } from '../../../components/ui/Badge'
import { Card } from '../../../components/ui/Card'
import { QueryState } from '../../../components/ui/QueryState'
import { formatMoney } from '../../../lib/media'

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.dashboard(),
  })
  const data = query.data

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('admin.dashboardTitle')}</h1>
      <QueryState isLoading={query.isLoading} error={query.error}>
        {data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label={t('admin.restaurantsCount')} value={String(data.restaurants_count ?? 0)} />
              <Stat label={t('admin.activeSubscriptions')} value={String(data.active_subscriptions ?? 0)} />
              <Stat label={t('admin.monthlyRevenue')} value={formatMoney(data.monthly_revenue ?? 0)} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h2 className="mb-3 font-semibold">{t('admin.expiringSoon')}</h2>
                <div className="space-y-2">
                  {(data.expiring_soon ?? []).length === 0 ? (
                    <p className="text-sm text-espresso-muted">{t('common.empty')}</p>
                  ) : (
                    data.expiring_soon.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-sm">
                        <span>{sub.restaurant?.name ?? `#${sub.restaurant_id}`}</span>
                        <span className="text-espresso-muted">{sub.ends_at ?? '—'}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
              <Card>
                <h2 className="mb-3 font-semibold">{t('admin.recentRestaurants')}</h2>
                <div className="space-y-2">
                  {(data.recent_restaurants ?? []).length === 0 ? (
                    <p className="text-sm text-espresso-muted">{t('common.empty')}</p>
                  ) : (
                    data.recent_restaurants.map((r) => (
                      <Link
                        key={r.id}
                        to={`/admin/restaurants/${r.id}`}
                        className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-sm hover:bg-cream-dark"
                      >
                        <span>{r.name}</span>
                        <Badge tone={r.is_active ? 'success' : 'danger'}>
                          {r.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </Link>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </QueryState>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-espresso-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-espresso">{value}</p>
    </Card>
  )
}
