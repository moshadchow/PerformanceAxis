import type { Broker, BrokerId, BrokerKey } from '../types/broker'
import type { ValidationError, ValidationResult } from '../types/common'

export interface BrokerInput {
  key: BrokerKey
  brokerId: BrokerId
}

export type BrokerUpdateInput = Partial<BrokerInput>

export interface AddBrokerOptions {
  activate?: boolean
}

export interface BrokerDeleteData {
  deletedBroker: Broker
  activeBroker: Broker | null
  brokers: Broker[]
}

export interface BrokerStoreSuccess<TData> {
  success: true
  data: TData
  validation: ValidationResult
}

export interface BrokerStoreFailure {
  success: false
  data: null
  validation: ValidationResult
}

export type BrokerStoreResult<TData> = BrokerStoreSuccess<TData> | BrokerStoreFailure

let brokers: Broker[] = []

export function getAllBrokers(): Broker[] {
  return cloneBrokers(brokers)
}

export function getActiveBroker(): Broker | null {
  const activeBroker = brokers.find((broker) => broker.isActive)

  return activeBroker === undefined ? null : cloneBroker(activeBroker)
}

export function addBroker(input: BrokerInput, options?: AddBrokerOptions): BrokerStoreResult<Broker> {
  const trimmedInput = trimBrokerInput(input)
  const errors = validateBrokerInput(trimmedInput)

  if (errors.length > 0) {
    return createFailure(errors)
  }

  const shouldActivate = brokers.length === 0 || options?.activate === true
  const broker: Broker = {
    ...trimmedInput,
    isActive: shouldActivate,
  }

  brokers = shouldActivate
    ? [...brokers.map((existingBroker) => ({ ...existingBroker, isActive: false })), broker]
    : [...brokers, broker]

  return createSuccess(cloneBroker(broker))
}

export function updateBroker(
  brokerId: BrokerId,
  input: BrokerUpdateInput,
): BrokerStoreResult<Broker> {
  const existingIndex = findBrokerIndexById(brokerId)

  if (existingIndex === -1) {
    return createFailure([createBrokerNotFoundError()])
  }

  const existingBroker = brokers[existingIndex]
  const updatedInput: BrokerInput = trimBrokerInput({
    key: input.key ?? existingBroker.key,
    brokerId: input.brokerId ?? existingBroker.brokerId,
  })
  const errors = validateBrokerInput(updatedInput, brokerId)

  if (errors.length > 0) {
    return createFailure(errors)
  }

  const updatedBroker: Broker = {
    ...existingBroker,
    ...updatedInput,
  }

  brokers = brokers.map((broker, index) => (index === existingIndex ? updatedBroker : broker))

  return createSuccess(cloneBroker(updatedBroker))
}

export function deleteBroker(brokerId: BrokerId): BrokerStoreResult<BrokerDeleteData> {
  const existingIndex = findBrokerIndexById(brokerId)

  if (existingIndex === -1) {
    return createFailure([createBrokerNotFoundError()])
  }

  const deletedBroker = brokers[existingIndex]
  const remainingBrokers = brokers.filter((broker) => broker.brokerId !== brokerId)

  if (deletedBroker.isActive && remainingBrokers.length > 0) {
    const [firstBroker, ...otherBrokers] = remainingBrokers
    brokers = [{ ...firstBroker, isActive: true }, ...otherBrokers.map((broker) => ({ ...broker, isActive: false }))]
  } else {
    brokers = remainingBrokers
  }

  const activeBroker = getActiveBroker()

  return createSuccess({
    deletedBroker: cloneBroker(deletedBroker),
    activeBroker,
    brokers: getAllBrokers(),
  })
}

export function activateBroker(brokerId: BrokerId): BrokerStoreResult<Broker> {
  const existingIndex = findBrokerIndexById(brokerId)

  if (existingIndex === -1) {
    return createFailure([createBrokerNotFoundError()])
  }

  brokers = brokers.map((broker, index) => ({
    ...broker,
    isActive: index === existingIndex,
  }))

  return createSuccess(cloneBroker(brokers[existingIndex]))
}

export function resetBrokerStoreForTests(): void {
  brokers = []
}

function trimBrokerInput(input: BrokerInput): BrokerInput {
  return {
    key: input.key.trim(),
    brokerId: input.brokerId.trim(),
  }
}

function validateBrokerInput(input: BrokerInput, excludedBrokerId?: BrokerId): ValidationError[] {
  const errors: ValidationError[] = []

  if (input.key.length === 0) {
    errors.push({
      field: 'key',
      message: 'Broker key is required.',
      code: 'BROKER_KEY_REQUIRED',
    })
  } else if (brokerExistsByKey(input.key, excludedBrokerId)) {
    errors.push({
      field: 'key',
      message: 'Broker key must be unique.',
      code: 'BROKER_KEY_DUPLICATE',
    })
  }

  if (input.brokerId.length === 0) {
    errors.push({
      field: 'brokerId',
      message: 'Broker ID is required.',
      code: 'BROKER_ID_REQUIRED',
    })
  } else if (brokerExistsById(input.brokerId, excludedBrokerId)) {
    errors.push({
      field: 'brokerId',
      message: 'Broker ID must be unique.',
      code: 'BROKER_ID_DUPLICATE',
    })
  }

  return errors
}

function brokerExistsByKey(key: BrokerKey, excludedBrokerId?: BrokerId): boolean {
  const normalizedKey = normalizeBrokerKey(key)

  return brokers.some(
    (broker) => broker.brokerId !== excludedBrokerId && normalizeBrokerKey(broker.key) === normalizedKey,
  )
}

function brokerExistsById(brokerId: BrokerId, excludedBrokerId?: BrokerId): boolean {
  return brokers.some((broker) => broker.brokerId !== excludedBrokerId && broker.brokerId === brokerId)
}

function findBrokerIndexById(brokerId: BrokerId): number {
  return brokers.findIndex((broker) => broker.brokerId === brokerId)
}

function normalizeBrokerKey(key: BrokerKey): string {
  return key.trim().toLowerCase()
}

function createBrokerNotFoundError(): ValidationError {
  return {
    field: 'brokerId',
    message: 'Broker was not found.',
    code: 'BROKER_NOT_FOUND',
  }
}

function createSuccess<TData>(data: TData): BrokerStoreSuccess<TData> {
  return {
    success: true,
    data,
    validation: createValidationResult([]),
  }
}

function createFailure(errors: ValidationError[]): BrokerStoreFailure {
  return {
    success: false,
    data: null,
    validation: createValidationResult(errors),
  }
}

function createValidationResult(errors: ValidationError[]): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors,
  }
}

function cloneBroker(broker: Broker): Broker {
  return { ...broker }
}

function cloneBrokers(brokersToClone: Broker[]): Broker[] {
  return brokersToClone.map(cloneBroker)
}
