import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Subir llave privada desde archivo .pem
  const handlePrivateKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content.includes('BEGIN PRIVATE KEY') || content.includes('BEGIN RSA PRIVATE KEY')) {
        onPrivateKeyChange(content);
        onSuccess(`Llave privada cargada con éxito desde ${file.name}`);
      } else {
        onError('El archivo no posee una cabecera estándar de llave privada RSA PEM.');
      }
    };
    reader.readAsText(file);
  };

  // Simulación de etapas visuales para el usuario
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSign = async () => {
    if (!pdfFile) return onError('Selecciona o arrastra el archivo PDF a firmar.');
    if (!privateKey) return onError('Carga tu Llave Privada RSA (.pem) para autorizar la firma.');
    if (!currentUser?.user?.id) return onError('Debes haber iniciado sesión con tu cuenta.');

    setLoading(true);
    setProgressStep(15);
    setProgressText('Leyendo archivo y calculando función resumen SHA-256...');

    try {
      await sleep(350);
      setProgressStep(40);
      setProgressText('Inyectando diccionario PAdES e incremental writer ISO 32000...');

      await sleep(350);
      setProgressStep(70);
      setProgressText('Cifrando resumen con llave privada RSA y empaquetando PKCS#7...');

      // Petición real al backend
      const res = await signPdfApi(pdfFile, privateKey, currentUser.user.id);

      setProgressStep(95);
      setProgressText('Estructurando PDF final y preparando descarga...');
      await sleep(300);

      // Descarga del PDF firmado
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

      setProgressStep(100);
      setProgressText('¡Firma completada con éxito!');
      await sleep(400);

      onSuccess(`¡Documento firmado exitosamente! Se descargó: Firmado_${pdfFile.name}`);
    } catch (err: any) {
      onError(err.message || 'Error durante el firmado');
    } finally {
      setLoading(false);
      setProgressStep(0);
      setProgressText('');
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 50, position: 'relative' }}>
      {/* MODAL DE PROGRESO / SPINNER ANIMADO */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(5, 7, 10, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#0d1117',
            border: '1px solid #1f293d',
            borderRadius: 12,
            padding: '36px 32px',
            width: '90%',
            maxWidth: 460,
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239, 35, 60, 0.15)'
          }}>
            {/* Spinner circular con degradado */}
            <div style={{
              width: 56,
              height: 56,
              margin: '0 auto 20px auto',
              border: '3px solid rgba(239, 35, 60, 0.15)',
              borderTopColor: '#ef233c',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />

            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: '#f8fafc', fontWeight: 800 }}>
              ESTAMPANDO FIRMA DIGITAL
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', minHeight: 32 }}>
              {progressText}
            </p>

            {/* Barra de progreso */}
            <div style={{
              width: '100%',
              height: 6,
              background: '#161b26',
              borderRadius: 3,
              overflow: 'hidden',
              marginBottom: 10
            }}>
              <div style={{
                width: `${progressStep}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ef233c, #38bdf8)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
              <span>PROCESANDO ARTEFACTO CRIPTOGRÁFICO</span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>{progressStep}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animación de rotación */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h2 style={{ margin: 0, fontStyle: 'italic', fontWeight: 900, fontSize: '30px', letterSpacing: '1px' }}>
            <span style={{ color: '#ffffff' }}>MÓDULO DE </span>
            <span style={{ color: '#ef233c' }}>FIRMADO DIGITAL</span>
          </h2>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px', color: '#64748b', marginTop: 4 }}>
            ESTÁNDAR PAdES-BES / PKCS#7 · SHA-256 CON RSA-2048
          </div>
        </div>

        <span style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#38bdf8',
          background: '#0d1017',
          padding: '6px 14px',
          borderRadius: 6,
          border: '1px solid #1c2230'
        }}>
          ● ADOBE READER COMPATIBLE
        </span>
      </div>

      {/* Tarjeta de Formulario */}
      <div style={{
        background: 'rgba(11, 13, 19, 0.95)',
        border: '1px solid #1c2230',
        borderRadius: 10,
        padding: 32,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Paso 1: Carga de PDF */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ef4444', letterSpacing: '1px', display: 'block', marginBottom: 10 }}>
            01. DOCUMENTO ORIGINAL (PDF)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files?.[0]) setPdfFile(e.dataTransfer.files[0]);
            }}
            onClick={() => document.getElementById('pdf-file-sign')?.click()}
            style={{
              border: isDragOver ? '1px dashed #ef4444' : '1px dashed #26334a',
              background: isDragOver ? 'rgba(239, 35, 60, 0.08)' : '#07080c',
              borderRadius: 6,
              padding: '28px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: pdfFile ? '#f8fafc' : '#94a3b8' }}>
              {pdfFile ? pdfFile.name : 'ARRASTRA EL ARCHIVO PDF AQUÍ O HAZ CLIC PARA SELECCIONAR'}
            </div>
            {pdfFile ? (
              <div style={{ fontSize: '11px', color: '#22c55e', marginTop: 6, fontFamily: 'monospace' }}>
                ✓ Documento cargado ({(pdfFile.size / 1024).toFixed(1)} KB)
              </div>
            ) : (
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: 4, fontFamily: 'monospace' }}>
                Formato admitido: Documento PDF legible
              </div>
            )}
            <input
              id="pdf-file-sign"
              type="file"
              accept="application/pdf"
              onChange={e => setPdfFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Paso 2: Llave Privada */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ef4444', letterSpacing: '1px' }}>
              02. LLAVE PRIVADA DEL FIRMANTE (.PEM)
            </label>
            <label style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>
              📂 Subir archivo .pem
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
            placeholder="Pega tu llave privada PEM o cárgala con el botón superior..."
            style={{
              width: '100%',
              background: '#07080c',
              border: privateKey ? '1px solid #166534' : '1px solid #1c2230',
              color: '#f8fafc',
              padding: '12px',
              borderRadius: 6,
              fontFamily: 'monospace',
              fontSize: 11,
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.5
            }}
          />
          {privateKey ? (
            <div style={{ fontSize: '11px', color: '#22c55e', marginTop: 6, fontFamily: 'monospace' }}>
              ● Llave privada vinculada y lista para autorizar la firma.
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: 6, fontFamily: 'monospace' }}>
              ○ Falta llave privada. Cárgala o genérala en la pestaña <strong>"Mis Llaves"</strong>.
            </div>
          )}
        </div>

        {/* Resumen de Certificación */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid #1c2230',
          borderRadius: 6,
          padding: 16,
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          fontSize: '11px',
          fontFamily: 'monospace'
        }}>
          <div>
            <span style={{ color: '#64748b' }}>FIRMANTE:</span>{' '}
            <strong style={{ color: '#f8fafc' }}>{currentUser?.perfil?.nombre || 'Usuario Autenticado'}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>CRIPTOSISTEMA:</span>{' '}
            <strong style={{ color: '#38bdf8' }}>RSA 2048-bit + SHA-256</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>ESTÁNDAR:</span>{' '}
            <strong style={{ color: '#22c55e' }}>PAdES-BES / PKCS#7</strong>
          </div>
        </div>

        {/* Botón de Ejecución */}
        <button
          onClick={handleSign}
          disabled={loading || !pdfFile || !privateKey}
          style={{
            width: '100%',
            padding: '15px',
            background: (!pdfFile || !privateKey) ? '#1e2430' : '#ef233c',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '1px',
            cursor: (!pdfFile || !privateKey || loading) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: (!pdfFile || !privateKey) ? 'none' : '0 0 25px rgba(239, 35, 60, 0.45)',
            transition: 'all 0.2s'
          }}
        >
          ⚡ EJECUTAR FIRMADO DIGITAL Y DESCARGAR &gt;
        </button>
      </div>
    </div>
  );
};