import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

interface ExportButtonProps {
  onClick: () => void
  label?: string
  disabled?: boolean
}

export function ExportButton({ onClick, label = 'Export CSV', disabled }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      className="rounded-full border-white/20 bg-white/[0.06] font-heading font-light"
      onClick={onClick}
      disabled={disabled}
    >
      <DownloadIcon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
