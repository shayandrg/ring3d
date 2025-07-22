'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Scene = dynamic(() => import('@/components/Scene').then(mod => ({ default: mod.Scene })), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-xl text-gray-600">Loading 3D Scene...</div>
    </div>
  )
});

function WebGLErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.error('WebGL not supported');
        setHasError(true);
      }
    } catch (e) {
      console.error('Error checking WebGL support:', e);
      setHasError(true);
    }
  }, []);
  
  if (hasError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="text-2xl text-red-600 mb-4">WebGL Not Supported</div>
        <div className="text-gray-600 max-w-md text-center mb-6">
          Your browser or device doesn&apos;t support WebGL, which is required for 3D rendering.
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <WebGLErrorBoundary>
        <Scene />
      </WebGLErrorBoundary>
    </main>
  );
} 