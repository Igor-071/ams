export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue'

export interface InvoiceLineItem {
  serviceId: string
  serviceName: string
  requestCount: number
  unitPrice: number
  subtotal: number
}

export interface Invoice {
  id: string
  merchantId: string
  merchantName: string
  consumerId: string
  consumerName: string
  period: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  commission: number
  commissionRate: number
  total: number
  status: InvoiceStatus
  issuedAt: string
  dueAt: string
  paidAt?: string
}
