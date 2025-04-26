import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RegistroPagamento() {
  const [registros, setRegistros] = useState([]);
  const [pendentesSaida, setPendentesSaida] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [comprovantes, setComprovantes] = useState({});
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().slice(0, 10));
  const [saidaManual, setSaidaManual] = useState({
    data: new Date().toISOString().split('T')[0], // já preenche com a data de hoje
    horario: '',
    responsavel: ''
  });
  
  const [modalFuncionario, setModalFuncionario] = useState(null);
  const [buscaNome, setBuscaNome] = useState('');
  const [modalPagamentos, setModalPagamentos] = useState(false);
  const [modalSaidas, setModalSaidas] = useState(false);
  const [dadosPagamentosPendentes, setDadosPagamentosPendentes] = useState({});
  const [dadosSaidasPendentes, setDadosSaidasPendentes] = useState({});

  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    carregarRegistros();
  }, []);

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
            pagamento: null,
            responsavel_saida_adm: null
          };
        }

        if (ponto.tipo === 'entrada') {
          agrupados[funcionario_id].entrada = ponto.data_hora;
          agrupados[funcionario_id].pontoEntradaId = ponto.id;
        }

        if (ponto.tipo === 'saida') {
          agrupados[funcionario_id].saida = ponto.data_hora;
          agrupados[funcionario_id].pontoSaidaId = ponto.id;
          agrupados[funcionario_id].responsavel_saida_adm = ponto.responsavel_saida_adm;
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

      const todos = Object.values(agrupados);
      const hoje = new Date(dataSelecionada).toISOString().split('T')[0];
      const saidasPendentes = todos.filter(r => {
        if (!r.entrada || r.saida) return false;
        const dataEntrada = new Date(r.entrada).toISOString().split('T')[0];
        return dataEntrada === hoje;
      });
      const completos = todos.filter(r => r.entrada && r.saida);

      setPendentesSaida(saidasPendentes);
      setRegistros(completos);
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

  const registrarSaidaAdm = async () => {
    try {
      await axios.post(`${API_URL}/pontos/saida-administrativa`, {
        funcionario_id: modalFuncionario.id,
        data_saida: saidaManual.data,
        horario_saida: saidaManual.horario,
        responsavel_saida_adm: saidaManual.responsavel
      });
  
      setModalFuncionario(null);
      setSaidaManual({ data: new Date().toISOString().split('T')[0], horario: '', responsavel: '' });
      setMensagem('Saída administrativa registrada!');
      carregarRegistros();
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao registrar saída administrativa.');
    }
  };
  

  const registrosFiltrados = registros.filter(r =>
    r.funcionario?.nome.toLowerCase().includes(buscaNome.toLowerCase())
  );

  

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
        <button
          onClick={() => {
            const dataFormatada = new Date(dataSelecionada).toISOString().split('T')[0];
            window.open(`${API_URL}/pagamentos/pendentes/excel?data=${dataFormatada}`, '_blank');
          }}
        >
          📥 Exportar Pendentes
        </button>

        <button
        onClick={async () => {
          try {
            const res = await axios.get(`${API_URL}/pagamentos/pendentes-por-dia`);
            setDadosPagamentosPendentes(res.data);
            setModalPagamentos(true);
          } catch (err) {
            console.error(err);
            alert('Erro ao buscar pagamentos pendentes.');
          }
        }}
        style={{ marginLeft: '10px' }}
      >
        🗂️ Pagamentos Pendentes
      </button>

      <button
        onClick={async () => {
          try {
            const res = await axios.get(`${API_URL}/pontos/pendentes-por-dia`);
            setDadosSaidasPendentes(res.data);
            setModalSaidas(true);
          } catch (err) {
            console.error(err);
            alert('Erro ao buscar saídas pendentes.');
          }
        }}
        style={{ marginLeft: '10px' }}
      >
        📤 Saídas Pendentes
      </button>





      </div>

      <h3 style={{ marginBottom: '1rem' }}>✅ Entrada & Saída para Pagamento</h3>

      {registrosFiltrados.map((r, i) => (
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
          Saída: {new Date(r.saida).toLocaleTimeString('pt-BR')}<br />
          Status de Saída: {r.responsavel_saida_adm ? `Administrativa (por ${r.responsavel_saida_adm})` : 'Realizada'}<br />

          <p>
            <strong>Status Pagamento:</strong> {r.pagamento ? '✅ Pago' : '❌ Pendente'}
          </p>

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

      {pendentesSaida.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3>⚠️ Funcionários com saída pendente</h3>
          {pendentesSaida.map((f, i) => (
            <div key={i} style={{
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid orange',
              borderRadius: '6px',
              backgroundColor: '#fff7e6'
            }}>
              <strong>{f.funcionario?.nome}</strong><br />
              Entrada: {new Date(f.entrada).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })}<br />
              <button onClick={() => setModalFuncionario(f.funcionario)}>📤 Saída Administrativa</button>
            </div>
          ))}
        </div>
      )}

{modalFuncionario && (
  <div style={{ background: '#eee', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
    <h4>Registrar Saída Administrativa para {modalFuncionario.nome}</h4>

    <div style={{ marginBottom: '10px' }}>
      <label>Data da Saída: </label>
      <input
        type="date"
        value={saidaManual.data}
        onChange={(e) => setSaidaManual({ ...saidaManual, data: e.target.value })}
        style={{ padding: '6px', marginRight: '10px' }}
      />
    </div>

    <div style={{ marginBottom: '10px' }}>
      <label>Horário da Saída: </label>
      <input
        type="time"
        value={saidaManual.horario}
        onChange={(e) => setSaidaManual({ ...saidaManual, horario: e.target.value })}
        style={{ padding: '6px', marginRight: '10px' }}
      />
    </div>

    <div style={{ marginBottom: '10px' }}>
      <label>Responsável: </label>
      <input
        type="text"
        placeholder="Nome do responsável"
        value={saidaManual.responsavel}
        onChange={(e) => setSaidaManual({ ...saidaManual, responsavel: e.target.value })}
        style={{ padding: '6px', marginRight: '10px' }}
      />
    </div>

    <button onClick={registrarSaidaAdm}>Confirmar Saída</button>
    <button onClick={() => setModalFuncionario(null)} style={{ marginLeft: '10px' }}>Cancelar</button>
  </div>
)}


      {/* MODAL - Pagamentos Pendentes por Dia */}
      {modalPagamentos && (
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '20px', maxHeight: '80vh', overflowY: 'auto', borderRadius: '10px', width: '90%', maxWidth: '800px' }}>
            <h3>🗂️ Pagamentos Pendentes por Dia</h3>
            <button onClick={() => setModalPagamentos(false)} style={{ float: 'right' }}>Fechar</button>
            {Object.entries(dadosPagamentosPendentes).map(([dia, registros]) => (
              <div key={dia} style={{ marginTop: '1rem' }}>
                <h4>📅 {dia}</h4>
                <ul>
                  {registros.map((r, i) => (
                    <li key={i}>
                      {r.nome} — {r.cargo} ({r.departamento})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL - Saídas Pendentes por Dia */}
      {modalSaidas && (
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '20px', maxHeight: '80vh', overflowY: 'auto', borderRadius: '10px', width: '90%', maxWidth: '800px' }}>
            <h3>📤 Saídas Pendentes por Dia</h3>
            <button onClick={() => setModalSaidas(false)} style={{ float: 'right' }}>Fechar</button>
            {Object.entries(dadosSaidasPendentes).map(([dia, registros]) => (
              <div key={dia} style={{ marginTop: '1rem' }}>
                <h4>📅 {dia}</h4>
                <ul>
                  {registros.map((r, i) => (
                    <li key={i}>
                      {r.nome} — {r.cargo} ({r.departamento})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroPagamento;
