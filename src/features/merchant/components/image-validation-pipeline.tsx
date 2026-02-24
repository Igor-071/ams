import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from 'lucide-react'
import type { ImageValidationStep } from '@/types/docker.ts'

interface ImageValidationPipelineProps {
  steps: ImageValidationStep[]
}

export function ImageValidationPipeline({ steps }: ImageValidationPipelineProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Validation Pipeline</p>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.step} className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.12] px-3 py-2">
              {step.passed ? (
                <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircleIcon className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm text-foreground">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
      {steps.some((s) => !s.passed) && (
        <div className="mt-1 space-y-1">
          {steps
            .filter((s) => !s.passed && s.message)
            .map((s) => (
              <p key={s.step} className="text-xs text-red-400">
                {s.label}: {s.message}
              </p>
            ))}
        </div>
      )}
    </div>
  )
}
