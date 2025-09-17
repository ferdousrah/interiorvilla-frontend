'use client'

import React, { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;           // ← use me!
  afterImage: string;            // ← use me!
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  /** Fallback alt if specific ones not provided */
  alt?: string;
  /** Optional specific alts per image */
  altBefore?: string;
  altAfter?: string;
  height?: string;
  style?: React.CSSProperties;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  className = '',
  alt = 'Before and after comparison',
  altBefore,
  altAfter,
  height,
  style,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // If parent updates the URLs after fetch, we don't need extra state—just use props directly.

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) updateSliderPosition(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) updateSliderPosition(e.touches[0].clientX);
  };

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  useEffect(() => {
    if (!isDragging) return;
    // mouse
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // touch
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const computedAltBefore = altBefore || `${alt} - Before`;
  const computedAltAfter  = altAfter  || `${alt} - After`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-md cursor-ew-resize select-none ${className}`}
      style={{
        aspectRatio: height ? 'auto' : '16/10',
        height: height || 'auto',
        ...style,
      }}
    >
      {/* After Image (background, full) */}
      <img
        src={afterImage}               // ← USE PROP
        alt={computedAltAfter}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before Image (clipped on top) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}            // ← USE PROP
          alt={computedAltBefore}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Slider Line + Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize"
          aria-hidden="true"
        >
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-4 bg-gray-400 rounded" />
            <div className="w-0.5 h-4 bg-gray-400 rounded" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm font-medium transition-opacity duration-200"
        style={{ opacity: sliderPosition > 15 ? 1 : 0 }}
      >
        {beforeLabel}
      </div>
      <div
        className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm font-medium transition-opacity duration-200"
        style={{ opacity: sliderPosition < 85 ? 1 : 0 }}
      >
        {afterLabel}
      </div>

      {/* Instruction */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-md text-xs transition-opacity duration-200">
        Drag to compare
      </div>
    </div>
  );
};
