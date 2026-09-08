import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { restaurantApi } from '../../../api/restaurant'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { ImageUpload } from '../../../components/ui/ImageUpload'
import { Input, Textarea } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { QueryState } from '../../../components/ui/QueryState'
import { asList, fieldError, getApiError, type FormErrors } from '../../../lib/errors'
import { formatMoney, localizedName, mediaUrl } from '../../../lib/media'
import { useToastStore } from '../../../store/toastStore'
import type { Category, MenuItem, Variant } from '../../../types'

type ItemForm = {
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  price: number
  image: string
  is_available: boolean
  sort_order: number
}

const emptyItem = (): ItemForm => ({
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  price: 0,
  image: '',
  is_available: true,
  sort_order: 0,
})

export function MenuManagerPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [catOpen, setCatOpen] = useState(false)
  const [catForm, setCatForm] = useState({ name_en: '', name_ar: '', sort_order: 0, is_active: true })
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [itemOpen, setItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem())
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [variantForm, setVariantForm] = useState({ name_en: '', name_ar: '', extra_price: 0 })

  const catsQuery = useQuery({
    queryKey: ['restaurant', 'categories'],
    queryFn: () => restaurantApi.categories(),
  })
  const itemsQuery = useQuery({
    queryKey: ['restaurant', 'items'],
    queryFn: () => restaurantApi.items(),
  })

  const categories = asList(catsQuery.data)
  const items = asList(itemsQuery.data)
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0] ?? null
  const selectedItems = items
    .filter((i) => i.category_id === selected?.id)
    .toSorted((a, b) => a.sort_order - b.sort_order)

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['restaurant', 'categories'] })
    await qc.invalidateQueries({ queryKey: ['restaurant', 'items'] })
  }

  const saveCat = useMutation({
    mutationFn: () =>
      editingCat
        ? restaurantApi.updateCategory(editingCat.id, catForm)
        : restaurantApi.createCategory(catForm),
    onSuccess: async (cat) => {
      push(t('toast.saved'), 'success')
      setCatOpen(false)
      setSelectedId(cat.id)
      await invalidate()
    },
    onError: (err) => {
      const parsed = getApiError(err)
      setMessage(parsed.message)
      setErrors(parsed.errors)
      push(parsed.message, 'error')
    },
  })

  const deleteCat = useMutation({
    mutationFn: (id: number) => restaurantApi.deleteCategory(id),
    onSuccess: async () => {
      push(t('toast.deleted'), 'success')
      setSelectedId(null)
      await invalidate()
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const saveItem = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error('No category')
      const payload = { ...itemForm, category_id: selected.id }
      return editingItem
        ? restaurantApi.updateItem(editingItem.id, payload)
        : restaurantApi.createItem(payload)
    },
    onSuccess: async () => {
      push(t('toast.saved'), 'success')
      setItemOpen(false)
      await invalidate()
    },
    onError: (err) => {
      const parsed = getApiError(err)
      setMessage(parsed.message)
      setErrors(parsed.errors)
      push(parsed.message, 'error')
    },
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => restaurantApi.deleteItem(id),
    onSuccess: async () => {
      push(t('toast.deleted'), 'success')
      await invalidate()
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const toggleAvail = useMutation({
    mutationFn: (item: MenuItem) =>
      restaurantApi.updateItem(item.id, { is_available: !item.is_available }),
    onSuccess: async () => {
      await invalidate()
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const addVariant = useMutation({
    mutationFn: () => restaurantApi.createVariant(editingItem!.id, variantForm),
    onSuccess: async () => {
      setVariantForm({ name_en: '', name_ar: '', extra_price: 0 })
      await invalidate()
      const refreshed = asList(await restaurantApi.items()).find((i) => i.id === editingItem?.id)
      if (refreshed) setEditingItem(refreshed)
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const removeVariant = useMutation({
    mutationFn: (variant: Variant) => restaurantApi.deleteVariant(editingItem!.id, variant.id),
    onSuccess: async () => {
      await invalidate()
      const refreshed = asList(await restaurantApi.items()).find((i) => i.id === editingItem?.id)
      if (refreshed) setEditingItem(refreshed)
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const res = await restaurantApi.upload(file)
      setItemForm((f) => ({ ...f, image: res.url || res.path }))
      push(t('toast.uploaded'), 'success')
    } catch (err) {
      push(getApiError(err).message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const openItem = (item?: MenuItem) => {
    setErrors({})
    setMessage('')
    if (item) {
      setEditingItem(item)
      setItemForm({
        name_en: item.name_en,
        name_ar: item.name_ar,
        description_en: item.description_en ?? '',
        description_ar: item.description_ar ?? '',
        price: item.price,
        image: item.image ?? '',
        is_available: item.is_available,
        sort_order: item.sort_order,
      })
    } else {
      setEditingItem(null)
      setItemForm(emptyItem())
    }
    setItemOpen(true)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('restaurant.menuTitle')}</h1>
      <QueryState isLoading={catsQuery.isLoading || itemsQuery.isLoading} error={catsQuery.error || itemsQuery.error}>
        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Card className="p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{t('restaurant.categories')}</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingCat(null)
                  setCatForm({ name_en: '', name_ar: '', sort_order: categories.length, is_active: true })
                  setErrors({})
                  setMessage('')
                  setCatOpen(true)
                }}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedId(cat.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-sm ${
                    selected?.id === cat.id ? 'bg-gold/15 font-medium' : 'hover:bg-cream'
                  }`}
                >
                  <span>{localizedName(i18n.language, cat.name_ar, cat.name_en)}</span>
                  {!cat.is_active ? <Badge tone="muted">{t('common.inactive')}</Badge> : null}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            {!selected ? (
              <p className="text-sm text-espresso-muted">{t('restaurant.noCategory')}</p>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {localizedName(i18n.language, selected.name_ar, selected.name_en)}
                    </h2>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCat(selected)
                          setCatForm({
                            name_en: selected.name_en,
                            name_ar: selected.name_ar,
                            sort_order: selected.sort_order,
                            is_active: selected.is_active,
                          })
                          setCatOpen(true)
                        }}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(t('common.confirmDelete'))) deleteCat.mutate(selected.id)
                        }}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={() => openItem()}>{t('restaurant.addItem')}</Button>
                </div>
                {selectedItems.length === 0 ? (
                  <p className="text-sm text-espresso-muted">{t('common.empty')}</p>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl border border-border p-3"
                      >
                        {item.image ? (
                          <img src={mediaUrl(item.image)} alt="" className="size-16 rounded-xl object-cover" />
                        ) : (
                          <div className="size-16 rounded-xl bg-cream" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{localizedName(i18n.language, item.name_ar, item.name_en)}</p>
                          <p className="text-sm text-gold-dark">{formatMoney(item.price)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={item.is_available ? 'outline' : 'secondary'}
                          onClick={() => toggleAvail.mutate(item)}
                        >
                          {item.is_available ? t('common.available') : t('common.unavailable')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openItem(item)}>
                          {t('common.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (window.confirm(t('common.confirmDelete'))) deleteItem.mutate(item.id)
                          }}
                        >
                          {t('common.delete')}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </QueryState>

      <Modal
        open={catOpen}
        onClose={() => setCatOpen(false)}
        title={editingCat ? t('restaurant.editCategory') : t('restaurant.addCategory')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCatOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button loading={saveCat.isPending} onClick={() => saveCat.mutate()}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p> : null}
          <Input label={t('common.nameEn')} value={catForm.name_en} onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })} error={fieldError(errors, 'name_en')} />
          <Input label={t('common.nameAr')} value={catForm.name_ar} onChange={(e) => setCatForm({ ...catForm, name_ar: e.target.value })} error={fieldError(errors, 'name_ar')} />
          <Input label="sort_order" type="number" value={catForm.sort_order} onChange={(e) => setCatForm({ ...catForm, sort_order: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={catForm.is_active} onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })} />
            {t('common.active')}
          </label>
        </div>
      </Modal>

      <Modal
        open={itemOpen}
        onClose={() => setItemOpen(false)}
        title={editingItem ? t('restaurant.editItem') : t('restaurant.addItem')}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setItemOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button loading={saveItem.isPending} onClick={() => saveItem.mutate()}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2">{message}</p> : null}
          <Input label={t('common.nameEn')} value={itemForm.name_en} onChange={(e) => setItemForm({ ...itemForm, name_en: e.target.value })} error={fieldError(errors, 'name_en')} />
          <Input label={t('common.nameAr')} value={itemForm.name_ar} onChange={(e) => setItemForm({ ...itemForm, name_ar: e.target.value })} error={fieldError(errors, 'name_ar')} />
          <Textarea label={t('common.descriptionEn')} value={itemForm.description_en} onChange={(e) => setItemForm({ ...itemForm, description_en: e.target.value })} />
          <Textarea label={t('common.descriptionAr')} value={itemForm.description_ar} onChange={(e) => setItemForm({ ...itemForm, description_ar: e.target.value })} />
          <Input label={t('common.price')} type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })} error={fieldError(errors, 'price')} />
          <Input label="sort_order" type="number" value={itemForm.sort_order} onChange={(e) => setItemForm({ ...itemForm, sort_order: Number(e.target.value) })} />
          <div className="sm:col-span-2">
            <ImageUpload
              label={t('common.image')}
              value={itemForm.image}
              uploading={uploading}
              onChange={(url) => setItemForm({ ...itemForm, image: url })}
              onFile={(file) => void uploadImage(file)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={itemForm.is_available}
              onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
            />
            {t('common.available')}
          </label>
        </div>

        {editingItem ? (
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="mb-3 font-medium">{t('restaurant.variants')}</h3>
            <div className="space-y-2">
              {(editingItem.variants ?? []).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-sm">
                  <span>
                    {localizedName(i18n.language, v.name_ar, v.name_en)} (+{formatMoney(v.extra_price)})
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => removeVariant.mutate(v)}>
                    {t('common.delete')}
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              <Input label={t('common.nameEn')} value={variantForm.name_en} onChange={(e) => setVariantForm({ ...variantForm, name_en: e.target.value })} />
              <Input label={t('common.nameAr')} value={variantForm.name_ar} onChange={(e) => setVariantForm({ ...variantForm, name_ar: e.target.value })} />
              <Input label={t('restaurant.extraPrice')} type="number" value={variantForm.extra_price} onChange={(e) => setVariantForm({ ...variantForm, extra_price: Number(e.target.value) })} />
              <div className="flex items-end">
                <Button className="w-full" size="sm" onClick={() => addVariant.mutate()}>
                  {t('restaurant.addVariant')}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
