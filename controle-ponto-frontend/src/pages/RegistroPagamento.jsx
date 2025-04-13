import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RegistroPagamento() {
  const [pontos, setPontos] = useState([]);
  const [pagamentos, setPagamentos] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [comprovantes, setComprovantes] = useState({});
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().slice(0, 10));

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    carregarPontos();
  }, []);

  const carregarPontos = async () => {
    try {
      const dataFormatada = new Date(dataSelecionada).toISOString().split('T')[0];
      const res = await axios.get(`${API_URL}/pontos/por-data?data=${dataFormatada}`);
      const listaPontos = res.data;
      setPontos(listaPontos);

      const pagamentosMap = {};
      for (const ponto of listaPontos) {
        const resPag = await axios.get(`${API_URL}/pagamentos/funcionario/${ponto.funcionario_id}`);
        const pago = resPag.data.find(p => p.ponto_id === ponto.id);
        if (pago) {
          pagamentosMap[ponto.id] = pago;
        }
      }
      setPagamentos(pagamentosMap);
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao carregar dados');
    }
  };

  const handleUpload = async (ponto) => {
    const file = comprovantes[ponto.id];
    if (!file) {
      setMensagem('Selecione um comprovante antes de enviar.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('funcionario_id', ponto.funcionario_id);
      formData.append('ponto_id', ponto.id);
      formData.append('comprovante', file);

      await axios.post(`${API_URL}/pagamentos`, formData);
      setMensagem('Pagamento registrado com sucesso!');
      carregarPontos();
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

      {/* Filtro por data */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <label style={{ marginRight: '10px' }}>Data:</label>
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          style={{ padding: '6px', marginRight: '10px' }}
        />
        <button onClick={carregarPontos} style={{ padding: '6px 12px' }}>🔍 Buscar</button>
      </div>

      {/* Listagem dos funcionários com ponto */}
      {pontos.map((ponto) => {
        const funcionario = ponto.Funcionario;
        const pagamento = pagamentos[ponto.id];

        return (
          <div key={ponto.id} style={{
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginBottom: '1rem',
            background: '#f9f9f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <strong>{funcionario?.nome}</strong><br />
            Registro: {new Date(ponto.data_hora).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short'
            })}<br />
            Status: {pagamento ? '✅ Pago' : '❌ Pendente'}

            {pagamento?.comprovante && (
              <>
                <br />
                <a
                  href={`${API_URL}/${pagamento.comprovante}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📎 Ver Comprovante
                </a>
              </>
            )}

            {!pagamento && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileChange(ponto.id, e.target.files[0])}
                />
                <button
                  onClick={() => handleUpload(ponto)}
                  style={{ marginLeft: '10px' }}
                >
                  Registrar Pagamento
                </button>
              </div>
            )}
          </div>
        );
      })}

      {mensagem && (
        <p style={{ marginTop: '1rem', color: mensagem.includes('sucesso') ? 'green' : 'red' }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}

export default RegistroPagamento;
