import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LoadingSkeleton } from '../loading-skeleton.tsx'

// AC-017: LoadingSkeleton renders placeholder animation
describe('LoadingSkeleton', () => {
  it('renders text skeleton by default', () => {
    const { container } = render(<LoadingSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders multiple skeletons', () => {
    const { container } = render(<LoadingSkeleton variant="card" count={3} />)
    const cards = container.querySelectorAll('.rounded-2xl')
    expect(cards).toHaveLength(3)
  })

  it('renders table-row variant', () => {
    const { container } = render(<LoadingSkeleton variant="table-row" count={2} />)
    const rows = container.querySelectorAll('.border-b')
    expect(rows).toHaveLength(2)
  })
})
