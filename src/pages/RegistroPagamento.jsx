import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RegistroPagamento() {
  const [registros, setRegistros] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [comprovantes, setComprovantes] = useState({});
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().slice(0, 10));
  const [buscaNome, setBuscaNome] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    carregarRegistros();
  }, [dataSelecionada]);

  const carregarRegistros = async () => {
    try {
      const dataFormatada = new Date(dataSelecionada).toISOString().split('T')[0];
      const res = await axios.get(`${API_URL}/pontos/por-data?data=${dataFormatada}`);
      const lista = res.data;

      const agrupados = {};
      for (const ponto of lista) {
        const { funcionario_id } = ponto;
        if (!agrupados[funcionario_id]) {
          agrupados[funcionario_id] = {
            funcionario: ponto.Funcionario,
            entrada: null,
            saida: null,
            pontoEntradaId: null,
            pontoSaidaId: null,
            pagamento: null
          };
        }

        if (ponto.tipo === 'entrada') {
          agrupados[funcionario_id].entrada = ponto.data_hora;
          agrupados[funcionario_id].pontoEntradaId = ponto.id;
        }

        if (ponto.tipo === 'saida') {
          agrupados[funcionario_id].saida = ponto.data_hora;
          agrupados[funcionario_id].pontoSaidaId = ponto.id;
        }
      }

      for (const id in agrupados) {
        const resPag = await axios.get(`${API_URL}/pagamentos/funcionario/${id}`);
        const pagamentos = resPag.data;
        const pontoIds = [
          agrupados[id].pontoEntradaId,
          agrupados[id].pontoSaidaId
        ];
        const pagamentoUnico = pagamentos.find(p => pontoIds.includes(p.ponto_id));
        agrupados[id].pagamento = pagamentoUnico;
      }

      const filtrados = Object.values(agrupados).filter(r => r.entrada);
      const filtradosNome = buscaNome
        ? filtrados.filter(r => r.funcionario?.nome.toLowerCase().includes(buscaNome.toLowerCase()))
        : filtrados;

      setRegistros(filtradosNome);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao carregar registros.');
    }
  };

  const handleUpload = async (pontoId, funcionarioId) => {
    const file = comprovantes[pontoId];
    if (!file) {
      setMensagem('Selecione um comprovante antes de enviar.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('funcionario_id', funcionarioId);
      formData.append('ponto_id', pontoId);
      formData.append('comprovante', file);

      await axios.post(`${API_URL}/pagamentos`, formData);
      setMensagem('Pagamento registrado com sucesso!');
      carregarRegistros();
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao registrar pagamento.');
    }
  };

  const handleFileChange = (pontoId, file) => {
    setComprovantes({ ...comprovantes, [pontoId]: file });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>💳 Registro de Pagamento</h2>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <label style={{ marginRight: '10px' }}>Data:</label>
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          style={{ padding: '6px', marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Buscar por nome"
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
          style={{ padding: '6px', marginRight: '10px' }}
        />
        <button onClick={carregarRegistros} style={{ padding: '6px 12px' }}>🔍 Buscar</button>
        <button onClick={() => window.open(`${API_URL}/pagamentos/pendentes/excel`, '_blank')}>
          📥 Exportar Pendentes
        </button>
      </div>

      {registros.map((r, i) => (
        <div key={i} style={{
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '1rem',
          background: '#f9f9f9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <strong>{r.funcionario?.nome}</strong><br />
          Cargo: {r.funcionario?.cargo} – Departamento: {r.funcionario?.departamento}<br />
          PIX: {r.funcionario?.pix || 'Não informado'}<br />
          Entrada: {new Date(r.entrada).toLocaleTimeString('pt-BR')}<br />
          Saída: {r.saida ? new Date(r.saida).toLocaleTimeString('pt-BR') : '---'}<br />

          <p><strong>Status:</strong> {r.pagamento ? '✅ Pago' : '❌ Pendente'}</p>
          <p><strong>Status de Saída:</strong> {r.saida ? '✅ Realizada' : '⚠️ Saída Pendente'}</p>

          {r.pagamento?.comprovante && (
            <p>
              <button
                onClick={() => window.open(r.pagamento.comprovante, '_blank', 'width=800,height=600')}
                style={{ marginTop: '5px' }}
              >
                📎 Ver Comprovante
              </button>
            </p>
          )}

          {!r.pagamento && (
            <div>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange(r.pontoEntradaId, e.target.files[0])}
              />
              <button onClick={() => handleUpload(r.pontoEntradaId, r.funcionario.id)}>
                Registrar Pagamento
              </button>
            </div>
          )}
        </div>
      ))}

      {mensagem && (
        <p style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}

export default RegistroPagamento;
