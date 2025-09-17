'use client'

import React, { Suspense, lazy } from 'react';

// Loading fallback component
const LoadingFallback: React.FC<{ height?: string }> = ({ height = '200px' }) => (
  <div 
    className="w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="text-gray-400 text-sm">Loading...</div>
  </div>
);

// Lazy load heavy components with better error boundaries
const withLazyLoading = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallbackHeight?: string
) => {
  const LazyComponent = lazy(importFn);
  
  return React.forwardRef<any, T>((props, ref) => (
    <Suspense fallback={<LoadingFallback height={fallbackHeight} />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

// Lazy loaded components
export const LazyGLBModelViewer = withLazyLoading(
  () => import('./glb-model-viewer').then(m => ({ default: m.GLBModelViewer })),
  '600px'
);

export const LazyBeforeAfterSlider = withLazyLoading(
  () => import('./before-after-slider').then(m => ({ default: m.BeforeAfterSlider })),
  '400px'
);

export const LazyTestimonialSection = withLazyLoading(
  () => import('../screens/Home/sections/TestimonialSection/TestimonialSection').then(m => ({ default: m.TestimonialSection })),
  '500px'
);

export const LazyBlogSection = withLazyLoading(
  () => import('../screens/Home/sections/BlogSection/BlogSection').then(m => ({ default: m.BlogSection })),
  '400px'
);

// Dynamic import utilities
export const loadGSAPPlugins = async () => {
  const [ScrollTrigger, SplitText, ScrollToPlugin] = await Promise.all([
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
    import('gsap/ScrollToPlugin')
  ]);
  
  return { ScrollTrigger, SplitText, ScrollToPlugin };
};

export const loadThreeJS = async () => {
  const [THREE, GLTFLoader, OrbitControls] = await Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/controls/OrbitControls.js')
  ]);
  
  return { THREE, GLTFLoader, OrbitControls };
};

export const loadFancybox = async () => {
  const { Fancybox } = await import('@fancyapps/ui');
  await import('@fancyapps/ui/dist/fancybox/fancybox.css');
  return Fancybox;
};