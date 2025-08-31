'use client'

import React, { useEffect } from 'react';

export const CriticalCSS: React.FC = () => {
  useEffect(() => {
    // Inline critical CSS for above-the-fold content
    const criticalCSS = `
      /* Critical styles for immediate rendering */
      .hero-section {
        min-height: 60vh;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        contain: layout style paint;
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
      }

      .nav-button {
        min-width: 108px;
        padding: 0 24px;
        border-radius: 50px;
        transition: all 0.3s ease;
        font-family: 'Fahkwang', sans-serif;
        font-weight: 500;
      }

      .nav-button:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(117, 191, 68, 0.3);
      }

      /* Prevent layout shift for images */
      .aspect-ratio-container {
        position: relative;
        overflow: hidden;
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
      .will-change-transform {
        will-change: transform;
      }

      .will-change-auto {
        will-change: auto;
      }

      /* GPU acceleration for smooth animations */
      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      /* Loading states */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }

      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Optimize font rendering */
      .font-optimized {
        font-display: swap;
        text-rendering: optimizeSpeed;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
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
        { src: '/interior-villa-dark.png', sizes: '208x41' },
        { src: '/image.png', sizes: '1920x1080' }
      ];

      criticalImages.forEach(({ src, sizes }) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.setAttribute('imagesizes', sizes);
        link.setAttribute('fetchpriority', 'high');
        document.head.appendChild(link);
      });
    };

    // Optimize third-party scripts
    const optimizeThirdPartyScripts = () => {
      // Defer Google Fonts loading
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      fontLinks.forEach(link => {
        link.setAttribute('media', 'print');
        link.setAttribute('onload', "this.media='all'");
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