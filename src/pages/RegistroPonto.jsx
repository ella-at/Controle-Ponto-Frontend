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
  const [pontosHoje, setPontosHoje] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    buscarFuncionarios();
    carregarPontosHoje();
  }, []);

  const carregarPontosHoje = async () => {
    try {
      const res = await axios.get(`${API_URL}/pontos/hoje`);
      setPontosHoje(res.data);
    } catch (err) {
      console.error('Erro ao buscar pontos do dia:', err);
    }
  };

  const obterStatusPonto = (funcionarioId) => {
    const registros = pontosHoje.filter(p => p.funcionario_id === funcionarioId);
    const tipos = registros.map(p => p.tipo);

    if (tipos.includes('entrada') && tipos.includes('saida')) return '✅ Entrada & Saída realizada';
    if (tipos.includes('entrada')) return '✅ Entrada realizada';
    return '⚠️ Registro pendente';
  };

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
      carregarPontosHoje(); // Atualiza o status após registrar
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
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
    <h2 className="text-3xl font-semibold text-center text-blue-700 mb-6">🕒 Registro de Ponto</h2>

    {!funcionarioSelecionado ? (
      <>
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por nome"
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md shadow-sm"
          />
          <select
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
            className="px-4 py-2 border rounded-md shadow-sm"
          >
            <option value="">Todos os cargos</option>
            {cargosUnicos.map((cargo, idx) => (
              <option key={idx} value={cargo}>{cargo}</option>
            ))}
          </select>
          <select
            value={filtroDepartamento}
            onChange={(e) => setFiltroDepartamento(e.target.value)}
            className="px-4 py-2 border rounded-md shadow-sm"
          >
            <option value="">Todos os departamentos</option>
            {departamentosUnicos.map((dep, idx) => (
              <option key={idx} value={dep}>{dep}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <button
            onClick={handleBuscar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            🔍 Buscar
          </button>
          <button
            onClick={handleLimpar}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            🧼 Limpar Filtro
          </button>
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
                  <strong>{f.nome}</strong> — {f.cargo} ({f.departamento})<br />
                  <span style={{ color: obterStatusPonto(f.id).includes('pendente') ? 'orange' : 'green' }}>
                    Status: {obterStatusPonto(f.id)}
                  </span>
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

          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <strong>{funcionarioSelecionado.nome}</strong><br />
            Cargo: {funcionarioSelecionado.cargo} – Departamento: {funcionarioSelecionado.departamento} <br />
            <span style={{ color: obterStatusPonto(funcionarioSelecionado.id).includes('pendente') ? 'orange' : 'green' }}>
              Status: {obterStatusPonto(funcionarioSelecionado.id)}
            </span>
          </div>

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
