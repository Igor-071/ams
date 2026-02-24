import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantServiceConsumersPage } from '../pages/merchant-service-consumers-page.tsx'
import {
  simulateConsumption,
  blockConsumerForService,
  unblockConsumerForService,
} from '@/mocks/handlers.ts'

function loginAsMerchant1() {
  useAuthStore.getState().login({
    id: 'user-merchant-1',
    email: 'merchant1@acme.com',
    name: 'ACME Admin',
    roles: ['merchant'],
    activeRole: 'merchant',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  })
}

function renderPage(serviceId = 'svc-1') {
  const router = createMemoryRouter(
    [{ path: '/merchant/services/:serviceId/consumers', element: <MerchantServiceConsumersPage /> }],
    { initialEntries: [`/merchant/services/${serviceId}/consumers`] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Per-Service Consumer Blocking', () => {
  beforeEach(async () => {
    const { mockServiceBlocks } = await import('@/mocks/data/services.ts')
    mockServiceBlocks.length = 0
  })

  // AC-181: Block/Unblock actions per consumer row
  it('shows Block button per consumer row', () => {
    loginAsMerchant1()
    renderPage()
    const blockButtons = screen.getAllByRole('button', { name: /^Block$/i })
    expect(blockButtons.length).toBeGreaterThanOrEqual(1)
  })

  // AC-182: Blocked consumers show red "Blocked" badge
  it('shows Blocked badge after blocking a consumer', async () => {
    loginAsMerchant1()
    renderPage()
    const user = userEvent.setup()

    const blockButtons = screen.getAllByRole('button', { name: /^Block$/i })
    await user.click(blockButtons[0])

    const confirmBtn = screen.getByRole('button', { name: /Confirm/i })
    await user.click(confirmBtn)

    // After blocking, "Blocked" badges should appear
    const blockedBadges = screen.getAllByText('Blocked').filter(
      (el) => el.getAttribute('data-slot') === 'badge',
    )
    expect(blockedBadges.length).toBeGreaterThanOrEqual(1)
    // Should show Unblock button
    expect(screen.getAllByRole('button', { name: /Unblock/i }).length).toBeGreaterThanOrEqual(1)
  })

  // AC-183: blockConsumerForService and unblockConsumerForService handlers
  it('blocks and unblocks a consumer for a service via handlers', () => {
    const block = blockConsumerForService('user-consumer-1', 'svc-1', 'user-merchant-1', 'ACME Admin')
    expect(block.consumerId).toBe('user-consumer-1')
    expect(block.serviceId).toBe('svc-1')

    const unblocked = unblockConsumerForService('user-consumer-1', 'svc-1', 'user-merchant-1', 'ACME Admin')
    expect(unblocked).toBe(true)
  })

  // AC-184: simulateConsumption returns 403 for blocked consumer-service pairs
  it('returns 403 when consumer is blocked for a service', () => {
    blockConsumerForService('user-consumer-1', 'svc-1', 'user-merchant-1', 'ACME Admin')
    const result = simulateConsumption('ams_live_k1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6', 'svc-1')
    expect(result.statusCode).toBe(403)
    expect(result.errorMessage).toBe('Consumer blocked for this service')
  })

  // AC-185: Audit actions consumer.service_blocked and consumer.service_unblocked
  it('creates audit logs for block/unblock actions', async () => {
    blockConsumerForService('user-consumer-1', 'svc-1', 'user-merchant-1', 'ACME Admin')
    const { mockAuditLogs } = await import('@/mocks/data/audit-logs.ts')
    const blockLog = mockAuditLogs.find(
      (l) => l.action === 'consumer.service_blocked' && l.targetId === 'user-consumer-1',
    )
    expect(blockLog).toBeDefined()

    unblockConsumerForService('user-consumer-1', 'svc-1', 'user-merchant-1', 'ACME Admin')
    const unblockLog = mockAuditLogs.find(
      (l) => l.action === 'consumer.service_unblocked' && l.targetId === 'user-consumer-1',
    )
    expect(unblockLog).toBeDefined()
  })

  // Unblock flow via UI
  it('unblocks a consumer via the UI', async () => {
    blockConsumerForService('user-consumer-1', 'svc-1', 'user-merchant-1', 'ACME Admin')

    loginAsMerchant1()
    renderPage()
    const user = userEvent.setup()

    // Should see Blocked badges
    const blockedBadges = screen.getAllByText('Blocked').filter(
      (el) => el.getAttribute('data-slot') === 'badge',
    )
    expect(blockedBadges.length).toBeGreaterThanOrEqual(1)

    const unblockBtn = screen.getAllByRole('button', { name: /Unblock/i })[0]
    await user.click(unblockBtn)

    const confirmBtn = screen.getByRole('button', { name: /Confirm/i })
    await user.click(confirmBtn)

    // After unblocking, Blocked badges should be gone
    const remainingBlocked = screen.queryAllByText('Blocked').filter(
      (el) => el.getAttribute('data-slot') === 'badge',
    )
    expect(remainingBlocked.length).toBe(0)
  })
})
