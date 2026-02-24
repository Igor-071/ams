import { useState } from 'react'
import {
  CheckCircle2Icon,
  XCircleIcon,
  MinusCircleIcon,
  PlayIcon,
  LoaderIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { simulateConsumption } from '@/mocks/handlers.ts'
import type { ConsumptionResponse, ValidationStep } from '@/types/consumption.ts'

const STEP_LABELS: Record<ValidationStep, string> = {
  api_key_validation: 'API Key Validation',
  ttl_check: 'TTL Check',
  service_authorization: 'Service Authorization',
  service_block_check: 'Service Block Check',
  merchant_config_check: 'Merchant Config',
  rate_limit_check: 'Rate Limit',
}

const ALL_STEPS: ValidationStep[] = [
  'api_key_validation',
  'ttl_check',
  'service_authorization',
  'service_block_check',
  'merchant_config_check',
  'rate_limit_check',
]

interface ConsumptionSimulatorProps {
  serviceId: string
}

export function ConsumptionSimulator({ serviceId }: ConsumptionSimulatorProps) {
  const [apiKey, setApiKey] = useState('')
  const [result, setResult] = useState<ConsumptionResponse | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSimulate() {
    if (!apiKey.trim()) return
    setLoading(true)
    // Simulate a small delay for realism
    setTimeout(() => {
      const response = simulateConsumption(apiKey, serviceId)
      setResult(response)
      setLoading(false)
    }, 500)
  }

  function getStepStatus(stepName: ValidationStep) {
    if (!result) return 'pending'
    const stepResult = result.validationResults.find((r) => r.step === stepName)
    if (!stepResult) return 'skipped'
    return stepResult.passed ? 'passed' : 'failed'
  }

  function getStepError(stepName: ValidationStep) {
    if (!result) return null
    const stepResult = result.validationResults.find((r) => r.step === stepName)
    if (!stepResult || stepResult.passed) return null
    return stepResult.errorCode
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg font-light">
          Try Consumption Endpoint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter API key value..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm"
            aria-label="API Key"
          />
          <Button
            onClick={handleSimulate}
            disabled={!apiKey.trim() || loading}
            className="shrink-0 rounded-full"
          >
            {loading ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            Simulate
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <div className="space-y-1">
              {ALL_STEPS.map((step) => {
                const status = getStepStatus(step)
                const errorCode = getStepError(step)
                return (
                  <div
                    key={step}
                    className="flex items-center justify-between rounded-lg border border-white/[0.12] px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {status === 'passed' && (
                        <CheckCircle2Icon className="h-4 w-4 text-green-400" />
                      )}
                      {status === 'failed' && (
                        <XCircleIcon className="h-4 w-4 text-red-400" />
                      )}
                      {status === 'skipped' && (
                        <MinusCircleIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={`text-sm ${status === 'skipped' ? 'text-muted-foreground' : 'text-foreground'}`}
                      >
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                    {errorCode && (
                      <span className="text-xs font-medium text-red-400">
                        {errorCode}
                      </span>
                    )}
                    {status === 'passed' && (
                      <span className="text-xs text-green-400">OK</span>
                    )}
                    {status === 'skipped' && (
                      <span className="text-xs text-muted-foreground">Skipped</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="rounded-lg border border-white/[0.12] p-3">
              {result.success ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-400">
                    200 — Success
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {result.responseTimeMs}ms
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-red-400">
                  {result.statusCode} — {result.errorMessage}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
