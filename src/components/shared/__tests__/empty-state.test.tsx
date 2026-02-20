import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../empty-state.tsx'

// AC-016: EmptyState renders placeholder
describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <EmptyState title="No items" description="Try adjusting your filters" />,
    )
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Create New</button>}
      />,
    )
    expect(screen.getByText('Create New')).toBeInTheDocument()
  })

  it('renders default icon when none provided', () => {
    const { container } = render(<EmptyState title="No items" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
