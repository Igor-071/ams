import { Link, Outlet, useLocation } from 'react-router'
import {
  LayoutDashboardIcon,
  KeyIcon,
  BarChart3Icon,
  BoxIcon,
  ContainerIcon,
  FolderKanbanIcon,
  StoreIcon,
  UsersIcon,
  FileTextIcon,
  ShieldIcon,
  ScrollTextIcon,
  LogOutIcon,
  type LucideIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { APP_NAME, FOOTER_TEXT, ROLE_LABELS, ROUTES } from '@/lib/constants.ts'
import type { Role } from '@/types/user.ts'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const consumerNav: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD, icon: LayoutDashboardIcon },
  { label: 'API Keys', href: ROUTES.CONSUMER_API_KEYS, icon: KeyIcon },
  { label: 'Usage', href: ROUTES.CONSUMER_USAGE, icon: BarChart3Icon },
  { label: 'Services', href: ROUTES.CONSUMER_SERVICES, icon: BoxIcon },
  { label: 'Images', href: ROUTES.CONSUMER_IMAGES, icon: ContainerIcon },
  { label: 'Projects', href: ROUTES.CONSUMER_PROJECTS, icon: FolderKanbanIcon },
]

const merchantNav: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.MERCHANT_DASHBOARD, icon: LayoutDashboardIcon },
  { label: 'Services', href: ROUTES.MERCHANT_SERVICES, icon: BoxIcon },
  { label: 'Consumers', href: ROUTES.MERCHANT_CONSUMERS, icon: UsersIcon },
  { label: 'Invoices', href: ROUTES.MERCHANT_INVOICES, icon: FileTextIcon },
  { label: 'Images', href: ROUTES.MERCHANT_IMAGES, icon: ContainerIcon },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboardIcon },
  { label: 'Merchants', href: ROUTES.ADMIN_MERCHANTS, icon: StoreIcon },
  { label: 'Consumers', href: ROUTES.ADMIN_CONSUMERS, icon: UsersIcon },
  { label: 'Services', href: ROUTES.ADMIN_SERVICES, icon: BoxIcon },
  { label: 'Governance', href: ROUTES.ADMIN_GOVERNANCE, icon: ScrollTextIcon },
]

const navByRole: Record<Role, NavItem[]> = {
  consumer: consumerNav,
  merchant: merchantNav,
  admin: adminNav,
}

export function DashboardLayout() {
  const { currentUser, logout } = useAuthStore()
  const location = useLocation()

  if (!currentUser) return null

  const navItems = navByRole[currentUser.activeRole]
  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link
            to={ROUTES.HOME}
            className="font-heading text-xl font-light text-foreground"
          >
            {APP_NAME}
          </Link>
        </SidebarHeader>
        <Separator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              {ROLE_LABELS[currentUser.activeRole]}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== navItems[0].href &&
                      location.pathname.startsWith(item.href))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Sign out"
              className="h-8 w-8 shrink-0"
            >
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-white/[0.06] px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-heading text-sm font-light text-muted-foreground">
              {ROLE_LABELS[currentUser.activeRole]}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <footer className="border-t border-white/[0.06] py-4">
          <p className="text-center font-heading text-sm font-light text-muted-foreground">
            {FOOTER_TEXT}
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
