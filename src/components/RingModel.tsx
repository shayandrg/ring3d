import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  Group, 
  Mesh, 
  Material, 
  Object3D, 
  MeshStandardMaterial, 
  Color, 
} from 'three';
import { GLTF } from 'three-stdlib';

type RingModelProps = {
  mousePosition: { x: number; y: number };
};

interface RingGLTF extends GLTF {
  nodes: {
    [key: string]: Mesh | Object3D;
  };
  materials: {
    [key: string]: Material;
  };
}

const DIAMOND_MATERIAL = {
  color: new Color('#ffffff'),
  roughness: 0.1,
  metalness: 0.2,
  transmission: 0.8,
  thickness: 0.5,
  ior: 2.0,
  clearcoat: 0.8,
  clearcoatRoughness: 0.2,
  envMapIntensity: 1.5,
};

const GOLD_MATERIAL = {
  color: new Color('#ffcf70'),
  roughness: 0.2,
  metalness: 0.9,
  envMapIntensity: 1.0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.3,
};

export function RingModel({ mousePosition }: RingModelProps) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  
  const materialsRef = useRef({
    diamond: null as MeshStandardMaterial | null,
    gold: null as MeshStandardMaterial | null
  });
  
  const gltf = useGLTF('/ring.glb', true) as unknown as RingGLTF;
  const { nodes, materials } = gltf;
  const groupRef = useRef<Group>(null);
  const { scene } = useThree();
  
  useMemo(() => {
    if (!materialsRef.current.diamond) {
      materialsRef.current.diamond = new MeshStandardMaterial({
        color: DIAMOND_MATERIAL.color,
        roughness: DIAMOND_MATERIAL.roughness,
        metalness: DIAMOND_MATERIAL.metalness,
        envMapIntensity: DIAMOND_MATERIAL.envMapIntensity,
      });
    }
    
    if (!materialsRef.current.gold) {
      materialsRef.current.gold = new MeshStandardMaterial({
        color: GOLD_MATERIAL.color,
        roughness: GOLD_MATERIAL.roughness,
        metalness: GOLD_MATERIAL.metalness,
        envMapIntensity: GOLD_MATERIAL.envMapIntensity,
      });
    }
  }, []);
  
  useEffect(() => {
    if (nodes && materials && materialsRef.current.diamond && materialsRef.current.gold) {
      setModelLoaded(true);
      
      Object.keys(nodes).forEach((key) => {
        const node = nodes[key];
        if (node instanceof Mesh) {
          const isDiamond = key.toLowerCase().includes('diamond') || 
                           key.toLowerCase().includes('gem') || 
                           key.toLowerCase().includes('stone');
          
          if (isDiamond) {
            node.material = materialsRef.current.diamond!;
          } else {
            node.material = materialsRef.current.gold!;
          }
          
          node.castShadow = true;
          node.receiveShadow = true;
          
          if (node.geometry) {
            node.geometry.dispose = () => {
              console.log('Preventing geometry disposal to avoid WebGL context loss');
            };
          }
        }
      });
    }
    
    return () => {
    };
  }, [nodes, materials]);
  
  useEffect(() => {
    return () => {
      if (materialsRef.current.diamond) {
        materialsRef.current.diamond.dispose();
      }
      if (materialsRef.current.gold) {
        materialsRef.current.gold.dispose();
      }
    };
  }, []);
  
  useEffect(() => {
    const handleError = () => {
      console.error('Error loading model');
      setModelError(true);
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    const mouseInfluence = 0.1;
    
    const targetRotationX = mousePosition.y * mouseInfluence;
    const targetRotationY = mousePosition.x * mouseInfluence;
    
    groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
    groupRef.current.rotation.z += (-targetRotationY - groupRef.current.rotation.z) * 0.1;
  });

  if (modelError) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  if (!modelLoaded) {
    return null;
  }

  return (
    <group ref={groupRef} dispose={null} scale={2.5} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

try {
  useGLTF.preload('/ring.glb');
} catch (error) {
  console.error('Error preloading model:', error);
} 