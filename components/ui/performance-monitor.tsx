'use client'

import { useEffect } from 'react';

export const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift') {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalImages = [
        '/interior-villa-dark.png',
        '/image.webp'
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });

      // Preload critical fonts
      const criticalFonts = [
        'https://fonts.googleapis.com/css2?family=Fahkwang:wght@300;400;500;600;700&display=swap'
      ];

      criticalFonts.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        link.onload = () => {
          link.rel = 'stylesheet';
        };
        document.head.appendChild(link);
      });
    };

    // Defer non-critical JavaScript
    const deferNonCriticalJS = () => {
      const scripts = document.querySelectorAll('script[data-defer]');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.getAttribute('src') || '';
        newScript.defer = true;
        document.head.appendChild(newScript);
        script.remove();
      });
    };

    // Run optimizations after initial load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        preloadCriticalResources();
        deferNonCriticalJS();
      });
    } else {
      preloadCriticalResources();
      deferNonCriticalJS();
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};