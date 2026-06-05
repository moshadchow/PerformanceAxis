import { beforeEach, describe, expect, it } from 'vitest'
import {
  activateBroker,
  addBroker,
  deleteBroker,
  getActiveBroker,
  getAllBrokers,
  resetBrokerStoreForTests,
  updateBroker,
} from './brokerStore'

const alphaBroker = { key: 'ALPHA', brokerId: 'broker-alpha-id' }
const betaBroker = { key: 'BETA', brokerId: 'broker-beta-id' }
const gammaBroker = { key: 'GAMMA', brokerId: 'broker-gamma-id' }

describe('brokerStore', () => {
  beforeEach(() => {
    resetBrokerStoreForTests()
  })

  it('starts with empty broker state', () => {
    expect(getAllBrokers()).toEqual([])
    expect(getActiveBroker()).toBeNull()
  })

  it('adds the first broker as active', () => {
    const result = addBroker(alphaBroker)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ ...alphaBroker, isActive: true })
    expect(getAllBrokers()).toEqual([{ ...alphaBroker, isActive: true }])
    expect(getActiveBroker()).toEqual({ ...alphaBroker, isActive: true })
  })

  it('adds later brokers as inactive by default', () => {
    addBroker(alphaBroker)
    const result = addBroker(betaBroker)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ ...betaBroker, isActive: false })
    expect(getActiveBroker()).toEqual({ ...alphaBroker, isActive: true })
  })

  it('adds a later broker as active when requested', () => {
    addBroker(alphaBroker)
    const result = addBroker(betaBroker, { activate: true })

    expect(result.success).toBe(true)
    expect(getAllBrokers()).toEqual([
      { ...alphaBroker, isActive: false },
      { ...betaBroker, isActive: true },
    ])
    expect(getActiveBroker()).toEqual({ ...betaBroker, isActive: true })
  })

  it('trims broker input before storing', () => {
    addBroker({ key: ' ALPHA ', brokerId: ' broker-alpha-id ' })

    expect(getAllBrokers()).toEqual([{ ...alphaBroker, isActive: true }])
  })

  it('rejects missing broker key and broker ID', () => {
    const result = addBroker({ key: ' ', brokerId: '' })

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([
      expect.objectContaining({ code: 'BROKER_KEY_REQUIRED' }),
      expect.objectContaining({ code: 'BROKER_ID_REQUIRED' }),
    ])
    expect(getAllBrokers()).toEqual([])
  })

  it('rejects duplicate broker keys case-insensitively', () => {
    addBroker(alphaBroker)
    const result = addBroker({ key: 'alpha', brokerId: 'broker-beta-id' })

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([expect.objectContaining({ code: 'BROKER_KEY_DUPLICATE' })])
    expect(getAllBrokers()).toEqual([{ ...alphaBroker, isActive: true }])
  })

  it('rejects duplicate broker IDs', () => {
    addBroker(alphaBroker)
    const result = addBroker({ key: 'BETA', brokerId: 'broker-alpha-id' })

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([expect.objectContaining({ code: 'BROKER_ID_DUPLICATE' })])
    expect(getAllBrokers()).toEqual([{ ...alphaBroker, isActive: true }])
  })

  it('updates broker key and ID while preserving active status', () => {
    addBroker(alphaBroker)
    const result = updateBroker('broker-alpha-id', {
      key: ' ALPHA-UPDATED ',
      brokerId: ' broker-alpha-updated-id ',
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      key: 'ALPHA-UPDATED',
      brokerId: 'broker-alpha-updated-id',
      isActive: true,
    })
    expect(getActiveBroker()).toEqual({
      key: 'ALPHA-UPDATED',
      brokerId: 'broker-alpha-updated-id',
      isActive: true,
    })
  })

  it('rejects updating a missing broker', () => {
    addBroker(alphaBroker)
    const result = updateBroker('missing-broker-id', { key: 'BETA' })

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([expect.objectContaining({ code: 'BROKER_NOT_FOUND' })])
    expect(getAllBrokers()).toEqual([{ ...alphaBroker, isActive: true }])
  })

  it('rejects update conflicts without mutating state', () => {
    addBroker(alphaBroker)
    addBroker(betaBroker)
    const result = updateBroker('broker-beta-id', {
      key: 'alpha',
      brokerId: 'broker-alpha-id',
    })

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([
      expect.objectContaining({ code: 'BROKER_KEY_DUPLICATE' }),
      expect.objectContaining({ code: 'BROKER_ID_DUPLICATE' }),
    ])
    expect(getAllBrokers()).toEqual([
      { ...alphaBroker, isActive: true },
      { ...betaBroker, isActive: false },
    ])
  })

  it('activates an existing broker and deactivates others', () => {
    addBroker(alphaBroker)
    addBroker(betaBroker)
    const result = activateBroker('broker-beta-id')

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ ...betaBroker, isActive: true })
    expect(getAllBrokers()).toEqual([
      { ...alphaBroker, isActive: false },
      { ...betaBroker, isActive: true },
    ])
  })

  it('rejects activating a missing broker without mutating state', () => {
    addBroker(alphaBroker)
    const result = activateBroker('missing-broker-id')

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([expect.objectContaining({ code: 'BROKER_NOT_FOUND' })])
    expect(getActiveBroker()).toEqual({ ...alphaBroker, isActive: true })
  })

  it('deletes an inactive broker without changing the active broker', () => {
    addBroker(alphaBroker)
    addBroker(betaBroker)
    const result = deleteBroker('broker-beta-id')

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      deletedBroker: { ...betaBroker, isActive: false },
      activeBroker: { ...alphaBroker, isActive: true },
      brokers: [{ ...alphaBroker, isActive: true }],
    })
    expect(getActiveBroker()).toEqual({ ...alphaBroker, isActive: true })
  })

  it('deletes the active broker and activates the first remaining broker', () => {
    addBroker(alphaBroker)
    addBroker(betaBroker)
    addBroker(gammaBroker)
    const result = deleteBroker('broker-alpha-id')

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      deletedBroker: { ...alphaBroker, isActive: true },
      activeBroker: { ...betaBroker, isActive: true },
      brokers: [
        { ...betaBroker, isActive: true },
        { ...gammaBroker, isActive: false },
      ],
    })
  })

  it('deletes the final active broker and clears active broker state', () => {
    addBroker(alphaBroker)
    const result = deleteBroker('broker-alpha-id')

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      deletedBroker: { ...alphaBroker, isActive: true },
      activeBroker: null,
      brokers: [],
    })
    expect(getActiveBroker()).toBeNull()
  })

  it('rejects deleting a missing broker without mutating state', () => {
    addBroker(alphaBroker)
    const result = deleteBroker('missing-broker-id')

    expect(result.success).toBe(false)
    expect(result.validation.errors).toEqual([expect.objectContaining({ code: 'BROKER_NOT_FOUND' })])
    expect(getAllBrokers()).toEqual([{ ...alphaBroker, isActive: true }])
  })

  it('returns defensive copies from read operations', () => {
    addBroker(alphaBroker)
    const allBrokers = getAllBrokers()
    const activeBroker = getActiveBroker()

    allBrokers[0].key = 'MUTATED'

    if (activeBroker !== null) {
      activeBroker.key = 'MUTATED'
    }

    expect(getAllBrokers()).toEqual([{ ...alphaBroker, isActive: true }])
    expect(getActiveBroker()).toEqual({ ...alphaBroker, isActive: true })
  })
})
