import { useState } from 'react'
import { Share2Icon, CheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

interface ShareReportButtonProps {
  generateSummary: () => string
}

export function ShareReportButton({ generateSummary }: ShareReportButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    const summary = generateSummary()
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      className="rounded-full border-white/20 bg-white/[0.06] font-heading font-light"
      onClick={handleClick}
      aria-label={copied ? 'Copied' : 'Share report'}
    >
      {copied ? (
        <CheckIcon className="mr-2 h-4 w-4 text-emerald-400" />
      ) : (
        <Share2Icon className="mr-2 h-4 w-4" />
      )}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  )
}
