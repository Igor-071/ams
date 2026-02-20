import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { PageHeader } from '../page-header.tsx'

// AC-014: PageHeader renders title and breadcrumbs
describe('PageHeader', () => {
  it('renders title as h1', () => {
    render(
      <MemoryRouter>
        <PageHeader title="API Keys" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'API Keys',
    )
  })

  it('renders description when provided', () => {
    render(
      <MemoryRouter>
        <PageHeader title="API Keys" description="Manage your keys" />
      </MemoryRouter>,
    )
    expect(screen.getByText('Manage your keys')).toBeInTheDocument()
  })

  it('renders breadcrumbs with separator', () => {
    render(
      <MemoryRouter>
        <PageHeader
          title="Key Detail"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'API Keys', href: '/dashboard/api-keys' },
            { label: 'Key Detail' },
          ]}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    // breadcrumb nav should exist
    expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument()
  })

  it('renders action slot', () => {
    render(
      <MemoryRouter>
        <PageHeader title="API Keys" actions={<button>Create Key</button>} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Create Key')).toBeInTheDocument()
  })
})
