import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CadastroFuncionario() {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [funcao, setFuncao] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [funcionarios, setFuncionarios] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome) {
      setMensagem('Nome é obrigatório');
      return;
    }

    try {
      await axios.post(`${API_URL}/funcionarios`, {
        nome,
        cargo,
        funcao,
        departamento
      });

      setMensagem('Funcionário cadastrado com sucesso!');
      setNome('');
      setCargo('');
      setFuncao('');
      setDepartamento('');
      buscarFuncionarios();
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao cadastrar funcionário.');
    }
  };

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

  return (
    <div>
      <h2>Cadastro de Funcionário</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required />

        <br />

        <label>Cargo:</label>
        <input value={cargo} onChange={(e) => setCargo(e.target.value)} />

        <br />

        <label>Função:</label>
        <input value={funcao} onChange={(e) => setFuncao(e.target.value)} />

        <br />

        <label>Departamento:</label>
        <input value={departamento} onChange={(e) => setDepartamento(e.target.value)} />

        <br />
        <button type="submit">Cadastrar</button>
      </form>

      {mensagem && <p style={{ color: mensagem.includes('sucesso') ? 'green' : 'red' }}>{mensagem}</p>}

      <hr />

      <h3>Funcionários Cadastrados</h3>
      <ul>
        {funcionarios.map((f) => (
          <li key={f.id}>
            {f.nome} – {f.cargo} ({f.departamento})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CadastroFuncionario;
