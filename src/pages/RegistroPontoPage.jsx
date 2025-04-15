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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
    <div className="max-w-2xl mx-auto p-4 font-sans text-base text-gray-800">
      {!funcionario ? (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">Identifique-se para Registrar o Ponto</h2>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={nomeBusca}
            onChange={(e) => setNomeBusca(e.target.value)}
            className="w-full md:w-3/4 px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={buscarFuncionario}
            className="w-full md:w-3/4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
          >
            Acessar Registro de Ponto
          </button>
          {mensagem && <p className="text-center mt-4 text-red-600 font-medium">{mensagem}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
          <p className="text-lg font-semibold text-center text-green-700">
            Olá, {funcionario.nome}! ({tipo.toUpperCase()})
          </p>

          <WebcamCapture onCapture={setFotoBase64} />

          <div className="w-full">
            <label className="block font-semibold mb-1">Assinatura:</label>
            <div className="border rounded-md p-2 shadow-sm bg-white max-w-xs mx-auto">
              <SignatureCanvas onSignature={setAssinaturaBase64} />
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition duration-200"
            >
              Registrar Ponto
            </button>
            <button
              type="button"
              onClick={() => setFuncionario(null)}
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              Sair
            </button>
          </div>

          {mensagem && (
            <p className="text-center mt-4 font-medium" style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>
              {mensagem}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default RegistroPontoPage;
