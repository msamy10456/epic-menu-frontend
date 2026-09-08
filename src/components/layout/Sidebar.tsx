import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Palette,
  QrCode,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { authApi } from '../../api/auth'
import type { LucideIcon } from 'lucide-react'

type Item = { to: string; key: string; icon: LucideIcon }

const adminNav: Item[] = [
  { to: '/admin/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/admin/restaurants', key: 'nav.restaurants', icon: Store },
  { to: '/admin/plans', key: 'nav.plans', icon: CreditCard },
  { to: '/admin/themes', key: 'nav.themes', icon: Palette },
  { to: '/admin/subscriptions', key: 'nav.subscriptions', icon: CreditCard },
]

const restaurantNav: Item[] = [
  { to: '/app/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/app/menu', key: 'nav.menu', icon: UtensilsCrossed },
  { to: '/app/themes', key: 'nav.themes', icon: Palette },
  { to: '/app/subscription', key: 'nav.subscription', icon: CreditCard },
  { to: '/app/qr', key: 'nav.qr', icon: QrCode },
  { to: '/app/analytics', key: 'nav.analytics', icon: BarChart3 },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const push = useToastStore((s) => s.push)
  const items = user?.role === 'super_admin' ? adminNav : restaurantNav

  const onLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // still clear local session
    }
    logout()
    push(t('toast.loggedOut'), 'info')
  }

  return (
    <aside className="flex h-full flex-col bg-espresso text-cream">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="font-cairo text-lg font-semibold tracking-wide">{t('app.name')}</p>
        <p className="mt-1 text-xs text-cream/70">{user?.name}</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'bg-gold text-white' : 'text-cream/80 hover:bg-white/10',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {t(item.key)}
            </NavLink>
          )
        })}
      </nav>
      <div className="p-3">
        <button
          type="button"
          onClick={() => void onLogout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/80 hover:bg-white/10"
        >
          <LogOut className="size-4" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
