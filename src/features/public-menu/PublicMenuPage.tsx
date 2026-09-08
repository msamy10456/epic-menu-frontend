import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { publicApi } from '../../api/public'
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher'
import { QueryState } from '../../components/ui/QueryState'
import { MenuRenderer } from '../theme-builder/MenuRenderer'
import { mergeTheme } from '../theme-builder/themeDefaults'

export function PublicMenuPage() {
  const { slug = '' } = useParams()
  const query = useQuery({
    queryKey: ['public-menu', slug],
    queryFn: () => publicApi.menu(slug),
    enabled: Boolean(slug),
  })

  return (
    <div className="min-h-svh bg-cream">
      <div className="mx-auto flex max-w-2xl justify-end p-3">
        <LanguageSwitcher />
      </div>
      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={!query.data}>
        {query.data ? (
          <MenuRenderer
            restaurant={query.data.restaurant}
            theme={mergeTheme(query.data.theme_config)}
            categories={query.data.categories ?? []}
            inactive={query.data.inactive}
          />
        ) : null}
      </QueryState>
    </div>
  )
}
