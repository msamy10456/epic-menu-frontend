import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { restaurantApi } from '../../../api/restaurant'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { QueryState } from '../../../components/ui/QueryState'
import { useToastStore } from '../../../store/toastStore'

export function QrCodePage() {
  const { t } = useTranslation()
  const push = useToastStore((s) => s.push)
  const svgWrap = useRef<HTMLDivElement>(null)
  const query = useQuery({
    queryKey: ['restaurant', 'qr'],
    queryFn: () => restaurantApi.qr(),
  })

  const url =
    query.data?.url ||
    (query.data?.slug ? `${window.location.origin}/menu/${query.data.slug}` : '')

  const downloadPng = () => {
    const svg = svgWrap.current?.querySelector('svg')
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const a = document.createElement('a')
      a.download = 'epicwall-menu-qr.png'
      a.href = canvas.toDataURL('image/png')
      a.click()
      URL.revokeObjectURL(blobUrl)
    }
    img.src = blobUrl
  }

  const copy = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    push(t('toast.copied'), 'success')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('restaurant.qrTitle')}</h1>
      <p className="text-sm text-espresso-muted">{t('restaurant.qrHint')}</p>
      <QueryState isLoading={query.isLoading} error={query.error} isEmpty={!url}>
        <Card className="mx-auto max-w-md text-center">
          <div ref={svgWrap} className="mx-auto inline-flex rounded-2xl bg-white p-4">
            <QRCodeSVG id="menu-qr" value={url} size={240} marginSize={4} />
          </div>
          <p className="mt-4 break-all text-sm text-espresso-muted">{url}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button onClick={downloadPng}>{t('restaurant.downloadPng')}</Button>
            <Button variant="outline" onClick={() => void copy()}>
              {t('common.copy')}
            </Button>
            <a href={url} target="_blank" rel="noreferrer">
              <Button variant="secondary">{t('restaurant.openMenu')}</Button>
            </a>
          </div>
        </Card>
      </QueryState>
    </div>
  )
}
