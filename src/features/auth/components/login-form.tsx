import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME } from '@/lib/constants.ts'
import { mockUsers } from '@/mocks/data/users.ts'
import { mockDelay } from '@/mocks/delay.ts'
import { OtpInput } from './otp-input.tsx'

type LoginStep = 'email' | 'otp'

export function LoginForm() {
  const [step, setStep] = useState<LoginStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleContinue() {
    setError('')
    setLoading(true)
    await mockDelay()
    setLoading(false)
    setStep('otp')
  }

  async function handleVerify() {
    setError('')
    setLoading(true)
    await mockDelay()

    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    )

    if (!user) {
      setError('No account found for this email')
      setLoading(false)
      return
    }

    if (user.status === 'suspended' || user.status === 'blocked') {
      setError('Your account has been suspended')
      setLoading(false)
      return
    }

    login(user)
    navigate(ROLE_HOME[user.activeRole], { replace: true })
  }

  function handleBack() {
    setStep('email')
    setOtp('')
    setError('')
  }

  if (step === 'otp') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-heading text-xl font-light text-foreground">
            Enter verification code
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a code to {email}
          </p>
        </div>

        <OtpInput value={otp} onChange={setOtp} disabled={loading} />

        {error && (
          <p className="text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={otp.length < 6 || loading}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>

        <button
          type="button"
          onClick={handleBack}
          className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to email
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-xl font-light text-foreground">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email to receive a verification code
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>

      <Button
        className="w-full"
        onClick={handleContinue}
        disabled={!isValidEmail || loading}
      >
        {loading ? 'Sending code...' : 'Continue'}
      </Button>
    </div>
  )
}
