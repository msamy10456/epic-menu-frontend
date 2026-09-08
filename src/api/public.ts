import type { PublicMenu } from '../types'
import { api, unwrap } from './client'

export const publicApi = {
  menu: (slug: string) => api.get(`/public/menu/${slug}`).then((r) => unwrap<PublicMenu>(r)),
}
