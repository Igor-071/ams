import { useEffect, useRef, useState } from 'react'
import { BellIcon, CheckCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useNotificationStore } from '@/stores/notification-store.ts'
import { useAuthStore } from '@/stores/auth-store.ts'

const SEED_KEY = 'ams-notifications-seeded'

function seedNotifications() {
  const { addNotification } = useNotificationStore.getState()
  const alreadySeeded = sessionStorage.getItem(SEED_KEY)
  if (alreadySeeded) return
  sessionStorage.setItem(SEED_KEY, 'true')

  addNotification({
    type: 'info',
    title: 'Welcome to AMS',
    description: 'Your account is ready. Start exploring the marketplace.',
  })
  addNotification({
    type: 'success',
    title: 'Service approved',
    description: 'Weather API access has been approved.',
  })
  addNotification({
    type: 'success',
    title: 'Access request approved',
    description: 'Your request for Geocoding API has been approved.',
  })
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { currentUser } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const unreadCount = useNotificationStore((s) => s.unreadCount())

  useEffect(() => {
    if (currentUser) {
      seedNotifications()
    }
  }, [currentUser])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <BellIcon className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-white/[0.06] bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <h3 className="font-heading text-sm font-light text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs text-muted-foreground"
                onClick={() => markAllAsRead()}
              >
                <CheckCheckIcon className="mr-1 h-3 w-3" />
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications
              </p>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  className={`w-full border-b border-white/[0.06] px-4 py-3 text-left last:border-0 ${
                    notif.read ? 'opacity-60' : ''
                  }`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id)
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!notif.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className={notif.read ? 'pl-4' : ''}>
                      <p className="text-sm font-medium text-foreground">
                        {notif.title}
                      </p>
                      {notif.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {notif.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
