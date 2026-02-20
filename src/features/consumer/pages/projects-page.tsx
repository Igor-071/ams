import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { FolderKanbanIcon, PlusIcon, UsersIcon, BoxIcon, KeyIcon } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { EmptyState } from '@/components/shared/empty-state.tsx'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { useAuthStore } from '@/stores/auth-store.ts'
import { getProjectsByConsumer, createProject } from '@/mocks/handlers.ts'
import { ROUTES } from '@/lib/constants.ts'

export function ProjectsPage() {
  const { currentUser } = useAuthStore()
  const consumerId = currentUser?.id ?? ''

  const [dialogOpen, setDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const projects = useMemo(
    () => getProjectsByConsumer(consumerId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [consumerId, refreshKey],
  )

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim() || !currentUser) return

    createProject({
      consumerId,
      consumerName: currentUser.name,
      consumerEmail: currentUser.email,
      name: projectName.trim(),
      description: projectDescription.trim() || undefined,
    })
    setProjectName('')
    setProjectDescription('')
    setDialogOpen(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Organize your services and API keys into projects"
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.CONSUMER_DASHBOARD },
          { label: 'Projects' },
        ]}
        actions={
          <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanbanIcon className="h-12 w-12" />}
          title="No projects yet"
          description="Create a project to organize your services and team members."
          action={
            <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
              New Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={ROUTES.CONSUMER_PROJECT_DETAIL(project.id)}
            >
              <Card className="h-full transition-all hover:border-primary/30 hover:shadow-[0_0_20px_rgba(0,102,255,0.08)]">
                <CardContent className="p-4">
                  <h3 className="font-heading text-lg font-light text-foreground">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3 w-3" />
                      {project.members.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <BoxIcon className="h-3 w-3" />
                      {project.serviceIds.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <KeyIcon className="h-3 w-3" />
                      {project.apiKeyIds.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g. Weather Dashboard"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description</Label>
              <Input
                id="project-desc"
                placeholder="Optional description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
