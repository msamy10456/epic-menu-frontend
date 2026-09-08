import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { restaurantApi } from '../../../api/restaurant'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { QueryState } from '../../../components/ui/QueryState'
import { asList, getApiError } from '../../../lib/errors'
import { useAuthStore } from '../../../store/authStore'
import { useToastStore } from '../../../store/toastStore'
import { ThemeEditor } from '../../theme-builder/ThemeEditor'
import { mergeTheme } from '../../theme-builder/themeDefaults'
import type { Category, ThemeConfig } from '../../../types'

export function ThemeEditorPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const restaurant = useAuthStore((s) => s.restaurant)
  const [draft, setDraft] = useState<ThemeConfig | null>(null)

  const themeQuery = useQuery({
    queryKey: ['restaurant', 'theme'],
    queryFn: () => restaurantApi.currentTheme(),
  })
  const catsQuery = useQuery({
    queryKey: ['restaurant', 'categories'],
    queryFn: () => restaurantApi.categories(),
  })
  const itemsQuery = useQuery({
    queryKey: ['restaurant', 'items'],
    queryFn: () => restaurantApi.items(),
  })
  const versionsQuery = useQuery({
    queryKey: ['restaurant', 'theme', 'versions'],
    queryFn: () => restaurantApi.themeVersions(),
  })

  const serverConfig = themeQuery.data
    ? mergeTheme(themeQuery.data.config ?? themeQuery.data.theme?.config)
    : null
  const config = draft ?? serverConfig

  const categories: Category[] = asList(catsQuery.data).map((cat) => ({
    ...cat,
    items: asList(itemsQuery.data).filter((item) => item.category_id === cat.id),
  }))

  const save = useMutation({
    mutationFn: () => restaurantApi.saveTheme(config!),
    onSuccess: async () => {
      push(t('toast.saved'), 'success')
      await qc.invalidateQueries({ queryKey: ['restaurant', 'theme'] })
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const rollback = useMutation({
    mutationFn: (id: number) => restaurantApi.rollbackTheme(id),
    onSuccess: async (data) => {
      setDraft(mergeTheme(data.config))
      push(t('toast.saved'), 'success')
      await qc.invalidateQueries({ queryKey: ['restaurant', 'theme'] })
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const versions = asList(versionsQuery.data)
  const previewRestaurant = {
    name: restaurant?.name ?? 'Restaurant',
    logo: restaurant?.logo ?? null,
    phone: restaurant?.phone ?? null,
    address: restaurant?.address ?? null,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('restaurant.themeEditor')}</h1>
        <Button loading={save.isPending} disabled={!config} onClick={() => save.mutate()}>
          {t('restaurant.saveTheme')}
        </Button>
      </div>
      <QueryState
        isLoading={themeQuery.isLoading || catsQuery.isLoading}
        error={themeQuery.error || catsQuery.error}
      >
        {config ? (
          <ThemeEditor
            config={config}
            onChange={setDraft}
            restaurant={previewRestaurant}
            categories={categories}
          />
        ) : null}
      </QueryState>
      <Card>
        <h2 className="mb-3 font-semibold">{t('restaurant.versions')}</h2>
        {versions.length === 0 ? (
          <p className="text-sm text-espresso-muted">{t('common.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-sm">
                <span>{v.created_at}</span>
                <Button size="sm" variant="outline" onClick={() => rollback.mutate(v.id)}>
                  {t('restaurant.rollback')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
