import { describe, it, expect } from 'vitest'
import {
  createApiKey,
  revokeApiKey,
  getDockerImagesByService,
  getDockerImagesForConsumer,
  getProjectsByConsumer,
  getProjectById,
  createProject,
} from '@/mocks/handlers.ts'

describe('Consumer Mock Handlers', () => {
  it('createApiKey creates a key with correct fields', () => {
    const key = createApiKey({
      consumerId: 'user-test',
      name: 'Test Key',
      description: 'A test key',
      serviceIds: ['svc-1'],
      ttlDays: 30,
    })
    expect(key.id).toBeDefined()
    expect(key.name).toBe('Test Key')
    expect(key.description).toBe('A test key')
    expect(key.status).toBe('active')
    expect(key.serviceIds).toEqual(['svc-1'])
    expect(key.ttlDays).toBe(30)
    expect(key.keyPrefix).toBe('ams_live')
  })

  it('revokeApiKey changes status to revoked', () => {
    const key = createApiKey({
      consumerId: 'user-test-revoke',
      name: 'Key To Revoke',
      serviceIds: [],
      ttlDays: 90,
    })
    const revoked = revokeApiKey(key.id)
    expect(revoked).toBeDefined()
    expect(revoked!.status).toBe('revoked')
    expect(revoked!.revokedAt).toBeDefined()
    expect(revoked!.revokedBy).toBe('consumer')
  })

  it('revokeApiKey returns undefined for non-active key', () => {
    const result = revokeApiKey('key-3') // expired key
    expect(result).toBeUndefined()
  })

  it('getDockerImagesByService returns images for a service', () => {
    const images = getDockerImagesByService('svc-3')
    expect(images.length).toBeGreaterThanOrEqual(2)
    expect(images[0].serviceId).toBe('svc-3')
  })

  it('getDockerImagesForConsumer returns empty for non-Docker subscriber', () => {
    const images = getDockerImagesForConsumer('user-consumer-1')
    // consumer-1 has approved access to svc-1 (api) and svc-2 (api), not Docker
    expect(images.length).toBe(0)
  })

  it('getProjectsByConsumer returns projects for a consumer', () => {
    const projects = getProjectsByConsumer('user-consumer-1')
    expect(projects.length).toBeGreaterThanOrEqual(2)
  })

  it('getProjectById returns correct project', () => {
    const project = getProjectById('proj-1')
    expect(project).toBeDefined()
    expect(project!.name).toBe('Weather Dashboard')
  })

  it('createProject creates a project with owner as first member', () => {
    const project = createProject({
      consumerId: 'user-test-proj',
      consumerName: 'Test User',
      consumerEmail: 'test@example.com',
      name: 'Test Project',
      description: 'A test project',
    })
    expect(project.id).toBeDefined()
    expect(project.name).toBe('Test Project')
    expect(project.members.length).toBe(1)
    expect(project.members[0].role).toBe('owner')
    expect(project.members[0].name).toBe('Test User')
  })
})
