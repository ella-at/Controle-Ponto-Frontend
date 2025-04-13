import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // <-- ADICIONADO

function PainelVerificacao() {
  const [entradas, setEntradas] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [erro, setErro] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    try {
      const resEntradas = await axios.get(`${API_URL}/pontos/hoje`);
      const resFaltantes = await axios.get(`${API_URL}/pontos/faltantes`);
      setEntradas(resEntradas.data);
      setFaltantes(resFaltantes.data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar dados.');
    }
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/pontos/hoje`)
      .then((res) => setRegistros(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Função para exportar Excel
  const exportarExcel = () => {
    const dados = registros.map((r) => ({
      Nome: r.Funcionario?.nome,
      Cargo: r.Funcionario?.cargo,
      Departamento: r.Funcionario?.departamento,
      Tipo: r.tipo,
      DataHora: new Date(r.data_hora).toLocaleString('pt-BR'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
    XLSX.writeFile(workbook, 'registros-ponto.xlsx');
  };




  return (
    
    <div>
      {/* BOTÃO DE EXPORTAÇÃO */}
      <button
      onClick={() => window.open(`${import.meta.env.VITE_API_URL}/pontos/exportar`, '_blank')}
      style={{ marginBottom: '1rem' }}
    >
      📁 Exportar para Excel
    </button>

      
      <h2>Entradas de Hoje</h2>
      {entradas.length === 0 ? (
        <p>Nenhuma entrada registrada ainda.</p>
      ) : (
        <ul>
          {entradas.map(p => (
            <li key={p.id} style={{ marginBottom: '1rem' }}>
              <strong>{p.Funcionario?.nome}</strong> - {new Date(p.data_hora).toLocaleTimeString()}
              <br />
              {p.foto && (
                <img src={`${API_URL}/${p.foto}`} alt="foto" width="100" />
              )}
              {p.assinatura && (
                <img src={`${API_URL}/${p.assinatura}`} alt="assinatura" width="100" />
              )}
            </li>
          ))}
        </ul>
      )}

      <h2>Faltando registrar entrada</h2>
      {faltantes.length === 0 ? (
        <p>Todos já registraram entrada 🎉</p>
      ) : (
        <ul>
          {faltantes.map(f => (
            <li key={f.id}>{f.nome}</li>
          ))}
        </ul>
      )}

      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default PainelVerificacao;
