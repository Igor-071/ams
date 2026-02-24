import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantImagesPage } from '../pages/merchant-images-page.tsx'
import type { DockerImage } from '@/types/docker.ts'

function loginAsMerchant2() {
  useAuthStore.getState().login({
    id: 'user-merchant-2',
    email: 'merchant2@dataflow.io',
    name: 'DataFlow Admin',
    roles: ['merchant'],
    activeRole: 'merchant',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  })
}

function renderImagesPage() {
  const router = createMemoryRouter(
    [{ path: '/merchant/images', element: <MerchantImagesPage /> }],
    { initialEntries: ['/merchant/images'] },
  )
  return render(<RouterProvider router={router} />)
}

let mockDockerImages: DockerImage[]

describe('Docker Image Lifecycle — Merchant', () => {
  beforeEach(async () => {
    const mod = await import('@/mocks/data/docker-images.ts')
    mockDockerImages = mod.mockDockerImages
    // Reset image statuses for clean tests
    for (const img of mockDockerImages) {
      if (img.id === 'img-1') img.status = 'active'
      if (img.id === 'img-2') img.status = 'active'
      if (img.id === 'img-4') img.status = 'deprecated'
    }
  })

  // AC-161 + AC-164: Status badges with deprecated amber styling
  it('renders status badges including deprecated with amber styling', () => {
    loginAsMerchant2()
    renderImagesPage()
    const activeBadges = screen.getAllByText('Active')
    expect(activeBadges.length).toBeGreaterThanOrEqual(2)
    // Deprecated appears in both the filter option and the badge
    const deprecatedBadges = screen.getAllByText('Deprecated').filter(
      (el) => el.getAttribute('data-slot') === 'badge',
    )
    expect(deprecatedBadges.length).toBeGreaterThanOrEqual(1)
    expect(deprecatedBadges[0].className).toContain('text-amber-400')
  })

  // AC-163: Mock data includes varied image states
  it('shows 3 images for merchant-2 (svc-3)', () => {
    loginAsMerchant2()
    renderImagesPage()
    expect(screen.getAllByText(/stream-processor:latest/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/stream-processor:v1\.2\.0/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/stream-processor:v1\.0\.0/).length).toBeGreaterThanOrEqual(1)
  })

  // AC-165: LicenseBadge valid/expired
  it('shows license badges — valid and expired', () => {
    loginAsMerchant2()
    renderImagesPage()
    const validBadges = screen.getAllByText('Valid')
    expect(validBadges.length).toBeGreaterThanOrEqual(2)
    const expiredTexts = screen.getAllByText('Expired')
    expect(expiredTexts.length).toBeGreaterThanOrEqual(1)
  })

  // AC-166: Licensing model and usage metrics
  it('shows licensing model and usage metrics per image', () => {
    loginAsMerchant2()
    renderImagesPage()
    expect(screen.getAllByText(/online/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/offline-ttl/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/1,250/)).toBeInTheDocument()
  })

  // AC-167: TTL expiry date
  it('shows TTL expiry date for offline-ttl images', () => {
    loginAsMerchant2()
    renderImagesPage()
    expect(screen.getByText(/Jun 1, 2025/)).toBeInTheDocument()
  })

  // AC-168: Deprecate button with confirmation
  it('shows Deprecate button for active images and opens confirmation dialog', async () => {
    loginAsMerchant2()
    renderImagesPage()
    const user = userEvent.setup()

    const deprecateButtons = screen.getAllByRole('button', { name: /Deprecate/i })
    expect(deprecateButtons.length).toBeGreaterThanOrEqual(1)

    await user.click(deprecateButtons[0])
    expect(screen.getByText(/Are you sure you want to deprecate/i)).toBeInTheDocument()
  })

  // AC-169: deprecateImage handler
  it('deprecates an image via confirmation dialog', async () => {
    loginAsMerchant2()
    renderImagesPage()
    const user = userEvent.setup()

    const deprecateButtons = screen.getAllByRole('button', { name: /Deprecate/i })
    await user.click(deprecateButtons[0])
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i })
    await user.click(confirmBtn)
    const deprecatedBadges = screen.getAllByText('Deprecated').filter(
      (el) => el.getAttribute('data-slot') === 'badge',
    )
    expect(deprecatedBadges.length).toBeGreaterThanOrEqual(2)
  })

  // AC-170: Filter by status
  it('filters images by status', async () => {
    loginAsMerchant2()
    renderImagesPage()
    const user = userEvent.setup()

    const statusFilter = screen.getByLabelText(/Filter by status/i)
    await user.selectOptions(statusFilter, 'deprecated')
    expect(screen.queryAllByText(/stream-processor:latest/).length).toBe(0)
    expect(screen.getAllByText(/stream-processor:v1\.0\.0/).length).toBeGreaterThanOrEqual(1)
  })

  // AC-170: Search by name
  it('searches images by name', async () => {
    loginAsMerchant2()
    renderImagesPage()
    const user = userEvent.setup()

    const searchInput = screen.getByPlaceholderText(/Search images/i)
    await user.type(searchInput, 'v1.2')
    expect(screen.getAllByText(/stream-processor:v1\.2\.0/).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryAllByText(/stream-processor:latest/).length).toBe(0)
  })

  // AC-171: Validation pipeline with 5 steps
  it('shows validation pipeline when expanded', async () => {
    loginAsMerchant2()
    renderImagesPage()
    const user = userEvent.setup()

    const expandButtons = screen.getAllByRole('button', { name: /Show pipeline/i })
    await user.click(expandButtons[0])

    expect(screen.getByText('Naming Convention')).toBeInTheDocument()
    expect(screen.getByText('Tag Validation')).toBeInTheDocument()
    expect(screen.getByText('Service Association')).toBeInTheDocument()
    expect(screen.getByText('Licensing')).toBeInTheDocument()
    expect(screen.getByText('Activation')).toBeInTheDocument()
  })

  // AC-173: Failed validation step for img-4
  it('shows a failed validation step for deprecated image', async () => {
    loginAsMerchant2()
    renderImagesPage()
    const user = userEvent.setup()

    const statusFilter = screen.getByLabelText(/Filter by status/i)
    await user.selectOptions(statusFilter, 'deprecated')

    const expandButtons = screen.getAllByRole('button', { name: /Show pipeline/i })
    await user.click(expandButtons[0])

    expect(screen.getByText(/does not follow/i)).toBeInTheDocument()
  })
})
