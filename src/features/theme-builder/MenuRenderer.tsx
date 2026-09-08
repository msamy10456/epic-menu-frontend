import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { formatMoney, localizedName, mediaUrl } from '../../lib/media'
import type { Category, MenuItem, PublicRestaurant, ThemeConfig } from '../../types'

export type MenuRendererProps = {
  restaurant: Pick<PublicRestaurant, 'name' | 'logo' | 'phone' | 'address'>
  theme: ThemeConfig
  categories: Category[]
  language?: string
  inactive?: boolean
  compact?: boolean
  onItemClick?: (item: MenuItem) => void
}

export function MenuRenderer({
  restaurant,
  theme,
  categories,
  language,
  inactive,
  compact,
  onItemClick,
}: MenuRendererProps) {
  const { i18n, t } = useTranslation()
  const lang = language ?? i18n.language
  const activeCategories = categories.filter((c) => c.is_active !== false)
  const [activeId, setActiveId] = useState<number | 'all'>('all')

  const visibleItems = useMemo(() => {
    const source =
      activeId === 'all'
        ? activeCategories.flatMap((c) => c.items ?? [])
        : (activeCategories.find((c) => c.id === activeId)?.items ?? [])
    return source.filter((item) => item.is_available !== false)
  }, [activeCategories, activeId])

  const radius = `${theme.style.borderRadius}px`
  const align = theme.header.alignment === 'center' ? 'center' : 'start'

  const vars = {
    backgroundColor: theme.style.backgroundColor,
    color: theme.style.textColor,
    fontFamily: theme.style.fontFamily,
    ['--menu-surface' as string]: theme.style.surfaceColor,
    ['--menu-muted' as string]: theme.style.mutedTextColor,
    ['--menu-primary' as string]: theme.style.primaryColor,
    ['--menu-accent' as string]: theme.style.accentColor,
    ['--menu-secondary' as string]: theme.style.secondaryColor,
  }

  const renderSection = (type: ThemeConfig['layout']['sections'][number]['type']) => {
    if (type === 'header') {
      return (
        <header
          className="px-5 py-8"
          style={{ textAlign: align, backgroundColor: theme.style.surfaceColor }}
        >
          {theme.header.showLogo && restaurant.logo ? (
            <img
              src={mediaUrl(restaurant.logo)}
              alt=""
              className={cn('mb-4 h-16 w-16 object-cover', align === 'center' && 'mx-auto')}
              style={{ borderRadius: radius }}
            />
          ) : null}
          {theme.header.showName ? (
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: theme.style.headingFontFamily, color: theme.style.primaryColor }}
            >
              {restaurant.name}
            </h1>
          ) : null}
          {theme.header.showAddress && restaurant.address ? (
            <p className="mt-2 text-sm" style={{ color: theme.style.mutedTextColor }}>
              {restaurant.address}
            </p>
          ) : null}
          {theme.header.showPhone && restaurant.phone ? (
            <p className="mt-1 text-sm" style={{ color: theme.style.mutedTextColor }}>
              {restaurant.phone}
            </p>
          ) : null}
        </header>
      )
    }

    if (type === 'categories') {
      const display = theme.categories.display
      return (
        <nav
          className={cn(
            'px-4 py-3',
            theme.categories.sticky && 'sticky top-0 z-10',
          )}
          style={{ backgroundColor: theme.style.backgroundColor }}
        >
          <div
            className={cn(
              display === 'list' ? 'flex flex-col gap-1' : 'flex gap-2 overflow-x-auto pb-1',
            )}
          >
            <CategoryChip
              label={t('common.all')}
              active={activeId === 'all'}
              display={display}
              radius={radius}
              theme={theme}
              onClick={() => setActiveId('all')}
            />
            {activeCategories.map((cat) => (
              <CategoryChip
                key={cat.id}
                label={localizedName(lang, cat.name_ar, cat.name_en)}
                active={activeId === cat.id}
                display={display}
                radius={radius}
                theme={theme}
                onClick={() => setActiveId(cat.id)}
              />
            ))}
          </div>
        </nav>
      )
    }

    if (type === 'items') {
      const layout = theme.items.layout
      return (
        <section className="px-4 py-4">
          {visibleItems.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: theme.style.mutedTextColor }}>
              {t('public.noItems')}
            </p>
          ) : (
            <div
              className={cn(
                layout === 'grid' && 'grid grid-cols-2 gap-3',
                layout === 'cards' && 'grid gap-4 sm:grid-cols-2',
                layout === 'list' && 'flex flex-col gap-3',
              )}
            >
              {visibleItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  theme={theme}
                  lang={lang}
                  radius={radius}
                  onClick={() => onItemClick?.(item)}
                />
              ))}
            </div>
          )}
        </section>
      )
    }

    return (
      <footer
        className="mt-auto px-5 py-8 text-sm"
        style={{ backgroundColor: theme.style.surfaceColor, color: theme.style.mutedTextColor }}
      >
        {theme.footer.text ? <p className="mb-2">{theme.footer.text}</p> : null}
        {theme.footer.showAddress && restaurant.address ? <p>{restaurant.address}</p> : null}
        {theme.footer.showPhone && restaurant.phone ? <p>{restaurant.phone}</p> : null}
      </footer>
    )
  }

  return (
    <div
      className={cn('mx-auto flex min-h-full flex-col overflow-hidden', compact ? 'max-w-md' : 'max-w-2xl')}
      style={{ ...vars, borderRadius: compact ? radius : undefined }}
    >
      {inactive ? (
        <div
          className="px-4 py-3 text-center text-sm font-medium"
          style={{ backgroundColor: theme.style.accentColor, color: theme.style.textColor }}
        >
          {t('public.inactiveBanner')}
        </div>
      ) : null}
      {theme.layout.sections
        .filter((s) => s.visible)
        .map((section) => (
          <div key={section.id}>{renderSection(section.type)}</div>
        ))}
    </div>
  )
}

