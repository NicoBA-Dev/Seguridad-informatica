import React from 'react';
import Swal from 'sweetalert2';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    activeTab: string;
    onNavigate: (tab: 'home' | 'auth' | 'keys' | 'sign' | 'verify') => void;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    currentUser,
    activeTab,
    onNavigate,
    onLogout,
}) => {
    const handleNavigate = (tab: 'home' | 'auth' | 'keys' | 'sign' | 'verify') => {
        onNavigate(tab);
        onClose();
    };

    const handleConfirmLogout = () => {
        Swal.fire({
            title: '¿Finalizar Sesión Criptográfica?',
            text: 'Se cerrará la sesión actual en este terminal. Si tienes una llave privada cargada en memoria, se removerá por seguridad.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef233c',
            cancelButtonColor: '#1e2430',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Permanecer conectado',
            background: '#0d1117',
            color: '#f8fafc',
            iconColor: '#38bdf8',
            customClass: {
                popup: 'border border-[#1e2430] shadow-2xl'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                onLogout();
                onClose();
            }
        });
    };

    return (
        <>
            {/* FONDO OSCURO (BACKDROP OVERLAY) */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(3, 5, 8, 0.75)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 998,
                        transition: 'opacity 0.25s ease',
                    }}
                />
            )}

            {/* PANEL LATERAL RETRÁCTIL */}
            <aside
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '320px',
                    height: '100vh',
                    background: '#090c12',
                    borderLeft: '1px solid #1c2230',
                    boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.85)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* SECCIÓN SUPERIOR: PERFIL Y NAVEGACIÓN */}
                <div>
                    {/* Encabezado del Sidebar */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            borderBottom: '1px solid #161b26',
                            paddingBottom: 14,
                        }}
                    >
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '1.5px', color: '#64748b' }}>
                            CONSOLA CRIPTOGRÁFICA
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: 4,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            title="Cerrar panel"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Tarjeta de Identidad Criptográfica Activa */}
                    {currentUser && (
                        <div
                            style={{
                                background: '#0d1117',
                                border: '1px solid #1c2230',
                                borderRadius: 8,
                                padding: 16,
                                marginBottom: 24,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: '#22c55e',
                                        boxShadow: '0 0 8px #22c55e',
                                    }}
                                />
                                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#22c55e', fontWeight: 800 }}>
                                    IDENTIDAD AUTORIZADA
                                </span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', wordBreak: 'break-word' }}>
                                {currentUser.perfil?.nombre || 'Usuario'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: 3 }}>
                                DOC. ID: {currentUser.perfil?.ci || 'N/A'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', marginTop: 3, wordBreak: 'break-all' }}>
                                {currentUser.user?.email}
                            </div>
                        </div>
                    )}

                    {/* Menú de Opciones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569', letterSpacing: '1px', marginBottom: 4 }}>
                            MÓDULOS DE SEGURIDAD
                        </div>

                        {/* Opción 1: Inicio */}
                        <button
                            onClick={() => handleNavigate('home')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '11px 14px',
                                background: activeTab === 'home' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeTab === 'home' ? '#334155' : 'transparent',
                                borderRadius: 6,
                                color: activeTab === 'home' ? '#ffffff' : '#94a3b8',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span>INICIO // DESCRIPCIÓN</span>
                        </button>

                        {/* Opción 2: Gestión de Llaves */}
                        <button
                            onClick={() => handleNavigate('keys')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '11px 14px',
                                background: activeTab === 'keys' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeTab === 'keys' ? '#0284c7' : 'transparent',
                                borderRadius: 6,
                                color: activeTab === 'keys' ? '#38bdf8' : '#94a3b8',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="7.5" cy="15.5" r="5.5" />
                                <path d="m21 2-9.6 9.6" />
                                <path d="m15.5 7.5 3 3L22 7l-3-3" />
                            </svg>
                            <span>GESTIÓN DE LLAVES RSA</span>
                        </button>

                        {/* Opción 3: Firmar PDF */}
                        <button
                            onClick={() => handleNavigate('sign')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '11px 14px',
                                background: activeTab === 'sign' ? 'rgba(239, 35, 60, 0.12)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeTab === 'sign' ? '#ef233c' : 'transparent',
                                borderRadius: 6,
                                color: activeTab === 'sign' ? '#ef4444' : '#94a3b8',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" x2="12" y1="18" y2="12" />
                                <line x1="9" x2="15" y1="15" y2="15" />
                            </svg>
                            <span>FIRMADO DIGITAL PAdES</span>
                        </button>

                        {/* Opción 4: Auditoría de Integridad */}
                        <button
                            onClick={() => handleNavigate('verify')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '11px 14px',
                                background: activeTab === 'verify' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeTab === 'verify' ? '#38bdf8' : 'transparent',
                                borderRadius: 6,
                                color: activeTab === 'verify' ? '#38bdf8' : '#94a3b8',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            <span>AUDITAR INTEGRIDAD</span>
                        </button>
                    </div>
                </div>

                {/* SECCIÓN INFERIOR: CIERRE DE SESIÓN CON CONFIRMACIÓN */}
                <div style={{ borderTop: '1px solid #161b26', paddingTop: 18 }}>
                    <button
                        type="button"
                        onClick={handleConfirmLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            padding: '11px',
                            background: 'rgba(239, 35, 60, 0.08)',
                            border: '1px solid #ef233c',
                            borderRadius: 6,
                            color: '#ef4444',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            cursor: 'pointer',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s',
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        <span>CERRAR SESIÓN</span>
                    </button>
                    <div style={{ textAlign: 'center', fontSize: '9px', fontFamily: 'monospace', color: '#475569', marginTop: 12 }}>
                        UPDS // SEGURIDAD DE LA INFORMACIÓN
                    </div>
                </div>
            </aside>
        </>
    );
};