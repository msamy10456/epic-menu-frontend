import axios from 'axios'

export type FormErrors = Record<string, string[] | string>

export function getApiError(err: unknown): { message: string; errors: FormErrors } {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errors?: FormErrors }
      | undefined
    return {
      message: data?.message || err.message || 'Something went wrong',
      errors: data?.errors ?? {},
    }
  }
  if (err instanceof Error) {
    return { message: err.message, errors: {} }
  }
  return { message: 'Something went wrong', errors: {} }
}

export function fieldError(errors: FormErrors | undefined, field: string): string | undefined {
  const value = errors?.[field]
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

export function asList<T>(data: T[] | { items?: T[]; data?: T[] } | null | undefined): T[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.data)) return data.data
  return []
}
