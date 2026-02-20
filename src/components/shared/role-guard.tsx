import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth-store.ts'
import type { Role } from '@/types/user.ts'

interface RoleGuardProps {
  allowedRoles: Role[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const currentUser = useAuthStore((s) => s.currentUser)

  if (!currentUser) return fallback
  if (!allowedRoles.includes(currentUser.activeRole)) return fallback

  return <>{children}</>
}
