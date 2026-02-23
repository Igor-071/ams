import type { Role } from '@/types/user.ts'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_MERCHANT: '/register/merchant',

  MARKETPLACE: '/marketplace',
  MARKETPLACE_SERVICE: (id: string) => `/marketplace/${id}` as const,

  // Consumer
  CONSUMER_DASHBOARD: '/dashboard',
  CONSUMER_API_KEYS: '/dashboard/api-keys',
  CONSUMER_API_KEY_NEW: '/dashboard/api-keys/new',
  CONSUMER_API_KEY_DETAIL: (id: string) => `/dashboard/api-keys/${id}` as const,
  CONSUMER_USAGE: '/dashboard/usage',
  CONSUMER_USAGE_DETAIL: (date: string) => `/dashboard/usage/${date}` as const,
  CONSUMER_SERVICES: '/dashboard/services',
  CONSUMER_SERVICE_DETAIL: (id: string) => `/dashboard/services/${id}` as const,
  CONSUMER_IMAGES: '/dashboard/images',
  CONSUMER_PROJECTS: '/dashboard/projects',
  CONSUMER_PROJECT_DETAIL: (id: string) => `/dashboard/projects/${id}` as const,

  // Merchant
  MERCHANT_DASHBOARD: '/merchant',
  MERCHANT_SERVICES: '/merchant/services',
  MERCHANT_SERVICE_NEW: '/merchant/services/new',
  MERCHANT_SERVICE_DETAIL: (id: string) => `/merchant/services/${id}` as const,
  MERCHANT_SERVICE_CONSUMERS: (id: string) =>
    `/merchant/services/${id}/consumers` as const,
  MERCHANT_CONSUMERS: '/merchant/consumers',
  MERCHANT_INVOICES: '/merchant/invoices',
  MERCHANT_INVOICE_DETAIL: (id: string) =>
    `/merchant/invoices/${id}` as const,
  MERCHANT_USAGE: '/merchant/usage',
  MERCHANT_USAGE_DETAIL: (date: string) => `/merchant/usage/${date}` as const,
  MERCHANT_IMAGES: '/merchant/images',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_MERCHANTS: '/admin/merchants',
  ADMIN_MERCHANT_DETAIL: (id: string) => `/admin/merchants/${id}` as const,
  ADMIN_CONSUMERS: '/admin/consumers',
  ADMIN_CONSUMER_DETAIL: (id: string) => `/admin/consumers/${id}` as const,
  ADMIN_SERVICES: '/admin/services',
  ADMIN_SERVICE_DETAIL: (id: string) => `/admin/services/${id}` as const,
  ADMIN_GOVERNANCE: '/admin/governance',
} as const

export const ROLE_HOME: Record<Role, string> = {
  consumer: ROUTES.CONSUMER_DASHBOARD,
  merchant: ROUTES.MERCHANT_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  merchant: 'Merchant',
  consumer: 'Consumer',
}

export const APP_NAME = 'AMS'
export const APP_FULL_NAME = 'Application Management & Service'
export const COMPANY_NAME = 'Ahoy Tech'
export const FOOTER_TEXT = `© 2025 ${COMPANY_NAME}. All rights reserved.`

export const DEFAULT_PAGE_SIZE = 10
export const DEBOUNCE_MS = 300
export const MOCK_DELAY_MIN = 200
export const MOCK_DELAY_MAX = 800
