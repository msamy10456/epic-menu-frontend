import type {
  AdminDashboard,
  Paginated,
  Plan,
  Restaurant,
  Subscription,
  Theme,
} from '../types'
import { api, unwrap } from './client'

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard').then((r) => unwrap<AdminDashboard>(r)),

  plans: () => api.get('/admin/plans').then((r) => unwrap<Plan[] | Paginated<Plan>>(r)),
  createPlan: (payload: Partial<Plan>) =>
    api.post('/admin/plans', payload).then((r) => unwrap<Plan>(r)),
  updatePlan: (id: number, payload: Partial<Plan>) =>
    api.put(`/admin/plans/${id}`, payload).then((r) => unwrap<Plan>(r)),
  deletePlan: (id: number) => api.delete(`/admin/plans/${id}`).then((r) => unwrap<null>(r)),

  restaurants: () =>
    api.get('/admin/restaurants').then((r) => unwrap<Restaurant[] | Paginated<Restaurant>>(r)),
  restaurant: (id: number) =>
    api.get(`/admin/restaurants/${id}`).then((r) => unwrap<Restaurant>(r)),
  createRestaurant: (payload: FormData | Record<string, unknown>) =>
    api.post('/admin/restaurants', payload).then((r) => unwrap<Restaurant>(r)),
  updateRestaurant: (id: number, payload: FormData | Record<string, unknown>) => {
    if (payload instanceof FormData) {
      payload.append('_method', 'PUT')
      return api.post(`/admin/restaurants/${id}`, payload).then((r) => unwrap<Restaurant>(r))
    }
    return api.put(`/admin/restaurants/${id}`, payload).then((r) => unwrap<Restaurant>(r))
  },
  deleteRestaurant: (id: number) =>
    api.delete(`/admin/restaurants/${id}`).then((r) => unwrap<null>(r)),
  activateRestaurant: (id: number) =>
    api.post(`/admin/restaurants/${id}/activate`).then((r) => unwrap<Restaurant>(r)),
  suspendRestaurant: (id: number) =>
    api.post(`/admin/restaurants/${id}/suspend`).then((r) => unwrap<Restaurant>(r)),

  subscriptions: () =>
    api
      .get('/admin/subscriptions')
      .then((r) => unwrap<Subscription[] | Paginated<Subscription>>(r)),
  updateSubscription: (
    id: number,
    payload: { ends_at?: string; status?: string; plan_id?: number },
  ) => api.put(`/admin/subscriptions/${id}`, payload).then((r) => unwrap<Subscription>(r)),

  themes: () => api.get('/admin/themes').then((r) => unwrap<Theme[] | Paginated<Theme>>(r)),
  createTheme: (payload: FormData | Record<string, unknown>) =>
    api.post('/admin/themes', payload).then((r) => unwrap<Theme>(r)),
  updateTheme: (id: number, payload: FormData | Record<string, unknown>) => {
    if (payload instanceof FormData) {
      payload.append('_method', 'PUT')
      return api.post(`/admin/themes/${id}`, payload).then((r) => unwrap<Theme>(r))
    }
    return api.put(`/admin/themes/${id}`, payload).then((r) => unwrap<Theme>(r))
  },
  deleteTheme: (id: number) => api.delete(`/admin/themes/${id}`).then((r) => unwrap<null>(r)),
}
