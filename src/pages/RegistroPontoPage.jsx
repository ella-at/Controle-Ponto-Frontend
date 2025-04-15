import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import SignatureCanvas from '../components/SignatureCanvas';

function RegistroPontoPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [nomeBusca, setNomeBusca] = useState('');
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [tipo, setTipo] = useState('entrada');
  const [fotoBase64, setFotoBase64] = useState('');
  const [assinaturaBase64, setAssinaturaBase64] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    buscarFuncionarios();
    setIsMobile(window.innerWidth < 768);
  }, []);

  const buscarFuncionarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/funcionarios`);
      setFuncionarios(res.data);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao buscar funcionários');
    }
  };

  const handleBuscar = () => {
    const encontrado = funcionarios.find(f => f.nome.toLowerCase() === nomeBusca.trim().toLowerCase());
    if (encontrado) {
      setFuncionarioSelecionado(encontrado);
      setMensagem('');
    } else {
      setMensagem('Funcionário não encontrado.');
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
      setTimeout(() => {
        setFuncionarioSelecionado(null);
        setFotoBase64('');
        setAssinaturaBase64('');
        setNomeBusca('');
        setMensagem('');
      }, 2500);
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
        <>
          <h2 className="text-2xl font-bold text-center mb-6">🕒 Registro de Ponto</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Digite seu nome completo"
              value={nomeBusca}
              onChange={(e) => setNomeBusca(e.target.value)}
              className="w-full px-4 py-2 border rounded-md shadow-sm"
            />
          </div>
          <button
            onClick={handleBuscar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            🔍 Buscar
          </button>
          {mensagem && (
            <p style={{ marginTop: '1rem', color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <p>
            Funcionário: <strong>{funcionarioSelecionado.nome}</strong>
          </p>

          <button type="button" onClick={() => setFuncionarioSelecionado(null)} style={{ marginBottom: '10px' }}>
            🔙 Voltar
          </button>

          <label>Tipo de Ponto:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ marginLeft: '10px', padding: '6px' }}>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>

          <br /><br />

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

          <button type="submit" style={{ marginTop: '1rem', padding: '10px 20px' }}>
            Registrar Ponto
          </button>

          {mensagem && (
            <p style={{ marginTop: '1rem', color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>
          )}
        </form>
      )}
    </div>
  );
}

export default RegistroPontoPage;