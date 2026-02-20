import { Navigate } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME, ROUTES } from '@/lib/constants.ts'

export function HomeRedirect() {
  const currentUser = useAuthStore((s) => s.currentUser)

  if (!currentUser) {
    return <Navigate to={ROUTES.MARKETPLACE} replace />
  }

  return <Navigate to={ROLE_HOME[currentUser.activeRole]} replace />
}
