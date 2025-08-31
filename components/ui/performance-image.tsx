'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PerformanceImageProps {
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
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const PerformanceImage = React.forwardRef<HTMLImageElement, PerformanceImageProps>(({
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
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  ...props
}, ref) => {
  const [imageSrc, setImageSrc] = useState(priority ? src : '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized URLs
  const generateOptimizedUrl = useCallback((originalSrc: string, w?: number, h?: number, q?: number) => {
    if (!originalSrc || originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return originalSrc;
    }

    // For external URLs, return as-is
    if (originalSrc.startsWith('http') && !originalSrc.includes('interiorvillabd.com')) {
      return originalSrc;
    }

    const url = new URL(originalSrc, window.location.origin);
    const params = new URLSearchParams(url.search);
    
    if (w) params.set('w', w.toString());
    if (h) params.set('h', h.toString());
    if (q && q !== 75) params.set('q', q.toString());
    
    // Add format optimization
    if (!params.has('f') && originalSrc.match(/\.(jpg|jpeg|png)$/i)) {
      params.set('f', 'webp');
    }

    url.search = params.toString();
    return url.toString();
  }, []);

  // Generate responsive srcSet
  const generateSrcSet = useCallback((originalSrc: string) => {
    if (!originalSrc) return '';
    
    const breakpoints = [320, 640, 768, 1024, 1280, 1920];
    
    return breakpoints
      .filter(w => !width || w <= width * 2) // Don't generate larger than 2x the display size
      .map(w => `${generateOptimizedUrl(originalSrc, w, undefined, quality)} ${w}w`)
      .join(', ');
  }, [generateOptimizedUrl, quality, width]);

  // Intersection Observer setup
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
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observerRef.current.observe(img);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView, src]);

  // Handle load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle error with fallback
  const handleError = useCallback(() => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [imageSrc, fallbackSrc, onError]);

  // Update src when component comes into view
  useEffect(() => {
    if (isInView && !imageSrc) {
      setImageSrc(src);
    }
  }, [isInView, imageSrc, src]);

  const optimizedSrc = generateOptimizedUrl(imageSrc, width, height, quality);
  const srcSet = generateSrcSet(imageSrc);

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Blur placeholder */}
      {!isLoaded && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gray-200"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && placeholder === 'empty' && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            width: width || '100%',
            height: height || '100%'
          }}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <picture>
        {/* WebP sources for modern browsers */}
        {imageSrc && imageSrc.match(/\.(jpg|jpeg|png)$/i) && (
          <source
            srcSet={generateSrcSet(imageSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp'))}
            sizes={sizes}
            type="image/webp"
          />
        )}
        
        {/* AVIF sources for even better compression */}
        {imageSrc && imageSrc.match(/\.(jpg|jpeg|png)$/i) && (
          <source
            srcSet={generateSrcSet(imageSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif'))}
            sizes={sizes}
            type="image/avif"
          />
        )}
        
        {/* Fallback image */}
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
          {...props}
        />
      </picture>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500 p-4">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Failed to load image</span>
          </div>
        </div>
      )}
    </div>
  );
});

PerformanceImage.displayName = 'PerformanceImage';