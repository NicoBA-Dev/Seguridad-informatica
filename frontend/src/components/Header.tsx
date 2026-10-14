import React from 'react';

interface HeaderProps {
    currentUser: any;
    activeTab: string;
    onNavigate: (tab: 'home' | 'auth' | 'keys' | 'sign' | 'verify') => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, activeTab, onNavigate, onLogout }) => {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 28px',
            background: 'rgba(10, 12, 16, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #1e2433',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            {/* Logo / Nombre del Proyecto */}
            <div
                onClick={() => onNavigate('home')}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
                <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #ef233c 0%, #7f1d1d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    color: 'white',
                    fontSize: 16,
                    boxShadow: '0 0 15px rgba(239, 35, 60, 0.5)'
                }}>
                    🔒
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '1px', color: '#ffffff' }}>
                        UPDS <span style={{ color: '#ef233c' }}>//</span> TRUST ENGINE
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.5px' }}>
                        FIRMA DIGITAL &amp; VALIDACIÓN
                    </div>
                </div>
            </div>

            {/* Botones de Acción directos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Pestañas de trabajo solo si está autenticado */}
                {currentUser && (
                    <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
                        <button
                            onClick={() => onNavigate('keys')}
                            style={{
                                padding: '7px 14px',
                                borderRadius: 6,
                                border: activeTab === 'keys' ? '1px solid #0284c7' : '1px solid transparent',
                                background: activeTab === 'keys' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                                color: activeTab === 'keys' ? '#38bdf8' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 600
                            }}
                        >
                            🔑 Mis Llaves
                        </button>
                        <button
                            onClick={() => onNavigate('sign')}
                            style={{
                                padding: '7px 14px',
                                borderRadius: 6,
                                border: activeTab === 'sign' ? '1px solid #ef233c' : '1px solid transparent',
                                background: activeTab === 'sign' ? 'rgba(239, 35, 60, 0.2)' : 'transparent',
                                color: activeTab === 'sign' ? '#ef4444' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 600
                            }}
                        >
                            ✍️ Firmar PDF
                        </button>
                    </div>
                )}

                {/* Botón: Verificar Firma */}
                <button
                    onClick={() => onNavigate('verify')}
                    style={{
                        padding: '7px 16px',
                        background: activeTab === 'verify' ? 'rgba(56, 189, 248, 0.2)' : '#121620',
                        border: '1px solid #26334a',
                        color: '#38bdf8',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s'
                    }}
                >
                    🔍 Verificar Firma
                </button>

                {/* Botón: Login / Perfil */}
                {currentUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                            background: '#131b2a',
                            border: '1px solid #1e3a5f',
                            color: '#38bdf8',
                            padding: '6px 12px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600
                        }}>
                            👤 {currentUser.perfil?.nombre || currentUser.user?.email}
                        </span>
                        <button
                            onClick={onLogout}
                            style={{
                                padding: '6px 10px',
                                background: '#1e1b24',
                                border: '1px solid #3b2737',
                                color: '#f87171',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 12
                            }}
                        >
                            Salir
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => onNavigate('auth')}
                        style={{
                            padding: '7px 18px',
                            background: '#ef233c',
                            border: 'none',
                            color: 'white',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 0 15px rgba(239, 35, 60, 0.4)'
                        }}
                    >
                        <span>👤</span> Acceder / Registro
                    </button>
                )}
            </div>
        </header>
    );
};