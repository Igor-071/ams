import { Navigate, Link } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME, ROUTES } from '@/lib/constants.ts'
import { MerchantRegisterForm } from '../components/merchant-register-form.tsx'

export function MerchantRegisterPage() {
  const currentUser = useAuthStore((s) => s.currentUser)

  if (currentUser) {
    return <Navigate to={ROLE_HOME[currentUser.activeRole]} replace />
  }

  return (
    <div className="space-y-6">
      <MerchantRegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
