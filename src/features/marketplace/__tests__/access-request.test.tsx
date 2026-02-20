import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { PublicLayout } from '@/components/layout/public-layout.tsx'
import { ServiceDetailPage } from '../pages/service-detail-page.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { mockAccessRequests } from '@/mocks/data/services.ts'
import type { User } from '@/types/user.ts'

vi.mock('@/mocks/delay.ts', () => ({
  mockDelay: () => Promise.resolve(),
}))

const consumerUser: User = {
  id: 'user-consumer-1',
  email: 'consumer@startup.io',
  name: 'Alice Consumer',
  roles: ['consumer'],
  activeRole: 'consumer',
  status: 'active',
  createdAt: '2025-04-01T00:00:00Z',
}

const freshConsumer: User = {
  id: 'user-consumer-fresh',
  email: 'fresh@test.com',
  name: 'Fresh Consumer',
  roles: ['consumer'],
  activeRole: 'consumer',
  status: 'active',
  createdAt: '2025-04-01T00:00:00Z',
}

function renderServiceDetail(serviceId: string) {
  const router = createMemoryRouter(
    [
      {
        element: <PublicLayout />,
        children: [
          { path: 'marketplace/:serviceId', element: <ServiceDetailPage /> },
        ],
      },
      { path: 'login', element: <div>Login Page</div> },
    ],
    { initialEntries: [`/marketplace/${serviceId}`] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Access Request Flow', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  // AC-042: Unauthenticated user sees login prompt
  it('shows login dialog when unauthenticated user clicks Request Access', async () => {
    const user = userEvent.setup()

    renderServiceDetail('svc-1')

    await user.click(screen.getByRole('button', { name: /request access/i }))

    await waitFor(() => {
      expect(screen.getByText(/sign in to request access/i)).toBeInTheDocument()
    })
  })

  it('navigates to login from the login dialog', async () => {
    const user = userEvent.setup()

    renderServiceDetail('svc-1')

    await user.click(screen.getByRole('button', { name: /request access/i }))

    await waitFor(() => {
      expect(screen.getByText(/sign in to request access/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })

  // AC-043: Authenticated consumer can submit request
  it('creates pending access request after confirmation', async () => {
    useAuthStore.getState().login(freshConsumer)
    const user = userEvent.setup()
    const initialCount = mockAccessRequests.length

    renderServiceDetail('svc-3') // Stream Processor - no existing request for fresh consumer

    await user.click(screen.getByRole('button', { name: /request access/i }))

    await waitFor(() => {
      expect(screen.getByText(/request access to stream processor/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /confirm request/i }))

    await waitFor(() => {
      expect(screen.getByText(/pending approval/i)).toBeInTheDocument()
    })

    // AC-047: Verify mock data was created
    expect(mockAccessRequests.length).toBe(initialCount + 1)
    const newRequest = mockAccessRequests[mockAccessRequests.length - 1]
    expect(newRequest.consumerId).toBe('user-consumer-fresh')
    expect(newRequest.consumerName).toBe('Fresh Consumer')
    expect(newRequest.serviceId).toBe('svc-3')
    expect(newRequest.serviceName).toBe('Stream Processor')
    expect(newRequest.status).toBe('pending')
    expect(newRequest.requestedAt).toBeDefined()
  })

  // AC-044: Approved access shows granted status
  it('shows Access Granted for approved request', () => {
    useAuthStore.getState().login(consumerUser)

    renderServiceDetail('svc-1') // consumer-1 has approved access to svc-1

    expect(screen.getByText(/access granted/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /request access/i })).not.toBeInTheDocument()
  })

  // AC-045: Pending request shows pending status
  it('shows Pending Approval for pending request', () => {
    useAuthStore.getState().login(consumerUser)

    renderServiceDetail('svc-4') // consumer-1 has pending request for svc-4

    expect(screen.getByText(/pending approval/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /request access/i })).not.toBeInTheDocument()
  })

  // AC-046: Denied request allows re-request
  it('shows Request Access with denied note for denied request', () => {
    // consumer-2 has denied request for svc-3
    useAuthStore.getState().login({
      id: 'user-consumer-2',
      email: 'dave@startup.io',
      name: 'Dave Developer',
      roles: ['consumer'],
      activeRole: 'consumer',
      status: 'active',
      createdAt: '2025-04-01T00:00:00Z',
    })

    renderServiceDetail('svc-3')

    expect(screen.getByRole('button', { name: /request access/i })).toBeInTheDocument()
    expect(screen.getByText(/previous request was denied/i)).toBeInTheDocument()
  })
})
