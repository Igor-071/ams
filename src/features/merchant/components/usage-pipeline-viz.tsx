import {
  BarChart3Icon,
  DollarSignIcon,
  LayoutDashboardIcon,
  BellIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'

const PIPELINE_STEPS = [
  { label: 'Aggregate Usage', icon: BarChart3Icon },
  { label: 'Update Billing', icon: DollarSignIcon },
  { label: 'Feed Dashboards', icon: LayoutDashboardIcon },
  { label: 'Trigger Alerts', icon: BellIcon },
]

export function UsagePipelineViz() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg font-light">
          Usage Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Async processing steps after each successful consumption request
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {PIPELINE_STEPS.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.12] px-3 py-2">
                <step.icon className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">{step.label}</span>
              </div>
              {index < PIPELINE_STEPS.length - 1 && (
                <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
