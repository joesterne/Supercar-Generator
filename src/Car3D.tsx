import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CarSpecs } from './types';

const colorMap: Record<string, string> = {
  'Midnight Black': '#050505',
  'Rosso Corsa': '#d40000',
  'Nardo Gray': '#5c5e60',
  'Electric Blue': '#0044ff',
  'Pearl White': '#f0f4f8',
  'Lime Green': '#39ff14',
  'Candy Apple Red': '#8B0000',
  'Satin Gold': '#d4af37',
  'Matte Gunmetal': '#2a2a2a',
  'Deep Ocean Teal': '#004b49'
};

const envMap: Record<string, string> = {
  'Neon City Streets': 'night',
  'Salt Flats at Sunset': 'sunset',
  'Alpine Mountain Pass': 'dawn',
  'Minimalist Studio': 'studio',
  'Rainy Tokyo Night': 'city',
  'Warehouse District': 'warehouse',
  'Forest Road': 'forest'
};

function CarModel({ specs }: { specs: CarSpecs }) {
  const carColor = colorMap[specs.color] || '#ffffff';
  
  const hasSpoiler = specs.bodyKit === 'Aggressive Aero' || specs.bodyKit === 'Widebody Track' || specs.bodyKit === 'Vintage Rally' || specs.bodyKit === 'Cyber-Street';
  const isWidebody = specs.bodyKit === 'Widebody Track' || specs.bodyKit === 'Cyber-Street';
  const isMinimalist = specs.bodyKit === 'Minimalist Concept';

  const bodyWidth = isWidebody ? 2.2 : 1.9;
  const rideHeight = specs.bodyKit === 'Aggressive Aero' || isWidebody ? 0.15 : 0.25;

  const paintMaterial = new THREE.MeshPhysicalMaterial({
    color: carColor,
    metalness: 0.8,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#050505',
    metalness: 0.9,
    roughness: 0.0,
    transmission: 1.0,
    ior: 1.5,
    thickness: 0.5,
    transparent: true,
    opacity: 0.8
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: '#111',
    roughness: 0.8,
    metalness: 0.2,
  });

  const tailLightMaterial = new THREE.MeshStandardMaterial({
    color: '#ff0000',
    emissive: '#ff0000',
    emissiveIntensity: 2,
    toneMapped: false
  });
  
  const headLightMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#ffffff',
    emissiveIntensity: 2,
    toneMapped: false
  });

  const chassisGeometry = React.useMemo(() => {
    const shape = new THREE.Shape();
    // Start at rear bottom
    shape.moveTo(-1.9, 0);
    // Bottom straight to front
    shape.lineTo(1.8, 0);
    // Front nose curve up
    shape.bezierCurveTo(2.1, 0.05, 2.1, 0.25, 1.8, 0.3);
    // Hood curve
    shape.bezierCurveTo(1.2, 0.35, 0.5, 0.45, 0.2, 0.5);
    // Cabin roof curve
    shape.bezierCurveTo(-0.3, 0.75, -1.0, 0.65, -1.5, 0.4);
    // Rear slope
    shape.bezierCurveTo(-1.8, 0.3, -2.1, 0.2, -1.9, 0);

    const extrudeSettings = {
      depth: bodyWidth - 0.4,
      bevelEnabled: true,
      bevelSegments: 32,
      steps: 4,
      curveSegments: 64,
      bevelSize: 0.2,
      bevelThickness: 0.2,
    };
    
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, [bodyWidth]);

  return (
    <group position={[0, rideHeight, 0]}>
      {/* Sleek Aerodynamic Main Body */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]} rotation={[0, -Math.PI / 2, 0]} geometry={chassisGeometry}>
        <primitive object={paintMaterial} attach="material" />
      </mesh>

      {/* Cabin (Glass Dome Embedded) */}
      {!isMinimalist ? (
        <mesh castShadow position={[0, 0.55, -0.2]} scale={[bodyWidth * 0.5, 0.25, 1.5]}>
          <sphereGeometry args={[1, 64, 64]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>
      ) : (
        <mesh castShadow position={[0, 0.5, -0.2]} scale={[bodyWidth * 0.6, 0.2, 1.8]}>
          <sphereGeometry args={[1, 64, 64]} />
          <primitive object={glassMaterial} attach="material" />
        </mesh>
      )}

      {/* Headlights (Sleek aerodynamic strips embedded in fenders) */}
      <mesh position={[bodyWidth * 0.35, 0.35, 1.7]} rotation={[0.2, 0.3, 0]} scale={[0.3, 0.05, 0.4]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <primitive object={headLightMaterial} attach="material" />
      </mesh>
      <mesh position={[-bodyWidth * 0.35, 0.35, 1.7]} rotation={[0.2, -0.3, 0]} scale={[0.3, 0.05, 0.4]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <primitive object={headLightMaterial} attach="material" />
      </mesh>

      {/* Taillights (Curved light bar) */}
      <mesh position={[0, 0.4, -2.1]} scale={[bodyWidth * 0.8, 0.05, 0.1]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <primitive object={tailLightMaterial} attach="material" />
      </mesh>

      {/* Wheels */}
      {[-1, 1].map((x, i) => 
        [-1.3, 1.4].map((z, j) => (
          <group key={`${i}-${j}`} position={[x * (bodyWidth / 2 + 0.1), 0.2, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.35, 0.35, 0.3, 64]} />
              <meshStandardMaterial color="#050505" roughness={0.9} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.16 : -0.16, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.02, 32]} />
              <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))
      )}

      {/* Spoiler */}
      {hasSpoiler && (
        <group position={[0, 0.8, -2.1]}>
          <mesh castShadow position={[0, 0.1, 0]}>
            <boxGeometry args={[bodyWidth * 1.1, 0.05, 0.4]} />
            <primitive object={paintMaterial} attach="material" />
          </mesh>
          <mesh castShadow position={[-0.6, 0, 0]}>
            <boxGeometry args={[0.05, 0.2, 0.2]} />
            <primitive object={darkMaterial} attach="material" />
          </mesh>
          <mesh castShadow position={[0.6, 0, 0]}>
            <boxGeometry args={[0.05, 0.2, 0.2]} />
            <primitive object={darkMaterial} attach="material" />
          </mesh>
        </group>
      )}

      {/* Front Splitter */}
      {hasSpoiler && (
         <mesh castShadow position={[0, 0.18, 2.1]}>
            <boxGeometry args={[bodyWidth * 1.05, 0.05, 0.4]} />
            <primitive object={darkMaterial} attach="material" />
         </mesh>
      )}
    </group>
  );
}

export default function CarPreview({ specs, eye }: { specs: CarSpecs, eye?: 'left' | 'right' }) {
  const preset = envMap[specs.environment] as any || 'studio';
  
  const camX = eye === 'left' ? 4.8 : eye === 'right' ? 5.2 : 5;
  
  return (
    <Canvas 
      id="car-canvas"
      shadows 
      camera={{ position: [camX, 2, 6], fov: 45 }} 
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      dpr={[1, 2]}
      className="w-full h-full"
    >
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={specs.ambientIntensity ?? 0.4} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow shadow-mapSize={[2048, 2048]} />
      
      <CarModel specs={specs} />
      
      <ContactShadows position={[0, -0.01, 0]} resolution={1024} scale={12} blur={2} opacity={0.7} far={2} />
      
      <Environment preset={preset} background blur={0.5} />
      
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 2 - 0.05} 
        minDistance={5}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={1.0}
      />
    </Canvas>
  );
}
