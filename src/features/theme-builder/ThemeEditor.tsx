import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { cn } from '../../lib/cn'
import type { Category, PublicRestaurant, ThemeConfig, ThemeSectionType } from '../../types'
import { MenuRenderer } from './MenuRenderer'

type Props = {
  config: ThemeConfig
  onChange: (config: ThemeConfig) => void
  restaurant: Pick<PublicRestaurant, 'name' | 'logo' | 'phone' | 'address'>
  categories: Category[]
}

export function ThemeEditor({ config, onChange, restaurant, categories }: Props) {
  const { t } = useTranslation()
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const update = (patch: Partial<ThemeConfig>) => onChange({ ...config, ...patch })

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = config.layout.sections.map((s) => s.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    update({
      layout: { sections: arrayMove(config.layout.sections, oldIndex, newIndex) },
    })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
        <h3 className="font-semibold">{t('theme.colors')}</h3>
        <ColorField
          label={t('theme.primary')}
          value={config.style.primaryColor}
          onChange={(primaryColor) => update({ style: { ...config.style, primaryColor } })}
        />
        <ColorField
          label={t('theme.secondary')}
          value={config.style.secondaryColor}
          onChange={(secondaryColor) => update({ style: { ...config.style, secondaryColor } })}
        />
        <ColorField
          label={t('theme.background')}
          value={config.style.backgroundColor}
          onChange={(backgroundColor) => update({ style: { ...config.style, backgroundColor } })}
        />
        <ColorField
          label={t('theme.surface')}
          value={config.style.surfaceColor}
          onChange={(surfaceColor) => update({ style: { ...config.style, surfaceColor } })}
        />
        <ColorField
          label={t('theme.text')}
          value={config.style.textColor}
          onChange={(textColor) => update({ style: { ...config.style, textColor } })}
        />
        <ColorField
          label={t('theme.muted')}
          value={config.style.mutedTextColor}
          onChange={(mutedTextColor) => update({ style: { ...config.style, mutedTextColor } })}
        />
        <ColorField
          label={t('theme.accent')}
          value={config.style.accentColor}
          onChange={(accentColor) => update({ style: { ...config.style, accentColor } })}
        />
        <Select
          label={t('theme.mode')}
          value={config.style.mode}
          onChange={(e) =>
            update({ style: { ...config.style, mode: e.target.value as 'light' | 'dark' } })
          }
        >
          <option value="light">{t('theme.light')}</option>
          <option value="dark">{t('theme.dark')}</option>
        </Select>
        <Input
          label={t('theme.fontFamily')}
          value={config.style.fontFamily}
          onChange={(e) => update({ style: { ...config.style, fontFamily: e.target.value } })}
        />
        <Input
          label={t('theme.headingFont')}
          value={config.style.headingFontFamily}
          onChange={(e) =>
            update({ style: { ...config.style, headingFontFamily: e.target.value } })
          }
        />
        <Input
          label={t('theme.radius')}
          type="number"
          value={config.style.borderRadius}
          onChange={(e) =>
            update({ style: { ...config.style, borderRadius: Number(e.target.value) } })
          }
        />

        <h3 className="pt-2 font-semibold">{t('theme.header')}</h3>
        <Toggle
          label={t('theme.showLogo')}
          checked={config.header.showLogo}
          onChange={(showLogo) => update({ header: { ...config.header, showLogo } })}
        />
        <Toggle
          label={t('theme.showName')}
          checked={config.header.showName}
          onChange={(showName) => update({ header: { ...config.header, showName } })}
        />
        <Toggle
          label={t('theme.showAddress')}
          checked={config.header.showAddress}
          onChange={(showAddress) => update({ header: { ...config.header, showAddress } })}
        />
        <Toggle
          label={t('theme.showPhone')}
          checked={config.header.showPhone}
          onChange={(showPhone) => update({ header: { ...config.header, showPhone } })}
        />
        <Select
          label={t('theme.alignment')}
          value={config.header.alignment}
          onChange={(e) =>
            update({
              header: { ...config.header, alignment: e.target.value as 'start' | 'center' },
            })
          }
        >
          <option value="start">{t('theme.start')}</option>
          <option value="center">{t('theme.center')}</option>
        </Select>

        <h3 className="pt-2 font-semibold">{t('theme.categories')}</h3>
        <Select
          label={t('theme.display')}
          value={config.categories.display}
          onChange={(e) =>
            update({
              categories: {
                ...config.categories,
                display: e.target.value as ThemeConfig['categories']['display'],
              },
            })
          }
        >
          <option value="pills">{t('theme.pills')}</option>
          <option value="tabs">{t('theme.tabs')}</option>
          <option value="list">{t('theme.list')}</option>
        </Select>
        <Toggle
          label={t('theme.sticky')}
          checked={config.categories.sticky}
          onChange={(sticky) => update({ categories: { ...config.categories, sticky } })}
        />

        <h3 className="pt-2 font-semibold">{t('theme.items')}</h3>
        <Select
          label={t('theme.itemLayout')}
          value={config.items.layout}
          onChange={(e) =>
            update({
              items: { ...config.items, layout: e.target.value as ThemeConfig['items']['layout'] },
            })
          }
        >
          <option value="list">{t('theme.list')}</option>
          <option value="grid">{t('theme.grid')}</option>
          <option value="cards">{t('theme.cards')}</option>
        </Select>
        <Toggle
          label={t('theme.showImages')}
          checked={config.items.showImages}
          onChange={(showImages) => update({ items: { ...config.items, showImages } })}
        />
        <Toggle
          label={t('theme.showDescription')}
          checked={config.items.showDescription}
          onChange={(showDescription) => update({ items: { ...config.items, showDescription } })}
        />
        <Toggle
          label={t('theme.showPrice')}
          checked={config.items.showPrice}
          onChange={(showPrice) => update({ items: { ...config.items, showPrice } })}
        />
        <Toggle
          label={t('theme.showVariants')}
          checked={config.items.showVariants}
          onChange={(showVariants) => update({ items: { ...config.items, showVariants } })}
        />

        <h3 className="pt-2 font-semibold">{t('theme.footer')}</h3>
        <Toggle
          label={t('theme.showAddress')}
          checked={config.footer.showAddress}
          onChange={(showAddress) => update({ footer: { ...config.footer, showAddress } })}
        />
        <Toggle
          label={t('theme.showPhone')}
          checked={config.footer.showPhone}
          onChange={(showPhone) => update({ footer: { ...config.footer, showPhone } })}
        />
        <Input
          label={t('theme.footerText')}
          value={config.footer.text}
          onChange={(e) => update({ footer: { ...config.footer, text: e.target.value } })}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <h3 className="mb-3 font-semibold">{t('theme.sections')}</h3>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={config.layout.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {config.layout.sections.map((section) => (
                <SortableSection
                  key={section.id}
                  id={section.id}
                  type={section.type}
                  visible={section.visible}
                  label={t(`theme.${section.type}`)}
                  visibleLabel={t('theme.visible')}
                  onToggle={(visible) =>
                    update({
                      layout: {
                        sections: config.layout.sections.map((s) =>
                          s.id === section.id ? { ...s, visible } : s,
                        ),
                      },
                    })
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-cream">
        <p className="border-b border-border px-4 py-2 text-sm font-medium text-espresso-muted">
          {t('restaurant.previewMenu')}
        </p>
        <MenuRenderer
          restaurant={restaurant}
          theme={config}
          categories={categories}
          compact
        />
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 cursor-pointer rounded-lg border border-border bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-24 rounded-lg border border-border px-2 text-xs"
        />
      </span>
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-gold' : 'bg-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white transition-all',
            checked ? 'start-5' : 'start-0.5',
          )}
        />
      </button>
    </label>
  )
}

function SortableSection({
  id,
  type,
  visible,
  label,
  visibleLabel,
  onToggle,
}: {
  id: string
  type: ThemeSectionType
  visible: boolean
  label: string
  visibleLabel: string
  onToggle: (visible: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center justify-between rounded-xl border border-border bg-cream px-3 py-2"
    >
      <button type="button" className="flex items-center gap-2 text-sm" {...attributes} {...listeners}>
        <GripVertical className="size-4 text-espresso-muted" />
        <span className="font-medium">{label}</span>
        <span className="sr-only">{type}</span>
      </button>
      <label className="flex items-center gap-2 text-xs text-espresso-muted">
        {visibleLabel}
        <input type="checkbox" checked={visible} onChange={(e) => onToggle(e.target.checked)} />
      </label>
    </div>
  )
}
