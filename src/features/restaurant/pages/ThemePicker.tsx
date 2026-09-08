import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { restaurantApi } from '../../../api/restaurant'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { QueryState } from '../../../components/ui/QueryState'
import { asList, getApiError } from '../../../lib/errors'
import { mediaUrl } from '../../../lib/media'
import { useAuthStore } from '../../../store/authStore'
import { useToastStore } from '../../../store/toastStore'

export function ThemePickerPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const restaurant = useAuthStore((s) => s.restaurant)

  const query = useQuery({
    queryKey: ['restaurant', 'themes'],
    queryFn: () => restaurantApi.themes(),
  })
  const themes = asList(query.data)

  const select = useMutation({
    mutationFn: (id: number) => restaurantApi.selectTheme(id),
    onSuccess: async () => {
      push(t('toast.saved'), 'success')
      await qc.invalidateQueries({ queryKey: ['restaurant'] })
      await qc.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('restaurant.themesTitle')}</h1>
        <Link to="/app/themes/editor">
          <Button variant="outline">{t('restaurant.themeEditor')}</Button>
        </Link>
      </div>
      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={themes.length === 0}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => {
            const selected = restaurant?.current_theme_id === theme.id
            const color = theme.config?.style?.primaryColor || '#b8860b'
            return (
              <Card key={theme.id} className="overflow-hidden p-0">
                <div
                  className="h-36"
                  style={{
                    background: color,
                    backgroundImage: mediaUrl(theme.thumbnail)
                      ? `url(${mediaUrl(theme.thumbnail)})`
                      : undefined,
                    backgroundSize: 'cover',
                  }}
                />
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{theme.name}</p>
                    <p className="text-xs text-espresso-muted">{color}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={selected ? 'secondary' : 'primary'}
                    loading={select.isPending}
                    onClick={() => select.mutate(theme.id)}
                  >
                    {selected ? t('common.selected') : t('common.select')}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </QueryState>
    </div>
  )
}
