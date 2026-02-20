import { Link, Outlet } from 'react-router'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { ROUTES, APP_NAME, FOOTER_TEXT } from '@/lib/constants.ts'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <Link
          to={ROUTES.MARKETPLACE}
          className="font-heading text-3xl font-light text-foreground"
        >
          {APP_NAME}
        </Link>
        <p className="mt-1 font-heading text-sm font-light text-muted-foreground">
          Application Management & Service
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <Outlet />
        </CardContent>
      </Card>

      <p className="mt-8 font-heading text-sm font-light text-muted-foreground">
        {FOOTER_TEXT}
      </p>
    </div>
  )
}
