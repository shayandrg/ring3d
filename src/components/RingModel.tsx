import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Material, Object3D } from 'three';
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

export function RingModel({ mousePosition }: RingModelProps) {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  
  const gltf = useGLTF('/models/ring.glb') as unknown as RingGLTF;
  const { nodes, materials } = gltf;
  const groupRef = useRef<Group>(null);
  
  useEffect(() => {
    if (nodes && materials) {
      setModelLoaded(true);
    }
  }, [nodes, materials]);
  
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
      {nodes && materials && Object.keys(nodes).map((key) => {
        const node = nodes[key];
        if (node instanceof Mesh) {
          return (
            <mesh
              key={key}
              geometry={node.geometry}
              material={node.material}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
              castShadow={false}
              receiveShadow={false}
            />
          );
        }
        return null;
      })}
    </group>
  );
}

try {
  useGLTF.preload('/models/ring.glb');
} catch (error) {
  console.error('Error preloading model:', error);
} 