import { Outlet } from 'react-router'
import { Toaster } from '@/components/ui/sonner.tsx'

export function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  )
}
