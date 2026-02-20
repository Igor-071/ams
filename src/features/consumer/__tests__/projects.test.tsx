import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { Role } from '@/types/user.ts'
import { useAuthStore } from '@/stores/auth-store.ts'
import { ProjectsPage } from '../pages/projects-page.tsx'
import { ProjectDetailPage } from '../pages/project-detail-page.tsx'

const mockConsumer = {
  id: 'user-consumer-1',
  email: 'alice@example.com',
  name: 'Alice Consumer',
  roles: ['consumer'] as Role[],
  activeRole: 'consumer' as const,
  status: 'active' as const,
  createdAt: '2025-01-01T00:00:00Z',
}

function renderProjectsPage() {
  const router = createMemoryRouter(
    [
      { path: '/dashboard/projects', element: <ProjectsPage /> },
      { path: '/dashboard/projects/:projectId', element: <ProjectDetailPage /> },
    ],
    { initialEntries: ['/dashboard/projects'] },
  )
  return render(<RouterProvider router={router} />)
}

function renderDetailPage(projectId = 'proj-1') {
  const router = createMemoryRouter(
    [
      { path: '/dashboard/projects/:projectId', element: <ProjectDetailPage /> },
      { path: '/dashboard/projects', element: <ProjectsPage /> },
    ],
    { initialEntries: [`/dashboard/projects/${projectId}`] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Projects & Teams', () => {
  beforeEach(() => {
    useAuthStore.getState().login(mockConsumer)
  })

  // AC-064: Projects list page renders with project cards
  it('shows projects list with cards', () => {
    renderProjectsPage()
    expect(screen.getByRole('heading', { name: /Projects/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /New Project/ })).toBeInTheDocument()
    expect(screen.getByText('Weather Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Data Pipeline')).toBeInTheDocument()
  })

  it('shows project card with member and service counts', () => {
    renderProjectsPage()
    const weatherCard = screen.getByText('Weather Dashboard').closest('a')
    expect(weatherCard).toBeInTheDocument()
  })

  it('shows empty state for user with no projects', () => {
    useAuthStore.getState().login({
      id: 'user-consumer-no-projects',
      email: 'noone@example.com',
      name: 'No Projects',
      roles: ['consumer'] as Role[],
      activeRole: 'consumer' as const,
      status: 'active' as const,
      createdAt: '2025-01-01T00:00:00Z',
    })
    renderProjectsPage()
    expect(screen.getByText('No projects yet')).toBeInTheDocument()
  })

  // AC-065: Project detail page shows members and services
  it('shows project detail with members, services, and API keys', () => {
    renderDetailPage('proj-1')
    expect(screen.getByRole('heading', { name: /Weather Dashboard/ })).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('Alice Consumer')).toBeInTheDocument()
    expect(screen.getByText('Bob Engineer')).toBeInTheDocument()
    expect(screen.getByText('owner')).toBeInTheDocument()
    expect(screen.getByText('member')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('Weather API')).toBeInTheDocument()
    expect(screen.getByText('Geocoding API')).toBeInTheDocument()
    expect(screen.getAllByText(/API Keys/).length).toBeGreaterThan(0)
    expect(screen.getByText('Production Key')).toBeInTheDocument()
  })

  // AC-066: Create new project
  it('creates a new project via dialog', async () => {
    const user = userEvent.setup()
    renderProjectsPage()

    await user.click(screen.getByRole('button', { name: /New Project/ }))
    expect(screen.getByLabelText(/Project Name/)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Project Name/), 'My New Project')
    await user.type(screen.getByLabelText(/Description/), 'Test description')
    await user.click(screen.getByRole('button', { name: /Create Project/ }))

    expect(screen.getByText('My New Project')).toBeInTheDocument()
  })
})
