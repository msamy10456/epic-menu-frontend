import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const restaurant = useAuthStore((s) => s.restaurant)
  const subscription = useAuthStore((s) => s.subscription)
  const plan = useAuthStore((s) => s.plan)
  const setAuth = useAuthStore((s) => s.setAuth)
  const logout = useAuthStore((s) => s.logout)

  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    enabled: Boolean(token),
    retry: false,
  })

  useEffect(() => {
    if (!me.data) return
    setAuth({
      user: me.data.user,
      restaurant: me.data.restaurant ?? null,
      subscription: me.data.subscription ?? null,
      plan: me.data.plan ?? null,
    })
  }, [me.data, setAuth])

  return {
    token,
    user,
    restaurant,
    subscription,
    plan,
    setAuth,
    logout,
    isLoading: Boolean(token) && me.isLoading && !user,
  }
}
