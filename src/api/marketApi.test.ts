import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMarketTradeInfo } from './marketApi'
import { resetApiClientForTests } from './client'
import { resetAppStoreForTests, setAuthToken } from '../store/appStore'
import { addBroker, resetBrokerStoreForTests } from '../store/brokerStore'
import { resetCacheForTests } from '../services/cacheService'

const validToken = 'header.payload.signature'
const marketTradeInfo = {
  volume: 1,
  trade: 2,
  value: 3,
  gainer: 4,
  loser: 5,
  unchanged: 6,
}

function setupAuthenticatedBroker(brokerId = 'broker-1'): void {
  setAuthToken(validToken, new Date(Date.now() + 60_000).toISOString())
  addBroker({ key: 'SNM', brokerId })
}

describe('marketApi', () => {
  beforeEach(() => {
    resetAppStoreForTests()
    resetBrokerStoreForTests()
    resetCacheForTests()
    resetApiClientForTests()
    vi.restoreAllMocks()
  })

  it('requires an active broker before fetch runs', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    setAuthToken(validToken, new Date(Date.now() + 60_000).toISOString())

    await expect(getMarketTradeInfo({ stockExchange: 'DSE' })).rejects.toMatchObject({
      category: 'client',
      code: 'BROKER_REQUIRED',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('calls market trade info endpoint with encoded stock exchange and protected headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(marketTradeInfo), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    setupAuthenticatedBroker('broker-1')

    await expect(getMarketTradeInfo({ stockExchange: 'DSE Main' })).resolves.toEqual(marketTradeInfo)

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://uat.xfltrade.com:20121/api/indexes/DSE%20Main/market-trade-info',
    )
    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect((request.headers as Headers).get('Authorization')).toBe(`Bearer ${validToken}`)
    expect((request.headers as Headers).get('X-BrokerId')).toBe('broker-1')
  })

  it('caches market trade info by broker and stock exchange', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(marketTradeInfo), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    setupAuthenticatedBroker('broker-1')

    await getMarketTradeInfo({ stockExchange: 'DSE' })
    await getMarketTradeInfo({ stockExchange: 'DSE' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
