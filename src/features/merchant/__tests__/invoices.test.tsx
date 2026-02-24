import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { MerchantInvoicesPage } from '../pages/merchant-invoices-page.tsx'
import { MerchantInvoiceDetailPage } from '../pages/merchant-invoice-detail-page.tsx'

function renderInvoicesPage() {
  const router = createMemoryRouter(
    [
      { path: '/merchant/invoices', element: <MerchantInvoicesPage /> },
      { path: '/merchant/invoices/:invoiceId', element: <MerchantInvoiceDetailPage /> },
    ],
    { initialEntries: ['/merchant/invoices'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderInvoiceDetail(invoiceId: string) {
  const router = createMemoryRouter(
    [{ path: '/merchant/invoices/:invoiceId', element: <MerchantInvoiceDetailPage /> }],
    { initialEntries: [`/merchant/invoices/${invoiceId}`] },
  )
  return render(<RouterProvider router={router} />)
}

const mockMerchant = {
  id: 'user-merchant-1',
  email: 'merchant@acme.com',
  name: 'James Merchant',
  roles: ['merchant'] as Role[],
  activeRole: 'merchant' as const,
  status: 'active' as const,
  createdAt: '2025-02-15T00:00:00Z',
}

describe('Merchant Invoicing', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockMerchant)
  })

  // AC-079: Invoices list table shows merchant invoices
  it('renders invoices table with merchant invoices', () => {
    renderInvoicesPage()
    expect(screen.getByRole('heading', { name: /Invoices/ })).toBeInTheDocument()
    // merchant-1 has inv-1 and inv-2 (both period 2025-04)
    expect(screen.getAllByText('2025-04').length).toBe(2)
    expect(screen.getByText('Alice Consumer')).toBeInTheDocument()
    expect(screen.getByText('Dave Developer')).toBeInTheDocument()
  })

  // AC-080: Invoice detail shows line items and totals
  it('renders invoice detail with line items', () => {
    renderInvoiceDetail('inv-1')
    expect(screen.getByRole('heading', { name: /Invoice — 2025-04/ })).toBeInTheDocument()
    // Line items
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
    // Totals
    expect(screen.getByText('$6.98')).toBeInTheDocument() // subtotal
    expect(screen.getByText('$6.28')).toBeInTheDocument() // total
  })

  // AC-081: Invoice detail shows AMS commission deduction
  it('shows commission rate and deduction amount', () => {
    renderInvoiceDetail('inv-1')
    expect(screen.getByText(/AMS Commission/)).toBeInTheDocument()
    expect(screen.getByText(/10%/)).toBeInTheDocument()
    expect(screen.getByText('-$0.70')).toBeInTheDocument()
  })

  // AC-DRF-01: Invoices page has date range filter
  it('renders date range filter with default "All Time" label', () => {
    renderInvoicesPage()
    const trigger = screen.getByRole('button', { name: /Filter by date range/ })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('All Time')
  })

  // AC-DRF-02: Date range filter opens with presets
  it('opens date range popover with preset buttons', async () => {
    const user = userEvent.setup()
    renderInvoicesPage()
    await user.click(screen.getByRole('button', { name: /Filter by date range/ }))
    expect(screen.getByText('3 Months')).toBeInTheDocument()
    expect(screen.getByText('6 Months')).toBeInTheDocument()
    expect(screen.getByText('This Year')).toBeInTheDocument()
  })

  // AC-EXP-03: Invoices export button
  it('renders Export CSV and Share buttons on invoices page', () => {
    renderInvoicesPage()
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Share report/i })).toBeInTheDocument()
  })
})
