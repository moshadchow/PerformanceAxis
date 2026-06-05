import type { DateString } from './common'

export type ChartSeriesKey = 'dseVolume' | 'xflVolume' | 'dseTrade' | 'xflTrade'

export interface ChartDataPoint {
  date: DateString
  dseVolume: number | null
  xflVolume: number | null
  dseTrade: number | null
  xflTrade: number | null
}
