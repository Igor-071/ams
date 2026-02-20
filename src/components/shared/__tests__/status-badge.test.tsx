import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../status-badge.tsx'

// AC-015: StatusBadge renders colored pill
describe('StatusBadge', () => {
  it('renders with the status text', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders pending status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders unknown status as-is', () => {
    render(<StatusBadge status="custom_status" />)
    expect(screen.getByText('custom_status')).toBeInTheDocument()
  })

  it('applies active class (green)', () => {
    const { container } = render(<StatusBadge status="active" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('emerald')
  })

  it('applies suspended class (red)', () => {
    const { container } = render(<StatusBadge status="suspended" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('red')
  })
})
