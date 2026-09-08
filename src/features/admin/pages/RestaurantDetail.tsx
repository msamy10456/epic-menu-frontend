import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { adminApi } from '../../../api/admin'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { ImageUpload } from '../../../components/ui/ImageUpload'
import { Input } from '../../../components/ui/Input'
import { QueryState } from '../../../components/ui/QueryState'
import { fieldError, getApiError, type FormErrors } from '../../../lib/errors'
import { useToastStore } from '../../../store/toastStore'

export function AdminRestaurantDetailPage() {
  const { id = '' } = useParams()
  const restaurantId = Number(id)
  const { t } = useTranslation()
  const qc = useQueryClient()
  const push = useToastStore((s) => s.push)
  const [errors, setErrors] = useState<FormErrors>({})
  const [message, setMessage] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const query = useQuery({
    queryKey: ['admin', 'restaurants', restaurantId],
    queryFn: () => adminApi.restaurant(restaurantId),
    enabled: Number.isFinite(restaurantId),
  })

  const [form, setForm] = useState<{
    name: string
    slug: string
    phone: string
    address: string
    logo: string
  } | null>(null)

  const restaurant = query.data
  const values = form ?? {
    name: restaurant?.name ?? '',
    slug: restaurant?.slug ?? '',
    phone: restaurant?.phone ?? '',
    address: restaurant?.address ?? '',
    logo: restaurant?.logo ?? '',
  }

  const save = useMutation({
    mutationFn: async () => {
      if (logoFile) {
        const payload = new FormData()
        payload.append('name', values.name)
        payload.append('slug', values.slug)
        payload.append('phone', values.phone)
        payload.append('address', values.address)
        payload.append('logo', logoFile)
        return adminApi.updateRestaurant(restaurantId, payload)
      }
      return adminApi.updateRestaurant(restaurantId, values)
    },
    onSuccess: async () => {
      push(t('toast.saved'), 'success')
      setLogoFile(null)
      await qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
    },
    onError: (err) => {
      const parsed = getApiError(err)
      setMessage(parsed.message)
      setErrors(parsed.errors)
      push(parsed.message, 'error')
    },
  })

  const toggle = useMutation({
    mutationFn: () =>
      restaurant?.is_active
        ? adminApi.suspendRestaurant(restaurantId)
        : adminApi.activateRestaurant(restaurantId),
    onSuccess: async () => {
      push(t('toast.saved'), 'success')
      await qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
    },
    onError: (err) => push(getApiError(err).message, 'error'),
  })

  return (
    <div className="space-y-4">
      <Link to="/admin/restaurants" className="text-sm text-gold-dark">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-semibold">{t('admin.restaurantDetail')}</h1>
      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={!restaurant}>
        {restaurant ? (
          <Card className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Badge tone={restaurant.is_active ? 'success' : 'danger'}>
                {restaurant.is_active ? t('common.active') : t('common.inactive')}
              </Badge>
              <Button
                variant={restaurant.is_active ? 'danger' : 'secondary'}
                size="sm"
                loading={toggle.isPending}
                onClick={() => toggle.mutate()}
              >
                {restaurant.is_active ? t('common.suspend') : t('common.activate')}
              </Button>
            </div>
            {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p> : null}
            <ImageUpload
              label={t('common.logo')}
              value={logoFile ? URL.createObjectURL(logoFile) : values.logo}
              onChange={(url) => {
                setLogoFile(null)
                setForm({ ...values, logo: url })
              }}
              onFile={(file) => {
                setLogoFile(file)
                setForm({ ...values, logo: URL.createObjectURL(file) })
              }}
            />
            <Input label={t('common.name')} value={values.name} onChange={(e) => setForm({ ...values, name: e.target.value })} error={fieldError(errors, 'name')} />
            <Input label={t('common.slug')} value={values.slug} onChange={(e) => setForm({ ...values, slug: e.target.value })} error={fieldError(errors, 'slug')} />
            <Input label={t('common.phone')} value={values.phone} onChange={(e) => setForm({ ...values, phone: e.target.value })} />
            <Input label={t('common.address')} value={values.address} onChange={(e) => setForm({ ...values, address: e.target.value })} />
            <Button loading={save.isPending} onClick={() => save.mutate()}>
              {t('common.save')}
            </Button>
          </Card>
        ) : null}
      </QueryState>
    </div>
  )
}
