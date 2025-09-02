'use client'

import React, { Suspense, lazy } from 'react';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback = <div className="w-full h-32 bg-gray-100 animate-pulse rounded-lg" />
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Lazy load heavy components
export const LazyGLBModelViewer = lazy(() => 
  import('./glb-model-viewer').then(module => ({ default: module.GLBModelViewer }))
);

export const LazyBeforeAfterSlider = lazy(() => 
  import('./before-after-slider').then(module => ({ default: module.BeforeAfterSlider }))
);

export const LazyFancybox = lazy(() => 
  import('@fancyapps/ui').then(module => ({ default: module.Fancybox }))
);

export const LazyFramerMotion = lazy(() => 
  import('framer-motion').then(module => ({ default: module.motion }))
);

export const LazyGSAP = lazy(() => 
  import('gsap').then(module => ({ default: module.default }))
);

export const LazyEmblaCarousel = lazy(() => 
  import('embla-carousel-react').then(module => ({ default: module.default }))
);

export const LazyVanillaTilt = lazy(() => 
  import('vanilla-tilt').then(module => ({ default: module.default }))
);