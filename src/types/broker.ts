export type BrokerKey = string

export type BrokerId = string

export interface Broker {
  key: BrokerKey
  brokerId: BrokerId
  isActive: boolean
}
