export type ApiKeyStatus = 'active' | 'expired' | 'revoked'

export interface ApiKey {
  id: string
  consumerId: string
  name: string
  description?: string
  keyValue: string
  keyPrefix: string
  serviceIds: string[]
  status: ApiKeyStatus
  ttlDays: number
  expiresAt: string
  createdAt: string
  revokedAt?: string
  revokedBy?: 'consumer' | 'merchant' | 'admin'
  metadata?: Record<string, string>
}
