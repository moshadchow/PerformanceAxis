import React from 'react';
import type { Broker } from '../../types/broker';
import BrokerListItem from './BrokerListItem';

interface Props {
  brokers: Broker[];
  activeBrokerId?: string;
  onEdit: (broker: Broker) => void;
  onDelete: (brokerId: string) => void;
  onActivate: (brokerId: string) => void;
}

const BrokerList: React.FC<Props> = ({ brokers, activeBrokerId, onEdit, onDelete, onActivate }) => {
  if (brokers.length === 0) {
    return <p>No brokers configured.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {brokers.map((broker) => (
        <BrokerListItem
          key={broker.brokerId}
          broker={broker}
          isActive={broker.brokerId === activeBrokerId}
          onEdit={onEdit}
          onDelete={onDelete}
          onActivate={onActivate}
        />
      ))}
    </ul>
  );
};

export default BrokerList;
