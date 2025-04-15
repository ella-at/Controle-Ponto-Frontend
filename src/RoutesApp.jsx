import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import RegistroPonto from './pages/RegistroPonto';
import RegistroPontoPage from './pages/RegistroPontoPage';
import RegistroPontoStandalone from './pages/RegistroPontoStandalone';
import PainelVerificacao from './pages/PainelVerificacao';
import CadastroFuncionario from './pages/CadastroFuncionario';
import RegistroPagamento from './pages/RegistroPagamento';
import AssinaturaMobile from './pages/AssinaturaMobile';

function RoutesApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><App /><RegistroPonto /></>} />
        <Route path="/registro-func" element={<><App /><RegistroPontoPage /></>} />
        <Route path="/painel" element={<><App /><PainelVerificacao /></>} />
        <Route path="/cadastro" element={<><App /><CadastroFuncionario /></>} />
        <Route path="/pagamento" element={<><App /><RegistroPagamento /></>} />
        <Route path="/assinatura-mobile" element={<AssinaturaMobile />} />

        {/* Página sem menu */}
        <Route path="/registro-funcionario" element={<RegistroPontoStandalone />} />
      </Routes>
    </Router>
  );
}

export default RoutesApp;
