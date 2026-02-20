import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ImagesPage } from '../pages/images-page.tsx'

function renderImagesPage() {
  const router = createMemoryRouter(
    [{ path: '/dashboard/images', element: <ImagesPage /> }],
    { initialEntries: ['/dashboard/images'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Docker Images', () => {
  // AC-062: Docker images page renders with available images
  it('shows heading and empty state when no Docker services are subscribed', () => {
    useAuthStore.getState().login({
      id: 'user-consumer-2',
      email: 'dave@example.com',
      name: 'Dave Developer',
      roles: ['consumer'],
      activeRole: 'consumer',
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
    })
    renderImagesPage()
    expect(screen.getByRole('heading', { name: /Docker Images/ })).toBeInTheDocument()
    expect(screen.getByText('No Docker images available')).toBeInTheDocument()
  })

  // AC-063: Pull command displayed with copy button
  it('renders pull command with copy button when images exist', async () => {
    const { mockAccessRequests } = await import('@/mocks/data/services.ts')
    const originalLength = mockAccessRequests.length

    mockAccessRequests.push({
      id: 'ar-test-docker',
      consumerId: 'user-consumer-1',
      consumerName: 'Alice Consumer',
      serviceId: 'svc-3',
      serviceName: 'Stream Processor',
      status: 'approved',
      requestedAt: '2025-04-20T00:00:00Z',
      resolvedAt: '2025-04-21T00:00:00Z',
      resolvedBy: 'user-admin-1',
    })

    useAuthStore.getState().login({
      id: 'user-consumer-1',
      email: 'alice@example.com',
      name: 'Alice Consumer',
      roles: ['consumer'],
      activeRole: 'consumer',
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
    })

    renderImagesPage()

    // Check the pull command is rendered in a <code> element
    const pullCommands = screen.getAllByText(
      /docker pull registry\.ams\.io\/stream-processor:latest/,
    )
    expect(pullCommands.length).toBeGreaterThan(0)
    // Copy button present
    expect(screen.getAllByLabelText(/Copy to clipboard/).length).toBeGreaterThan(0)

    mockAccessRequests.splice(originalLength)
  })
})
