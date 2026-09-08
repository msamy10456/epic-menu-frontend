import type { ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Spinner } from '../components/ui/Spinner'
import { AppShell } from '../components/layout/AppShell'
import { AdminDashboardPage } from '../features/admin/pages/Dashboard'
import { AdminPlansPage } from '../features/admin/pages/Plans'
import { AdminRestaurantDetailPage } from '../features/admin/pages/RestaurantDetail'
import { AdminRestaurantsPage } from '../features/admin/pages/Restaurants'
import { AdminSubscriptionsPage } from '../features/admin/pages/Subscriptions'
import { AdminThemesPage } from '../features/admin/pages/Themes'
import { AdminLoginPage } from '../features/auth/AdminLoginPage'
import { LandingPage } from '../features/auth/LandingPage'
import { MockPaymentPage } from '../features/auth/MockPaymentPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { RestaurantLoginPage } from '../features/auth/RestaurantLoginPage'
import { PublicMenuPage } from '../features/public-menu/PublicMenuPage'
import { AnalyticsPage } from '../features/restaurant/pages/Analytics'
import { RestaurantDashboardPage } from '../features/restaurant/pages/Dashboard'
import { MenuManagerPage } from '../features/restaurant/pages/MenuManager'
import { QrCodePage } from '../features/restaurant/pages/QrCode'
import { SubscriptionPage } from '../features/restaurant/pages/Subscription'
import { ThemeEditorPage } from '../features/restaurant/pages/ThemeEditorPage'
import { ThemePickerPage } from '../features/restaurant/pages/ThemePicker'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types'

function GuestOnly({ children }: { children: ReactNode }) {
  const { token, user } = useAuth()
  if (token && user) {
    return <Navigate to={user.role === 'super_admin' ? '/admin' : '/app'} replace />
  }
  return children
}

function Protected({ roles }: { roles: Role[] }) {
  const { token, user, isLoading } = useAuth()
  if (isLoading) return <Spinner />
  if (!token || !user) {
    const dest = roles.includes('super_admin') ? '/admin/login' : '/login'
    return <Navigate to={dest} replace />
  }
  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === 'super_admin' ? '/admin' : '/app'} replace />
  }
  return <Outlet />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/admin/login"
        element={
          <GuestOnly>
            <AdminLoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <RestaurantLoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route path="/menu/:slug" element={<PublicMenuPage />} />
      <Route path="/payment/mock/:paymentId" element={<MockPaymentPage />} />

      <Route element={<Protected roles={['super_admin']} />}>
        <Route path="/admin" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="restaurants" element={<AdminRestaurantsPage />} />
          <Route path="restaurants/:id" element={<AdminRestaurantDetailPage />} />
          <Route path="plans" element={<AdminPlansPage />} />
          <Route path="themes" element={<AdminThemesPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        </Route>
      </Route>

      <Route element={<Protected roles={['restaurant_owner', 'staff']} />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RestaurantDashboardPage />} />
          <Route path="menu" element={<MenuManagerPage />} />
          <Route path="themes" element={<ThemePickerPage />} />
          <Route path="themes/editor" element={<ThemeEditorPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="qr" element={<QrCodePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
