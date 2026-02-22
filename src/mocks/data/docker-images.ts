import type { DockerImage } from '@/types/docker.ts'
import { hmrCache } from './hmr-cache.ts'

export const mockDockerImages: DockerImage[] = hmrCache('__ams_dockerImages', () => [
  {
    id: 'img-1',
    serviceId: 'svc-3',
    name: 'stream-processor',
    tag: 'latest',
    digest: 'sha256:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    sizeBytes: 256_000_000,
    license: 'Apache-2.0',
    pullCommand: 'docker pull registry.ams.io/stream-processor:latest',
    pushedAt: '2025-04-01T00:00:00Z',
    pushedBy: 'user-merchant-2',
  },
  {
    id: 'img-2',
    serviceId: 'svc-3',
    name: 'stream-processor',
    tag: 'v1.2.0',
    digest: 'sha256:b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    sizeBytes: 245_000_000,
    license: 'Apache-2.0',
    pullCommand: 'docker pull registry.ams.io/stream-processor:v1.2.0',
    pushedAt: '2025-03-25T00:00:00Z',
    pushedBy: 'user-merchant-2',
  },
  {
    id: 'img-3',
    serviceId: 'svc-5',
    name: 'auth-middleware',
    tag: 'latest',
    digest: 'sha256:c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    sizeBytes: 128_000_000,
    license: 'MIT',
    pullCommand: 'docker pull registry.ams.io/auth-middleware:latest',
    pushedAt: '2025-04-01T00:00:00Z',
    pushedBy: 'user-dual-1',
  },
])
