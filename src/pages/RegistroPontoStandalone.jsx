import React from 'react';
import RegistroPonto from './RegistroPonto';

function RegistroPontoStandalone() {
  return (
    <div style={{ padding: 0, margin: 0 }}>
      <RegistroPonto standalone={true} />
    </div>
  );
}

export default RegistroPontoStandalone;
