import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx'

const validationSteps = [
  { step: 1, name: 'API Key Validation', errorCode: '401', description: 'Missing or invalid API key' },
  { step: 2, name: 'TTL Check', errorCode: '403', description: 'Key expired or revoked' },
  { step: 3, name: 'Service Authorization', errorCode: '403', description: 'Key not authorized for service' },
  { step: 4, name: 'Merchant Config', errorCode: '502', description: 'Merchant service misconfigured' },
  { step: 5, name: 'Rate Limit', errorCode: '429', description: 'Rate limit exceeded' },
]

const errorCodes = [
  { code: '200', status: 'Success', description: 'Request forwarded to upstream and response returned' },
  { code: '401', status: 'Unauthorized', description: 'Missing or invalid API key' },
  { code: '403', status: 'Forbidden', description: 'Expired, revoked, or unauthorized key' },
  { code: '429', status: 'Too Many Requests', description: 'Rate limit exceeded' },
  { code: '502', status: 'Bad Gateway', description: 'Merchant service misconfigured' },
]

export function ConsumptionEndpointDocs() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Consumption Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Endpoint</p>
            <code className="text-sm text-foreground">POST /api/consume</code>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Required Headers</p>
            <code className="text-sm text-foreground">X-API-Key: &lt;api_key&gt;</code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Validation Chain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationSteps.map((step, index) => (
              <div
                key={step.step}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] p-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {step.step}
                </div>
                {index > 0 && (
                  <div className="absolute -mt-10 ml-3 h-2 w-px bg-white/[0.06]" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{step.name}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-red-500/15 text-red-400 text-xs"
                >
                  {step.errorCode}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg font-light">
            Error Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-white/[0.06]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorCodes.map((err) => (
                  <TableRow key={err.code}>
                    <TableCell>
                      <code className="text-sm">{err.code}</code>
                    </TableCell>
                    <TableCell className="font-medium">{err.status}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {err.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
