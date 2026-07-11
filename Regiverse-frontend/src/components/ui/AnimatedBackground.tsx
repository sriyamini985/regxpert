import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

// Glass-like Sphere with smooth floating animation
const GlassSphere = ({ position, scale, speed = 1, color }: {
  position: [number, number, number],
  scale: number,
  speed?: number,
  color: string
}) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const time = useRef(Math.random() * 100);

  useFrame((_, delta: number) => {
    if (mesh.current) {
      time.current += delta * speed;
      // Smooth sine-wave floating motion
      mesh.current.position.y = position[1] + Math.sin(time.current * 0.5) * 0.3;
      mesh.current.position.x = position[0] + Math.sin(time.current * 0.3) * 0.2;
      mesh.current.rotation.x += delta * 0.1;
      mesh.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={mesh} args={[1, 32, 32]} position={position} scale={scale}>
        <meshPhysicalMaterial
          color={color}
          transmission={0.9}
          thickness={0.5}
          roughness={0}
          metalness={0.1}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </Float>
  );
};

// Morphing Gradient Blob
const MorphingBlob = ({ position, scale, color }: {
  position: [number, number, number],
  scale: number,
  color: string
}) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const time = useRef(Math.random() * 100);

  useFrame((_, delta: number) => {
    if (mesh.current) {
      time.current += delta;
      // Slow rotation for organic feel
      mesh.current.rotation.x = Math.sin(time.current * 0.2) * 0.3;
      mesh.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <Sphere ref={mesh} args={[1, 64, 64]} position={position} scale={scale}>
      <MeshDistortMaterial
        color={color}
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.1}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
};

// Floating Particles
const FloatingParticles = ({ count = 50 }: { count?: number }) => {
  const mesh = useRef<THREE.Points>(null!);
  const time = useRef(0);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return { positions };
  }, [count]);

  useFrame((_, delta: number) => {
    if (mesh.current) {
      time.current += delta;
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time.current * 0.5 + i * 0.1) * 0.002;
        positions[i3] += Math.cos(time.current * 0.3 + i * 0.1) * 0.001;
      }

      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#0066CC"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Ambient Light Ring
const LightRing = ({ position }: { position: [number, number, number] }) => {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((_, delta: number) => {
    if (mesh.current) {
      mesh.current.rotation.z += delta * 0.05;
      mesh.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <torusGeometry args={[2, 0.02, 16, 100]} />
      <meshBasicMaterial color="#06B6D4" transparent opacity={0.3} />
    </mesh>
  );
};

const AnimatedBackground = () => {
  const colors = useMemo(() => ({
    primary: '#0066CC',
    secondary: '#06B6D4',
    accent: '#3B82F6',
  }), []);

  const glassSpheres = useMemo(() => [
    { position: [-4, 2, -3] as [number, number, number], scale: 0.8, speed: 0.8, color: colors.primary },
    { position: [4, -1, -4] as [number, number, number], scale: 1.2, speed: 0.6, color: colors.secondary },
    { position: [-2, -2, -5] as [number, number, number], scale: 0.6, speed: 1, color: colors.accent },
    { position: [3, 3, -6] as [number, number, number], scale: 0.9, speed: 0.7, color: colors.primary },
    { position: [0, 1, -4] as [number, number, number], scale: 0.5, speed: 0.9, color: colors.secondary },
  ], [colors]);

  const morphingBlobs = useMemo(() => [
    { position: [-5, -3, -8] as [number, number, number], scale: 1.5, color: colors.primary },
    { position: [5, 2, -10] as [number, number, number], scale: 2, color: colors.secondary },
    { position: [0, -4, -9] as [number, number, number], scale: 1.2, color: colors.accent },
  ], [colors]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.95) 50%, rgba(248, 250, 252, 0.9) 100%)'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0066CC" />
        <pointLight position={[10, 5, 5]} intensity={0.3} color="#06B6D4" />

        {glassSpheres.map((sphere, i) => (
          <GlassSphere key={`glass-${i}`} {...sphere} />
        ))}

        {morphingBlobs.map((blob, i) => (
          <MorphingBlob key={`blob-${i}`} {...blob} />
        ))}

        <FloatingParticles count={60} />

        <LightRing position={[-3, 0, -7]} />
        <LightRing position={[4, -2, -8]} />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;