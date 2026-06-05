import React, { useEffect, useState } from 'react';
import type { Broker, BrokerId } from '../../types/broker';
import type { ValidationError } from '../../types/common';
import {
  getAllBrokers,
  getActiveBroker,
  addBroker,
  updateBroker,
  deleteBroker,
  activateBroker,
} from '../../store/brokerStore';
import BrokerForm from './BrokerForm';
import BrokerList from './BrokerList';

type Mode = 'add' | 'edit';

const BrokerManager: React.FC = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [activeBroker, setActiveBroker] = useState<Broker | null>(null);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const refreshBrokers = () => {
    setBrokers(getAllBrokers());
    setActiveBroker(getActiveBroker());
    setEditingBroker(null);
    setValidationErrors([]);
  };

  useEffect(() => {
    refreshBrokers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = (input: { key: string; brokerId: string }) => {
    const result = addBroker(input);
    if (result.success) {
      refreshBrokers();
    } else {
      setValidationErrors(result.validation.errors);
    }
  };

  const handleUpdate = (input: { key: string; brokerId: string }) => {
    if (!editingBroker) return;
    const result = updateBroker(editingBroker.brokerId, input);
    if (result.success) {
      refreshBrokers();
    } else {
      setValidationErrors(result.validation.errors);
    }
  };

  const handleDelete = (brokerId: BrokerId) => {
    const result = deleteBroker(brokerId);
    if (result.success) {
      refreshBrokers();
    } else {
      setValidationErrors(result.validation.errors);
    }
  };

  const handleActivate = (brokerId: BrokerId) => {
    const result = activateBroker(brokerId);
    if (result.success) {
      refreshBrokers();
    } else {
      setValidationErrors(result.validation.errors);
    }
  };

  const startEdit = (broker: Broker) => {
    setEditingBroker(broker);
    setValidationErrors([]);
  };

  const cancelEdit = () => {
    setEditingBroker(null);
    setValidationErrors([]);
  };

  return (
    <section>
      <h2>Broker Management</h2>
      <BrokerForm
        mode={editingBroker ? 'edit' : 'add'}
        initialBroker={editingBroker ?? undefined}
        validationErrors={validationErrors}
        onSubmit={editingBroker ? handleUpdate : handleAdd}
        onCancel={editingBroker ? cancelEdit : undefined}
      />
      <BrokerList
        brokers={brokers}
        activeBrokerId={activeBroker?.brokerId}
        onEdit={startEdit}
        onDelete={handleDelete}
        onActivate={handleActivate}
      />
    </section>
  );
};

export default BrokerManager;
