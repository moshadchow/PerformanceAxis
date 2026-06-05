import type { DateString } from './common'

export type ComparisonMetricKey = 'volume' | 'trade'

export interface ComparisonRow {
  date: DateString
  dseVolume: number
  xflVolume: number
  volumePercentage: number
  dseTrade: number
  xflTrade: number
}
