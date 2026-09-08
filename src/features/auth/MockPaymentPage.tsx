import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { restaurantApi } from '../../api/restaurant'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { getApiError } from '../../lib/errors'
import { useToastStore } from '../../store/toastStore'

export function MockPaymentPage() {
  const { paymentId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const push = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onPay = async () => {
    if (!paymentId) return
    setLoading(true)
    setMessage('')
    try {
      await restaurantApi.simulateSuccess(Number(paymentId))
      push(t('toast.saved'), 'success')
      navigate('/app/subscription')
    } catch (err) {
      const parsed = getApiError(err)
      setMessage(parsed.message)
      push(parsed.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold">{t('payment.mockTitle')}</h1>
        <p className="mt-2 text-sm text-espresso-muted">{t('payment.mockHint')}</p>
        {message ? <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p> : null}
        <Button className="mt-6 w-full" loading={loading} onClick={() => void onPay()}>
          {t('payment.paySuccess')}
        </Button>
      </Card>
    </div>
  )
}
