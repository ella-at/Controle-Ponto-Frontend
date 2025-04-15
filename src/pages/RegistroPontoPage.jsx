// src/pages/RegistroPontoPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import SignatureCanvas from '../components/SignatureCanvas';

function RegistroPontoPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [buscaNome, setBuscaNome] = useState('');
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [tipo, setTipo] = useState('entrada');
  const [fotoBase64, setFotoBase64] = useState('');
  const [assinaturaBase64, setAssinaturaBase64] = useState('');
  const [mensagem, setMensagem] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  const buscarFuncionarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/funcionarios`);
      setFuncionarios(res.data);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
    }
  };

  const handleBuscar = () => {
    const encontrado = funcionarios.find(f => f.nome.toLowerCase().includes(buscaNome.toLowerCase()));
    if (encontrado) {
      setFuncionarioSelecionado(encontrado);
    } else {
      setMensagem('Funcionário não encontrado');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!funcionarioSelecionado || !fotoBase64 || !assinaturaBase64) {
      setMensagem('Preencha todos os campos, tire a foto e assine.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('funcionario_id', funcionarioSelecionado.id);
      formData.append('tipo', tipo);
      formData.append('foto', dataURLtoFile(fotoBase64, 'foto.jpg'));
      formData.append('assinatura', dataURLtoFile(assinaturaBase64, 'assinatura.png'));

      await axios.post(`${API_URL}/pontos`, formData);
      setMensagem('Registro realizado com sucesso!');

      // Voltar para a tela inicial
      setFuncionarioSelecionado(null);
      setBuscaNome('');
      setFotoBase64('');
      setAssinaturaBase64('');
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
      {!funcionarioSelecionado ? (
        <div>
          <h2 className="text-2xl font-semibold text-center mb-6">🔍 Identifique-se</h2>
          <input
            type="text"
            placeholder="Digite seu nome"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            className="w-full px-4 py-2 border rounded-md shadow-sm mb-4"
          />
          <button
            onClick={handleBuscar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Buscar
          </button>
          {mensagem && (
            <p className="mt-4 text-center" style={{ color: 'red' }}>{mensagem}</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold mb-4 text-center">Olá, {funcionarioSelecionado.nome}</h2>
          <label>Tipo de Ponto:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="block mb-4 mt-1 px-3 py-2 border rounded">
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>

          <WebcamCapture onCapture={setFotoBase64} />

          <div style={{ marginTop: '20px' }}>
            <label><strong>Assinatura:</strong></label>
            <div style={{ border: '1px solid #ccc', padding: '10px' }}>
              <SignatureCanvas onSignature={setAssinaturaBase64} />
            </div>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4 w-full"
          >
            Registrar Ponto
          </button>

          {mensagem && (
            <p className="mt-4 text-center" style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>
          )}
        </form>
      )}
    </div>
  );
}

export default RegistroPontoPage;
