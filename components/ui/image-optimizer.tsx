'use client'

import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  sizes?: string;
  style?: React.CSSProperties;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc = '/placeholder.webp',
  sizes,
  style,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate WebP and AVIF sources
  const generateSources = (originalSrc: string) => {
    if (!originalSrc) return [];
    
    const sources = [];
    
    // Try AVIF first (best compression)
    if (originalSrc.includes('.jpg') || originalSrc.includes('.jpeg') || originalSrc.includes('.png')) {
      sources.push({
        srcSet: originalSrc.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.avif$2'),
        type: 'image/avif'
      });
      
      // Then WebP
      sources.push({
        srcSet: originalSrc.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2'),
        type: 'image/webp'
      });
    }
    
    return sources;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') return;

    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading when image comes into view
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before image comes into view
      }
    );

    observer.observe(img);

    return () => {
      observer.unobserve(img);
    };
  }, [priority, loading]);

  const sources = generateSources(imageSrc);

  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          type={source.type}
          sizes={sizes}
        />
      ))}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        {...props}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            width: width || '100%',
            height: height || '100%'
          }}
        />
      )}
    </picture>
  );
};