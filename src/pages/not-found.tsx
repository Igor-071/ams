import { Link } from 'react-router'
import { Button } from '@/components/ui/button.tsx'
import { ROUTES } from '@/lib/constants.ts'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="font-heading text-6xl font-light text-foreground">404</h1>
      <p className="mt-2 font-heading text-lg font-light text-muted-foreground">
        Page not found
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.MARKETPLACE}>Go to Marketplace</Link>
      </Button>
    </div>
  )
}
