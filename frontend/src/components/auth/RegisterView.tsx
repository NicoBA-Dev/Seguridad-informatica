import React, { useState } from 'react';
import { registerApi, loginApi } from '../../lib/api';

interface RegisterViewProps {
    onSwitchToLogin: () => void;
    onSuccess: (userData: any, mensaje: string) => void;
    onError: (mensaje: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onSwitchToLogin, onSuccess, onError }) => {
    const [nombre, setNombre] = useState('');
    const [ci, setCi] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Crear la cuenta en Supabase
            await registerApi(email, password, nombre, ci);

            // 2. Iniciar sesión automáticamente de inmediato
            const loginRes = await loginApi(email, password);
            const userData = { user: loginRes.user, perfil: loginRes.perfil };

            // 3. Notificar y dar la bienvenida al usuario
            onSuccess(
                userData,
                `¡Identidad creada e inicializada con éxito! Bienvenido, ${loginRes.perfil?.nombre || email}`
            );
        } catch (err: any) {
            onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 6) s += 30;
        if (password.length >= 10) s += 30;
        if (/[A-Z]/.test(password)) s += 20;
        if (/[0-9]/.test(password)) s += 20;
        return Math.min(s, 100);
    };

    return (
        <div style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '820px',
            background: 'rgba(11, 13, 19, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #1c2230',
            borderRadius: '8px',
            padding: '36px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 35, 60, 0.08)'
        }}>
            {/* Pasos */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ margin: '0 0 12px 0', fontStyle: 'italic', fontWeight: 900, fontSize: '24px', letterSpacing: '1px' }}>
                    <span style={{ color: '#ffffff' }}>INICIALIZAR </span>
                    <span style={{ color: '#ef233c' }}>IDENTIDAD</span>
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontSize: '11px', fontFamily: 'monospace' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef233c' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#ef233c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>01</span>
                        <span>DATOS DEL FIRMANTE</span>
                    </div>
                    <div style={{ width: 25, height: 1, background: '#334155' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#1e2433', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>02</span>
                        <span>PERFIL CRIPTOGRÁFICO</span>
                    </div>
                    <div style={{ width: 25, height: 1, background: '#334155' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#1e2433', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>03</span>
                        <span>SUPABASE RLS</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, marginBottom: 28 }}>

                    {/* Columna 1: Credenciales Reales */}
                    <div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ef4444', letterSpacing: '1px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, background: '#ef4444' }} />
                            CREDENCIALES DE REGISTRO
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', display: 'block', marginBottom: 4 }}>
                                    NOMBRE COMPLETO
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej. Juan Pérez Ramos"
                                    style={{ width: '100%', background: '#07080c', border: '1px solid #1c2230', color: '#f8fafc', padding: '10px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', display: 'block', marginBottom: 4 }}>
                                    CÉDULA DE IDENTIDAD (C.I.)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={ci}
                                    onChange={e => setCi(e.target.value)}
                                    placeholder="Ej. 8472912 LP"
                                    style={{ width: '100%', background: '#07080c', border: '1px solid #1c2230', color: '#f8fafc', padding: '10px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', display: 'block', marginBottom: 4 }}>
                                    CORREO ELECTRÓNICO (TERMINAL ID)
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="usuario@upds.edu.bo"
                                    style={{ width: '100%', background: '#07080c', border: '1px solid #1c2230', color: '#f8fafc', padding: '10px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', display: 'block', marginBottom: 4 }}>
                                    CONTRASEÑA MAESTRA
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        style={{ width: '100%', background: '#07080c', border: '1px solid #1c2230', color: '#f8fafc', padding: '10px 38px 10px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, outline: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: 8,
                                            background: 'transparent',
                                            border: 'none',
                                            color: showPassword ? '#ef4444' : '#64748b',
                                            cursor: 'pointer',
                                            padding: 4,
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    >
                                        {showPassword ? (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                                <line x1="2" x2="22" y1="2" y2="22" />
                                            </svg>
                                        ) : (
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <div style={{ height: 3, background: '#1c2230', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${getPasswordStrength()}%`,
                                        background: getPasswordStrength() > 60 ? '#22c55e' : getPasswordStrength() > 30 ? '#f59e0b' : '#ef4444',
                                        transition: 'all 0.3s ease'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna 2: Parámetros Criptográficos */}
                    <div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ef4444', letterSpacing: '1px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, background: '#ef4444' }} />
                            PARÁMETROS CRIPTOGRÁFICOS ASIGNADOS
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ padding: '12px 14px', borderRadius: '6px', border: '1px solid #1c2230', background: '#07080c', display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ color: '#ef4444' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 800, color: '#f8fafc' }}>
                                        ALGORITMO ASIMÉTRICO (RSA-2048)
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        Par de claves asimétricas para garantizar autenticidad y no repudio.
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '12px 14px', borderRadius: '6px', border: '1px solid #1c2230', background: '#07080c', display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ color: '#ef4444' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 800, color: '#f8fafc' }}>
                                        INTEGRIDAD CON SHA-256
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        Resumen criptográfico único para detectar cualquier alteración en el PDF.
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '12px 14px', borderRadius: '6px', border: '1px solid #1c2230', background: '#07080c', display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ color: '#ef4444' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect width="20" height="8" x="2" y="2" rx="2" />
                                        <rect width="20" height="8" x="2" y="14" rx="2" />
                                        <line x1="6" x2="6.01" y1="6" y2="6" />
                                        <line x1="6" x2="6.01" y1="18" y2="18" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 800, color: '#f8fafc' }}>
                                        CUSTODIA PÚBLICA (.PEM)
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        Tu llave pública se sincronizará con Supabase para validaciones externas.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1c2230', paddingTop: 18 }}>
                    <span
                        onClick={onSwitchToLogin}
                        style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', cursor: 'pointer' }}
                    >
                        ← VOLVER AL PORTAL DE ACCESO
                    </span>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 28px',
                            background: '#ef233c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '12px',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            boxShadow: '0 0 20px rgba(239, 35, 60, 0.45)'
                        }}
                    >
                        {loading ? 'INICIALIZANDO...' : 'COMPLETAR REGISTRO >'}
                    </button>
                </div>
            </form>
        </div>
    );
};