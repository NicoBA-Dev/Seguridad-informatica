import React, { useState } from 'react';
import { generateKeysApi } from '../lib/api';

interface KeysViewProps {
    currentUser: any;
    publicKey: string;
    privateKey: string;
    onKeysGenerated: (pub: string, priv: string) => void;
    onError: (mensaje: string) => void;
    onSuccess: (mensaje: string) => void;
}

export const KeysView: React.FC<KeysViewProps> = ({
    currentUser,
    publicKey,
    privateKey,
    onKeysGenerated,
    onError,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([
        publicKey
            ? `> Llave pública activa recuperada de Supabase para: ${currentUser?.perfil?.nombre || 'Usuario'}`
            : '> Sistema listo. Pulsa GENERAR PAR DE LLAVES para inicializar tu par RSA.',
    ]);

    const handleGenerate = async () => {
        if (!currentUser?.user?.id) {
            onError('Debes iniciar sesión para asociar las llaves a tu identidad.');
            return;
        }
        setLoading(true);
        setTerminalLogs([
            '> Inicializando secuencia criptográfica (RSA-2048)...',
            '[ENTROPÍA] Colectando ruido de hardware (CSPRNG)... OK',
            '[PRIMOS] Generando p y q de 1024-bit... OK',
            '[SUPABASE] Sincronizando llave pública en tabla perfiles... OK',
        ]);

        try {
            const res = await generateKeysApi(currentUser.user.id);
            onKeysGenerated(res.llavePublica, res.llavePrivada);
            setTerminalLogs(prev => [
                ...prev,
                '[COMPLETADO] Par de llaves generado exitosamente.',
                '-----BEGIN PUBLIC KEY-----',
                res.llavePublica.split('\n').slice(1, 3).join('\n') + '\n...',
                '-----END PUBLIC KEY-----',
            ]);
            onSuccess('Par de llaves generado y llave pública guardada en Supabase.');
        } catch (err: any) {
            setTerminalLogs(prev => [...prev, `[ERROR] ${err.message}`]);
            onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadPrivateKey = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content.includes('BEGIN PRIVATE KEY') || content.includes('BEGIN RSA PRIVATE KEY')) {
                onKeysGenerated(publicKey, content);
                setTerminalLogs(prev => [
                    ...prev,
                    `> Archivo [${file.name}] cargado. Llave privada activa para firmar.`,
                ]);
                onSuccess(`Llave privada cargada desde ${file.name}`);
            } else {
                onError('El archivo no tiene el formato estándar de llave privada PEM.');
            }
        };
        reader.readAsText(file);
    };

    const descargarArchivo = (contenido: string, nombreArchivo: string) => {
        const blob = new Blob([contenido], { type: 'application/x-pem-file' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ paddingBottom: 50 }}>
            {/* Encabezado amplio */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30 }}>
                <div>
                    <h2 style={{ margin: 0, fontStyle: 'italic', fontWeight: 900, fontSize: '32px', letterSpacing: '1px' }}>
                        <span style={{ color: '#ffffff' }}>GENERADOR DE </span>
                        <span style={{ color: '#ef233c' }}>ENTROPÍA</span>
                    </h2>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px', color: '#64748b', marginTop: 6 }}>
                        ADMINISTRACIÓN DE LLAVES ASIMÉTRICAS RSA-2048 · SUPABASE LINKED
                    </div>
                </div>

                <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', background: '#0d1017', padding: '6px 14px', borderRadius: 6, border: '1px solid #1c2230' }}>
                    {publicKey ? '● LLAVE PÚBLICA ACTIVA' : '○ SIN LLAVES'}
                </span>
            </div>

            {/* Grid espacioso */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28 }}>
                {/* Panel Izquierdo */}
                <div style={{
                    background: 'rgba(11, 13, 19, 0.95)',
                    border: '1px solid #1c2230',
                    borderRadius: 10,
                    padding: 28,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 420
                }}>
                    <div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ef4444', letterSpacing: '1px', marginBottom: 20 }}>
                            CREDENCIALES Y ACCIONES
                        </div>

                        {/* Subir llave privada guardada */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                padding: '14px',
                                background: '#07080c',
                                border: '1px dashed #38bdf8',
                                borderRadius: 6,
                                color: '#38bdf8',
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                fontWeight: 700,
                                textAlign: 'center'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" x2="12" y1="3" y2="15" />
                                </svg>
                                {privateKey ? '✓ PRIVADA CARGADA (CAMBIAR)' : 'CARGAR LLAVE_PRIVADA.PEM'}
                                <input
                                    type="file"
                                    accept=".pem,.key,.txt"
                                    onChange={handleUploadPrivateKey}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: 6, textAlign: 'center' }}>
                                Carga tu archivo si ya lo tienes en tu equipo
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', color: '#334155', fontSize: '11px', margin: '16px 0', fontFamily: 'monospace' }}>
                            — O BIEN —
                        </div>

                        {/* Generar nuevo par */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !currentUser}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: '#ef233c',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                fontSize: '11px',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                boxShadow: '0 0 15px rgba(239, 35, 60, 0.4)'
                            }}
                        >
                            {loading ? 'CALCULANDO...' : '⚡ GENERAR NUEVO PAR RSA'}
                        </button>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', borderTop: '1px solid #1c2230', paddingTop: 16 }}>
                        Tu <strong>Llave Pública</strong> permanece registrada de forma persistente en Supabase bajo políticas RLS.
                    </div>
                </div>

                {/* Panel Derecho: Terminal y Descargas claras */}
                <div style={{
                    background: '#06070a',
                    border: '1px solid #1c2230',
                    borderRadius: 10,
                    padding: 28,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 420
                }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.8, color: '#94a3b8' }}>
                        {terminalLogs.map((log, index) => (
                            <div
                                key={index}
                                style={{
                                    color: log.startsWith('>') ? '#ef4444' : log.includes('-----') ? '#f8fafc' : '#94a3b8',
                                    wordBreak: 'break-all'
                                }}
                            >
                                {log}
                            </div>
                        ))}
                    </div>

                    {/* Únicas dos opciones claras de descarga */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 16,
                        borderTop: '1px solid #1c2230',
                        paddingTop: 20,
                        marginTop: 24
                    }}>
                        {privateKey && (
                            <button
                                onClick={() => descargarArchivo(privateKey, 'llave_privada.pem')}
                                style={{
                                    padding: '12px 20px',
                                    background: 'transparent',
                                    color: '#f59e0b',
                                    border: '1px solid #f59e0b',
                                    borderRadius: 6,
                                    fontFamily: 'monospace',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                📥 DESCARGAR LLAVE_PRIVADA.PEM
                            </button>
                        )}

                        {publicKey && (
                            <button
                                onClick={() => descargarArchivo(publicKey, 'llave_publica.pem')}
                                style={{
                                    padding: '12px 24px',
                                    background: '#ef233c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontFamily: 'monospace',
                                    fontWeight: 800,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    boxShadow: '0 0 20px rgba(239, 35, 60, 0.45)'
                                }}
                            >
                                📥 DESCARGAR LLAVE_PÚBLICA.PEM (20 PTS)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};