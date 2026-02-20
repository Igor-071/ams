import { useNavigate } from 'react-router'
import { LogOutIcon, RepeatIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ROLE_HOME, ROLE_LABELS, ROUTES } from '@/lib/constants.ts'
import type { Role } from '@/types/user.ts'

export function UserMenu() {
  const { currentUser, logout, switchRole } = useAuthStore()
  const navigate = useNavigate()

  if (!currentUser) return null

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const otherRoles = currentUser.roles.filter(
    (r) => r !== currentUser.activeRole,
  )

  function handleSwitchRole(role: Role) {
    switchRole(role)
    navigate(ROLE_HOME[role], { replace: true })
  }

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-3 rounded-lg p-1 text-left hover:bg-accent"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-brand text-xs text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-56 rounded-2xl border-white/[0.06] bg-card shadow-card"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{currentUser.name}</span>
            <Badge variant="secondary" className="text-xs">
              {ROLE_LABELS[currentUser.activeRole]}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {currentUser.email}
          </p>
        </DropdownMenuLabel>
        {otherRoles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {otherRoles.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => handleSwitchRole(role)}
              >
                <RepeatIcon className="h-4 w-4" />
                Switch to {ROLE_LABELS[role]}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
