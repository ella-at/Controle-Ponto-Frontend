import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import SignatureCanvas from '../components/SignatureCanvas';

function RegistroPonto() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtroCargo, setFiltroCargo] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [buscaNome, setBuscaNome] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState([]);
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
      setResultadoBusca(res.data); 
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao buscar funcionários');
    }
  };

  const handleBuscar = () => {
    const filtrados = funcionarios.filter((f) => {
      return (
        (!filtroCargo || f.cargo === filtroCargo) &&
        (!filtroDepartamento || f.departamento === filtroDepartamento) &&
        (!buscaNome || f.nome.toLowerCase().includes(buscaNome.toLowerCase()))
      );
    });
    setResultadoBusca(filtrados);
  };

  const handleLimpar = () => {
    setFiltroCargo('');
    setFiltroDepartamento('');
    setBuscaNome('');
    setResultadoBusca(funcionarios);
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
      setFuncionarioSelecionado(null);
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

  const cargosUnicos = [...new Set(funcionarios.map(f => f.cargo).filter(Boolean))];
  const departamentosUnicos = [...new Set(funcionarios.map(f => f.departamento).filter(Boolean))];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>🕒 Registro de Ponto</h2>

      {!funcionarioSelecionado ? (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Buscar por nome"
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              style={{ flex: '1', padding: '8px' }}
            />
            <select
              value={filtroCargo}
              onChange={(e) => setFiltroCargo(e.target.value)}
              style={{ padding: '8px' }}
            >
              <option value="">Todos os cargos</option>
              {cargosUnicos.map((cargo, idx) => (
                <option key={idx} value={cargo}>{cargo}</option>
              ))}
            </select>
            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              style={{ padding: '8px' }}
            >
              <option value="">Todos os departamentos</option>
              {departamentosUnicos.map((dep, idx) => (
                <option key={idx} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button onClick={handleBuscar} style={{ marginRight: '10px', padding: '8px 12px' }}>🔍 Buscar</button>
            <button onClick={handleLimpar} style={{ padding: '8px 12px' }}>🧼 Limpar Filtro</button>
          </div>

          {resultadoBusca.length === 0 ? (
            <p style={{ color: 'gray' }}>Nenhum funcionário encontrado.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {resultadoBusca.map((f) => (
                <li key={f.id} style={{
                  background: '#f2f2f2',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <strong>{f.nome}</strong> — {f.cargo} ({f.departamento})
                  <br />
                  <button onClick={() => setFuncionarioSelecionado(f)} style={{ marginTop: '5px' }}>Selecionar</button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <p>
            Funcionário selecionado: <strong>{funcionarioSelecionado.nome}</strong>{' '}
            <button type="button" onClick={() => setFuncionarioSelecionado(null)}>Trocar</button>
          </p>

          <label>Tipo de Ponto:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ marginLeft: '10px', padding: '6px' }}>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>

          <br /><br />

          <WebcamCapture onCapture={setFotoBase64} />
          <SignatureCanvas onSignature={setAssinaturaBase64} />

          <button type="submit" style={{ marginTop: '1rem', padding: '10px 20px' }}>
            Registrar Ponto
          </button>

          {mensagem && (
            <p style={{ marginTop: '1rem', color: mensagem.includes('sucesso') ? 'green' : 'red' }}>
              {mensagem}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default RegistroPonto;
