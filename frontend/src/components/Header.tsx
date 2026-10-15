import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

interface HeaderProps {
    currentUser: any;
    activeTab: string;
    onNavigate: (tab: 'home' | 'auth' | 'keys' | 'sign' | 'verify') => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, activeTab, onNavigate, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 28px',
                    background: 'rgba(10, 12, 16, 0.88)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #1c2230',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                {/* Logo e Identidad del Sistema */}
                <div
                    onClick={() => onNavigate('home')}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                >
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 6,
                            background: 'linear-gradient(135deg, #ef233c 0%, #881337 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 0 16px rgba(239, 35, 60, 0.45)',
                        }}
                    >
                        {/* Candado Criptográfico SVG */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px', color: '#ffffff' }}>
                            UPDS <span style={{ color: '#ef233c' }}>//</span> TRUST ENGINE
                        </div>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b', letterSpacing: '0.8px' }}>
                            CRIPTOANÁLISIS &amp; FIRMA DIGITAL PAdES
                        </div>
                    </div>
                </div>

                {/* Acciones de la Barra Superior */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Botón de Acceso Directo: Verificar Firma */}
                    <button
                        onClick={() => onNavigate('verify')}
                        style={{
                            padding: '8px 16px',
                            background: activeTab === 'verify' ? 'rgba(56, 189, 248, 0.15)' : '#0d131f',
                            border: `1px solid ${activeTab === 'verify' ? '#38bdf8' : '#1e3a5f'}`,
                            color: '#38bdf8',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                        <span>AUDITAR PDF</span>
                    </button>

                    {/* Si NO está autenticado: Botón Ingresar */}
                    {!currentUser ? (
                        <button
                            onClick={() => onNavigate('auth')}
                            style={{
                                padding: '8px 18px',
                                background: '#ef233c',
                                border: 'none',
                                color: 'white',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                letterSpacing: '0.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 0 15px rgba(239, 35, 60, 0.45)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>INGRESAR</span>
                        </button>
                    ) : (
                        /* Si SÍ está autenticado: Botón Hamburguesa que despliega el Sidebar */
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            style={{
                                padding: '7px 14px',
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid #1e293b',
                                color: '#f8fafc',
                                borderRadius: 6,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                transition: 'all 0.2s',
                            }}
                        >
                            <div
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    border: '1px solid #22c55e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#22c55e',
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: '#e2e8f0', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {currentUser.perfil?.nombre || currentUser.user?.email}
                            </span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" x2="20" y1="12" y2="12" />
                                <line x1="4" x2="20" y1="6" y2="6" />
                                <line x1="4" x2="20" y1="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
            </header>

            {/* Renderizado del Sidebar independiente */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentUser={currentUser}
                activeTab={activeTab}
                onNavigate={onNavigate}
                onLogout={onLogout}
            />
        </>
    );
};