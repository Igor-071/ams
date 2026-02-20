import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROUTES } from '@/lib/constants.ts'
import type { Role } from '@/types/user.ts'

interface AuthGuardProps {
  allowedRoles?: Role[]
}

export function AuthGuard({ allowedRoles }: AuthGuardProps) {
  const currentUser = useAuthStore((s) => s.currentUser)

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.activeRole)) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
