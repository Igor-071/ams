import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME } from '@/lib/constants.ts'
import {
  getUserByEmail,
  validateInviteCode,
  createMerchantUser,
} from '@/mocks/handlers.ts'
import { mockDelay } from '@/mocks/delay.ts'

export function MerchantRegisterForm() {
  const [searchParams] = useSearchParams()
  const codeFromUrl = searchParams.get('code') ?? ''

  const [inviteCode, setInviteCode] = useState(codeFromUrl)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isFormValid =
    inviteCode.trim().length > 0 &&
    name.trim().length > 0 &&
    isValidEmail &&
    companyName.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isFormValid) return

    setLoading(true)
    await mockDelay()

    if (!validateInviteCode(inviteCode.trim())) {
      setError('Invalid or expired invite code')
      setLoading(false)
      return
    }

    const existing = getUserByEmail(email)
    if (existing) {
      setError('An account with this email already exists')
      setLoading(false)
      return
    }

    const user = createMerchantUser({
      name: name.trim(),
      email: email.trim(),
      inviteCode: inviteCode.trim(),
      companyName: companyName.trim(),
      description: description.trim() || undefined,
      website: website.trim() || undefined,
    })

    login(user)
    navigate(ROLE_HOME[user.activeRole], { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-xl font-light text-foreground">
          Register as Merchant
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use your invite code to create a merchant account
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="merch-invite">Invite code</Label>
          <Input
            id="merch-invite"
            type="text"
            placeholder="Enter your invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            disabled={loading || codeFromUrl.length > 0}
            readOnly={codeFromUrl.length > 0}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="merch-name">Full name</Label>
          <Input
            id="merch-name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="merch-email">Email</Label>
          <Input
            id="merch-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="merch-company">Company name</Label>
          <Input
            id="merch-company"
            type="text"
            placeholder="Your company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="merch-desc">
            Description <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="merch-desc"
            type="text"
            placeholder="What does your company do?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="merch-website">
            Website <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="merch-website"
            type="url"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
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
        {loading ? 'Registering...' : 'Register as Merchant'}
      </Button>
    </form>
  )
}
