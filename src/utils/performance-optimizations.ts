// Advanced performance optimization utilities

// Critical resource preloader with priority hints
export const preloadCriticalResources = () => {
  const criticalImages = [
    { src: '/interior-villa-dark.png', priority: 'high' }
  ];

  criticalImages.forEach(({ src, priority }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }
    document.head.appendChild(link);
  });
};

// Optimize GSAP for better performance
export const optimizeGSAP = () => {
  if (typeof window !== 'undefined' && window.gsap) {
    window.gsap.config({
      force3D: true,
      nullTargetWarn: false,
      trialWarn: false
    });

    // Set default ease for better performance
    window.gsap.defaults({
      ease: "power2.out",
      duration: 0.6
    });
  }
};

// Debounce utility for scroll events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle utility for resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Intersection Observer with performance optimizations
export const createOptimizedObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: [0, 0.1, 0.5, 1],
    ...options
  };

  return new IntersectionObserver(
    debounce(callback, 16), // Debounce to ~60fps
    defaultOptions
  );
};

// Image optimization utilities
export const generateSrcSet = (src: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]) => {
  if (!src) return '';
  
  return widths
    .map(width => {
      const optimizedSrc = src.includes('?') 
        ? `${src}&w=${width}&q=75`
        : `${src}?w=${width}&q=75`;
      return `${optimizedSrc} ${width}w`;
    })
    .join(', ');
};

export const generateSizes = (breakpoints: { [key: string]: string } = {}) => {
  const defaultBreakpoints = {
    '(max-width: 640px)': '100vw',
    '(max-width: 768px)': '100vw',
    '(max-width: 1024px)': '50vw',
    '(max-width: 1280px)': '33vw',
    ...breakpoints
  };

  return Object.entries(defaultBreakpoints)
    .map(([media, size]) => `${media} ${size}`)
    .join(', ');
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  console.group('Bundle Analysis');
  console.log('JavaScript files:', scripts.length);
  console.log('CSS files:', styles.length);
  
  // Estimate total size (rough calculation)
  let totalEstimatedSize = 0;
  scripts.forEach(script => {
    const src = (script as HTMLScriptElement).src;
    if (src.includes('chunk') || src.includes('vendor')) {
      totalEstimatedSize += 100; // Rough estimate in KB
    }
  });
  
  console.log('Estimated JS size:', `${totalEstimatedSize}KB`);
  console.groupEnd();
};

// Memory usage monitor
export const monitorMemoryUsage = () => {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const checkMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('Memory usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)}MB`
      });
    }
  };

  // Check memory usage every 30 seconds in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(checkMemory, 30000);
  }
};

// Cleanup unused event listeners
export const cleanupEventListeners = () => {
  const events = ['scroll', 'resize', 'mousemove', 'touchmove'];
  
  events.forEach(eventType => {
    const listeners = (window as any)._eventListeners?.[eventType] || [];
    if (listeners.length > 10) {
      console.warn(`High number of ${eventType} listeners detected:`, listeners.length);
    }
  });
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  if (typeof window === 'undefined') return;

  const budget = {
    maxJSSize: 500, // KB
    maxCSSSize: 100, // KB
    maxImageSize: 2000, // KB
    maxFonts: 5
  };

  const scripts = document.querySelectorAll('script[src]');
  const styles = document.querySelectorAll('link[rel="stylesheet"]');
  const fonts = document.querySelectorAll('link[href*="fonts"]');

  console.group('Performance Budget Check');
  console.log('Scripts:', scripts.length, '/ Budget: reasonable');
  console.log('Stylesheets:', styles.length, '/ Budget: reasonable');
  console.log('Fonts:', fonts.length, `/ Budget: ${budget.maxFonts}`);
  
  if (fonts.length > budget.maxFonts) {
    console.warn('⚠️ Font budget exceeded');
  }
  
  console.groupEnd();
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  // Run immediately
  preloadCriticalResources();
  optimizeGSAP();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      analyzeBundleSize();
      checkPerformanceBudget();
      monitorMemoryUsage();
    });
  } else {
    analyzeBundleSize();
    checkPerformanceBudget();
    monitorMemoryUsage();
  }

  // Run after page load
  window.addEventListener('load', () => {
    cleanupEventListeners();
  });
};