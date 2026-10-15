import React, { useState } from 'react';
import { verifyPdfApi } from '../lib/api';

interface VerifyViewProps {
    onError: (mensaje: string) => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({ onError }) => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [resultado, setResultado] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [progressStep, setProgressStep] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [copiedHash, setCopiedHash] = useState(false);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleVerify = async () => {
        if (!pdfFile) return onError('Seleccione o arrastre un documento PDF firmado para iniciar la auditoría.');

        setLoading(true);
        setResultado(null);
        setProgressStep(25);
        setProgressText('Leyendo flujo de bytes y calculando función resumen SHA-256...');

        try {
            await sleep(350);
            setProgressStep(55);
            setProgressText('Analizando diccionario /ByteRange y contenedor PAdES / PKCS#7...');

            await sleep(350);
            setProgressStep(85);
            setProgressText('Cotejando identidad del firmante y llave pública en Supabase...');

            const res = await verifyPdfApi(pdfFile);

            setProgressStep(100);
            setProgressText('Auditoría criptográfica completada.');
            await sleep(300);

            setResultado(res);
        } catch (err: any) {
            onError(err.message || 'Error durante la verificación del documento');
        } finally {
            setLoading(false);
            setProgressStep(0);
            setProgressText('');
        }
    };

    const copiarHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
    };

    return (
        <div style={{ maxWidth: 940, margin: '0 auto', paddingBottom: 50, position: 'relative' }}>
            {/* MODAL DE PROGRESO / SPINNER DE AUDITORÍA */}
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
                        maxWidth: 480,
                        textAlign: 'center',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.15)'
                    }}>
                        <div style={{
                            width: 54,
                            height: 54,
                            margin: '0 auto 20px auto',
                            border: '3px solid rgba(56, 189, 248, 0.15)',
                            borderTopColor: '#38bdf8',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }} />

                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#f8fafc', fontWeight: 800, letterSpacing: '0.5px' }}>
                            EJECUTANDO AUDITORÍA FORENSE
                        </h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', minHeight: 32 }}>
                            {progressText}
                        </p>

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
                                background: 'linear-gradient(90deg, #38bdf8, #22c55e)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
                            <span>PROTOCOLO DE INTEGRIDAD</span>
                            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{progressStep}%</span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* Encabezado */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ margin: '0 0 6px 0', fontStyle: 'italic', fontWeight: 900, fontSize: '28px', letterSpacing: '1px' }}>
                    <span style={{ color: '#ffffff' }}>VALIDADOR DE </span>
                    <span style={{ color: '#ef233c' }}>INTEGRIDAD</span>
                </h2>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', color: '#64748b' }}>
                    AUDITORÍA FORENSE CRIPTOGRÁFICA · ESTÁNDAR PAdES / PKCS#7
                </div>
            </div>

            {/* Tarjeta Principal de Carga */}
            <div style={{
                background: 'rgba(11, 13, 19, 0.95)',
                border: '1px solid #1c2230',
                borderRadius: 8,
                padding: 32,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', letterSpacing: '1px', marginBottom: 12 }}>
                    ARTEFACTO DE ENTRADA (DOCUMENTO DIGITAL)
                </div>

                {/* Zona de Arrastre / Selección de PDF */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files?.[0]) setPdfFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => document.getElementById('pdf-verify-input')?.click()}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isDragOver ? '1px dashed #38bdf8' : '1px dashed #2a3449',
                        borderRadius: 6,
                        padding: '34px 20px',
                        background: isDragOver ? 'rgba(56, 189, 248, 0.05)' : '#07080c',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {/* Icono de escudo de validación */}
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8',
                        marginBottom: 12
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                    </div>

                    <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 800, color: pdfFile ? '#f8fafc' : '#94a3b8', letterSpacing: '0.5px' }}>
                        {pdfFile ? pdfFile.name : 'ARRASTRA EL DOCUMENTO FIRMADO (PDF)'}
                    </div>
                    <div style={{ fontSize: '10px', color: pdfFile ? '#22c55e' : '#64748b', marginTop: 4, fontFamily: 'monospace' }}>
                        {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB listos para inspección` : 'FORMATO ADMITIDO: ARCHIVO PDF CON CONTENEDOR DE FIRMA'}
                    </div>

                    <input
                        id="pdf-verify-input"
                        type="file"
                        accept="application/pdf"
                        onChange={e => setPdfFile(e.target.files?.[0] || null)}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Botón de Ejecutar Verificación */}
                <button
                    onClick={handleVerify}
                    disabled={loading || !pdfFile}
                    style={{
                        width: '100%',
                        marginTop: 20,
                        padding: '14px',
                        background: (!pdfFile || loading) ? '#1e2430' : '#ef233c',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '12px',
                        letterSpacing: '1px',
                        cursor: (!pdfFile || loading) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: (!pdfFile || loading) ? 'none' : '0 0 20px rgba(239, 35, 60, 0.45)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" x2="16.65" y1="21" y2="16.65" />
                    </svg>
                    {loading ? 'AUDITANDO ESTRUCTURA CRIPTOGRÁFICA...' : 'EJECUTAR SECUENCIA DE VERIFICACIÓN >'}
                </button>
            </div>

            {/* Banner de Resultado */}
            {resultado && (
                <div style={{
                    marginTop: 24,
                    background: resultado.valido ? 'rgba(6, 20, 14, 0.95)' : 'rgba(25, 10, 12, 0.95)',
                    border: `1px solid ${resultado.valido ? '#166534' : '#991b1b'}`,
                    borderLeft: `4px solid ${resultado.valido ? '#22c55e' : '#ef4444'}`,
                    borderRadius: 6,
                    padding: '22px 24px',
                    boxShadow: resultado.valido ? '0 0 25px rgba(34, 197, 94, 0.15)' : '0 0 25px rgba(239, 68, 68, 0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: resultado.valido ? '#22c55e' : '#ef4444',
                                color: '#06070a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {resultado.valido ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <line x1="18" x2="6" y1="6" y2="18" />
                                        <line x1="6" x2="18" y1="6" y2="18" />
                                    </svg>
                                )}
                            </div>
                            <span style={{
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                color: resultado.valido ? '#22c55e' : '#ef4444',
                                letterSpacing: '1px'
                            }}>
                                {resultado.valido ? 'FIRMA DIGITAL VERIFICADA // INTEGRIDAD VÁLIDA' : 'VERIFICACIÓN FALLIDA // DOCUMENTO ALTERADO'}
                            </span>
                        </div>

                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>
                            {resultado.fechaFirma || 'AUDITORÍA CONCLUIDA'}
                        </span>
                    </div>

                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {resultado.mensaje}
                    </p>

                    {resultado.valido && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                            gap: 12,
                            background: 'rgba(0, 0, 0, 0.45)',
                            padding: 16,
                            borderRadius: 6,
                            border: '1px solid #1c2230',
                            fontSize: '11px',
                            fontFamily: 'monospace'
                        }}>
                            <div>
                                <span style={{ color: '#64748b' }}>FIRMANTE:</span>{' '}
                                <strong style={{ color: '#f8fafc' }}>{resultado.firmante?.nombre}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>DOCUMENTO / C.I.:</span>{' '}
                                <strong style={{ color: '#f8fafc' }}>{resultado.firmante?.ci || 'N/A'}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>CORREO:</span>{' '}
                                <strong style={{ color: '#38bdf8' }}>{resultado.firmante?.email}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b' }}>ESTÁNDAR:</span>{' '}
                                <strong style={{ color: '#22c55e' }}>PAdES-BES (PKCS#7)</strong>
                            </div>

                            {/* Hash SHA-256 con opción de copia */}
                            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #1f293d', paddingTop: 12, marginTop: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ color: '#64748b' }}>HASH SHA-256 AUDITADO:</span>
                                    <button
                                        type="button"
                                        onClick={() => copiarHash(resultado.hashSha256)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #26334a',
                                            color: copiedHash ? '#22c55e' : '#94a3b8',
                                            padding: '3px 8px',
                                            borderRadius: 4,
                                            fontSize: '10px',
                                            fontFamily: 'monospace',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {copiedHash ? '✓ COPIADO' : 'COPIAR HASH'}
                                    </button>
                                </div>
                                <code style={{ color: '#22c55e', fontSize: '11px', wordBreak: 'break-all', display: 'block' }}>
                                    {resultado.hashSha256}
                                </code>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};