import { Link, Outlet } from 'react-router'
import { ArrowUpRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { ROUTES, FOOTER_TEXT } from '@/lib/constants.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME } from '@/lib/constants.ts'

export function PublicLayout() {
  const currentUser = useAuthStore((s) => s.currentUser)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/[0.12] bg-black/10 backdrop-blur-[51px]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTES.MARKETPLACE}
            className="flex items-center gap-2 font-heading text-xl font-light text-foreground"
          >
            <img src="/ahoy-logo.png" alt="Ahoy" className="h-8 w-auto" />
          </Link>
          <nav>
            {currentUser ? (
              <Button asChild variant="outline" size="sm">
                <Link to={ROLE_HOME[currentUser.activeRole]}>
                  Dashboard
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.LOGIN}>
                  Sign In
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.12] bg-black/10 backdrop-blur-[51px] py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-heading text-sm font-light text-muted-foreground">
            {FOOTER_TEXT}
          </p>
        </div>
      </footer>
    </div>
  )
}
