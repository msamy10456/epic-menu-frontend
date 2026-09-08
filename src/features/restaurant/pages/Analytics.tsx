import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { restaurantApi } from '../../../api/restaurant'
import { Card } from '../../../components/ui/Card'
import { QueryState } from '../../../components/ui/QueryState'
import { localizedName } from '../../../lib/media'

export function AnalyticsPage() {
  const { t, i18n } = useTranslation()
  const query = useQuery({
    queryKey: ['restaurant', 'analytics'],
    queryFn: () => restaurantApi.analytics(),
  })
  const data = query.data

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('restaurant.analyticsTitle')}</h1>
      <QueryState isLoading={query.isLoading} error={query.error}>
        {data ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <p className="text-sm text-espresso-muted">{t('restaurant.views')}</p>
                <p className="mt-2 text-3xl font-semibold">{data.views ?? 0}</p>
              </Card>
              <Card>
                <p className="text-sm text-espresso-muted">{t('restaurant.itemClicks')}</p>
                <p className="mt-2 text-3xl font-semibold">{data.item_clicks ?? 0}</p>
              </Card>
            </div>
            <Card className="h-80">
              <h2 className="mb-4 font-semibold">{t('restaurant.viewsOverTime')}</h2>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={data.views_over_time ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc8" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#b8860b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card className="h-80">
              <h2 className="mb-4 font-semibold">{t('restaurant.topItems')}</h2>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={(data.top_items ?? []).map((item) => ({
                    name: localizedName(i18n.language, item.name_ar, item.name_en),
                    clicks: item.clicks,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#c9a227" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </>
        ) : null}
      </QueryState>
    </div>
  )
}
