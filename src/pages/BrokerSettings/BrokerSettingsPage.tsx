import React from 'react';
import BrokerManager from '../../components/BrokerManager/BrokerManager';

const BrokerSettingsPage: React.FC = () => {
  return (
    <section style={{ marginTop: '2rem' }}>
      <h2>Broker Settings</h2>
      <p>Manage broker mappings used for API requests.</p>
      <BrokerManager />
    </section>
  );
};

export default BrokerSettingsPage;
