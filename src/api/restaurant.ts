import type {
  Analytics,
  Category,
  CheckoutResult,
  Plan,
  MenuItem,
  Paginated,
  Payment,
  PaymentGateway,
  QrPayload,
  RestaurantDashboard,
  Subscription,
  Theme,
  ThemeConfig,
  ThemeVersion,
  UploadResult,
  Variant,
} from '../types'
import { api, unwrap } from './client'

export const restaurantApi = {
  dashboard: () =>
    api.get('/restaurant/dashboard').then((r) => unwrap<RestaurantDashboard>(r)),

  categories: () =>
    api.get('/restaurant/categories').then((r) => unwrap<Category[] | Paginated<Category>>(r)),
  createCategory: (payload: Partial<Category>) =>
    api.post('/restaurant/categories', payload).then((r) => unwrap<Category>(r)),
  updateCategory: (id: number, payload: Partial<Category>) =>
    api.put(`/restaurant/categories/${id}`, payload).then((r) => unwrap<Category>(r)),
  deleteCategory: (id: number) =>
    api.delete(`/restaurant/categories/${id}`).then((r) => unwrap<null>(r)),

  items: (categoryId?: number) =>
    api
      .get('/restaurant/items', { params: categoryId ? { category_id: categoryId } : undefined })
      .then((r) => unwrap<MenuItem[] | Paginated<MenuItem>>(r)),
  createItem: (payload: Partial<MenuItem>) =>
    api.post('/restaurant/items', payload).then((r) => unwrap<MenuItem>(r)),
  updateItem: (id: number, payload: Partial<MenuItem>) =>
    api.put(`/restaurant/items/${id}`, payload).then((r) => unwrap<MenuItem>(r)),
  deleteItem: (id: number) =>
    api.delete(`/restaurant/items/${id}`).then((r) => unwrap<null>(r)),

  createVariant: (itemId: number, payload: Partial<Variant>) =>
    api.post(`/restaurant/items/${itemId}/variants`, payload).then((r) => unwrap<Variant>(r)),
  updateVariant: (itemId: number, id: number, payload: Partial<Variant>) =>
    api
      .put(`/restaurant/items/${itemId}/variants/${id}`, payload)
      .then((r) => unwrap<Variant>(r)),
  deleteVariant: (itemId: number, id: number) =>
    api.delete(`/restaurant/items/${itemId}/variants/${id}`).then((r) => unwrap<null>(r)),

  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/restaurant/uploads', form).then((r) => unwrap<UploadResult>(r))
  },

  themes: () =>
    api.get('/restaurant/themes').then((r) => unwrap<Theme[] | Paginated<Theme>>(r)),
  selectTheme: (id: number) =>
    api.post(`/restaurant/themes/${id}/select`).then((r) => unwrap<Theme>(r)),
  currentTheme: () =>
    api
      .get('/restaurant/theme')
      .then((r) => unwrap<{ theme?: Theme; config: ThemeConfig }>(r)),
  saveTheme: (config: ThemeConfig) =>
    api.put('/restaurant/theme', { config }).then((r) => unwrap<{ config: ThemeConfig }>(r)),
  themeVersions: () =>
    api
      .get('/restaurant/theme/versions')
      .then((r) => unwrap<ThemeVersion[] | Paginated<ThemeVersion>>(r)),
  rollbackTheme: (id: number) =>
    api
      .post(`/restaurant/theme/versions/${id}/rollback`)
      .then((r) => unwrap<{ config: ThemeConfig }>(r)),

  plans: () => api.get('/restaurant/plans').then((r) => unwrap<Plan[] | Paginated<Plan>>(r)),

  subscription: () =>
    api
      .get('/restaurant/subscription')
      .then((r) =>
        unwrap<{
          subscription: Subscription | null
          plan?: unknown
          plans?: Plan[]
        }>(r),
      ),
  checkout: (payload: { plan_id: number; gateway: PaymentGateway }) =>
    api.post('/restaurant/subscription/checkout', payload).then((r) => unwrap<CheckoutResult>(r)),
  simulateSuccess: (id: number) =>
    api.post(`/restaurant/payments/${id}/simulate-success`).then((r) => unwrap<Payment>(r)),
  payments: () =>
    api.get('/restaurant/payments').then((r) => unwrap<Payment[] | Paginated<Payment>>(r)),

  qr: () => api.get('/restaurant/qr').then((r) => unwrap<QrPayload>(r)),
  analytics: () => api.get('/restaurant/analytics').then((r) => unwrap<Analytics>(r)),
}
