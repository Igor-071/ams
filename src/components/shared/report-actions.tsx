import type { ReactNode } from 'react'
import { ExportButton } from './export-button.tsx'
import { ShareReportButton } from './share-report-button.tsx'

interface ReportActionsProps {
  onExport: () => void
  generateSummary: () => string
  exportDisabled?: boolean
  children?: ReactNode
}

export function ReportActions({ onExport, generateSummary, exportDisabled }: ReportActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ExportButton onClick={onExport} disabled={exportDisabled} />
      <ShareReportButton generateSummary={generateSummary} />
    </div>
  )
}
