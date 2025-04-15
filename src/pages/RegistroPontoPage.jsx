// src/pages/RegistroPontoPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import RegistroPonto from './RegistroPonto';

function RegistroPontoPage() {
  const [buscaNome, setBuscaNome] = useState('');
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const buscarFuncionario = async () => {
    if (!buscaNome) return;
    setCarregando(true);
    setMensagem('');

    try {
      const res = await axios.get(`${API_URL}/funcionarios`);
      const funcionarios = res.data;

      const encontrado = funcionarios.find(f =>
        f.nome.toLowerCase().includes(buscaNome.toLowerCase())
      );

      if (encontrado) {
        setFuncionarioSelecionado(encontrado);
      } else {
        setMensagem('Funcionário não encontrado. Verifique o nome digitado.');
      }
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao buscar funcionários.');
    } finally {
      setCarregando(false);
    }
  };

  if (funcionarioSelecionado) {
    return <RegistroPonto preSelecionado={funcionarioSelecionado} standalone={true} />;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-semibold mb-4">🔍 Localizar Funcionário</h2>

      <input
        type="text"
        placeholder="Digite seu nome completo"
        value={buscaNome}
        onChange={(e) => setBuscaNome(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded mb-4"
      />
      <button
        onClick={buscarFuncionario}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        disabled={carregando}
      >
        {carregando ? 'Buscando...' : 'Acessar Registro'}
      </button>

      {mensagem && <p className="mt-4 text-red-600">{mensagem}</p>}
    </div>
  );
}

export default RegistroPontoPage;
