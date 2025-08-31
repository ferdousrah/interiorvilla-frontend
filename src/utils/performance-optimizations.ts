// Advanced performance optimization utilities

// Critical resource preloader with priority hints
export const preloadCriticalResources = () => {
  const criticalImages = [
    { src: '/interior-villa-dark.png', priority: 'high' },
    { src: '/image.png', priority: 'high' }
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
  
  // Preload critical CSS
  const criticalCSS = document.querySelector('link[rel="stylesheet"]');
  if (criticalCSS) {
    criticalCSS.setAttribute('fetchpriority', 'high');
  }
};

// Optimize GSAP for better performance
export const optimizeGSAP = () => {
  if (typeof window !== 'undefined' && window.gsap) {
    window.gsap.config({
      force3D: true,
      nullTargetWarn: false,
      nullTargetWarn: false,
      autoSleep: 60,
      units: { left: "px", top: "px", rotation: "deg" },
      autoSleep: 60 // Auto-sleep animations after 60 seconds
    });

    // Set default ease for better performance
    window.gsap.defaults({
      ease: "power2.out",
      duration: 0.6
    });
    
    // Enable hardware acceleration
    window.gsap.set("*", { force3D: true });
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
  optimizeGSAP();
  preloadCriticalResources();
  
  // Register service worker for caching
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for SW updates
      })
      .then((registration) => {
        console.log('SW registered successfully');
        
        // Check for updates every 24 hours
        setInterval(() => {
          registration.update();
        }, 24 * 60 * 60 * 1000);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
    });

    // Set default properties to reduce reflows
    window.gsap.defaults({
      ease: "power2.out",
      duration: 0.6,
      force3D: true
    });

    // Optimize ScrollTrigger for better performance
    if (window.gsap.registerPlugin) {
      const { ScrollTrigger } = window.gsap;
      if (ScrollTrigger) {
        ScrollTrigger.config({
          autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
          ignoreMobileResize: true
        });
      }
    }
  }
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      analyzeBundleSize();
      checkPerformanceBudget();
      monitorMemoryUsage();
      optimizeImageCaching();
    });
  } else {
    analyzeBundleSize();
    checkPerformanceBudget();
    monitorMemoryUsage();
    optimizeImageCaching();
  }

  // Run after page load
  window.addEventListener('load', () => {
    cleanupEventListeners();
    
    // Defer heavy operations
    setTimeout(() => {
      // Load non-critical resources
      const nonCriticalImages = document.querySelectorAll('img[loading="lazy"]');
      nonCriticalImages.forEach(img => {
        if (img.getAttribute('data-src')) {
          img.setAttribute('src', img.getAttribute('data-src') || '');
        }
      });
    }, 1000);
  });
  
  // Optimize for Core Web Vitals
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Run non-critical optimizations when browser is idle
      analyzeBundleSize();
      checkPerformanceBudget();
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      analyzeBundleSize();
      checkPerformanceBudget();
    }, 2000);
  }
};

// Optimize image caching with better headers
export const optimizeImageCaching = () => {
  const images = document.querySelectorAll('img[src]');
  
  images.forEach((img) => {
    const imgElement = img as HTMLImageElement;
    const src = imgElement.src;
    
    // Add cache optimization for CMS images
    if (src.includes('cms.interiorvillabd.com') && !src.includes('v=')) {
      const url = new URL(src);
      const params = new URLSearchParams(url.search);
      
      // Add daily cache versioning
      const today = new Date().toISOString().split('T')[0];
      params.set('v', today);
      
      // Add format optimization if not present
      if (!params.has('f') && src.match(/\.(jpg|jpeg|png)$/i)) {
        params.set('f', 'webp');
      }
      
      url.search = params.toString();
      imgElement.src = url.toString();
    }
  });
};

// Add cache headers via meta tags for better browser caching
export const addCacheHeaders = () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Cache-Control';
  meta.content = 'public, max-age=31536000, immutable';
  document.head.appendChild(meta);
  
  // Add cache control for different resource types
  const resourceHints = [
    { rel: 'preload', as: 'style', href: '/assets/css/index.css' },
    { rel: 'preload', as: 'script', href: '/assets/js/index.js' },
    { rel: 'prefetch', href: '/about' },
    { rel: 'prefetch', href: '/portfolio' },
    { rel: 'prefetch', href: '/contact' }
  ];
  
  resourceHints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
};