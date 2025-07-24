import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Html, 
  ContactShadows, 
  Sparkles,
  MeshRefractionMaterial,
  useTexture,
} from '@react-three/drei';
import { Group, Mesh, PCFShadowMap, MeshStandardMaterial, MeshPhysicalMaterial, Color, Vector3, CubeTextureLoader, BufferGeometry, Euler, Quaternion, Matrix4 } from 'three';
import { CustomEnvironment } from './CustomEnvironment';
import { useFrame, useThree } from '@react-three/fiber';

// Add this to handle basePath in Next.js
const basePath = process.env.NODE_ENV === 'production' ? '/ring3d' : '';

interface DiamondMesh extends Mesh {
  __isDiamond?: boolean;
}

interface DiamondData {
  id: number;
  geometry: BufferGeometry;
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

function Loader() {
  return (
    <Html center>
      <div className="text-center text-white bg-black/20 p-2 rounded">
        <div>Loading Model...</div>
      </div>
    </Html>
  );
}

// Custom component for diamonds with refraction
function Diamond({ 
  geometry, 
  position, 
  rotation, 
  scale 
}: {
  geometry: BufferGeometry;
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}) {
  return (
    <mesh 
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshPhysicalMaterial
        color="white"
        transmission={0.99}
        roughness={0.0}
        ior={2.75}
        thickness={0.2}
        envMapIntensity={3.0}
        clearcoat={1.0}
        clearcoatRoughness={0.0}
        metalness={0.25}
        transparent
        opacity={0.92}
        reflectivity={1.0}
        attenuationColor={"#ffffff"}
        attenuationDistance={0.2}
      />
    </mesh>
  );
}

function RingModel() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(`${basePath}/ring.glb`);
  
  useEffect(() => {
    if (!groupRef.current) return;
    
    groupRef.current.rotation.x = 0;
    groupRef.current.rotation.z = 0;
    
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        
        const isDiamond = object.name.toLowerCase().includes('diamond') || 
                         object.name.toLowerCase().includes('gem') || 
                         object.name.toLowerCase().includes('stone');
        
        if (isDiamond) {
          console.log('Found diamond part:', object.name);
          
          const diamondMaterial = new MeshPhysicalMaterial({
            color: new Color('#ffffff'),
            transparent: true,
            opacity: 0.92,
            roughness: 0.0,
            metalness: 0.25,
            envMapIntensity: 3.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            reflectivity: 1.0,
            ior: 2.75, 
            thickness: 0.2,
            transmission: 0.99,
            attenuationColor: new Color('#ffffff'),
            attenuationDistance: 0.2
          });
          
          if (Array.isArray(object.material)) {
            for (let i = 0; i < object.material.length; i++) {
              object.material[i] = diamondMaterial.clone();
            }
          } else {
            object.material = diamondMaterial;
          }
        }
      }
    });
  }, [scene]);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });
  
  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} scale={2.5} />
      <Sparkles count={50} scale={6} size={1.5} speed={0.6} opacity={0.3} color="white" />
    </group>
  );
}

export function Scene() {
  const [hasError, setHasError] = useState(false);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.gc) {
        try {
          window.gc();
        } catch (e) {
          console.log('GC not available');
        }
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (hasError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">WebGL context lost</div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full relative">
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 35 }}
        dpr={1}
        frameloop="always"
        shadows={{
          enabled: true,
          type: PCFShadowMap
        }}
        gl={{ 
          antialias: false,
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: true,
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          
          // @ts-expect-error - legacy property
          gl.physicallyCorrectLights = false;
          // @ts-expect-error - legacy property
          gl.outputEncoding = 3000;
          gl.toneMapping = 0;
          
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
        performance={{ min: 0.5 }}
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={['#f0f0f0']} />
        
        <ambientLight intensity={0.6} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.25} 
          penumbra={0.5} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0001}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.8} color="#ffffff" />
        <pointLight position={[5, -5, 5]} intensity={0.8} color="#ffffff" />
        <pointLight position={[0, 10, 0]} intensity={1.0} color="#ffffff" />
        
        <CustomEnvironment preset="studio" />
        
        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.6}
          scale={10}
          blur={3}
          far={3}
          resolution={256}
        />
        
        <Suspense fallback={<Loader />}>
          <RingModel />
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={15}
          maxDistance={25}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          autoRotate={true}
          autoRotateSpeed={0.5}
          makeDefault
        />
      </Canvas>
    </div>
  );
}

try {
  useGLTF.preload(`${basePath}/ring.glb`, true);
} catch (error) {
  console.error('Error preloading model:', error);
} 