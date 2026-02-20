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
}

export interface DockerRegistry {
  serviceId: string
  registryUrl: string
  repository: string
  credentials?: {
    username: string
    token: string
  }
}
