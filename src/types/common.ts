export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface FilterParams {
  search?: string
  status?: string
  type?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface DateRange {
  from: string
  to: string
}

export interface SelectOption {
  label: string
  value: string
}

export type Status = 'active' | 'pending' | 'suspended' | 'blocked' | 'expired' | 'revoked' | 'rejected' | 'draft'
