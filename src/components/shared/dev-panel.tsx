import { useState } from 'react'
import { WrenchIcon, RotateCcwIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

export function DevPanel() {
  const [open, setOpen] = useState(false)

  function handleReset() {
    sessionStorage.clear()
    window.location.reload()
  }

  return (
    <div className="border-t border-white/[0.06]">
      <button
        className="flex w-full items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(!open)}
        aria-label="Toggle dev panel"
      >
        <WrenchIcon className="h-3 w-3" />
        Dev Panel
        {open ? (
          <ChevronDownIcon className="h-3 w-3" />
        ) : (
          <ChevronUpIcon className="h-3 w-3" />
        )}
      </button>
      {open && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full text-xs"
            onClick={handleReset}
          >
            <RotateCcwIcon className="mr-2 h-3 w-3" />
            Reset Mock Data
          </Button>
        </div>
      )}
    </div>
  )
}
