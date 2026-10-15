import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VerifyView } from './VerifyView';

interface HeroLandingProps {
    onStart: () => void;
    onVerify?: () => void;
    onError?: (mensaje: string) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
    onStart,
    onError = () => { }
}) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const verifySectionRef = useRef<HTMLDivElement>(null);

    // Desplazamiento suave hacia el validador integrado
    const scrollToVerify = () => {
        if (verifySectionRef.current) {
            verifySectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
        camera.position.set(0, 4, 11);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);

        // Malla Ondulatoria Digital (Cyber Matrix Floor)
        const gridCols = 55;
        const gridRows = 45;
        const planeGeo = new THREE.PlaneGeometry(36, 26, gridCols, gridRows);
        planeGeo.rotateX(-Math.PI / 2.3);
        planeGeo.translate(0, -2.8, 0);

        const count = planeGeo.attributes.position.count;
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            if (i % 2 === 0) {
                colors[i * 3] = 0.93;
                colors[i * 3 + 1] = 0.14;
                colors[i * 3 + 2] = 0.24;
            } else {
                colors[i * 3] = 0.08;
                colors[i * 3 + 1] = 0.65;
                colors[i * 3 + 2] = 0.92;
            }
        }
        planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const pointsMat = new THREE.PointsMaterial({
            size: 0.07,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
        });

        const gridMesh = new THREE.Points(planeGeo, pointsMat);
        scene.add(gridMesh);

        // Partículas de datos flotantes
        const dustCount = 350;
        const dustPos = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount * 3; i++) {
            dustPos[i] = (Math.random() - 0.5) * 25;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            size: 0.04,
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
        });
        const dustMesh = new THREE.Points(dustGeo, dustMat);
        scene.add(dustMesh);

        const originalPositions = planeGeo.attributes.position.clone();

        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
        };
        window.addEventListener('mousemove', handleMouseMove);

        let reqId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            const pos = planeGeo.attributes.position;
            for (let i = 0; i < count; i++) {
                const u = originalPositions.getX(i);
                const v = originalPositions.getY(i);
                const wave = Math.sin(u * 0.4 + time * 1.5) * Math.cos(v * 0.4 + time * 1.2) * 0.6;
                pos.setZ(i, originalPositions.getZ(i) + wave);
            }
            pos.needsUpdate = true;

            dustMesh.rotation.y = time * 0.02;

            camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04;
            camera.position.y += (-mouseY * 0.8 + 4 - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!currentMount) return;
            const w = currentMount.clientWidth;
            const h = currentMount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(reqId);
            renderer.dispose();
            if (currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {/* -------------------------------------------------------------
                SECCIÓN HERO: PORTADA Y ACCIONES PRINCIPALES
               ------------------------------------------------------------- */}
            <div style={{
                position: 'relative',
                minHeight: 'calc(100vh - 75px)',
                background: 'radial-gradient(circle at 50% 30%, #0d111a 0%, #06070a 80%)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 20px',
            }}>
                {/* Canvas 3D de fondo */}
                <div
                    ref={mountRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        pointerEvents: 'none',
                    }}
                />

                {/* Capa de contraste translúcida */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(ellipse at center, rgba(6,7,10,0.5) 0%, rgba(6,7,10,0.85) 75%)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }} />

                {/* Contenido Central */}
                <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', maxWidth: 880 }}>
                    {/* Badge superior de estado */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(239, 35, 60, 0.1)',
                        border: '1px solid rgba(239, 35, 60, 0.3)',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        letterSpacing: '1.5px',
                        color: '#ef4444',
                        marginBottom: 20,
                        fontWeight: 700
                    }}>
                        <span style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: '#ef4444',
                            boxShadow: '0 0 8px #ef4444'
                        }} />
                        SISTEMA EN LÍNEA // ENTORNO CRIPTOGRÁFICO ACTIVO
                    </div>

                    {/* Título formal en español */}
                    <h1 style={{
                        fontSize: 'clamp(36px, 5.5vw, 64px)',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        letterSpacing: '-1.5px',
                        lineHeight: 1.08,
                        margin: '0 0 16px 0',
                        textTransform: 'uppercase',
                    }}>
                        <span style={{ color: '#ffffff', textShadow: '0 0 25px rgba(255,255,255,0.2)' }}>
                            MOTOR CRIPTOGRÁFICO
                        </span>
                        <br />
                        <span style={{
                            color: '#ef233c',
                            textShadow: '0 0 35px rgba(239, 35, 60, 0.65)'
                        }}>
                            DE CONFIANZA DIGITAL
                        </span>
                    </h1>

                    {/* Subtítulo institucional */}
                    <p style={{
                        color: '#94a3b8',
                        fontSize: 'clamp(15px, 2vw, 17px)',
                        maxWidth: 680,
                        margin: '0 auto 36px auto',
                        lineHeight: 1.6,
                    }}>
                        Garantizando la autenticidad, integridad y el no repudio de documentos electrónicos.
                        Plataforma de firmado compatible con el estándar <strong>PAdES / PKCS#7</strong>, algoritmos <strong>RSA-2048</strong> y resumen <strong>SHA-256</strong>.
                    </p>

                    {/* Botones de Acción */}
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={onStart}
                            style={{
                                padding: '15px 34px',
                                background: '#ef233c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                boxShadow: '0 0 25px rgba(239, 35, 60, 0.55)',
                                transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="12" x2="12" y1="18" y2="12" />
                                <line x1="9" x2="15" y1="15" y2="15" />
                            </svg>
                            <span>INICIALIZAR FIRMADO DIGITAL &gt;</span>
                        </button>

                        <button
                            onClick={scrollToVerify}
                            style={{
                                padding: '15px 28px',
                                background: '#0d131f',
                                color: '#38bdf8',
                                border: '1px solid #1e3a5f',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                                e.currentTarget.style.borderColor = '#38bdf8';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = '#0d131f';
                                e.currentTarget.style.borderColor = '#1e3a5f';
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

                {/* Tarjetas Informativas Inferiores */}
                <div style={{
                    position: 'relative',
                    zIndex: 3,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    width: '100%',
                    maxWidth: '880px',
                    marginTop: '55px'
                }}>
                    <div style={{
                        background: 'rgba(15, 18, 25, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #1e2433',
                        borderLeft: '3px solid #ef233c',
                        padding: '16px 20px',
                        borderRadius: '6px'
                    }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>CRIPTOSISTEMA ASIMÉTRICO</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
                            2048 <span style={{ fontSize: '12px', color: '#ef4444' }}>BITS</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Par de llaves RSA en formato PEM</div>
                    </div>

                    <div style={{
                        background: 'rgba(15, 18, 25, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #1e2433',
                        borderLeft: '3px solid #38bdf8',
                        padding: '16px 20px',
                        borderRadius: '6px'
                    }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>FUNCIÓN RESUMEN UNIDIRECCIONAL</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', margin: '4px 0' }}>SHA-256</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Resistencia estricta a colisiones</div>
                    </div>

                    <div style={{
                        background: 'rgba(15, 18, 25, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #1e2433',
                        borderLeft: '3px solid #22c55e',
                        padding: '16px 20px',
                        borderRadius: '6px'
                    }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>REPOSITORIO DE CLAVES</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e', margin: '4px 0' }}>SUPABASE</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Seguridad RLS y custodia pública</div>
                    </div>
                </div>
            </div>

            {/* -------------------------------------------------------------
                SECCIÓN DE AUDITORÍA INTEGRADA DIRECTAMENTE EN EL HOME
               ------------------------------------------------------------- */}
            <div
                ref={verifySectionRef}
                style={{
                    position: 'relative',
                    zIndex: 4,
                    padding: '60px 24px 80px 24px',
                    background: '#06070a',
                    borderTop: '1px solid #1c2230',
                }}
            >
                <div style={{ maxWidth: 880, margin: '0 auto 30px auto', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '5px 12px',
                        borderRadius: 16,
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#38bdf8',
                        marginBottom: 12
                    }}>
                        VERIFICACIÓN EN LÍNEA DISPONIBLE AL PÚBLICO
                    </div>
                    <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px 0' }}>
                        Auditoría Forense y Validación de Integridad
                    </h2>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                        Cualquier receptor o autoridad puede auditar la autenticidad del documento sin necesidad de iniciar sesión.
                    </p>
                </div>

                {/* Render del componente de validación */}
                <VerifyView onError={onError} />
            </div>
        </div>
    );
};