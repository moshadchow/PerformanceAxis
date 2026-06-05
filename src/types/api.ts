import type { DateRange } from './common'

export interface BrokerSummaryResponse {
  totalExecutionReport: number
  totalTrade: number
  buyTrade: number
  sellTrade: number
  totalValue: number
  buyValue: number
  sellValue: number
}

export interface MarketTradeInfoResponse {
  volume: number
  trade: number
  value: number
  gainer: number
  loser: number
  unchanged: number
}

export type ApiEndpointKey = 'broker-summary' | 'market-trade-info'

export interface ApiRequestKey extends Partial<DateRange> {
  endpoint: ApiEndpointKey
  brokerId?: string
}
