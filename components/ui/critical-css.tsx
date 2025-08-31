'use client'

import React, { useEffect } from 'react';

export const CriticalCSS: React.FC = () => {
  useEffect(() => {
    // Inline critical CSS for above-the-fold content
    const criticalCSS = `
      /* Critical styles for immediate rendering */
      /* Prevent render blocking with essential styles */
      * {
        box-sizing: border-box;
      }
      
      .hero-section {
        min-height: 60vh;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        contain: layout style paint;
        transform: translateZ(0);
      }

      .header-fixed {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        backdrop-filter: blur(20px);
        background: rgba(27, 27, 27, 0.95);
        transition: all 0.3s ease;
        contain: layout style paint;
      }

      .nav-button {
        min-width: 108px;
        padding: 0 24px;
        border-radius: 50px;
        transition: all 0.3s ease;
        font-family: 'Fahkwang', sans-serif;
        font-weight: 500;
        contain: layout style;
      }

      .nav-button:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(117, 191, 68, 0.3);
      }

      /* Prevent layout shift for images */
      img {
        max-width: 100%;
        height: auto;
        font-size: 0;
      }
      
      .aspect-ratio-container {
        position: relative;
        overflow: hidden;
        contain: layout;
      }

      .aspect-ratio-container::before {
        content: '';
        display: block;
        padding-top: var(--aspect-ratio, 56.25%); /* 16:9 default */
      }

      .aspect-ratio-container > * {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* Optimize animations for performance */
      .animate-optimized {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      
      .will-change-transform {
        will-change: transform;
        transform: translateZ(0);
        backface-visibility: hidden;
      }

      .will-change-auto {
        will-change: auto;
      }

      /* GPU acceleration for smooth animations */
      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        contain: layout style paint;
      }

      /* Loading states */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        contain: layout style paint;
      }

      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Optimize font rendering */
      .text-optimized {
        font-display: swap;
        text-rendering: optimizeSpeed;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .font-optimized {
        font-display: swap;
        text-rendering: optimizeSpeed;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Critical button styles */
      .btn-primary {
        background: #75BF44;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-family: 'Fahkwang', sans-serif;
        font-weight: 500;
        transition: all 0.3s ease;
        contain: layout style;
      }
      
      .btn-primary:hover {
        background: #68AB3C;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(117, 191, 68, 0.3);
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'critical-css';
    styleElement.textContent = criticalCSS;
    
    if (!document.getElementById('critical-css')) {
      document.head.appendChild(styleElement);
    }

    // Preload critical images with proper sizing
    const preloadCriticalImages = () => {
      const criticalImages = [
        { src: '/interior-villa-dark.png', sizes: '208x41', fetchpriority: 'high' },
        { src: '/image.png', sizes: '1920x1080', fetchpriority: 'high' }
      ];

      criticalImages.forEach(({ src, sizes, fetchpriority }) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.setAttribute('imagesizes', sizes);
        link.setAttribute('fetchpriority', fetchpriority);
        document.head.appendChild(link);
      });
    };

    // Optimize third-party scripts
    const optimizeThirdPartyScripts = () => {
      // Fonts are now inlined in critical CSS, so this is no longer needed
      
      // Defer non-critical scripts
      const scripts = document.querySelectorAll('script[data-defer]');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.getAttribute('src') || '';
        newScript.defer = true;
        newScript.async = true;
        document.head.appendChild(newScript);
        script.remove();
      });

      // Add resource hints for external domains
      const domains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cms.interiorvillabd.com'
      ];

      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      });
      
      // Prefetch next likely pages
      const prefetchPages = ['/about', '/portfolio', '/contact'];
      prefetchPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
      });
    };

    // Run optimizations
    preloadCriticalImages();
    optimizeThirdPartyScripts();

    // Cleanup function
    return () => {
      const criticalCSSElement = document.getElementById('critical-css');
      if (criticalCSSElement) {
        criticalCSSElement.remove();
      }
    };
  }, []);

  return null;
};