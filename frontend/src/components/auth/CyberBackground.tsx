import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const CyberBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 18;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const count = 350;
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 35;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
            velocities[i] = 0.02 + Math.random() * 0.04;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.08,
            color: 0xef233c,
            transparent: true,
            opacity: 0.55,
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);

        let reqId: number;
        const animate = () => {
            reqId = requestAnimationFrame(animate);

            const pos = geo.attributes.position as THREE.BufferAttribute;
            for (let i = 0; i < count; i++) {
                let z = pos.getZ(i);
                z += velocities[i];
                if (z > 15) z = -15;
                pos.setZ(i, z);
            }
            pos.needsUpdate = true;
            points.rotation.z += 0.0006;

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(reqId);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
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
    );
};