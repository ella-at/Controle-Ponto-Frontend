import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import SignatureCanvas from '../components/SignatureCanvas';

function RegistroPonto({ standalone = false }) {
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
  const [pontosPorData, setPontosPorData] = useState([]);
  const [pendenciasSaida, setPendenciasSaida] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    buscarFuncionarios();
    buscarPendenciasSaida();
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    carregarPontosPorData(dataSelecionada);
  }, [dataSelecionada]);

  const carregarPontosPorData = async (data) => {
    try {
      const res = await axios.get(`${API_URL}/pontos/por-data?data=${data}`);
      setPontosPorData(res.data);
    } catch (err) {
      console.error('Erro ao buscar pontos por data:', err);
    }
  };

  const buscarPendenciasSaida = async () => {
    try {
      const res = await axios.get(`${API_URL}/pontos/pendencias-saida`);
      setPendenciasSaida(res.data); // Deve retornar array de objetos: { funcionario_id, nome, data }
    } catch (err) {
      console.error('Erro ao buscar pendências de saída:', err);
    }
  };

  const obterStatusPonto = (funcionarioId) => {
    const registros = pontosPorData.filter(p => p.funcionario_id === funcionarioId);
    const tipos = registros.map(p => p.tipo);

    if (tipos.includes('entrada') && tipos.includes('saida')) return '✅ Entrada & Saída realizada';
    if (tipos.includes('entrada')) return '✅ Entrada realizada';
    return '⚠️ Registro pendente';
  };

  const confirmarVale = async (pontoId) => {
    try {
      await axios.post(`${API_URL}/pontos/confirmar-vale`, {
        ponto_id: pontoId
      });
      setMensagem('Vale confirmado com sucesso!');
      carregarRegistros();
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao confirmar vale.');
    }
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

    const temPendencia = pendenciasSaida.some(p => p.funcionario_id === funcionarioSelecionado.id);

    if (tipo === 'entrada' && temPendencia) {
      setMensagem('Não é possível registrar uma nova entrada. Há pendência de saída em dias anteriores.');
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
      carregarPontosPorData(dataSelecionada);
      buscarPendenciasSaida();
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
      {!standalone && <h2 className="text-3xl font-semibold text-center text-blue-700 mb-6">🕒 Registro de Ponto</h2>}

      {!standalone && pendenciasSaida.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded">
          <h3 className="font-semibold mb-2 text-yellow-800">⚠️ Pendências de Saída Administrativa:</h3>
          <ul className="list-disc pl-5 text-sm text-yellow-900">
            {pendenciasSaida.map((p, idx) => (
              <li key={idx}>
                {p.nome} - pendente desde {new Date(p.data).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!funcionarioSelecionado ? (
        <>
          {!standalone && (
            <>
              <div className="mb-6">
                <label className="block mb-1"><strong>Selecionar Data:</strong></label>
                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="px-4 py-2 border rounded-md shadow-sm"
                />
              </div>

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
                  Limpar Filtro
                </button>
              </div>
            </>
          )}

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
          {!standalone && (
            <p>
              Funcionário selecionado: <strong>{funcionarioSelecionado.nome}</strong>{' '}
              <button type="button" onClick={() => setFuncionarioSelecionado(null)}>Trocar</button>
            </p>
          )}

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

          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <strong>{funcionarioSelecionado.nome}</strong><br />
            Cargo: {funcionarioSelecionado.cargo} – Departamento: {funcionarioSelecionado.departamento} <br />
            <span style={{ color: obterStatusPonto(funcionarioSelecionado.id).includes('pendente') ? 'orange' : 'green' }}>
              Status: {obterStatusPonto(funcionarioSelecionado.id)}
            </span>
          </div>

          {pendenciasSaida.some(p => p.funcionario_id === funcionarioSelecionado.id) && (
            <div style={{ marginTop: '1rem', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404' }}>
              ⚠️ Este funcionário possui <strong>pendência de saída</strong> em dias anteriores.<br />
              A regularização deve ser feita com o <strong>administrador</strong> antes de registrar nova entrada.
            </div>
          )}

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
