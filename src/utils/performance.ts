// Performance optimization utilities

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (sources: string[]): Promise<void> => {
  try {
    await Promise.all(sources.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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

// Intersection Observer for lazy loading
export const createLazyObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Resource hints
export const addResourceHint = (href: string, rel: 'preload' | 'prefetch' | 'dns-prefetch', as?: string) => {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (as) link.as = as;
  document.head.appendChild(link);
};

// Critical resource preloader
export const preloadCriticalResources = () => {
  const criticalImages = [
    '/interior-villa-dark.png',
    '/image.png'
  ];

  const criticalFonts = [
    'https://fonts.googleapis.com/css2?family=Fahkwang:wght@300;400;500;600;700&display=swap'
  ];

  // Preload images
  criticalImages.forEach(src => {
    addResourceHint(src, 'preload', 'image');
  });

  // Preload fonts
  criticalFonts.forEach(href => {
    addResourceHint(href, 'preload', 'style');
  });
};

// Optimize GSAP performance
export const optimizeGSAP = () => {
  if (typeof window !== 'undefined' && window.gsap) {
    // Set GSAP to use CSS transforms for better performance
    window.gsap.config({
      force3D: true,
      nullTargetWarn: false
    });
  }
};

// Web Vitals measurement
export const measureWebVitals = () => {
  if ('web-vital' in window) return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      switch (entry.entryType) {
        case 'largest-contentful-paint':
          console.log('LCP:', entry.startTime);
          break;
        case 'first-input':
          console.log('FID:', (entry as any).processingStart - entry.startTime);
          break;
        case 'layout-shift':
          if (!(entry as any).hadRecentInput) {
            console.log('CLS:', (entry as any).value);
          }
          break;
      }
    });
  });

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  (window as any)['web-vital'] = true;
};