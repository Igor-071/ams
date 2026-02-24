import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { PublicLayout } from '@/components/layout/public-layout.tsx'
import { CatalogPage } from '../pages/catalog-page.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'

vi.mock('@/mocks/delay.ts', () => ({
  mockDelay: () => Promise.resolve(),
}))

// Override debounce to be instant in tests
vi.mock('@/hooks/use-debounce.ts', () => ({
  useDebounce: <T,>(value: T) => value,
}))

function renderCatalog() {
  const router = createMemoryRouter(
    [
      {
        element: <PublicLayout />,
        children: [
          { path: 'marketplace', element: <CatalogPage /> },
          { path: 'marketplace/:serviceId', element: <div>Service Detail</div> },
        ],
      },
    ],
    { initialEntries: ['/marketplace'] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Marketplace Catalog', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  // AC-028: Page renders without authentication
  it('renders heading, search input, type filter, and service cards', () => {
    renderCatalog()

    expect(screen.getByRole('heading', { name: /marketplace/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by type')).toBeInTheDocument()
    // Active public services should be rendered (svc-1, svc-2, svc-3 = 3 public active; svc-4 is private)
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
    expect(screen.getByText('Stream Processor')).toBeInTheDocument()
    // svc-4 Sentiment Analysis API is private, not shown in catalog
    expect(screen.queryByText('Sentiment Analysis API')).not.toBeInTheDocument()
  })

  // AC-029: Service cards show key information
  it('displays service name, merchant, type badge, category, and pricing', () => {
    renderCatalog()

    // Weather API card
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getAllByText('ACME APIs').length).toBeGreaterThan(0)
    expect(screen.getByText('$0.001/req')).toBeInTheDocument()
    // Type badges
    const apiBadges = screen.getAllByText('API')
    expect(apiBadges.length).toBeGreaterThan(0)
  })

  // AC-030: Only active services displayed
  it('does not show draft, pending, suspended, or rejected services', () => {
    renderCatalog()

    // svc-5 is pending_approval, svc-6 is draft, svc-7 is suspended
    expect(screen.queryByText('Auth Middleware')).not.toBeInTheDocument()
    expect(screen.queryByText('Image Recognition API')).not.toBeInTheDocument()
    expect(screen.queryByText('Legacy Data API')).not.toBeInTheDocument()
  })

  // AC-031: Search filters in real-time (debounce mocked to be instant)
  it('filters services by search query', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await user.type(screen.getByPlaceholderText('Search services...'), 'weather')

    await waitFor(() => {
      expect(screen.getByText('Weather API')).toBeInTheDocument()
      expect(screen.queryByText('Geocoding API')).not.toBeInTheDocument()
      expect(screen.queryByText('Stream Processor')).not.toBeInTheDocument()
    })
  })

  // AC-031: Search matches on merchant name
  it('filters services by merchant name', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await user.type(screen.getByPlaceholderText('Search services...'), 'DataFlow')

    await waitFor(() => {
      expect(screen.getByText('Stream Processor')).toBeInTheDocument()
      // Sentiment Analysis API is private, not shown in catalog even when searching
      expect(screen.queryByText('Sentiment Analysis API')).not.toBeInTheDocument()
      expect(screen.queryByText('Weather API')).not.toBeInTheDocument()
    })
  })

  // AC-032: Type filter
  it('filters services by type when selecting API', async () => {
    const user = userEvent.setup()
    renderCatalog()

    const filterGroup = screen.getByRole('group', { name: 'Filter by type' })
    const apiButton = filterGroup.querySelector('button:nth-child(2)')!
    await user.click(apiButton)

    await waitFor(() => {
      expect(screen.getByText('Weather API')).toBeInTheDocument()
      expect(screen.queryByText('Stream Processor')).not.toBeInTheDocument()
    })
  })

  it('filters services by type when selecting Docker', async () => {
    const user = userEvent.setup()
    renderCatalog()

    const filterGroup = screen.getByRole('group', { name: 'Filter by type' })
    const dockerButton = filterGroup.querySelector('button:nth-child(3)')!
    await user.click(dockerButton)

    await waitFor(() => {
      expect(screen.getByText('Stream Processor')).toBeInTheDocument()
      expect(screen.queryByText('Weather API')).not.toBeInTheDocument()
    })
  })

  // AC-034: Empty state
  it('shows empty state when no services match', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await user.type(screen.getByPlaceholderText('Search services...'), 'xyznonexistent')

    await waitFor(() => {
      expect(screen.getByText('No services found')).toBeInTheDocument()
    })
  })

  // AC-034: Clear filters
  it('clears filters when clicking clear filters button', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await user.type(screen.getByPlaceholderText('Search services...'), 'xyznonexistent')

    await waitFor(() => {
      expect(screen.getByText('No services found')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /clear filters/i }))

    await waitFor(() => {
      expect(screen.getByText('Weather API')).toBeInTheDocument()
    })
  })

  // AC-035: Card click navigates to detail
  it('navigates to service detail when clicking a card', async () => {
    const user = userEvent.setup()
    renderCatalog()

    await user.click(screen.getByTestId('service-card-svc-1'))

    await waitFor(() => {
      expect(screen.getByText('Service Detail')).toBeInTheDocument()
    })
  })

  // Card enrichments: consumer count, free tier
  it('shows consumer count on service cards', () => {
    renderCatalog()

    // svc-1 Weather API has 2 approved consumers (ar-1 and ar-4)
    expect(screen.getByText('2 consumers')).toBeInTheDocument()
  })

  it('shows free tier indicator when pricing has free tier', () => {
    renderCatalog()

    // svc-1 has freeTier: 1000, svc-2 has freeTier: 500
    const freeTierLabels = screen.getAllByText('Free tier')
    expect(freeTierLabels.length).toBeGreaterThanOrEqual(2)
  })
})
