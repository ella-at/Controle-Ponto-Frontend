import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function PainelVerificacao() {
  const [entradas, setEntradas] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [erro, setErro] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [visiveis, setVisiveis] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;

  const buscarDados = async () => {
    try {
      const resEntradas = await axios.get(`${API_URL}/pontos/por-data?data=${dataSelecionada}`);
      const resFaltantes = await axios.get(`${API_URL}/pontos/faltantes`);
      setEntradas(resEntradas.data);
      setFaltantes(resFaltantes.data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar dados.');
    }
  };

  useEffect(() => {
    buscarDados();
  }, [dataSelecionada]);

  // Agrupar registros por funcionário
  const registrosAgrupados = entradas.reduce((acc, ponto) => {
    const funcionarioId = ponto.Funcionario?.id;
    if (!acc[funcionarioId]) {
      acc[funcionarioId] = {
        funcionario: ponto.Funcionario,
        registros: []
      };
    }
    acc[funcionarioId].registros.push(ponto);
    return acc;
  }, {});

  const toggleVisivel = (id) => {
    setVisiveis((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '2rem' }}>📋 Painel de Verificação</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ marginRight: '10px' }}><strong>Selecionar Data:</strong></label>
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <button
          onClick={() => window.open(`${API_URL}/pontos/exportar`, '_blank')}
          style={{
            padding: '10px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📁 Exportar para Excel
        </button>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '8px' }}>✅ Registros do Dia</h3>

        {Object.keys(registrosAgrupados).length === 0 ? (
          <p style={{ color: '#888' }}>Nenhum registro neste dia.</p>
        ) : (
          Object.values(registrosAgrupados).map(({ funcionario, registros }) => {
            const isVisible = visiveis[funcionario.id];
            return (
              <div
                key={funcionario.id}
                style={{
                  marginBottom: '2rem',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.2rem' }}>{funcionario.nome}</strong>
                  <div>
                    <span style={{ marginRight: '10px' }}>🗂 {registros.length} registro(s)</span>
                    <button
                      onClick={() => toggleVisivel(funcionario.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #007bff',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        color: '#007bff',
                        cursor: 'pointer'
                      }}
                    >
                      {isVisible ? '🙈 Ocultar' : '👁 Mostrar'}
                    </button>
                  </div>
                </div>

                {isVisible && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
                    {registros.map((ponto) => (
                      <div
                        key={ponto.id}
                        style={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          padding: '10px',
                          width: '280px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <p style={{ margin: '5px 0' }}>
                          ⏰ {new Date(ponto.data_hora).toLocaleTimeString()} — <strong>{ponto.tipo.toUpperCase()}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {ponto.foto && (
                            <img src={ponto.foto} alt="foto" width="100" style={{ borderRadius: '4px' }} />
                          )}
                          {ponto.assinatura && (
                            <img src={ponto.assinatura} alt="assinatura" width="100" style={{ borderRadius: '4px' }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      <section>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '8px' }}>⚠️ Faltando registrar entrada</h3>
        {faltantes.length === 0 ? (
          <p style={{ color: 'green' }}>Todos registraram entrada neste dia 🎉</p>
        ) : (
          <ul style={{ paddingLeft: '20px' }}>
            {faltantes.map((f) => (
              <li key={f.id} style={{ padding: '4px 0' }}>{f.nome}</li>
            ))}
          </ul>
        )}
      </section>

      {erro && (
        <p style={{ color: 'red', marginTop: '1rem' }}>{erro}</p>
      )}
    </div>
  );
}

export default PainelVerificacao;
