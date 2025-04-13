import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CadastroFuncionario() {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [funcionarios, setFuncionarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const buscarFuncionarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/funcionarios`);
      setFuncionarios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  const limparFormulario = () => {
    setNome('');
    setCargo('');
    setDepartamento('');
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome) {
      setMensagem('Nome é obrigatório');
      return;
    }

    try {
      if (editandoId) {
        // Atualizar funcionário
        await axios.put(`${API_URL}/funcionarios/${editandoId}`, {
          nome,
          cargo,
          departamento,
        });
        setMensagem('Funcionário atualizado com sucesso!');
      } else {
        // Criar novo funcionário
        await axios.post(`${API_URL}/funcionarios`, {
          nome,
          cargo,
          departamento,
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

  const iniciarEdicao = (funcionario) => {
    setNome(funcionario.nome);
    setCargo(funcionario.cargo);
    setDepartamento(funcionario.departamento);
    setEditandoId(funcionario.id);
  };

  const excluirFuncionario = async (id) => {
    if (confirm('Deseja realmente excluir este funcionário?')) {
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

  return (
    <div>
      <h2>{editandoId ? 'Editar Funcionário' : 'Cadastro de Funcionário'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required />

        <br />

        <label>Cargo:</label>
        <input value={cargo} onChange={(e) => setCargo(e.target.value)} />

        <br />


        <label>Departamento:</label>
        <input value={departamento} onChange={(e) => setDepartamento(e.target.value)} />

        <br />
        <button type="submit">{editandoId ? 'Atualizar' : 'Cadastrar'}</button>
        {editandoId && <button onClick={limparFormulario} style={{ marginLeft: '10px' }}>Cancelar</button>}
      </form>

      {mensagem && (
        <p style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>
      )}

      <hr />

      <h3>Funcionários Cadastrados</h3>
      <ul>
        {funcionarios.map((f) => (
          <li key={f.id}>
            <strong>{f.nome}</strong> – {f.cargo} ({f.departamento})
            <br />
            <button onClick={() => iniciarEdicao(f)}>✏️ Editar</button>
            <button onClick={() => excluirFuncionario(f.id)} style={{ marginLeft: '10px' }}>
              🗑️ Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CadastroFuncionario;
