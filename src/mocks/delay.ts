import { MOCK_DELAY_MIN, MOCK_DELAY_MAX } from '@/lib/constants.ts'

export function mockDelay(
  min = MOCK_DELAY_MIN,
  max = MOCK_DELAY_MAX,
): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise((resolve) => setTimeout(resolve, ms))
}
