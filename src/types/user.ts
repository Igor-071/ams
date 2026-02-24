export type Role = 'admin' | 'merchant' | 'consumer'

export type UserStatus = 'active' | 'pending' | 'suspended' | 'blocked' | 'disabled'

export interface User {
  id: string
  email: string
  name: string
  roles: Role[]
  activeRole: Role
  status: UserStatus
  avatarUrl?: string
  createdAt: string
}

export interface MerchantProfile {
  userId: string
  companyName: string
  description: string
  website?: string
  inviteCode: string
  invitedAt: string
  flaggedForReview?: boolean
  subscriptionsBlocked?: boolean
}

export interface ConsumerProfile {
  userId: string
  organization?: string
}
