import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const current = i18n.language.startsWith('ar') ? 'ar' : 'en'

  return (
    <div className={cn('inline-flex rounded-xl border border-border bg-surface p-0.5', className)}>
      <Button
        variant={current === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8"
        onClick={() => void i18n.changeLanguage('en')}
      >
        {t('common.english')}
      </Button>
      <Button
        variant={current === 'ar' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8"
        onClick={() => void i18n.changeLanguage('ar')}
      >
        {t('common.arabic')}
      </Button>
    </div>
  )
}
