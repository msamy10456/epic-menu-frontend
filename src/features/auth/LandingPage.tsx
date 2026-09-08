import { Shield, Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher'
import { useAuthStore } from '../../store/authStore'

export function LandingPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  if (token && user) {
    return <Navigate to={user.role === 'super_admin' ? '/admin' : '/app'} replace />
  }

  return (
    <div className="min-h-svh bg-cream px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-gold uppercase">{t('app.name')}</p>
            <h1 className="mt-2 font-cairo text-4xl font-semibold text-espresso">{t('auth.welcome')}</h1>
            <p className="mt-2 text-espresso-muted">{t('auth.choosePortal')}</p>
          </div>
          <LanguageSwitcher />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Link to="/admin/login" className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-dark">
                <Shield className="size-6" />
              </div>
              <h2 className="text-xl font-semibold">{t('auth.adminLogin')}</h2>
              <p className="mt-2 text-sm text-espresso-muted">{t('auth.adminHint')}</p>
            </Card>
          </Link>
          <Link to="/login" className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-espresso/10 text-espresso">
                <Store className="size-6" />
              </div>
              <h2 className="text-xl font-semibold">{t('auth.restaurantLogin')}</h2>
              <p className="mt-2 text-sm text-espresso-muted">{t('auth.restaurantHint')}</p>
            </Card>
          </Link>
        </div>
        <p className="mt-8 text-center text-sm text-espresso-muted">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-medium text-gold-dark underline">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