function CategoryChip({
  label,
  active,
  display,
  radius,
  theme,
  onClick,
}: {
  label: string
  active: boolean
  display: ThemeConfig['categories']['display']
  radius: string
  theme: ThemeConfig
  onClick: () => void
}) {
  const isTab = display === 'tabs'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors', display === 'list' && 'w-full text-start')}
      style={{
        borderRadius: isTab ? 0 : radius,
        backgroundColor: active ? theme.style.primaryColor : theme.style.surfaceColor,
        color: active ? '#fff' : theme.style.textColor,
        borderBottom: isTab ? `2px solid ${active ? theme.style.primaryColor : 'transparent'}` : undefined,
      }}
    >
      {label}
    </button>
  )
}

function ItemCard({
  item,
  theme,
  lang,
  radius,
  onClick,
}: {
  item: MenuItem
  theme: ThemeConfig
  lang: string
  radius: string
  onClick: () => void
}) {
  const { t } = useTranslation()
  const layout = theme.items.layout
  const img = mediaUrl(item.image)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full overflow-hidden text-start',
        layout === 'list' && 'flex gap-3 p-3',
        layout !== 'list' && 'flex flex-col',
      )}
      style={{ backgroundColor: theme.style.surfaceColor, borderRadius: radius }}
    >
      {theme.items.showImages && img ? (
        <img
          src={img}
          alt=""
          className={cn(
            'object-cover',
            layout === 'list' ? 'h-20 w-20 shrink-0' : 'h-40 w-full',
          )}
          style={{ borderRadius: layout === 'list' ? radius : undefined }}
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium" style={{ fontFamily: theme.style.headingFontFamily }}>
            {localizedName(lang, item.name_ar, item.name_en)}
          </h3>
          {theme.items.showPrice ? (
            <span className="shrink-0 font-semibold" style={{ color: theme.style.primaryColor }}>
              {formatMoney(item.price)}
            </span>
          ) : null}
        </div>
        {theme.items.showDescription ? (
          <p className="text-sm" style={{ color: theme.style.mutedTextColor }}>
            {localizedName(lang, item.description_ar, item.description_en)}
          </p>
        ) : null}
        {theme.items.showVariants && item.variants?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-xs" style={{ color: theme.style.mutedTextColor }}>
              {t('public.variants')}:
            </span>
            {item.variants.map((v) => (
              <span
                key={v.id}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: theme.style.backgroundColor }}
              >
                {localizedName(lang, v.name_ar, v.name_en)}
                {v.extra_price ? ` +${formatMoney(v.extra_price)}` : ''}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  )
}
