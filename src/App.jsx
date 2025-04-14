import React, { useState } from 'react';
import RegistroPonto from './pages/RegistroPonto';
import PainelVerificacao from './pages/PainelVerificacao';
import CadastroFuncionario from './pages/CadastroFuncionario';
import RegistroPagamento from './pages/RegistroPagamento';
import AssinaturaMobile from './pages/AssinaturaMobile';


function App() {
  const [tela, setTela] = useState('registro');

  const botaoStyle = (ativo) => ({
    marginRight: '10px',
    backgroundColor: ativo ? '#007bff' : '#ccc',
    color: '#fff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  });

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>📋 Controle de Ponto</h1>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setTela('registro')}
          style={botaoStyle(tela === 'registro')}
        >
          Registrar Ponto
        </button>
        <button
          onClick={() => setTela('painel')}
          style={botaoStyle(tela === 'painel')}
        >
          Painel de Verificação
        </button>
        
        
        <button onClick={() => setTela('cadastro')} style={botaoStyle(tela === 'cadastro')}>
          Cadastro de Funcionário
        </button>
        <button onClick={() => setTela('pagamento')} style={botaoStyle(tela === 'pagamento')}>
        Registro de Pagamento
        </button>
      </div>


      {tela === 'registro' && <RegistroPonto />}
      {tela === 'painel' && <PainelVerificacao />}
      {tela === 'cadastro' && <CadastroFuncionario />}
      {tela === 'pagamento' && <RegistroPagamento />}
    </div>
  );
}

export default App;
