import { useLocation } from 'react-router'

export function PlaceholderPage() {
  const location = useLocation()

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="font-heading text-xl font-light text-foreground">
        {location.pathname}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        This page is coming soon.
      </p>
    </div>
  )
}
