export type Role = 'super_admin' | 'restaurant_owner' | 'staff'
export type BillingCycle = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trialing' | 'past_due'
export type PaymentGateway = 'mock' | 'paymob' | 'fawry'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export type User = {
  id: number
  name: string
  email: string
  role: Role
  restaurant_id: number | null
}

export type Restaurant = {
  id: number
  name: string
  slug: string
  logo: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  current_theme_id: number | null
  public_url: string | null
  owner?: User
}

export type Plan = {
  id: number
  name: string
  price: number
  billing_cycle: BillingCycle
  max_categories: number
  max_items: number
  max_themes: number
  allow_custom_domain: boolean
  allow_analytics: boolean
  allow_multi_branch: boolean
  is_active: boolean
  is_trial: boolean
  trial_days: number
}

export type Subscription = {
  id: number
  restaurant_id: number
  plan_id: number
  status: SubscriptionStatus
  starts_at: string | null
  ends_at: string | null
  restaurant?: Restaurant
  plan?: Plan
}

export type Theme = {
  id: number
  name: string
  thumbnail: string | null
  is_global: boolean
  config: ThemeConfig
  plan_ids?: number[]
}

export type ThemeSectionType = 'header' | 'categories' | 'items' | 'footer'

export type ThemeConfig = {
  version: 1
  style: {
    mode: 'light' | 'dark'
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    surfaceColor: string
    textColor: string
    mutedTextColor: string
    accentColor: string
    fontFamily: string
    headingFontFamily: string
    borderRadius: number
  }
  layout: {
    sections: { id: string; type: ThemeSectionType; visible: boolean }[]
  }
  header: {
    showLogo: boolean
    showName: boolean
    showAddress: boolean
    showPhone: boolean
    alignment: 'start' | 'center'
  }
  categories: { display: 'pills' | 'tabs' | 'list'; sticky: boolean }
  items: {
    layout: 'list' | 'grid' | 'cards'
    showImages: boolean
    showDescription: boolean
    showPrice: boolean
    showVariants: boolean
  }
  footer: { showAddress: boolean; showPhone: boolean; text: string }
}

export type ThemeVersion = {
  id: number
  created_at: string
  config?: ThemeConfig
}

export type Variant = {
  id: number
  name_ar: string
  name_en: string
  extra_price: number
}

export type MenuItem = {
  id: number
  category_id: number
  name_ar: string
  name_en: string
  description_ar: string | null
  description_en: string | null
  price: number
  image: string | null
  is_available: boolean
  sort_order: number
  variants: Variant[]
}

export type Category = {
  id: number
  name_ar: string
  name_en: string
  sort_order: number
  is_active: boolean
  items?: MenuItem[]
}

export type PublicRestaurant = {
  name: string
  slug: string
  logo: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  subscription_active: boolean
}

export type PublicMenu = {
  restaurant: PublicRestaurant
  inactive: boolean
  theme_config: ThemeConfig
  categories: Category[]
}

export type AdminDashboard = {
  restaurants_count: number
  active_subscriptions: number
  monthly_revenue: number
  expiring_soon: Subscription[]
  recent_restaurants: Restaurant[]
}

export type RestaurantDashboard = {
  restaurant: Restaurant
  subscription: Subscription | null
  plan: Plan | null
  usage: {
    categories: number
    max_categories: number
    items: number
    max_items: number
  }
  recent_activity: ActivityItem[]
}

export type ActivityItem = {
  id?: number
  type?: string
  message?: string
  description?: string
  created_at?: string
}

export type CheckoutResult = {
  payment_id: number
  checkout_url: string | null
  amount: number
}

export type Payment = {
  id: number
  amount: number
  status: PaymentStatus
  gateway: PaymentGateway
  checkout_url?: string | null
  created_at?: string
}

export type QrPayload = {
  url: string
  slug: string
}

export type Analytics = {
  views: number
  item_clicks: number
  views_over_time: { date: string; count: number }[]
  top_items: { menu_item_id: number; name_en: string; name_ar: string; clicks: number }[]
}

export type UploadResult = {
  url: string
  path: string
}

export type AuthPayload = {
  token: string
  user: User
  restaurant?: Restaurant | null
  subscription?: Subscription | null
  plan?: Plan | null
}

export type MePayload = {
  user: User
  restaurant?: Restaurant | null
  subscription?: Subscription | null
  plan?: Plan | null
}

export type Paginated<T> = {
  items?: T[]
  data?: T[]
  total?: number
  page?: number
  perPage?: number
  per_page?: number
  current_page?: number
  last_page?: number
}

export type ApiEnvelope<T> = {
  success: boolean
  data: T
  message: string
  errors: Record<string, string[] | string>
}
