import { Navigate, Link } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME, ROUTES } from '@/lib/constants.ts'
import { LoginForm } from '../components/login-form.tsx'
import { SsoButton } from '../components/sso-button.tsx'
import { DevLoginPanel } from '../components/dev-login-panel.tsx'

export function LoginPage() {
  const currentUser = useAuthStore((s) => s.currentUser)

  if (currentUser) {
    return <Navigate to={ROLE_HOME[currentUser.activeRole]} replace />
  }

  return (
    <div className="space-y-6">
      <LoginForm />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.12]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <SsoButton />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary hover:underline">
          Register
        </Link>
      </p>

      <DevLoginPanel />
    </div>
  )
}
