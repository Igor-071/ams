import { Badge } from '@/components/ui/badge.tsx'
import { cn } from '@/lib/utils.ts'

interface TbdBadgeProps {
  label?: string
  className?: string
}

export function TbdBadge({ label = 'TBD', className }: TbdBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-dashed border-amber-500/40 bg-amber-500/10 text-xs text-amber-400',
        className,
      )}
    >
      {label}
    </Badge>
  )
}
