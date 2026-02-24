export type AuditAction =
  | 'merchant.invited'
  | 'merchant.registered'
  | 'merchant.suspended'
  | 'merchant.unsuspended'
  | 'service.created'
  | 'service.submitted'
  | 'service.approved'
  | 'service.rejected'
  | 'service.updated'
  | 'service.suspended'
  | 'consumer.registered'
  | 'consumer.blocked'
  | 'consumer.unblocked'
  | 'access.requested'
  | 'access.approved'
  | 'access.denied'
  | 'apikey.created'
  | 'apikey.revoked'
  | 'invoice.issued'
  | 'merchant.approved'
  | 'merchant.rejected'
  | 'merchant.disabled'
  | 'merchant.flagged'
  | 'merchant.unflagged'
  | 'merchant.subscriptions_blocked'
  | 'merchant.subscriptions_unblocked'
  | 'image.deprecated'
  | 'image.disabled'
  | 'consumer.service_blocked'
  | 'consumer.service_unblocked'

export interface AuditLog {
  id: string
  action: AuditAction
  actorId: string
  actorName: string
  actorRole: string
  targetId: string
  targetType: 'merchant' | 'consumer' | 'service' | 'apikey' | 'invoice' | 'access_request' | 'image'
  description: string
  metadata?: Record<string, string>
  timestamp: string
}
