import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { useNotificationStore } from '@/stores/notification-store.ts'
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

describe('Notification Center', () => {
  beforeEach(() => {
    useNotificationStore.getState().clearAll()
    sessionStorage.clear()
  })

  // AC-112: Bell icon in dashboard topbar
  it('renders bell icon in the topbar', () => {
    useAuthStore.getState().login(mockConsumer)
    renderDashboard()
    expect(screen.getByRole('button', { name: /Notifications/ })).toBeInTheDocument()
  })

  // AC-115: Seed notifications on first load
  it('seeds notifications on first dashboard load', () => {
    useAuthStore.getState().login(mockConsumer)
    renderDashboard()
    // After render, notifications should be seeded
    const { notifications } = useNotificationStore.getState()
    expect(notifications.length).toBeGreaterThanOrEqual(3)
    expect(notifications.some((n) => n.title === 'Welcome to AMS')).toBe(true)
    expect(notifications.some((n) => n.title === 'Service approved')).toBe(true)
  })

  // AC-112: Unread badge shows count
  it('shows unread count badge when there are unread notifications', () => {
    useAuthStore.getState().login(mockConsumer)
    renderDashboard()
    // Seeded notifications are all unread
    const badge = screen.getByText('3')
    expect(badge).toBeInTheDocument()
  })

  // AC-113: Dropdown shows notification list
  it('opens dropdown showing notifications when bell clicked', async () => {
    useAuthStore.getState().login(mockConsumer)
    renderDashboard()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Notifications/ }))
    expect(screen.getByText('Welcome to AMS')).toBeInTheDocument()
    expect(screen.getByText('Service approved')).toBeInTheDocument()
    expect(screen.getByText('Access request approved')).toBeInTheDocument()
    expect(screen.getByText(/Mark all as read/)).toBeInTheDocument()
  })

  // AC-114: Mark as read
  it('marks a notification as read when clicked', async () => {
    useAuthStore.getState().login(mockConsumer)
    renderDashboard()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Notifications/ }))
    // Click on first notification
    await user.click(screen.getByText('Welcome to AMS'))
    // Unread count should decrease
    const count = useNotificationStore.getState().unreadCount()
    expect(count).toBe(2)
  })

  // AC-114: Mark all as read
  it('marks all notifications as read when button clicked', async () => {
    useAuthStore.getState().login(mockConsumer)
    renderDashboard()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Notifications/ }))
    await user.click(screen.getByText(/Mark all as read/))
    const count = useNotificationStore.getState().unreadCount()
    expect(count).toBe(0)
  })
})
