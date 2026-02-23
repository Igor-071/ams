import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-4 py-1.5 font-heading text-sm font-light text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Previous
      </button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-4 py-1.5 font-heading text-sm font-light text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        Next
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
