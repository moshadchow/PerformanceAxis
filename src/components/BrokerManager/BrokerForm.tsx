import React, { useEffect, useState } from 'react';
import type { Broker } from '../../types/broker';
import type { ValidationError } from '../../types/common';

interface Props {
  mode: 'add' | 'edit';
  initialBroker?: Broker;
  validationErrors: ValidationError[];
  onSubmit: (input: { key: string; brokerId: string }) => void;
  onCancel?: () => void;
}

const BrokerForm: React.FC<Props> = ({ mode, initialBroker, validationErrors, onSubmit, onCancel }) => {
  const [key, setKey] = useState('');
  const [brokerId, setBrokerId] = useState('');

  // Populate fields when editing or when switching modes
  useEffect(() => {
    if (mode === 'edit' && initialBroker) {
      setKey(initialBroker.key);
      setBrokerId(initialBroker.brokerId);
    } else {
      setKey('');
      setBrokerId('');
    }
  }, [mode, initialBroker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ key: key.trim(), brokerId: brokerId.trim() });
  };

  const getError = (field: 'key' | 'brokerId') => {
    const err = validationErrors.find((e) => e.field === field);
    return err ? err.message : '';
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <fieldset style={{ border: '1px solid #ddd', padding: '1rem' }}>
        <legend>{mode === 'add' ? 'Add Broker' : 'Edit Broker'}</legend>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Broker Key:
            <input
              type="text"
              name="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </label>
          {getError('key') && <div style={{ color: 'red' }}>{getError('key')}</div>}
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Broker ID:
            <input
              type="text"
              name="brokerId"
              value={brokerId}
              onChange={(e) => setBrokerId(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </label>
          {getError('brokerId') && <div style={{ color: 'red' }}>{getError('brokerId')}</div>}
        </div>
        <div>
          <button type="submit" style={{ marginRight: '0.5rem' }}>
            {mode === 'add' ? 'Add' : 'Save'}
          </button>
          {mode === 'edit' && onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
};

export default BrokerForm;
