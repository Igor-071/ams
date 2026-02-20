import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME } from '@/lib/constants.ts'
import { getUserByEmail, createConsumerUser } from '@/mocks/handlers.ts'
import { mockDelay } from '@/mocks/delay.ts'

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isFormValid = name.trim().length > 0 && isValidEmail

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isFormValid) return

    setLoading(true)
    await mockDelay()

    const existing = getUserByEmail(email)
    if (existing) {
      setError('An account with this email already exists')
      setLoading(false)
      return
    }

    const user = createConsumerUser({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim() || undefined,
    })

    login(user)
    navigate(ROLE_HOME[user.activeRole], { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-xl font-light text-foreground">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Register to start using the AMS marketplace
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reg-name">Full name</Label>
          <Input
            id="reg-name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-org">
            Organization <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="reg-org"
            type="text"
            placeholder="Your company or organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={!isFormValid || loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
