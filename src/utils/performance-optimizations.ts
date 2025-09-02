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

// Lightweight throttle utility for scroll events
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

// Debounce utility for resize events
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

// Resource hints
export const addResourceHint = (href: string, rel: 'preload' | 'prefetch' | 'dns-prefetch', as?: string) => {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (as) link.as = as;
  document.head.appendChild(link);
};

// Critical resource preloader
export const preloadCriticalResourcesOptimized = () => {
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

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  // Run immediately
  preloadCriticalResources();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalResourcesOptimized();
    });
  } else {
    preloadCriticalResourcesOptimized();
  }
};