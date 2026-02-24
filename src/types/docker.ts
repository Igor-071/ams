export type DockerImageStatus = 'active' | 'deprecated' | 'disabled'

export type LicensingModel = 'online' | 'offline-ttl'

export type LicenseStatus = 'valid' | 'expired' | 'revoked'

export type UsageModel = 'execution' | 'pull' | 'time-based'

export interface ImageValidationStep {
  step: string
  label: string
  passed: boolean
  message?: string
}

export interface DockerImage {
  id: string
  serviceId: string
  name: string
  tag: string
  digest: string
  sizeBytes: number
  license: string
  pullCommand: string
  pushedAt: string
  pushedBy: string
  status: DockerImageStatus
  licensingModel: LicensingModel
  licenseStatus: LicenseStatus
  ttlExpiresAt?: string
  version: string
  usageModel: UsageModel
  pullCount: number
  executionCount: number
  validationSteps: ImageValidationStep[]
}

export interface DockerRegistry {
  serviceId: string
  registryUrl: string
  repository: string
  credentials?: {
    username: string
    token: string
  }
  scopedToken?: string
  tokenExpiresAt?: string
}
