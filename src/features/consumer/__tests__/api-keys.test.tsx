import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ApiKeysPage } from '../pages/api-keys-page.tsx'
import { ApiKeyNewPage } from '../pages/api-key-new-page.tsx'
import { ApiKeyDetailPage } from '../pages/api-key-detail-page.tsx'

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'alice@example.com',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

function renderKeysPage() {
  const router = createMemoryRouter(
    [
      { path: '/dashboard/api-keys', element: <ApiKeysPage /> },
      { path: '/dashboard/api-keys/new', element: <ApiKeyNewPage /> },
      { path: '/dashboard/api-keys/:keyId', element: <ApiKeyDetailPage /> },
    ],
    { initialEntries: ['/dashboard/api-keys'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderNewKeyPage() {
  const router = createMemoryRouter(
    [
      { path: '/dashboard/api-keys/new', element: <ApiKeyNewPage /> },
      { path: '/dashboard/api-keys/:keyId', element: <ApiKeyDetailPage /> },
      { path: '/dashboard/api-keys', element: <ApiKeysPage /> },
    ],
    { initialEntries: ['/dashboard/api-keys/new'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderDetailPage(keyId = 'key-1') {
  const router = createMemoryRouter(
    [
      { path: '/dashboard/api-keys/:keyId', element: <ApiKeyDetailPage /> },
      { path: '/dashboard/api-keys', element: <ApiKeysPage /> },
    ],
    { initialEntries: [`/dashboard/api-keys/${keyId}`] },
  )
  return render(<RouterProvider router={router} />)
}

describe('API Key Management', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockConsumer)
  })

  // AC-052: API keys list page shows consumer's keys
  it('shows keys list with table columns', () => {
    renderKeysPage()
    expect(screen.getByRole('heading', { name: /API Keys/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Generate New Key/ })).toBeInTheDocument()
    expect(screen.getByText('Production Key')).toBeInTheDocument()
    expect(screen.getByText('Development Key')).toBeInTheDocument()
    expect(screen.getByText('Expired Key')).toBeInTheDocument()
    expect(screen.getByText('Revoked Key')).toBeInTheDocument()
  })

  // AC-053: API key status badges display correctly
  it('shows correct status badges for keys', () => {
    renderKeysPage()
    const activeBadges = screen.getAllByText('Active')
    const expiredBadges = screen.getAllByText('Expired')
    const revokedBadges = screen.getAllByText('Revoked')
    expect(activeBadges.length).toBeGreaterThanOrEqual(2)
    expect(expiredBadges.length).toBeGreaterThanOrEqual(1)
    expect(revokedBadges.length).toBeGreaterThanOrEqual(1)
  })

  // AC-054: Generate new API key form
  it('shows generate key form with required fields', () => {
    renderNewKeyPage()
    expect(screen.getByRole('heading', { name: /Generate New Key/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByLabelText(/TTL/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Generate Key/ })).toBeInTheDocument()
  })

  // AC-055: Successful key generation shows the key value once
  it('shows full key value and copy warning after generation', async () => {
    const user = userEvent.setup()
    renderNewKeyPage()

    await user.type(screen.getByLabelText(/Name/), 'My Test Key')
    await user.click(screen.getByRole('button', { name: /Generate Key/ }))

    expect(screen.getByText('API Key Created Successfully')).toBeInTheDocument()
    expect(screen.getByText(/won't be shown again/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Copy to clipboard/i)).toBeInTheDocument()
  })

  // AC-056: API key detail page shows masked key and metadata
  it('shows key detail with masked value and metadata', () => {
    renderDetailPage('key-1')
    expect(screen.getByRole('heading', { name: /Production Key/ })).toBeInTheDocument()
    expect(screen.getByText('ams_live...')).toBeInTheDocument()
    expect(screen.getByText('Main production API key for weather data')).toBeInTheDocument()
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Revoke Key/ })).toBeInTheDocument()
  })

  // AC-057: Revoke key with confirmation dialog
  it('revokes key after confirmation dialog', async () => {
    const user = userEvent.setup()
    renderDetailPage('key-2')

    await user.click(screen.getByRole('button', { name: /Revoke Key/ }))
    expect(screen.getByText('Revoke this API key?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Revoke' }))
    expect(screen.queryByRole('button', { name: /Revoke Key/ })).not.toBeInTheDocument()
  })

  // AC-058: Key list row click navigates to detail
  it('navigates to detail page when clicking a key row', async () => {
    const user = userEvent.setup()
    renderKeysPage()

    await user.click(screen.getByText('Development Key'))
    expect(screen.getByText('ams_test...')).toBeInTheDocument()
  })
})
