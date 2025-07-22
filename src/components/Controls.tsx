import React from 'react';

type ControlsProps = {
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  resetCamera: () => void;
};

export function Controls({ autoRotate, setAutoRotate, resetCamera }: ControlsProps) {
  return (
    <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-4 z-10">
      <button
        onClick={() => setAutoRotate(!autoRotate)}
        className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-md shadow-md hover:bg-white/90 transition-colors flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 mr-2 ${autoRotate ? 'text-blue-600' : 'text-gray-600'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
      </button>
      <button
        onClick={resetCamera}
        className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-md shadow-md hover:bg-white/90 transition-colors flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2 text-gray-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        Reset View
      </button>
    </div>
  );
} 