import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CadastroFuncionario() {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [pix, setPix] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [funcionarios, setFuncionarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [funcionarioInfo, setFuncionarioInfo] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  const buscarFuncionarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/funcionarios`);
      setFuncionarios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const limparFormulario = () => {
    setNome('');
    setCargo('');
    setDepartamento('');
    setPix('');
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome) return setMensagem('Nome é obrigatório');

    try {
      if (editandoId) {
        await axios.put(`${API_URL}/funcionarios/${editandoId}`, {
          nome, cargo, departamento, pix
        });
        setMensagem('Funcionário atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/funcionarios`, {
          nome, cargo, departamento, pix
        });
        setMensagem('Funcionário cadastrado com sucesso!');
      }

      limparFormulario();
      buscarFuncionarios();
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao salvar funcionário.');
    }
  };

  const iniciarEdicao = (f) => {
    setNome(f.nome);
    setCargo(f.cargo);
    setDepartamento(f.departamento);
    setPix(f.pix || '');
    setEditandoId(f.id);
  };

  const excluirFuncionario = async (id) => {
    if (confirm('Deseja excluir este funcionário?')) {
      try {
        await axios.delete(`${API_URL}/funcionarios/${id}`);
        setMensagem('Funcionário excluído com sucesso!');
        buscarFuncionarios();
        if (editandoId === id) limparFormulario();
      } catch (err) {
        console.error(err);
        setMensagem('Erro ao excluir funcionário.');
      }
    }
  };

  const abrirModalInfo = async (funcionario) => {
    setFuncionarioInfo(funcionario);
    setMostrarInfo(true);

    try {
      const [resPontos, resPagamentos] = await Promise.all([
        axios.get(`${API_URL}/pontos/funcionario/${funcionario.id}`),
        axios.get(`${API_URL}/pagamentos/funcionario/${funcionario.id}`)
      ]);

      setRegistros(resPontos.data);
      setPagamentos(resPagamentos.data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {editandoId ? 'Editar Funcionário' : 'Cadastro de Funcionário'}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <input style={styles.input} placeholder="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        <input style={styles.input} placeholder="Departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
        <input style={styles.input} placeholder="PIX" value={pix} onChange={(e) => setPix(e.target.value)} />
        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.button}>
            {editandoId ? 'Atualizar' : 'Cadastrar'}
          </button>
          {editandoId && (
            <button type="button" onClick={limparFormulario} style={styles.cancel}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {mensagem && (
        <p style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <h3>Funcionários Cadastrados</h3>
      <div style={styles.cardGrid}>
        {funcionarios.map((f) => (
          <div key={f.id} style={styles.card}>
            <h4>{f.nome}</h4>
            <p><strong>Cargo:</strong> {f.cargo}</p>
            <p><strong>Departamento:</strong> {f.departamento}</p>
            <p><strong>PIX:</strong> {f.pix || 'Não informado'}</p>
            <div style={styles.cardButtons}>
              <button onClick={() => iniciarEdicao(f)} style={styles.buttonSmall}>✏️ Editar</button>
              <button onClick={() => excluirFuncionario(f.id)} style={styles.deleteButton}>🗑️ Excluir</button>
              <button onClick={() => abrirModalInfo(f)} style={styles.infoButton}>ℹ️ Informações</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Informações */}
      {mostrarInfo && funcionarioInfo && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>📋 Informações de {funcionarioInfo.nome}</h3>
            <p><strong>Cargo:</strong> {funcionarioInfo.cargo}</p>
            <p><strong>Departamento:</strong> {funcionarioInfo.departamento}</p>
            <p><strong>PIX:</strong> {funcionarioInfo.pix || 'Não informado'}</p>

            <h4>🕒 Registros de Ponto</h4>
            <ul>
              {registros.map((r) => (
                <li key={r.id}>
                  [{r.tipo.toUpperCase()}] - {new Date(r.data_hora).toLocaleString()}
                </li>
              ))}
            </ul>

            <h4>💳 Pagamentos</h4>
            <ul>
              {pagamentos.map((p) => (
                <li key={p.id}>
                  Pagamento em {new Date(p.createdAt).toLocaleString()}
                  {p.comprovante && (
                    <> — <a href={p.comprovante} target="_blank" rel="noreferrer">📎 Ver comprovante</a></>
                  )}

                </li>
              ))}
            </ul>

            <button onClick={() => setMostrarInfo(false)} style={{ marginTop: '20px' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  title: { textAlign: 'center', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  input: { padding: '8px', fontSize: '14px' },
  buttonGroup: { display: 'flex', gap: '10px' },
  button: { backgroundColor: '#28a745', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer' },
  cancel: { backgroundColor: '#ccc', padding: '8px 16px', border: 'none' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' },
  card: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  cardButtons: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' },
  buttonSmall: { padding: '6px', fontSize: '14px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' },
  deleteButton: { padding: '6px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' },
  infoButton: { padding: '6px', backgroundColor: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: '2rem', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }
};

export default CadastroFuncionario;
