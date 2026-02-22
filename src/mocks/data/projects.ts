import type { Project } from '@/types/project.ts'
import { hmrCache } from './hmr-cache.ts'

export const mockProjects: Project[] = hmrCache('__ams_projects', () => [
  {
    id: 'proj-1',
    consumerId: 'user-consumer-1',
    name: 'Weather Dashboard',
    description: 'Internal weather monitoring dashboard using Weather and Geocoding APIs',
    members: [
      {
        userId: 'user-consumer-1',
        name: 'Alice Consumer',
        email: 'alice@example.com',
        role: 'owner',
        addedAt: '2025-04-07T00:00:00Z',
      },
      {
        userId: 'member-1',
        name: 'Bob Engineer',
        email: 'bob@example.com',
        role: 'member',
        addedAt: '2025-04-08T00:00:00Z',
      },
    ],
    serviceIds: ['svc-1', 'svc-2'],
    apiKeyIds: ['key-1'],
    createdAt: '2025-04-07T00:00:00Z',
  },
  {
    id: 'proj-2',
    consumerId: 'user-consumer-1',
    name: 'Data Pipeline',
    description: 'Stream processing pipeline for real-time analytics',
    members: [
      {
        userId: 'user-consumer-1',
        name: 'Alice Consumer',
        email: 'alice@example.com',
        role: 'owner',
        addedAt: '2025-04-10T00:00:00Z',
      },
    ],
    serviceIds: ['svc-1'],
    apiKeyIds: ['key-2'],
    createdAt: '2025-04-10T00:00:00Z',
  },
])
