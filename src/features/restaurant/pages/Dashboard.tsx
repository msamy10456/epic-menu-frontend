import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { restaurantApi } from '../../../api/restaurant'
import { Card } from '../../../components/ui/Card'
import { QueryState } from '../../../components/ui/QueryState'
import { Badge } from '../../../components/ui/Badge'

export function RestaurantDashboardPage() {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: ['restaurant', 'dashboard'],
    queryFn: () => restaurantApi.dashboard(),
  })
  const data = query.data

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('restaurant.dashboardTitle')}</h1>
      <QueryState isLoading={query.isLoading} error={query.error}>
        {data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <p className="text-sm text-espresso-muted">{t('common.name')}</p>
                <p className="mt-2 text-2xl font-semibold">{data.restaurant?.name}</p>
                <Badge className="mt-2" tone={data.restaurant?.is_active ? 'success' : 'danger'}>
                  {data.restaurant?.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
              </Card>
              <Card>
                <p className="text-sm text-espresso-muted">{t('restaurant.categoriesUsed')}</p>
                <p className="mt-2 text-3xl font-semibold">
                  {data.usage?.categories ?? 0}
                  <span className="text-base text-espresso-muted">
                    /{data.usage?.max_categories ?? '∞'}
                  </span>
                </p>
              </Card>
              <Card>
                <p className="text-sm text-espresso-muted">{t('restaurant.itemsUsed')}</p>
                <p className="mt-2 text-3xl font-semibold">
                  {data.usage?.items ?? 0}
                  <span className="text-base text-espresso-muted">/{data.usage?.max_items ?? '∞'}</span>
                </p>
              </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <h2 className="mb-2 font-semibold">{t('restaurant.currentPlan')}</h2>
                <p>{data.plan?.name ?? '—'}</p>
                <p className="text-sm text-espresso-muted">{data.subscription?.status ?? '—'}</p>
                <p className="text-sm text-espresso-muted">{data.subscription?.ends_at ?? ''}</p>
              </Card>
              <Card>
                <h2 className="mb-2 font-semibold">{t('restaurant.recentActivity')}</h2>
                {(data.recent_activity ?? []).length === 0 ? (
                  <p className="text-sm text-espresso-muted">{t('common.empty')}</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.recent_activity.map((item, index) => (
                      <li key={item.id ?? index} className="rounded-xl bg-cream px-3 py-2">
                        {item.message || item.description || item.type || '—'}
                        {item.created_at ? (
                          <span className="ms-2 text-espresso-muted">{item.created_at}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        ) : null}
      </QueryState>
    </div>
  )
}
