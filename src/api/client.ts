import axios, { type AxiosResponse } from 'axios'
import type { ApiEnvelope } from '../types'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const path = window.location.pathname
      const isPublic =
        path.startsWith('/menu/') ||
        path === '/login' ||
        path === '/register' ||
        path === '/admin/login' ||
        path === '/'
      const role = useAuthStore.getState().user?.role
      useAuthStore.getState().logout()
      if (!isPublic) {
        const dest = role === 'super_admin' ? '/admin/login' : '/login'
        if (path !== dest) {
          window.location.assign(dest)
        }
      }
    }
    return Promise.reject(error)
  },
)

export function unwrap<T>(res: AxiosResponse<ApiEnvelope<T>>): T {
  return res.data.data
}
