'use client'

import React, { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  alt?: string;
  height?: string;
  style?: React.CSSProperties;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  className = "",
  alt = "Before and after comparison",
  height,
  style
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      updateSliderPosition(e.touches[0].clientX);
    }
  };

  const updateSliderPosition = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const position = ((clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, position)));
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-md cursor-ew-resize select-none ${className}`} 
      style={{ 
        aspectRatio: height ? 'auto' : '16/10',
        height: height || 'auto',
        ...style
      }}
    >
      {/* Before Image (Background) */}
      <img
        src="/before.jpg"
        alt={`${alt} - Before`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* After Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src="/after.jpg"
          alt={`${alt} - After`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-4 bg-gray-400 rounded"></div>
            <div className="w-0.5 h-4 bg-gray-400 rounded"></div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div 
        className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-md text-sm font-medium transition-opacity duration-200"
        style={{ 
          opacity: sliderPosition > 15 ? 1 : 0 
        }}
      >
        {beforeLabel}
      </div>
      <div 
        className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-md text-sm font-medium transition-opacity duration-200"
        style={{ 
          opacity: sliderPosition < 85 ? 1 : 0 
        }}
      >
        {afterLabel}
      </div>

      {/* Instruction Text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-md text-xs transition-opacity duration-200">
        Drag to compare
      </div>
    </div>
  );
};