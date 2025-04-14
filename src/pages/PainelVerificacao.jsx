import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function PainelVerificacao() {
  const [entradas, setEntradas] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [erro, setErro] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
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

        {entradas.length === 0 ? (
          <p style={{ color: '#888' }}>Nenhum registro neste dia.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {entradas.map((p) => (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  flex: '1 1 300px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <strong style={{ fontSize: '1.1rem' }}>{p.Funcionario?.nome}</strong>
                <p style={{ margin: '5px 0' }}>
                  ⏰ {new Date(p.data_hora).toLocaleTimeString()} — <strong>{p.tipo.toUpperCase()}</strong>
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {p.foto && (
                    <img 
                    src={`${API_URL}/${p.foto?.replace(/^\/?uploads/, 'uploads')}`}
                    alt="foto"
                    width="100"
                    style={{ borderRadius: '4px', objectFit: 'cover' }}
                    />
                  )}
                  {p.assinatura && (
                    <img
                    src={`${API_URL}/${p.assinatura?.replace(/^\/?uploads/, 'uploads')}`}
                    alt="assinatura"
                    width="100"
                    style={{ borderRadius: '4px', objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
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
