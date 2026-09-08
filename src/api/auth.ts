import type { AuthPayload, MePayload } from '../types'
import { api, unwrap } from './client'

export const authApi = {
  adminLogin: (payload: { email: string; password: string }) =>
    api.post('/auth/admin/login', payload).then((r) => unwrap<AuthPayload>(r)),

  restaurantLogin: (payload: { email: string; password: string }) =>
    api.post('/auth/restaurant/login', payload).then((r) => unwrap<AuthPayload>(r)),

  register: (payload: {
    name: string
    email: string
    password: string
    password_confirmation: string
    restaurant_name: string
    phone?: string
    address?: string
  }) => api.post('/auth/restaurant/register', payload).then((r) => unwrap<AuthPayload>(r)),

  logout: () => api.post('/auth/logout').then((r) => unwrap<null>(r)),

  me: () => api.get('/auth/me').then((r) => unwrap<MePayload>(r)),
}
