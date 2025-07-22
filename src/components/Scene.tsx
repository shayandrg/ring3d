import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Group, Mesh, Material, Object3D } from 'three';

function Loader() {
  return (
    <Html center>
      <div className="text-center text-white bg-black/20 p-2 rounded">
        <div>Loading Model...</div>
      </div>
    </Html>
  );
}

function RingModel({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/ring.glb');
  
  useEffect(() => {
    if (!groupRef.current) return;
    
    const mouseInfluence = 0.1;
    groupRef.current.rotation.x = mousePosition.y * mouseInfluence;
    groupRef.current.rotation.z = -mousePosition.x * mouseInfluence;
  }, [mousePosition]);
  
  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} scale={2.5} />
    </group>
  );
}

export function Scene() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (hasError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">error</div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={1}
        gl={{ 
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(1);
          
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.warn('WebGL context lost');
            setHasError(true);
          });
          
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored');
            setHasError(false);
          });
        }}
      >
        <color attach="background" args={['#f8f8f8']} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Suspense fallback={<Loader />}>
          <RingModel mousePosition={mousePosition} />
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2.5}
          autoRotate={true}
          autoRotateSpeed={1.0}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/ring.glb'); 