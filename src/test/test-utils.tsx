import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import type { User } from '@/types/user.ts'

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string
  user?: User | null
}

function Wrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
) {
  const { user = null, ...renderOptions } = options

  // Set auth state before render
  useAuthStore.setState({ currentUser: user })

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export function renderWithRouter(
  routes: Parameters<typeof createMemoryRouter>[0],
  options: RenderWithProvidersOptions = {},
) {
  const { initialRoute = '/', user = null, ...renderOptions } = options

  useAuthStore.setState({ currentUser: user })

  const router = createMemoryRouter(routes, {
    initialEntries: [initialRoute],
  })

  return render(
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>,
    renderOptions,
  )
}

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-test-1',
    email: 'test@ams.io',
    name: 'Test User',
    roles: ['consumer'],
    activeRole: 'consumer',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

// Reset stores between tests
export function resetStores() {
  useAuthStore.setState({ currentUser: null })
}
