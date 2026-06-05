import React from 'react';
import type { Broker } from '../../types/broker';

interface Props {
  broker: Broker;
  isActive: boolean;
  onEdit: (broker: Broker) => void;
  onDelete: (brokerId: string) => void;
  onActivate: (brokerId: string) => void;
}

const BrokerListItem: React.FC<Props> = ({ broker, isActive, onEdit, onDelete, onActivate }) => {
  return (
    <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
      <span style={{ flexGrow: 1 }}>
        {broker.key} ({broker.brokerId})
        {isActive && <strong style={{ marginLeft: '0.5rem', color: 'green' }}>(Active)</strong>}
      </span>
      {!isActive && (
        <button type="button" onClick={() => onActivate(broker.brokerId)} style={{ marginRight: '0.5rem' }}>
          Activate
        </button>
      )}
      <button type="button" onClick={() => onEdit(broker)} style={{ marginRight: '0.5rem' }}>
        Edit
      </button>
      <button type="button" onClick={() => onDelete(broker.brokerId)}>
        Delete
      </button>
    </li>
  );
};

export default BrokerListItem;
