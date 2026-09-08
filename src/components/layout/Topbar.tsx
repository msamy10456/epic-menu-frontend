import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { t } = useTranslation()
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur">
      <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenu}>
        <Menu className="size-5" />
        <span className="sr-only">{t('nav.openMenu')}</span>
      </Button>
      <p className="hidden text-sm font-medium text-espresso-muted sm:block">{t('app.tagline')}</p>
      <LanguageSwitcher />
    </header>
  )
}
