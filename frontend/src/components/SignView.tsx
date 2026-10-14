import React, { useState, useRef } from 'react';
import { signPdfApi } from '../lib/api';

interface SignViewProps {
  currentUser: any;
  privateKey: string;
  onPrivateKeyChange: (key: string) => void;
  onError: (mensaje: string) => void;
  onSuccess: (mensaje: string) => void;
}

export const SignView: React.FC<SignViewProps> = ({
  currentUser,
  privateKey,
  onPrivateKeyChange,
  onError,
  onSuccess,
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [strokeColor, setStrokeColor] = useState('#ef233c');
  const [lineWidth, setLineWidth] = useState(3);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = strokeColor;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Subir llave privada directamente desde archivo
  const handlePrivateKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content.includes('BEGIN PRIVATE KEY') || content.includes('BEGIN RSA PRIVATE KEY')) {
        onPrivateKeyChange(content);
        onSuccess(`Llave privada cargada desde ${file.name}`);
      } else {
        onError('El archivo no tiene el formato estándar de llave privada PEM.');
      }
    };
    reader.readAsText(file);
  };

  const handleSign = async () => {
    if (!pdfFile) return onError('Selecciona el archivo PDF del informe para firmar.');
    if (!privateKey) return onError('Sube tu Llave Privada RSA (.pem) o genérala en la pestaña 1.');
    if (!currentUser?.user?.id) return onError('Debes haber iniciado sesión para estampar tu firma.');

    setLoading(true);
    try {
      const res = await signPdfApi(pdfFile, privateKey, currentUser.user.id);

      const byteCharacters = atob(res.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Firmado_${pdfFile.name}`;
      a.click();
      URL.revokeObjectURL(url);

      onSuccess(`¡Documento firmado con éxito! Se descargó Firmado_${pdfFile.name}`);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', paddingBottom: 40 }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontStyle: 'italic', fontWeight: 900, fontSize: '28px', letterSpacing: '1px' }}>
            <span style={{ color: '#ffffff' }}>ARQUITECTO DE </span>
            <span style={{ color: '#ef233c' }}>FIRMA</span>
          </h2>
          <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', color: '#64748b', marginTop: 4 }}>
            ESTAMPADO CRIPTOGRÁFICO &amp; NO REPUDIO
          </div>
        </div>

        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8', background: '#0d1017', padding: '4px 10px', borderRadius: 4, border: '1px solid #1c2230' }}>
          PAdES / PKCS#7 CERTIFICADO
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: 20 }}>
        {/* Panel Izquierdo: Configuración */}
        <div style={{
          background: 'rgba(11, 13, 19, 0.95)',
          border: '1px solid #1c2230',
          borderRadius: 8,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Carga de PDF */}
          <div>
            <label style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', display: 'block', marginBottom: 6 }}>
              DOCUMENTO A FIRMAR (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setPdfFile(e.target.files?.[0] || null)}
              style={{ fontSize: '12px', color: '#94a3b8', width: '100%' }}
            />
          </div>

          {/* Carga de Llave Privada con botón de archivo */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
                LLAVE PRIVADA (.PEM)
              </label>
              <label style={{ fontSize: '10px', fontFamily: 'monospace', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
                Subir .pem
                <input
                  type="file"
                  accept=".pem,.key,.txt"
                  onChange={handlePrivateKeyFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <textarea
              rows={4}
              value={privateKey}
              onChange={e => onPrivateKeyChange(e.target.value)}
              placeholder="Pega tu llave privada o cárgala con el botón de arriba"
              style={{
                width: '100%',
                background: '#07080c',
                border: '1px solid #1c2230',
                color: '#f8fafc',
                padding: '8px',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 10,
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Color del trazo */}
          <div>
            <label style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', display: 'block', marginBottom: 6 }}>
              COLOR DEL TRAZO VISUAL
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['#ef233c', '#ffffff', '#38bdf8'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setStrokeColor(c)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: c,
                    border: strokeColor === c ? '2px solid white' : '1px solid #334155',
                    cursor: 'pointer',
                    boxShadow: strokeColor === c ? `0 0 10px ${c}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Grosor */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace', color: '#64748b', marginBottom: 6 }}>
              <span>GROSOR DE TRAZO</span>
              <span style={{ color: '#ef4444' }}>{lineWidth}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={lineWidth}
              onChange={e => setLineWidth(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ef233c' }}
            />
          </div>
        </div>

        {/* Panel Derecho: Lienzo de Firma */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            position: 'relative',
            background: '#06070a',
            border: '1px solid #1c2230',
            borderRadius: 8,
            overflow: 'hidden',
            height: 380,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={380}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{ cursor: 'crosshair', width: '100%', height: '100%' }}
            />

            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 14,
              fontSize: '10px',
              fontFamily: 'monospace',
              color: '#475569',
              pointerEvents: 'none'
            }}>
              DIBUJA TU RÚBRICA SOBRE ESTE LIENZO CON EL RATÓN
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              onClick={clearCanvas}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #1c2230',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              LIMPIAR LIENZO
            </button>

            <button
              onClick={handleSign}
              disabled={loading || !pdfFile || !privateKey}
              style={{
                padding: '12px 30px',
                background: '#ef233c',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '12px',
                letterSpacing: '1px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 20px rgba(239, 35, 60, 0.45)'
              }}
            >
              {loading ? 'FIRMANDO...' : 'EJECUTAR FIRMADO DIGITAL >'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};