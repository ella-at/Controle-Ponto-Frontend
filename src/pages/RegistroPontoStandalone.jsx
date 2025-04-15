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
    <div className="max-w-xl mx-auto px-4 py-8 font-sans">
      {!funcionario ? (
        <div>
          <h2 className="text-2xl font-semibold text-center mb-4">Identifique-se para Registrar o Ponto</h2>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={nomeBusca}
            onChange={(e) => setNomeBusca(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-4"
          />
          <button onClick={buscarFuncionario} className="w-full bg-blue-600 text-white py-2 rounded">
            Acessar Registro de Ponto
          </button>
          {mensagem && <p className="text-center mt-4 text-red-600">{mensagem}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="mb-2 text-center text-lg font-semibold">
            Olá, {funcionario.nome}! ({tipo.toUpperCase()})
          </p>

          <WebcamCapture onCapture={setFotoBase64} />

          <div style={{ marginTop: '20px' }}>
            <label><strong>Assinatura:</strong></label>
            <div style={{
              maxWidth: isMobile ? '100%' : '320px',
              margin: isMobile ? '10px auto' : '10px 0',
              border: '1px solid #ccc',
              padding: '10px'
            }}>
              <SignatureCanvas onSignature={setAssinaturaBase64} />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              Registrar Ponto
            </button>
            <br></br>
            <button type="button" onClick={() => setFuncionario(null)} className="text-sm underline text-blue-700">
              Sair
            </button>
          </div>

          {mensagem && <p className="text-center mt-4" style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>}
        </form>
      )}
    </div>
  );
}

export default RegistroPontoPage;
