// src/pages/RegistroPontoPage.jsx
import React, { useState } from 'react';
import RegistroPonto from './RegistroPonto';

function RegistroPontoPage() {
  const [funcionario, setFuncionario] = useState(null);
  const [nomeBusca, setNomeBusca] = useState('');
  const [erro, setErro] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const buscarFuncionario = async () => {
    try {
      const res = await fetch(`${API_URL}/funcionarios`);
      const lista = await res.json();
      const encontrado = lista.find(f => f.nome.toLowerCase() === nomeBusca.toLowerCase());

      if (encontrado) {
        setFuncionario(encontrado);
        setErro('');
      } else {
        setErro('Funcionário não encontrado');
      }
    } catch (err) {
      console.error(err);
      setErro('Erro ao buscar funcionário');
    }
  };

  const handleVoltar = () => {
    setFuncionario(null);
    setNomeBusca('');
    setErro('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      {!funcionario ? (
        <>
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>🔍 Identifique-se</h2>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={nomeBusca}
            onChange={(e) => setNomeBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarFuncionario()}
            style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={buscarFuncionario} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Acessar Registro de Ponto
          </button>
          {erro && <p style={{ color: 'red', marginTop: '1rem' }}>{erro}</p>}
        </>
      ) : (
        <>
          <RegistroPonto standalone={true} funcionarioSelecionadoExternamente={funcionario} onCancelar={handleVoltar} />
        </>
      )}
    </div>
  );
}

export default RegistroPontoPage;
