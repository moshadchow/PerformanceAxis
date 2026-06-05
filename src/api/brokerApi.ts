import { getActiveBroker } from '../store/brokerStore'
import { createApiCacheKey } from '../services/cacheService'
import { createValidationApiError, validateDateRange } from '../services/validationService'
import type { BrokerSummaryRequest, BrokerSummaryResponse } from '../types/api'
import type { ApiError } from '../types/common'
import { apiRequest } from './client'

export async function getBrokerSummary(request: BrokerSummaryRequest): Promise<BrokerSummaryResponse> {
  const validation = validateDateRange(request)

  if (!validation.isValid) {
    throw createValidationApiError(validation)
  }

  const brokerId = getActiveBrokerIdForCacheKey()
  const cacheKey = createApiCacheKey({
    endpoint: 'broker-summary',
    brokerId,
    fromDate: request.fromDate,
    toDate: request.toDate,
  })

  return apiRequest<BrokerSummaryResponse>('/api/broker-summary/orders-execution', {
    query: { fromDate: request.fromDate, toDate: request.toDate },
    cacheKey,
    cancelPreviousGroupKey: createApiCacheKey({ endpoint: 'broker-summary', brokerId }),
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
