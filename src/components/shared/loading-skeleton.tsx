import { Skeleton } from '@/components/ui/skeleton.tsx'
import { cn } from '@/lib/utils.ts'

type SkeletonVariant = 'card' | 'table-row' | 'text'

interface LoadingSkeletonProps {
  variant?: SkeletonVariant
  count?: number
  className?: string
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-6">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="mb-4 h-8 w-32" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b py-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="ml-auto h-4 w-16" />
    </div>
  )
}

function TextSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

const variants: Record<SkeletonVariant, () => React.JSX.Element> = {
  card: CardSkeleton,
  'table-row': TableRowSkeleton,
  text: TextSkeleton,
}

export function LoadingSkeleton({
  variant = 'text',
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const Component = variants[variant]

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}
