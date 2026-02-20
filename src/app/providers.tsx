import { RouterProvider } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'
import { router } from './router.tsx'

export function Providers() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}
