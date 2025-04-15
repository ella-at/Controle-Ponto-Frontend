import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AssinaturaMobile from './pages/AssinaturaMobile';
import './index.css';
import RegistroPontoStandalone from './pages/RegistroPontoStandalone';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/assinatura-mobile" element={<AssinaturaMobile />} />
        <Route path="/registro-funcionario" element={<RegistroPontoStandalone />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
