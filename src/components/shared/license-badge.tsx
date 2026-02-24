import { Badge } from '@/components/ui/badge.tsx'
import type { LicenseStatus } from '@/types/docker.ts'
import { cn } from '@/lib/utils.ts'

const licenseConfig: Record<LicenseStatus, { label: string; className: string }> = {
  valid: {
    label: 'Valid',
    className: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15',
  },
  expired: {
    label: 'Expired',
    className: 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/15',
  },
  revoked: {
    label: 'Revoked',
    className: 'bg-red-500/15 text-red-400 hover:bg-red-500/15',
  },
}

interface LicenseBadgeProps {
  status: LicenseStatus
  className?: string
}

export function LicenseBadge({ status, className }: LicenseBadgeProps) {
  const config = licenseConfig[status]

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
