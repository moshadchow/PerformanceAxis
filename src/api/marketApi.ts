import { getActiveBroker } from '../store/brokerStore'
import { createApiCacheKey } from '../services/cacheService'
import type { MarketTradeInfoRequest, MarketTradeInfoResponse } from '../types/api'
import type { ApiError } from '../types/common'
import { apiRequest } from './client'

export async function getMarketTradeInfo(request: MarketTradeInfoRequest): Promise<MarketTradeInfoResponse> {
  const stockExchange = request.stockExchange.trim()
  const brokerId = getActiveBrokerIdForCacheKey()
  const cacheKey = createApiCacheKey({
    endpoint: 'market-trade-info',
    brokerId,
    stockExchange,
  })

  return apiRequest<MarketTradeInfoResponse>(`/api/indexes/${encodeURIComponent(stockExchange)}/market-trade-info`, {
    cacheKey,
    cancelPreviousGroupKey: createApiCacheKey({ endpoint: 'market-trade-info', brokerId, stockExchange }),
  })
}

function getActiveBrokerIdForCacheKey(): string {
  const activeBroker = getActiveBroker()

  if (activeBroker === null) {
    throw createBrokerRequiredError()
  }

  return activeBroker.brokerId
}

function createBrokerRequiredError(): ApiError {
  return {
    message: 'Active broker is required.',
    category: 'client',
    code: 'BROKER_REQUIRED',
  }
}
