import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ImagesPage } from '../pages/images-page.tsx'

function loginAsConsumer1() {
  useAuthStore.getState().login({
    id: 'user-consumer-1',
    email: 'alice@example.com',
    name: 'Alice Consumer',
    roles: ['consumer'],
    activeRole: 'consumer',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  })
}

function renderImagesPage() {
  const router = createMemoryRouter(
    [{ path: '/dashboard/images', element: <ImagesPage /> }],
    { initialEntries: ['/dashboard/images'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Consumer Image Pull Flow', () => {
  let mockAccessRequests: import('@/types/service.ts').AccessRequest[]

  beforeEach(async () => {
    const services = await import('@/mocks/data/services.ts')
    mockAccessRequests = services.mockAccessRequests
    const existing = mockAccessRequests.find(
      (r) => r.consumerId === 'user-consumer-1' && r.serviceId === 'svc-3',
    )
    if (!existing) {
      mockAccessRequests.push({
        id: 'ar-test-docker-pull',
        consumerId: 'user-consumer-1',
        consumerName: 'Alice Consumer',
        serviceId: 'svc-3',
        serviceName: 'Stream Processor',
        status: 'approved',
        requestedAt: '2025-04-20T00:00:00Z',
        resolvedAt: '2025-04-21T00:00:00Z',
        resolvedBy: 'user-admin-1',
      })
    }
  })

  // AC-174: Consumer images page shows status badge, license badge
  it('shows status badges and license badges per image', () => {
    loginAsConsumer1()
    renderImagesPage()
    const activeBadges = screen.getAllByText('Active')
    expect(activeBadges.length).toBeGreaterThanOrEqual(1)
    const validBadges = screen.getAllByText('Valid')
    expect(validBadges.length).toBeGreaterThanOrEqual(1)
  })

  // AC-175: "Request Pull Access" button per active image
  it('shows Request Pull Access button for active images', () => {
    loginAsConsumer1()
    renderImagesPage()
    const pullButtons = screen.getAllByRole('button', { name: /Request Pull Access/i })
    expect(pullButtons.length).toBeGreaterThanOrEqual(1)
  })

  // AC-176: Pull flow dialog with 4-step simulation
  it('opens pull flow dialog with 4 simulation steps', async () => {
    loginAsConsumer1()
    renderImagesPage()
    const user = userEvent.setup()

    const pullButtons = screen.getAllByRole('button', { name: /Request Pull Access/i })
    await user.click(pullButtons[0])

    expect(screen.getByText('Entitlement Check')).toBeInTheDocument()
    expect(screen.getByText('License Validation')).toBeInTheDocument()
    expect(screen.getByText('Team Verification')).toBeInTheDocument()
    expect(screen.getByText('Token Generation')).toBeInTheDocument()
  })

  // AC-177: Generated pull token shown masked with copy button
  it('generates pull token and shows it masked with copy button', async () => {
    loginAsConsumer1()
    renderImagesPage()
    const user = userEvent.setup()

    const pullButtons = screen.getAllByRole('button', { name: /Request Pull Access/i })
    await user.click(pullButtons[0])

    const generateBtn = screen.getByRole('button', { name: /Generate Token/i })
    await user.click(generateBtn)

    expect(screen.getByText(/ams_pull_/)).toBeInTheDocument()
    // Multiple copy buttons exist (one per image card + one for the token)
    expect(screen.getAllByLabelText(/Copy to clipboard/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/30 min/i)).toBeInTheDocument()
  })

  // AC-179: Filter by status
  it('filters images by status', async () => {
    loginAsConsumer1()
    renderImagesPage()
    const user = userEvent.setup()

    const statusFilter = screen.getByLabelText(/Filter by status/i)
    await user.selectOptions(statusFilter, 'deprecated')
    expect(screen.getAllByText(/stream-processor:v1\.0\.0/).length).toBeGreaterThanOrEqual(1)
  })

  // AC-179: Search by name
  it('searches images by name', async () => {
    loginAsConsumer1()
    renderImagesPage()
    const user = userEvent.setup()

    const searchInput = screen.getByPlaceholderText(/Search images/i)
    await user.type(searchInput, 'v1.2')
    expect(screen.getAllByText(/stream-processor:v1\.2\.0/).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryAllByText(/stream-processor:latest/).length).toBe(0)
  })

  // AC-180: Disabled/deprecated images — no pull button
  it('does not show pull button for deprecated images', async () => {
    loginAsConsumer1()
    renderImagesPage()
    const user = userEvent.setup()

    const statusFilter = screen.getByLabelText(/Filter by status/i)
    await user.selectOptions(statusFilter, 'deprecated')
    expect(screen.queryByRole('button', { name: /Request Pull Access/i })).not.toBeInTheDocument()
  })
})
