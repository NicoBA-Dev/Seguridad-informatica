import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroLandingProps {
    onStart: () => void;
    onVerify: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onStart, onVerify }) => {
    const mountRef = useRef<HTMLDivElement>(null);

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
        // Se ubica abajo para no tapar el título central
        const gridCols = 55;
        const gridRows = 45;
        const planeGeo = new THREE.PlaneGeometry(36, 26, gridCols, gridRows);
        planeGeo.rotateX(-Math.PI / 2.3);
        planeGeo.translate(0, -2.8, 0);

        // Material de puntos luminosos con gradiente cian y carmesí
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

        // Partículas de datos flotantes en el espacio superior
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

        // Posición original para calcular la oscilación ondulatoria
        const originalPositions = planeGeo.attributes.position.clone();

        // Movimiento con el ratón
        let mouseX = 0;
        let mouseY = 0;
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animación continua a 60 FPS
        let reqId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            const pos = planeGeo.attributes.position;
            for (let i = 0; i < count; i++) {
                const u = originalPositions.getX(i);
                const v = originalPositions.getY(i);
                // Función de onda senoidal suave (simula flujo de datos cifrados)
                const wave = Math.sin(u * 0.4 + time * 1.5) * Math.cos(v * 0.4 + time * 1.2) * 0.6;
                pos.setZ(i, originalPositions.getZ(i) + wave);
            }
            pos.needsUpdate = true;

            // Rotación suave del polvo espacial
            dustMesh.rotation.y = time * 0.02;

            // Parallax con el mouse
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
        <div style={{
            position: 'relative',
            minHeight: 'calc(100vh - 80px)',
            background: 'radial-gradient(circle at 50% 30%, #0d111a 0%, #06070a 80%)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px',
        }}>
            {/* Canvas 3D de fondo (No bloquea clics ni texto) */}
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

            {/* Degradado para garantizar legibilidad del 100% en el texto */}
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
                {/* Badge superior */}
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
                    letterSpacing: '2px',
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
                    SYSTEM ONLINE // NETWORK ENCRYPTION: ACTIVE
                </div>

                {/* Título de gran impacto con tipografía limpia */}
                <h1 style={{
                    fontSize: 'clamp(38px, 6vw, 68px)',
                    fontWeight: 900,
                    fontStyle: 'italic',
                    letterSpacing: '-1.5px',
                    lineHeight: 1.05,
                    margin: '0 0 14px 0',
                    textTransform: 'uppercase',
                }}>
                    <span style={{ color: '#ffffff', textShadow: '0 0 25px rgba(255,255,255,0.2)' }}>
                        CRYPTOGRAPHIC
                    </span>
                    <br />
                    <span style={{
                        color: '#ef233c',
                        textShadow: '0 0 35px rgba(239, 35, 60, 0.65)'
                    }}>
                        TRUST ENGINE
                    </span>
                </h1>

                {/* Subtítulo nítido */}
                <p style={{
                    color: '#94a3b8',
                    fontSize: 'clamp(15px, 2vw, 17px)',
                    maxWidth: 640,
                    margin: '0 auto 36px auto',
                    lineHeight: 1.6,
                }}>
                    Redefiniendo la soberanía digital mediante firmas criptográficas inmutables.
                    Experimenta la autenticidad e integridad respaldadas por algoritmos <strong>RSA-2048</strong> y <strong>SHA-256</strong>.
                </p>

                {/* Botones de Acción */}
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={onStart}
                        style={{
                            padding: '16px 36px',
                            background: '#ef233c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 0 25px rgba(239, 35, 60, 0.55)',
                            transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        ⚡ INITIALIZE SIGNATURE &gt;
                    </button>

                    <button
                        onClick={onVerify}
                        style={{
                            padding: '16px 28px',
                            background: '#0d131f',
                            color: '#38bdf8',
                            border: '1px solid #1e3a5f',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
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
                        🔍 VERIFY INTEGRITY
                    </button>
                </div>
            </div>

            {/* Tarjetas Inferiores */}
            <div style={{
                position: 'relative',
                zIndex: 3,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                width: '100%',
                maxWidth: '880px',
                marginTop: '60px'
            }}>
                <div style={{
                    background: 'rgba(15, 18, 25, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #1e2433',
                    borderLeft: '3px solid #ef233c',
                    padding: '16px 20px',
                    borderRadius: '6px'
                }}>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>ALGORITMO ASIMÉTRICO</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
                        2048 <span style={{ fontSize: '12px', color: '#ef4444' }}>BITS</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Claves RSA PKCS#8 / SPKI (.PEM)</div>
                </div>

                <div style={{
                    background: 'rgba(15, 18, 25, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #1e2433',
                    borderLeft: '3px solid #ef233c',
                    padding: '16px 20px',
                    borderRadius: '6px'
                }}>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>FUNCION RESUMEN</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>SHA-256</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Integridad estricta y no colisión</div>
                </div>

                <div style={{
                    background: 'rgba(15, 18, 25, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #1e2433',
                    borderLeft: '3px solid #22c55e',
                    padding: '16px 20px',
                    borderRadius: '6px'
                }}>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>BASE DE DATOS</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e', margin: '4px 0' }}>SUPABASE</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Políticas RLS y Auth activo</div>
                </div>
            </div>
        </div>
    );
};