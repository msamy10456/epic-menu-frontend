import { create } from 'zustand'
import type { Plan, Restaurant, Subscription, User } from '../types'

const STORAGE_KEY = 'epicwall.auth'

type AuthSnapshot = {
  token: string | null
  user: User | null
  restaurant: Restaurant | null
  subscription: Subscription | null
  plan: Plan | null
}

type AuthState = AuthSnapshot & {
  setAuth: (payload: Partial<AuthSnapshot>) => void
  logout: () => void
  hydrate: () => void
}

function loadPersisted(): AuthSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { token: null, user: null, restaurant: null, subscription: null, plan: null }
    }
    const parsed = JSON.parse(raw) as Partial<AuthSnapshot>
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
      restaurant: parsed.restaurant ?? null,
      subscription: parsed.subscription ?? null,
      plan: parsed.plan ?? null,
    }
  } catch {
    return { token: null, user: null, restaurant: null, subscription: null, plan: null }
  }
}

function persist(state: AuthSnapshot) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token: state.token,
      user: state.user,
      restaurant: state.restaurant,
      subscription: state.subscription,
      plan: state.plan,
    }),
  )
}

const initial = loadPersisted()

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initial,
  setAuth: (payload) => {
    const next = { ...get(), ...payload }
    persist(next)
    set(next)
  },
  logout: () => {
    const next: AuthSnapshot = {
      token: null,
      user: null,
      restaurant: null,
      subscription: null,
      plan: null,
    }
    persist(next)
    set(next)
  },
  hydrate: () => {
    set(loadPersisted())
  },
}))
