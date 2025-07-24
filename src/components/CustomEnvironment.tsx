import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Group } from 'three';

type EnvironmentPreset = 'studio' | 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'sunset' | 'warehouse';

interface CustomEnvironmentProps {
  preset?: EnvironmentPreset;
}

export function CustomEnvironment({ preset = 'studio' }: CustomEnvironmentProps) {
  const groupRef = useRef<Group>(null);
  const { gl } = useThree();
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.PI / 4;
    }
    
    gl.capabilities.getMaxAnisotropy = () => 1;
  }, [gl]);
  
  useFrame((state) => {
    if (groupRef.current && state.clock.elapsedTime % 1 < 0.01) {
      groupRef.current.rotation.y = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
    }
  });
  
  return (
    <group ref={groupRef}>
      <Environment 
        preset={preset}
        background={false}
        resolution={256}
        blur={0.5}
      />
    </group>
  );
} 