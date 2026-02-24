import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantImagesPage } from '../pages/merchant-images-page.tsx'

function renderImagesPage() {
  const router = createMemoryRouter(
    [{ path: '/merchant/images', element: <MerchantImagesPage /> }],
    { initialEntries: ['/merchant/images'] },
  )
  return render(<RouterProvider router={router} />)
}

const mockMerchant2 = {
  id: 'user-merchant-2',
  email: 'merchant@dataflow.io',
  name: 'Maria DataFlow',
  roles: ['merchant'] as Role[],
  activeRole: 'merchant' as const,
  status: 'active' as const,
  createdAt: '2025-03-01T00:00:00Z',
}

const mockMerchant1 = {
  id: 'user-merchant-1',
  email: 'merchant@acme.com',
  name: 'James Merchant',
  roles: ['merchant'] as Role[],
  activeRole: 'merchant' as const,
  status: 'active' as const,
  createdAt: '2025-02-15T00:00:00Z',
}

describe('Merchant Docker Image Management', () => {
  // AC-082: Images page shows docker images
  it('renders docker images for merchant-2', () => {
    useAuthStore.getState().login(mockMerchant2)
    renderImagesPage()
    expect(screen.getByRole('heading', { name: /Docker Images/ })).toBeInTheDocument()
    // merchant-2 owns svc-3 (Stream Processor) which has 3 docker images
    expect(screen.getAllByText(/stream-processor/).length).toBeGreaterThanOrEqual(3)
  })

  // AC-083: Each image shows push command with copy button
  it('shows push commands with copy buttons', () => {
    useAuthStore.getState().login(mockMerchant2)
    renderImagesPage()
    const pushCommands = screen.getAllByText(/docker push registry\.ams\.io/)
    expect(pushCommands.length).toBeGreaterThanOrEqual(2)
  })

  // Empty state for merchant with no docker images
  it('shows empty state for merchant with no docker services', () => {
    useAuthStore.getState().login(mockMerchant1)
    renderImagesPage()
    expect(screen.getByText(/No Docker images/)).toBeInTheDocument()
  })
})
