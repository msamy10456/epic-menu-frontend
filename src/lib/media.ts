export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  if (path.startsWith('/')) return path
  return `/storage/${path}`
}

export function formatMoney(value: number | null | undefined, currency = 'EGP') {
  const amount = Number(value ?? 0)
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function localizedName(
  lang: string,
  ar?: string | null,
  en?: string | null,
): string {
  return lang.startsWith('ar') ? (ar || en || '') : (en || ar || '')
}
