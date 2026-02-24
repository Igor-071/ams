import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { AdminConsumerDetailPage } from '../pages/admin-consumer-detail-page.tsx'
import {
  getApiKeyById,
  getApiKeysByConsumer,
  adminRevokeApiKey,
  adminRevokeAllConsumerKeys,
  forceRegenerateApiKey,
} from '@/mocks/handlers.ts'
import { mockApiKeys } from '@/mocks/data/api-keys.ts'

function renderConsumerDetail(consumerId: string) {
  const router = createMemoryRouter(
    [{ path: '/admin/consumers/:consumerId', element: <AdminConsumerDetailPage /> }],
    { initialEntries: [`/admin/consumers/${consumerId}`] },
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

// Save original key statuses for restoration
const originalKeyStatuses: Record<string, { status: string; revokedAt?: string; revokedBy?: string }> = {}

describe('Admin Credential Control', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockAdmin)
    // Restore original key statuses
    for (const [id, orig] of Object.entries(originalKeyStatuses)) {
      const key = mockApiKeys.find((k) => k.id === id)
      if (key) {
        key.status = orig.status as 'active' | 'expired' | 'revoked'
        key.revokedAt = orig.revokedAt
        key.revokedBy = orig.revokedBy as 'consumer' | 'merchant' | 'admin' | undefined
      }
    }
    // Save current statuses before tests modify them
    for (const key of mockApiKeys) {
      originalKeyStatuses[key.id] = {
        status: key.status,
        revokedAt: key.revokedAt,
        revokedBy: key.revokedBy,
      }
    }
  })

  // AC-156: Admin consumer detail shows API Keys card
  it('shows API Keys card with keys table on consumer detail', () => {
    renderConsumerDetail('user-consumer-1')
    expect(screen.getByText('API Keys')).toBeInTheDocument()
    // consumer-1 has keys: Production Key, Development Key, Expired Key, Revoked Key
    expect(screen.getByText('Production Key')).toBeInTheDocument()
    expect(screen.getByText('Development Key')).toBeInTheDocument()
    // Table headers
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  // AC-157: adminRevokeApiKey handler
  it('revokes a single API key with revokedBy=admin', () => {
    const result = adminRevokeApiKey('key-1')
    expect(result).toBeDefined()
    expect(result!.status).toBe('revoked')
    expect(result!.revokedBy).toBe('admin')
    expect(result!.revokedAt).toBeDefined()
  })

  // AC-158: adminRevokeAllConsumerKeys handler
  it('revokes all active keys for a consumer', () => {
    const count = adminRevokeAllConsumerKeys('user-consumer-1')
    expect(count).toBeGreaterThan(0)
    const remaining = getApiKeysByConsumer('user-consumer-1', { pageSize: 100 }).data
    const stillActive = remaining.filter((k) => k.status === 'active')
    expect(stillActive.length).toBe(0)
  })

  // AC-159: Revoke All Keys button with confirmation dialog
  it('shows Revoke All Keys button and opens confirmation dialog', async () => {
    renderConsumerDetail('user-consumer-1')
    const user = userEvent.setup()
    const revokeAllBtn = screen.getByRole('button', { name: /Revoke All Keys/i })
    expect(revokeAllBtn).toBeInTheDocument()
    await user.click(revokeAllBtn)
    expect(screen.getByText(/Revoke All API Keys\?/)).toBeInTheDocument()
    expect(screen.getByText(/immediately revoke all active API keys/)).toBeInTheDocument()
  })

  // AC-160: Force Regenerate per key
  it('force regenerates an API key (revokes old + creates new)', () => {
    const oldKey = getApiKeyById('key-1')!
    const oldName = oldKey.name
    const newKey = forceRegenerateApiKey('key-1')
    expect(newKey).toBeDefined()
    expect(newKey!.name).toBe(oldName)
    expect(newKey!.status).toBe('active')
    // Old key should be revoked
    const revokedOld = getApiKeyById('key-1')!
    expect(revokedOld.status).toBe('revoked')
    expect(revokedOld.revokedBy).toBe('admin')
  })
})
