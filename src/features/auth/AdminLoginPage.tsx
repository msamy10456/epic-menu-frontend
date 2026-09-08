import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { fieldError, getApiError, type FormErrors } from '../../lib/errors'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'

export function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const push = useToastStore((s) => s.push)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrors({})
    try {
      const data = await authApi.adminLogin({ email, password })
      setAuth({
        token: data.token,
        user: data.user,
        restaurant: data.restaurant ?? null,
        subscription: data.subscription ?? null,
        plan: data.plan ?? null,
      })
      navigate('/admin/dashboard')
    } catch (err) {
      const parsed = getApiError(err)
      setMessage(parsed.message)
      setErrors(parsed.errors)
      push(parsed.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame>
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">{t('auth.adminLogin')}</h1>
        <p className="mt-1 text-sm text-espresso-muted">{t('auth.adminHint')}</p>
        <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          {message ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p> : null}
          <Input
            label={t('auth.email')}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldError(errors, 'email')}
            required
          />
          <Input
            label={t('auth.password')}
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldError(errors, 'password')}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            {t('auth.signIn')}
          </Button>
        </form>
        <Link to="/" className="mt-4 inline-block text-sm text-gold-dark">
          {t('auth.backHome')}
        </Link>
      </Card>
    </AuthFrame>
  )
}

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-cream px-4 py-10">
      <div className="mb-6 flex w-full max-w-md justify-end">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  )
}
