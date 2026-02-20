import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME } from '@/lib/constants.ts'
import { mockUsers } from '@/mocks/data/users.ts'

const devUsers = [
  { label: 'Admin', userId: 'user-admin-1' },
  { label: 'Merchant', userId: 'user-merchant-1' },
  { label: 'Consumer', userId: 'user-consumer-1' },
  { label: 'Dual Role', userId: 'user-dual-1' },
] as const

export function DevLoginPanel() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  function handleDevLogin(userId: string) {
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      login(user)
      navigate(ROLE_HOME[user.activeRole], { replace: true })
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-amber-400">
        Dev Quick Login
      </p>
      <div className="grid grid-cols-2 gap-2">
        {devUsers.map(({ label, userId }) => (
          <Button
            key={userId}
            variant="secondary"
            size="sm"
            onClick={() => handleDevLogin(userId)}
            data-testid={`dev-login-${label.toLowerCase().replace(' ', '-')}`}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
