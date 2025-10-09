'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface LazyImageProps {
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
  placeholder?: string;
  quality?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
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
  sizes = '100vw',
  style,
  placeholder,
  quality = 75,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URLs
  const generateOptimizedSrc = useCallback((originalSrc: string, w?: number, h?: number) => {
    if (!originalSrc) return '';
    
    // If it's already optimized or external, return as-is
    if (originalSrc.includes('?') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // Add optimization parameters for supported formats
    const params = new URLSearchParams();
    if (w) params.set('w', w.toString());
    if (h) params.set('h', h.toString());
    if (quality !== 75) params.set('q', quality.toString());
    
    const queryString = params.toString();
    return queryString ? `${originalSrc}?${queryString}` : originalSrc;
  }, [quality]);

  // Generate WebP sources
  const generateWebPSources = useCallback((originalSrc: string) => {
    if (!originalSrc) return [];
    
    const sources = [];
    
    // Generate different sizes for responsive images
    const breakpoints = [
      { media: '(max-width: 640px)', width: 640 },
      { media: '(max-width: 768px)', width: 768 },
      { media: '(max-width: 1024px)', width: 1024 },
      { media: '(max-width: 1280px)', width: 1280 },
      { media: '(min-width: 1281px)', width: 1920 }
    ];

    // Try WebP format first
    if (originalSrc.match(/\.(jpg|jpeg|png)$/i)) {
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      breakpoints.forEach(bp => {
        sources.push({
          srcSet: generateOptimizedSrc(webpSrc, bp.width),
          media: bp.media,
          type: 'image/webp'
        });
      });
    }

    return sources;
  }, [generateOptimizedSrc]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const img = imgRef.current;
    if (!img) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setImageSrc(src);
            observerRef.current?.unobserve(img);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before image comes into view
        threshold: 0.01
      }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView, src]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [imageSrc, fallbackSrc, onError]);

  // Update src when in view
  useEffect(() => {
    if (isInView && !imageSrc && src) {
      setImageSrc(src);
    }
  }, [isInView, imageSrc, src]);

  const sources = generateWebPSources(imageSrc);
  const optimizedSrc = generateOptimizedSrc(imageSrc, width, height);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"
          style={{
            width: width || '100%',
            height: height || '100%'
          }}
          aria-hidden="true"
        />
      )}

      <picture>
        {sources.map((source, index) => (
          <source
            key={index}
            srcSet={source.srcSet}
            media={source.media}
            type={source.type}
          />
        ))}
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            objectFit: 'cover'
          }}
          {...props}
        />
      </picture>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Loading</span>
          </div>
        </div>
      )}
    </div>
  );
};