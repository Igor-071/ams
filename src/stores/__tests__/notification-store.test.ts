import { describe, it, expect, beforeEach } from 'vitest'
import { useNotificationStore } from '../notification-store.ts'

describe('Notification Store', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] })
  })

  // AC-020: Notification store manages toast notifications
  it('adds a notification', () => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Test notification',
      description: 'A test',
    })
    const notifications = useNotificationStore.getState().notifications
    expect(notifications).toHaveLength(1)
    expect(notifications[0].title).toBe('Test notification')
    expect(notifications[0].read).toBe(false)
  })

  it('removes a notification', () => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title: 'To be removed',
    })
    const id = useNotificationStore.getState().notifications[0].id
    useNotificationStore.getState().removeNotification(id)
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })

  it('marks notification as read', () => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title: 'Unread',
    })
    const id = useNotificationStore.getState().notifications[0].id
    useNotificationStore.getState().markAsRead(id)
    expect(useNotificationStore.getState().notifications[0].read).toBe(true)
  })

  it('marks all as read', () => {
    useNotificationStore.getState().addNotification({ type: 'info', title: 'A' })
    useNotificationStore.getState().addNotification({ type: 'info', title: 'B' })
    useNotificationStore.getState().markAllAsRead()
    const all = useNotificationStore.getState().notifications
    expect(all.every((n) => n.read)).toBe(true)
  })

  it('counts unread notifications', () => {
    useNotificationStore.getState().addNotification({ type: 'info', title: 'A' })
    useNotificationStore.getState().addNotification({ type: 'info', title: 'B' })
    expect(useNotificationStore.getState().unreadCount()).toBe(2)
    const id = useNotificationStore.getState().notifications[0].id
    useNotificationStore.getState().markAsRead(id)
    expect(useNotificationStore.getState().unreadCount()).toBe(1)
  })

  it('clears all notifications', () => {
    useNotificationStore.getState().addNotification({ type: 'info', title: 'A' })
    useNotificationStore.getState().addNotification({ type: 'info', title: 'B' })
    useNotificationStore.getState().clearAll()
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })
})
