import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// 3D Avatar Head Component
const AvatarHead = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
    const headRef = useRef<THREE.Group>(null);
    const eyeLeftRef = useRef<THREE.Mesh>(null);
    const eyeRightRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (headRef.current) {
            // Smooth head rotation following mouse
            headRef.current.rotation.y = THREE.MathUtils.lerp(
                headRef.current.rotation.y,
                mousePosition.x * 0.3,
                0.1
            );
            headRef.current.rotation.x = THREE.MathUtils.lerp(
                headRef.current.rotation.x,
                -mousePosition.y * 0.2,
                0.1
            );
        }

        // Eyes follow mouse more
        if (eyeLeftRef.current && eyeRightRef.current) {
            const eyeRotX = mousePosition.y * 0.15;
            const eyeRotY = mousePosition.x * 0.25;

            eyeLeftRef.current.rotation.x = eyeRotX;
            eyeLeftRef.current.rotation.y = eyeRotY;
            eyeRightRef.current.rotation.x = eyeRotX;
            eyeRightRef.current.rotation.y = eyeRotY;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={headRef} position={[0, 0.2, 0]}>
                {/* Main Head - Gradient sphere */}
                <Sphere args={[1, 64, 64]} position={[0, 0, 0]}>
                    <MeshDistortMaterial
                        color="#0066CC"
                        attach="material"
                        distort={0.1}
                        speed={2}
                        roughness={0.2}
                        metalness={0.3}
                    />
                </Sphere>

                {/* Face plate - lighter area */}
                <Sphere args={[0.85, 32, 32]} position={[0, 0, 0.3]}>
                    <meshPhysicalMaterial
                        color="#E2E8F0"
                        roughness={0.3}
                        metalness={0.1}
                    />
                </Sphere>

                {/* Left Eye Socket */}
                <group position={[-0.3, 0.15, 0.7]}>
                    <mesh>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <meshPhysicalMaterial color="#ffffff" roughness={0.1} />
                    </mesh>
                    {/* Iris */}
                    <mesh ref={eyeLeftRef} position={[0, 0, 0.1]}>
                        <sphereGeometry args={[0.12, 32, 32]} />
                        <meshPhysicalMaterial color="#0066CC" roughness={0.2} metalness={0.5} />
                    </mesh>
                    {/* Pupil */}
                    <mesh position={[0, 0, 0.15]}>
                        <sphereGeometry args={[0.06, 32, 32]} />
                        <meshBasicMaterial color="#1E293B" />
                    </mesh>
                    {/* Eye highlight */}
                    <mesh position={[0.04, 0.04, 0.18]}>
                        <sphereGeometry args={[0.025, 16, 16]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                </group>

                {/* Right Eye Socket */}
                <group position={[0.3, 0.15, 0.7]}>
                    <mesh>
                        <sphereGeometry args={[0.2, 32, 32]} />
                        <meshPhysicalMaterial color="#ffffff" roughness={0.1} />
                    </mesh>
                    {/* Iris */}
                    <mesh ref={eyeRightRef} position={[0, 0, 0.1]}>
                        <sphereGeometry args={[0.12, 32, 32]} />
                        <meshPhysicalMaterial color="#0066CC" roughness={0.2} metalness={0.5} />
                    </mesh>
                    {/* Pupil */}
                    <mesh position={[0, 0, 0.15]}>
                        <sphereGeometry args={[0.06, 32, 32]} />
                        <meshBasicMaterial color="#1E293B" />
                    </mesh>
                    {/* Eye highlight */}
                    <mesh position={[0.04, 0.04, 0.18]}>
                        <sphereGeometry args={[0.025, 16, 16]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                </group>

                {/* Smile */}
                <mesh position={[0, -0.25, 0.8]} rotation={[0.2, 0, 0]}>
                    <torusGeometry args={[0.15, 0.03, 16, 32, Math.PI]} />
                    <meshPhysicalMaterial color="#06B6D4" roughness={0.3} metalness={0.2} />
                </mesh>

                {/* Decorative ring around head */}
                <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 4, 0, 0]}>
                    <torusGeometry args={[0.6, 0.03, 16, 64]} />
                    <meshPhysicalMaterial
                        color="#06B6D4"
                        roughness={0.1}
                        metalness={0.8}
                        emissive="#06B6D4"
                        emissiveIntensity={0.3}
                    />
                </mesh>

                {/* Floating orbs around avatar */}
                <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
                    <mesh position={[1.2, 0.3, 0]}>
                        <sphereGeometry args={[0.1, 16, 16]} />
                        <meshPhysicalMaterial
                            color="#3B82F6"
                            roughness={0.1}
                            metalness={0.9}
                            emissive="#3B82F6"
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                </Float>

                <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.2}>
                    <mesh position={[-1.1, -0.2, 0.2]}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshPhysicalMaterial
                            color="#06B6D4"
                            roughness={0.1}
                            metalness={0.9}
                            emissive="#06B6D4"
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                </Float>

                <Float speed={3.5} rotationIntensity={0.3} floatIntensity={0.8}>
                    <mesh position={[0.8, -0.5, 0.3]}>
                        <sphereGeometry args={[0.06, 16, 16]} />
                        <meshPhysicalMaterial
                            color="#0066CC"
                            roughness={0.1}
                            metalness={0.9}
                            emissive="#0066CC"
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                </Float>
            </group>
        </Float>
    );
};

// Animated rings behind avatar
const BackgroundRings = () => {
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const ring3Ref = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.1;
        if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.15;
        if (ring3Ref.current) ring3Ref.current.rotation.z = t * 0.08;
    });

    return (
        <group position={[0, 0, -1]}>
            <mesh ref={ring1Ref}>
                <torusGeometry args={[2, 0.02, 16, 100]} />
                <meshBasicMaterial color="#0066CC" transparent opacity={0.3} />
            </mesh>
            <mesh ref={ring2Ref}>
                <torusGeometry args={[2.3, 0.015, 16, 100]} />
                <meshBasicMaterial color="#06B6D4" transparent opacity={0.2} />
            </mesh>
            <mesh ref={ring3Ref}>
                <torusGeometry args={[2.6, 0.01, 16, 100]} />
                <meshBasicMaterial color="#3B82F6" transparent opacity={0.15} />
            </mesh>
        </group>
    );
};

interface Avatar3DProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Avatar3D: React.FC<Avatar3DProps> = ({ className = '', size = 'md' }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const sizeClasses = {
        sm: 'w-32 h-32',
        md: 'w-48 h-48',
        lg: 'w-64 h-64'
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // Normalize to -1 to 1
                const x = (e.clientX - centerX) / (window.innerWidth / 2);
                const y = (e.clientY - centerY) / (window.innerHeight / 2);

                setMousePosition({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <motion.div
            ref={containerRef}
            className={`${sizeClasses[size]} ${className}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                damping: 15,
                stiffness: 100,
                delay: 0.2
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
                <pointLight position={[-5, 5, 5]} intensity={0.5} color="#0066CC" />
                <pointLight position={[5, -5, 5]} intensity={0.3} color="#06B6D4" />

                {/* Background Rings */}
                <BackgroundRings />

                {/* Main Avatar */}
                <AvatarHead mousePosition={mousePosition} />
            </Canvas>
        </motion.div>
    );
};

export default Avatar3D;
