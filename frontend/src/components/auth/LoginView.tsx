import React, { useState } from 'react';
import { loginApi } from '../../lib/api';

interface LoginViewProps {
    onSwitchToRegister: () => void;
    onSuccess: (userData: any, mensaje: string) => void;
    onError: (mensaje: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToRegister, onSuccess, onError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginApi(email, password);
            const userData = { user: res.user, perfil: res.perfil };
            onSuccess(userData, `Acceso autorizado. Sesión iniciada: ${res.perfil?.nombre || res.user.email}`);
        } catch (err: any) {
            onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '430px',
            background: 'rgba(11, 13, 19, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #1c2230',
            borderRadius: '8px',
            padding: '38px 32px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 35, 60, 0.08)'
        }}>
            {/* Encabezado */}
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
                <h2 style={{ margin: '0 0 6px 0', fontStyle: 'italic', fontWeight: 900, fontSize: '24px', letterSpacing: '1px' }}>
                    <span style={{ color: '#ffffff' }}>PORTAL DE </span>
                    <span style={{ color: '#ef233c' }}>ACCESO</span>
                </h2>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '2px', color: '#64748b' }}>
                    AUTENTICACIÓN EN EL MOTOR CRIPTOGRÁFICO
                </div>

                {/* Escáner biométrico circular central */}
                <div style={{
                    margin: '22px auto 0 auto',
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    border: '1px dashed #ef233c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(239, 35, 60, 0.05)',
                }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ef233c 0%, #991b1b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 0 15px rgba(239, 35, 60, 0.6)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <label style={{ display: 'block', fontSize: '10px', fontFamily: 'monospace', color: '#64748b', letterSpacing: '1px', marginBottom: 6 }}>
                        CORREO ELECTRÓNICO (TERMINAL ID)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        </span>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="usuario@upds.edu.bo"
                            style={{
                                width: '100%',
                                background: '#07080c',
                                border: '1px solid #1c2230',
                                color: '#f8fafc',
                                padding: '11px 14px 11px 36px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                outline: 'none',
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '10px', fontFamily: 'monospace', color: '#64748b', letterSpacing: '1px', marginBottom: 6 }}>
                        CONTRASEÑA DE ACCESO
                    </label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="7.5" cy="15.5" r="5.5" />
                                <path d="m21 2-9.6 9.6" />
                                <path d="m15.5 7.5 3 3L22 7l-3-3" />
                            </svg>
                        </span>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            style={{
                                width: '100%',
                                background: '#07080c',
                                border: '1px solid #1c2230',
                                color: '#f8fafc',
                                padding: '11px 40px 11px 36px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                outline: 'none',
                            }}
                        />
                        {/* Botón Ver / Ocultar Contraseña */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: 9,
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
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                    <line x1="2" x2="22" y1="2" y2="22" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            style={{ accentColor: '#ef233c' }}
                        />
                        MANTENER SESIÓN
                    </label>
                    <span
                        onClick={onSwitchToRegister}
                        style={{ color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        ¿NUEVA IDENTIDAD?
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: 4,
                        padding: '13px',
                        background: '#ef233c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '13px',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(239, 35, 60, 0.45)',
                    }}
                >
                    {loading ? 'AUTENTICANDO...' : 'AUTORIZAR ACCESO >'}
                </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: '9px', fontFamily: 'monospace', color: '#475569', letterSpacing: '1px' }}>
                ESTADO: <span style={{ color: '#22c55e' }}>CONEXIÓN CIFRADA</span> // UPDS LAB
            </div>
        </div>
    );
};