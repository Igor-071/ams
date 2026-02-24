import { Badge } from '@/components/ui/badge.tsx'
import type { Status } from '@/types/common.ts'
import { cn } from '@/lib/utils.ts'

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/15',
  },
  suspended: {
    label: 'Suspended',
    className: 'bg-red-500/15 text-red-400 hover:bg-red-500/15',
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-red-500/15 text-red-400 hover:bg-red-500/15',
  },
  expired: {
    label: 'Expired',
    className: 'bg-gray-500/15 text-gray-400 hover:bg-gray-500/15',
  },
  revoked: {
    label: 'Revoked',
    className: 'bg-red-500/15 text-red-400 hover:bg-red-500/15',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-400 hover:bg-red-500/15',
  },
  draft: {
    label: 'Draft',
    className: 'bg-slate-500/15 text-slate-400 hover:bg-slate-500/15',
  },
  disabled: {
    label: 'Disabled',
    className: 'bg-red-500/15 text-red-400 hover:bg-red-500/15',
  },
  deprecated: {
    label: 'Deprecated',
    className: 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/15',
  },
}

interface StatusBadgeProps {
  status: Status | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as Status] ?? {
    label: status,
    className: 'bg-gray-500/15 text-gray-400 hover:bg-gray-500/15',
  }

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
