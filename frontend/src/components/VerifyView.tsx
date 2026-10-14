import React, { useState } from 'react';
import { verifyPdfApi } from '../lib/api';

interface VerifyViewProps {
    onError: (mensaje: string) => void;
}

export const VerifyView: React.FC<VerifyViewProps> = ({ onError }) => {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [resultado, setResultado] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!pdfFile) return onError('Por favor sube o arrastra un archivo PDF firmado para auditar.');

        setLoading(true);
        setResultado(null);
        try {
            const res = await verifyPdfApi(pdfFile);
            setResultado(res);
        } catch (err: any) {
            onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 940, margin: '0 auto', paddingBottom: 40 }}>
            {/* Encabezado */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ margin: '0 0 6px 0', fontStyle: 'italic', fontWeight: 900, fontSize: '28px', letterSpacing: '1px' }}>
                    <span style={{ color: '#ffffff' }}>VALIDADOR DE </span>
                    <span style={{ color: '#ef233c' }}>INTEGRIDAD</span>
                </h2>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', color: '#64748b' }}>
                    AUDITORÍA FORENSE CRIPTOGRÁFICA · VERIFICADOR UPDS
                </div>
            </div>

            {/* Tarjeta Principal de Carga (Captura 3) */}
            <div style={{
                background: 'rgba(11, 13, 19, 0.95)',
                border: '1px solid #1c2230',
                borderRadius: 8,
                padding: 36,
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
            }}>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', letterSpacing: '1px', marginBottom: 12 }}>
                    ARTEFACTO DE ENTRADA
                </div>

                {/* Zona de Arrastre / Selección de PDF */}
                <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed #2a3449',
                    borderRadius: 6,
                    padding: '38px 20px',
                    background: '#07080c',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                }}>
                    {/* Icono de nube con candado */}
                    <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(239, 35, 60, 0.1)',
                        border: '1px solid rgba(239, 35, 60, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444',
                        marginBottom: 12
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                            <path d="M12 12v9" />
                            <path d="m16 16-4-4-4 4" />
                        </svg>
                    </div>

                    <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px' }}>
                        {pdfFile ? pdfFile.name : 'ARRASTRA EL DOCUMENTO CIFRADO (PDF)'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: 4, fontFamily: 'monospace' }}>
                        {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : 'FORMATO ADMITIDO: PDF CON SELLO CRIPTOGRÁFICO'}
                    </div>

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => setPdfFile(e.target.files?.[0] || null)}
                        style={{ display: 'none' }}
                    />
                </label>

                {/* Botón de Ejecutar Verificación */}
                <button
                    onClick={handleVerify}
                    disabled={loading || !pdfFile}
                    style={{
                        width: '100%',
                        marginTop: 20,
                        padding: '14px',
                        background: '#ef233c',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '12px',
                        letterSpacing: '1.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 0 20px rgba(239, 35, 60, 0.45)',
                        opacity: (!pdfFile || loading) ? 0.6 : 1
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" x2="16.65" y1="21" y2="16.65" />
                    </svg>
                    {loading ? 'ANALIZANDO BYTES Y METADATOS...' : 'EJECUTAR SECUENCIA DE VERIFICACIÓN >'}
                </button>
            </div>

            {/* Banner Verde Neón de Resultado (Igual a la Captura 3) */}
            {resultado && (
                <div style={{
                    marginTop: 24,
                    background: resultado.valido ? 'rgba(6, 20, 14, 0.95)' : 'rgba(25, 10, 12, 0.95)',
                    border: `1px solid ${resultado.valido ? '#166534' : '#991b1b'}`,
                    borderLeft: `4px solid ${resultado.valido ? '#22c55e' : '#ef4444'}`,
                    borderRadius: 6,
                    padding: '20px 24px',
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
                            {resultado.fechaFirma || 'AUDITORÍA FINALIZADA'}
                        </span>
                    </div>

                    <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#94a3b8' }}>
                        {resultado.mensaje}
                    </p>

                    {resultado.valido && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 12,
                            background: 'rgba(0, 0, 0, 0.4)',
                            padding: 14,
                            borderRadius: 4,
                            fontSize: '12px',
                            fontFamily: 'monospace'
                        }}>
                            <div><span style={{ color: '#64748b' }}>FIRMANTE:</span> <strong style={{ color: '#f8fafc' }}>{resultado.firmante?.nombre}</strong></div>
                            <div><span style={{ color: '#64748b' }}>C.I.:</span> <strong style={{ color: '#f8fafc' }}>{resultado.firmante?.ci}</strong></div>
                            <div><span style={{ color: '#64748b' }}>CORREO:</span> <strong style={{ color: '#38bdf8' }}>{resultado.firmante?.email}</strong></div>
                            <div style={{ gridColumn: '1 / -1', wordBreak: 'break-all' }}>
                                <span style={{ color: '#64748b' }}>HASH SHA-256 AUDITADO:</span> <code style={{ color: '#22c55e' }}>{resultado.hashSha256}</code>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};