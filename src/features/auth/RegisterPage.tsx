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

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const push = useToastStore((s) => s.push)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    restaurant_name: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrors({})
    try {
      const data = await authApi.register({
        ...form,
        phone: form.phone || undefined,
        address: form.address || undefined,
      })
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
      <Card className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold">{t('auth.register')}</h1>
        <p className="mt-1 text-sm text-espresso-muted">{t('auth.registerHint')}</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => void onSubmit(e)}>
          {message ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2">{message}</p>
          ) : null}
          <Input label={t('auth.name')} name="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={fieldError(errors, 'name')} required />
          <Input label={t('auth.email')} name="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={fieldError(errors, 'email')} required />
          <Input label={t('auth.restaurantName')} name="restaurant_name" value={form.restaurant_name} onChange={(e) => set('restaurant_name', e.target.value)} error={fieldError(errors, 'restaurant_name')} required />
          <Input label={`${t('auth.phone')} (${t('common.optional')})`} name="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={fieldError(errors, 'phone')} />
          <Input label={t('auth.password')} name="password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} error={fieldError(errors, 'password')} required />
          <Input label={t('auth.confirmPassword')} name="password_confirmation" type="password" value={form.password_confirmation} onChange={(e) => set('password_confirmation', e.target.value)} error={fieldError(errors, 'password_confirmation')} required />
          <div className="sm:col-span-2">
            <Input label={`${t('auth.address')} (${t('common.optional')})`} name="address" value={form.address} onChange={(e) => set('address', e.target.value)} error={fieldError(errors, 'address')} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full" loading={loading}>
              {t('auth.createAccount')}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-sm text-espresso-muted">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-medium text-gold-dark">
            {t('auth.signIn')}
          </Link>
        </p>
      </Card>
    </AuthFrame>
  )
}
