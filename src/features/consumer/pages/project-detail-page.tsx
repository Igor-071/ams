import { useMemo } from 'react'
import { useParams } from 'react-router'
import { UsersIcon, BoxIcon, KeyIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { getProjectById, getServiceById, getApiKeyById } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const project = useMemo(() => getProjectById(projectId ?? ''), [projectId])

  if (!project) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Project Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
            { label: 'Projects', href: ROUTES.CONSUMER_PROJECTS },
            { label: 'Not Found' },
          ]}
        />
        <p className="text-muted-foreground">This project does not exist.</p>
      </div>
    )
  }

  const services = project.serviceIds
    .map((id) => getServiceById(id))
    .filter((s): s is NonNullable<typeof s> => s != null)

  const apiKeys = project.apiKeyIds
    .map((id) => getApiKeyById(id))
    .filter((k): k is NonNullable<typeof k> => k != null)

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'Projects', href: ROUTES.CONSUMER_PROJECTS },
          { label: project.name },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg font-light">
              <UsersIcon className="h-4 w-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between rounded-lg border border-white/[0.12] p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary text-xs"
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg font-light">
                <BoxIcon className="h-4 w-4" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services assigned</p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-lg border border-white/[0.12] p-3"
                    >
                      <p className="text-sm text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.type.toUpperCase()} &middot; {service.category}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg font-light">
                <KeyIcon className="h-4 w-4" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">No API keys assigned</p>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="rounded-lg border border-white/[0.12] p-3"
                    >
                      <p className="text-sm text-foreground">{key.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {key.keyPrefix}... &middot; {key.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
