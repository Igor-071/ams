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
  useSidebar,
} from '@/components/ui/sidebar.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { UserMenu } from '@/components/shared/user-menu.tsx'
import { NotificationCenter } from '@/components/shared/notification-center.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { FOOTER_TEXT, ROLE_LABELS, ROUTES } from '@/lib/constants.ts'
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

function DashboardSidebar({ navItems, activeRole }: { navItems: NavItem[]; activeRole: Role }) {
  const location = useLocation()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={`transition-all duration-300 ease-in-out ${collapsed ? 'h-16 items-center justify-center p-2' : 'p-4'}`}>
        <Link
          to={ROUTES.HOME}
          className={`flex items-center transition-all duration-300 ease-in-out ${collapsed ? 'justify-center' : 'justify-start'}`}
        >
          <img
            src="/ahoy-icon.png"
            alt="Ahoy"
            className={`shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'h-8 w-8 opacity-100' : 'h-0 w-0 opacity-0'}`}
          />
          <img
            src="/ahoy-logo.png"
            alt="Ahoy"
            className={`transition-all duration-300 ease-in-out ${collapsed ? 'h-0 w-0 opacity-0' : 'h-8 w-auto opacity-100'}`}
          />
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {ROLE_LABELS[activeRole]}
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
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
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
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}

export function DashboardLayout() {
  const { currentUser } = useAuthStore()

  if (!currentUser) return null

  const navItems = navByRole[currentUser.activeRole]
  return (
    <SidebarProvider>
      <DashboardSidebar navItems={navItems} activeRole={currentUser.activeRole} />

      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b border-white/[0.06] bg-transparent backdrop-blur-xl px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-heading text-sm font-light text-muted-foreground">
              {ROLE_LABELS[currentUser.activeRole]}
            </span>
          </div>
          <div className="ml-auto">
            <NotificationCenter />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
        <footer className="sticky bottom-0 z-50 border-t border-white/[0.06] bg-transparent backdrop-blur-xl py-4">
          <p className="text-center font-heading text-sm font-light text-muted-foreground">
            {FOOTER_TEXT}
          </p>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
