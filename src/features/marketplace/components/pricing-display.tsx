import type { PricingModel } from '@/types/service.ts'
import { formatNumber } from '@/lib/format.ts'

interface PricingDisplayProps {
  pricing: PricingModel
}

export function PricingDisplay({ pricing }: PricingDisplayProps) {
  switch (pricing.type) {
    case 'free':
      return (
        <div>
          <p className="text-lg font-medium text-emerald-400">Free</p>
        </div>
      )
    case 'per_request':
      return (
        <div className="space-y-1">
          <p className="text-lg font-medium text-foreground">
            ${pricing.pricePerRequest}/{' '}
            <span className="text-sm text-muted-foreground">request</span>
          </p>
          {pricing.freeTier && (
            <p className="text-xs text-muted-foreground">
              First {formatNumber(pricing.freeTier)} requests free
            </p>
          )}
        </div>
      )
    case 'tiered':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Tiered pricing</p>
          <div className="space-y-1">
            {pricing.tiers?.map((tier, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Up to {formatNumber(tier.upTo)} req
                </span>
                <span className="text-foreground">${tier.pricePerRequest}/req</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'flat':
      return (
        <div>
          <p className="text-lg font-medium text-foreground">Flat rate</p>
          <p className="text-xs text-muted-foreground">Contact for pricing</p>
        </div>
      )
    default:
      return null
  }
}
