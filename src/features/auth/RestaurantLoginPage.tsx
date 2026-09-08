import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { fieldError, getApiError, type FormErrors } from '../../lib/errors'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { AuthFrame } from './AdminLoginPage'

export function RestaurantLoginPage() {
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
      const data = await authApi.restaurantLogin({ email, password })
      setAuth({
        token: data.token,
        user: data.user,
        restaurant: data.restaurant ?? null,
        subscription: data.subscription ?? null,
        plan: data.plan ?? null,
      })
      navigate('/app/dashboard')
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
        <h1 className="text-2xl font-semibold">{t('auth.restaurantLogin')}</h1>
        <p className="mt-1 text-sm text-espresso-muted">{t('auth.restaurantHint')}</p>
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
        <p className="mt-4 text-sm text-espresso-muted">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-medium text-gold-dark">
            {t('auth.register')}
          </Link>
        </p>
      </Card>
    </AuthFrame>
  )
}
