import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminUsagePage } from '../pages/admin-usage-page.tsx'

// Mock ResponsiveContainer to avoid zero-size issues in jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  }
})

function renderUsagePage() {
  const router = createMemoryRouter(
    [{ path: '/admin/usage', element: <AdminUsagePage /> }],
    { initialEntries: ['/admin/usage'] },
  )
  return render(<RouterProvider router={router} />)
}

const mockAdmin = {
  id: 'user-admin-1',
  email: 'admin@ams.io',
  name: 'Sarah Admin',
  roles: ['admin'] as Role[],
  activeRole: 'admin' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

describe('Admin Usage Page', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockAdmin)
  })

  it('renders heading "Platform Usage" and 4 stat cards', () => {
    renderUsagePage()
    expect(screen.getByRole('heading', { name: /Platform Usage/ })).toBeInTheDocument()
    expect(screen.getByText('Total Requests')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
    expect(screen.getByText('Error Rate')).toBeInTheDocument()
  })

  it('renders consumption chart', () => {
    renderUsagePage()
    expect(screen.getByText('Consumption Over Time')).toBeInTheDocument()
    expect(screen.getByTestId('consumption-chart')).toBeInTheDocument()
  })

  it('shows By Merchant table with ACME APIs', () => {
    renderUsagePage()
    expect(screen.getByText('By Merchant')).toBeInTheDocument()
    // ACME APIs appears in both By Merchant (company) and By Service (merchant) tables
    expect(screen.getAllByText('ACME APIs').length).toBeGreaterThanOrEqual(1)
  })

  it('shows By Consumer table with consumer names', () => {
    renderUsagePage()
    expect(screen.getByText('By Consumer')).toBeInTheDocument()
    expect(screen.getByText('Alice Consumer')).toBeInTheDocument()
    expect(screen.getByText('Dave Developer')).toBeInTheDocument()
  })

  it('shows By Service table with service names', () => {
    renderUsagePage()
    expect(screen.getByText('By Service')).toBeInTheDocument()
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
  })

  it('displays platform-wide total requests', () => {
    renderUsagePage()
    // 6 total mock usage records across all merchants/consumers
    expect(screen.getAllByText('6').length).toBeGreaterThanOrEqual(1)
  })

  it('renders date range picker button', () => {
    renderUsagePage()
    const pickerButton = screen.getByRole('button', { name: /Select date range/ })
    expect(pickerButton).toBeInTheDocument()
    expect(pickerButton).toHaveTextContent('This Month')
  })
})
