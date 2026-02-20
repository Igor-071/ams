export interface ProjectMember {
  userId: string
  name: string
  email: string
  role: 'owner' | 'member'
  addedAt: string
}

export interface Project {
  id: string
  consumerId: string
  name: string
  description?: string
  members: ProjectMember[]
  serviceIds: string[]
  apiKeyIds: string[]
  createdAt: string
}
