export interface ConsumptionRequest {
  apiKey: string
  serviceId: string
  method: string
  path: string
  headers?: Record<string, string>
  body?: string
}

export type ValidationStep =
  | 'api_key_validation'
  | 'ttl_check'
  | 'service_authorization'
  | 'merchant_config_check'
  | 'rate_limit_check'

export interface ValidationResult {
  step: ValidationStep
  passed: boolean
  errorCode?: number
  errorMessage?: string
}

export interface ConsumptionResponse {
  success: boolean
  statusCode: number
  validationResults: ValidationResult[]
  responseTimeMs?: number
  errorMessage?: string
}
