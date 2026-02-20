import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { DashboardLayout } from '@/components/layout/dashboard-layout.tsx'

function renderDashboard() {
  const router = createMemoryRouter(
    [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <div>Dashboard Content</div> },
        ],
      },
    ],
    { initialEntries: ['/dashboard'] },
  )
  return render(<RouterProvider router={router} />)
}

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'consumer@startup.io',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

describe('Dev Panel', () => {
  // AC-111: Dev panel accessible from dashboard footer
  it('renders dev panel toggle in dashboard footer', () => {
    useAuthStore.getState().login(mockConsumer)
    renderDashboard()
    expect(screen.getByRole('button', { name: /Toggle dev panel/ })).toBeInTheDocument()
  })

  it('shows reset mock data button when panel opened', async () => {
    useAuthStore.getState().login(mockConsumer)
    renderDashboard()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Toggle dev panel/ }))
    expect(screen.getByRole('button', { name: /Reset Mock Data/ })).toBeInTheDocument()
  })
})
