import React, { useRef } from 'react';
import axios from 'axios';

function AssinaturaMobile() {
  const canvasRef = useRef(null);
  const query = new URLSearchParams(window.location.search);
  const funcionarioId = query.get('id');
  const tipo = query.get('tipo') || 'entrada'; // fallback caso queira usar isso no futuro
  const API_URL = import.meta.env.VITE_API_URL;

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleMouseUp = async () => {
    const canvas = canvasRef.current;
    const assinaturaBase64 = canvas.toDataURL('image/png');

    try {
      const blob = await fetch(assinaturaBase64).then(res => res.blob());
      const formData = new FormData();
      formData.append('funcionario_id', funcionarioId);
      formData.append('tipo', tipo);
      formData.append('assinatura', new File([blob], 'assinatura.png', { type: 'image/png' }));

      await axios.post(`${import.meta.env.VITE_API_URL}/assinatura-mobile`, formData);
      alert('Assinatura enviada com sucesso!');
      window.close(); // fecha a aba no celular
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar assinatura.');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>📲 Assinatura por Dispositivo Móvel</h2>
      <p>Assine no quadro abaixo. Ao terminar, a assinatura será enviada automaticamente.</p>
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        style={{ border: '1px solid #ccc', touchAction: 'none' }}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onMouseDown={(e) => {
          const ctx = canvasRef.current.getContext('2d');
          ctx.beginPath();
          ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }}
        onMouseMove={(e) => {
          if (e.buttons !== 1) return;
          const ctx = canvasRef.current.getContext('2d');
          ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          ctx.stroke();
        }}
      />
      <br />
      <button onClick={clearCanvas} style={{ marginTop: 10 }}>Limpar</button>
    </div>
  );
}

export default AssinaturaMobile;
