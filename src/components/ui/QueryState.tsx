import { useTranslation } from 'react-i18next'
import { getApiError } from '../../lib/errors'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { Spinner } from './Spinner'
import type { ReactNode } from 'react'

export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  children,
}: {
  isLoading: boolean
  error: unknown
  isEmpty?: boolean
  emptyTitle?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  if (isLoading) return <Spinner />
  if (error) {
    return (
      <EmptyState
        title={t('common.error')}
        description={getApiError(error).message}
        action={
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        }
      />
    )
  }
  if (isEmpty) return <EmptyState title={emptyTitle || t('common.empty')} />
  return children
}
