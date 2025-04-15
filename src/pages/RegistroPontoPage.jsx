// src/pages/RegistroPontoPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import SignatureCanvas from '../components/SignatureCanvas';

function RegistroPontoPage() {
  const [nomeBusca, setNomeBusca] = useState('');
  const [funcionario, setFuncionario] = useState(null);
  const [fotoBase64, setFotoBase64] = useState('');
  const [assinaturaBase64, setAssinaturaBase64] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [tipo, setTipo] = useState('entrada');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const buscarFuncionario = async () => {
    try {
      const res = await axios.get(`${API_URL}/funcionarios`);
      const encontrado = res.data.find(f => f.nome.toLowerCase() === nomeBusca.toLowerCase());
      if (encontrado) {
        setFuncionario(encontrado);
        definirTipoPonto(encontrado.id);
      } else {
        setMensagem('Funcionário não encontrado');
      }
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao buscar funcionário');
    }
  };

  const definirTipoPonto = async (funcionarioId) => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const res = await axios.get(`${API_URL}/pontos/por-data?data=${hoje}`);
      const registros = res.data.filter(p => p.funcionario_id === funcionarioId);
      const tipos = registros.map(p => p.tipo);
      if (tipos.includes('entrada') && !tipos.includes('saida')) {
        setTipo('saida');
      } else {
        setTipo('entrada');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fotoBase64 || !assinaturaBase64) {
      setMensagem('Tire a foto e assine para registrar o ponto.');
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
      setTimeout(() => {
        setFuncionario(null);
        setFotoBase64('');
        setAssinaturaBase64('');
        setMensagem('');
        setNomeBusca('');
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

  return (
    <div className="max-w-xl mx-auto px-4 py-10 font-sans bg-white shadow-lg rounded-lg mt-10">
      {!funcionario ? (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">📝 Identifique-se</h2>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={nomeBusca}
            onChange={(e) => setNomeBusca(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={buscarFuncionario}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-md font-semibold"
          >
            Acessar Registro de Ponto
          </button>
          {mensagem && <p className="text-red-600 mt-4 text-sm">{mensagem}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="text-center">
          <p className="mb-4 text-xl font-semibold text-gray-800">
            👋 Olá, <span className="text-blue-700">{funcionario.nome}</span> — Registro de {tipo === 'entrada' ? 'Entrada' : 'Saída'}
          </p>

          <WebcamCapture onCapture={setFotoBase64} />

          <div className="mt-6">
            <label className="block mb-2 font-medium text-gray-700">✍️ Assinatura:</label>
            <div className="border border-gray-300 rounded-md p-3 mx-auto" style={{ maxWidth: isMobile ? '100%' : '320px' }}>
              <SignatureCanvas onSignature={setAssinaturaBase64} />
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold"
            >
              ✅ Registrar Ponto
            </button>
            <button
              type="button"
              onClick={() => setFuncionario(null)}
              className="ml-4 text-sm text-blue-600 underline hover:text-blue-800"
            >
              Sair
            </button>
          </div>

          {mensagem && <p className="text-center mt-4 text-sm" style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>}
        </form>
      )}
    </div>
  );
}

export default RegistroPontoPage;
