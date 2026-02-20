import { Navigate, Link } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME, ROUTES } from '@/lib/constants.ts'
import { RegisterForm } from '../components/register-form.tsx'

export function RegisterPage() {
  const currentUser = useAuthStore((s) => s.currentUser)

  if (currentUser) {
    return <Navigate to={ROLE_HOME[currentUser.activeRole]} replace />
  }

  return (
    <div className="space-y-6">
      <RegisterForm />

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
        <p>
          Have a merchant invite?{' '}
          <Link
            to={ROUTES.REGISTER_MERCHANT}
            className="text-primary hover:underline"
          >
            Register as merchant
          </Link>
        </p>
      </div>
    </div>
  )
}
