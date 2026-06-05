import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBrokerSummary } from './brokerApi'
import { resetApiClientForTests } from './client'
import { resetAppStoreForTests, setAuthToken } from '../store/appStore'
import { addBroker, resetBrokerStoreForTests } from '../store/brokerStore'
import { resetCacheForTests } from '../services/cacheService'

const validToken = 'header.payload.signature'
const brokerSummary = {
  totalExecutionReport: 1,
  totalTrade: 2,
  buyTrade: 3,
  sellTrade: 4,
  totalValue: 5,
  buyValue: 6,
  sellValue: 7,
}

function setupAuthenticatedBroker(brokerId = 'broker-1'): void {
  setAuthToken(validToken, new Date(Date.now() + 60_000).toISOString())
  addBroker({ key: 'SNM', brokerId })
}

describe('brokerApi', () => {
  beforeEach(() => {
    resetAppStoreForTests()
    resetBrokerStoreForTests()
    resetCacheForTests()
    resetApiClientForTests()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('validates date ranges before fetch runs', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    setupAuthenticatedBroker()

    await expect(getBrokerSummary({ fromDate: 'bad', toDate: '2026-01-31' })).rejects.toMatchObject({
      category: 'validation',
      code: 'VALIDATION_FAILED',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('requires an active broker before fetch runs', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    setAuthToken(validToken, new Date(Date.now() + 60_000).toISOString())

    await expect(getBrokerSummary({ fromDate: '2026-01-01', toDate: '2026-01-31' })).rejects.toMatchObject({
      category: 'client',
      code: 'BROKER_REQUIRED',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('calls broker summary endpoint with date query and protected headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(brokerSummary), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    setupAuthenticatedBroker('broker-1')

    await expect(getBrokerSummary({ fromDate: '2026-01-01', toDate: '2026-01-31' })).resolves.toEqual(
      brokerSummary,
    )

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://uat.xfltrade.com:20121/api/broker-summary/orders-execution?fromDate=2026-01-01&toDate=2026-01-31',
    )
    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect((request.headers as Headers).get('Authorization')).toBe(`Bearer ${validToken}`)
    expect((request.headers as Headers).get('X-BrokerId')).toBe('broker-1')
  })

  it('caches broker summary by broker and date range', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(brokerSummary), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    setupAuthenticatedBroker('broker-1')

    await getBrokerSummary({ fromDate: '2026-01-01', toDate: '2026-01-31' })
    await getBrokerSummary({ fromDate: '2026-01-01', toDate: '2026-01-31' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
