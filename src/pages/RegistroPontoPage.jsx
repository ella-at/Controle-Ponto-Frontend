// src/pages/RegistroPontoPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import SignatureCanvas from '../components/SignatureCanvas';

function RegistroPontoPage() {
  const [buscaNome, setBuscaNome] = useState('');
  const [funcionario, setFuncionario] = useState(null);
  const [fotoBase64, setFotoBase64] = useState('');
  const [assinaturaBase64, setAssinaturaBase64] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState('entrada');

  const API_URL = import.meta.env.VITE_API_URL;

  const handleBuscar = async () => {
    try {
      const res = await axios.get(`${API_URL}/funcionarios`);
      const encontrado = res.data.find(f => f.nome.toLowerCase() === buscaNome.toLowerCase());
      if (encontrado) {
        setFuncionario(encontrado);
      } else {
        setMensagem('Funcionário não encontrado');
      }
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao buscar funcionário');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fotoBase64 || !assinaturaBase64 || !funcionario) {
      setMensagem('Preencha todos os campos, tire a foto e assine.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('funcionario_id', funcionario.id);
      formData.append('tipo', tipo);
      formData.append('foto', dataURLtoFile(fotoBase64, 'foto.jpg'));
      formData.append('assinatura', dataURLtoFile(assinaturaBase64, 'assinatura.png'));

      await axios.post(`${API_URL}/pontos`, formData);
      setMensagem('Registro realizado com sucesso!');

      // Resetar após 2 segundos
      setTimeout(() => {
        setFuncionario(null);
        setBuscaNome('');
        setFotoBase64('');
        setAssinaturaBase64('');
        setMensagem('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao registrar ponto.');
    }
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  if (!funcionario) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">🔍 Digite seu nome</h2>
        <input
          type="text"
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
          className="border rounded w-full p-2 mb-4"
          placeholder="Nome completo"
        />
        <button
          onClick={handleBuscar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
        {mensagem && (
          <p className="mt-4" style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Registro de Ponto</h2>
      <form onSubmit={handleSubmit}>
        <p><strong>{funcionario.nome}</strong> — {funcionario.cargo} ({funcionario.departamento})</p>

        <label className="block mt-4">Tipo:</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border p-2 rounded">
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

        <div className="mt-6">
          <WebcamCapture onCapture={setFotoBase64} />
        </div>

        <div className="mt-6">
          <label className="block mb-2 font-semibold">Assinatura:</label>
          <SignatureCanvas onSignature={setAssinaturaBase64} />
        </div>

        <button type="submit" className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Registrar Ponto
        </button>
        {mensagem && (
          <p className="mt-4" style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>
        )}
      </form>
    </div>
  );
}

export default RegistroPontoPage;
