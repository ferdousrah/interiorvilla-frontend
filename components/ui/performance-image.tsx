// components/ui/performance-image.tsx
'use client';

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
  fetchpriority?: 'high' | 'low' | 'auto';
}

export const PerformanceImage = React.forwardRef<HTMLImageElement, PerformanceImageProps>(
  (
    {
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
      fetchpriority = 'auto',
      ...props
    },
    ref
  ) => {
    const [imageSrc, setImageSrc] = useState(priority ? src : '');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    /* ---------- Lazy load trigger ---------- */
    useEffect(() => {
      if (priority || isInView) return;
      const img = imgRef.current;
      if (!img) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              setImageSrc(src);
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: '50px', threshold: 0.01 }
      );
      observer.observe(img);
      return () => observer.disconnect();
    }, [priority, isInView, src]);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
      if (imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
        setHasError(false);
      } else {
        setHasError(true);
        onError?.();
      }
    }, [imageSrc, fallbackSrc, onError]);

    useEffect(() => {
      if (isInView && !imageSrc) setImageSrc(src);
    }, [isInView, imageSrc, src]);

    return (
      <div className={`relative overflow-hidden ${className}`} style={style}>
        {!isLoaded && placeholder === 'blur' && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: blurDataURL ? `url(${blurDataURL})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.05)',
              transition: 'opacity 0.4s ease',
            }}
            aria-hidden="true"
          />
        )}

        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          fetchpriority={fetchpriority}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
          {...props}
        />

        {hasError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
            Image failed to load
          </div>
        )}
      </div>
    );
  }
);
PerformanceImage.displayName = 'PerformanceImage';
