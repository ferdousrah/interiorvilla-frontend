// Advanced performance optimization utilities with forced reflow prevention

// Batch DOM reads to prevent forced reflows
class DOMBatcher {
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];
  private scheduled = false;

  read(fn: () => void) {
    this.readQueue.push(fn);
    this.schedule();
  }

  write(fn: () => void) {
    this.writeQueue.push(fn);
    this.schedule();
  }

  private schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    
    requestAnimationFrame(() => {
      // Execute all reads first
      this.readQueue.forEach(fn => fn());
      this.readQueue = [];
      
      // Then execute all writes
      this.writeQueue.forEach(fn => fn());
      this.writeQueue = [];
      
      this.scheduled = false;
    });
  }
}

export const domBatcher = new DOMBatcher();

// Optimized throttle that uses RAF for smooth animations
export const throttleRAF = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;
  let lastArgs: Parameters<T>;

  return (...args: Parameters<T>) => {
    lastArgs = args;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...lastArgs);
        rafId = null;
      });
    }
  };
};

// Lightweight throttle for scroll events
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

// Prevent forced reflows by caching layout properties
class LayoutCache {
  private cache = new Map<Element, DOMRect>();
  private observer: ResizeObserver;
  private rafId: number | null = null;
  private pendingInvalidations = new Set<Element>();

  constructor() {
    this.observer = new ResizeObserver((entries) => {
      // Batch invalidations to prevent forced reflows
      entries.forEach((entry) => {
        this.pendingInvalidations.add(entry.target);
      });
      
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => {
          this.pendingInvalidations.forEach((element) => {
            this.cache.delete(element);
          });
          this.pendingInvalidations.clear();
          this.rafId = null;
        });
      }
    });
  }

  getRect(element: Element): DOMRect {
    if (!this.cache.has(element)) {
      // Use RAF to batch rect calculations
      const rect = element.getBoundingClientRect();
      this.cache.set(element, rect);
      this.observer.observe(element);
    }
    return this.cache.get(element)!;
  }

  invalidate(element: Element) {
    this.pendingInvalidations.add(element);
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.pendingInvalidations.forEach((el) => {
          this.cache.delete(el);
        });
        this.pendingInvalidations.clear();
        this.rafId = null;
      });
    }
  }

  clear() {
    this.cache.clear();
    this.pendingInvalidations.clear();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

export const layoutCache = new LayoutCache();

// Optimized scroll handler that prevents forced reflows
export const createOptimizedScrollHandler = (
  callback: (scrollY: number, direction: 'up' | 'down') => void
) => {
  let lastScrollY = 0;
  let rafId: number | null = null;
  let cachedScrollY = 0;

  const handleScroll = () => {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      const scrollY = window.pageYOffset;
      
      // Only update if scroll changed significantly
      if (Math.abs(scrollY - cachedScrollY) < 2) {
        rafId = null;
        return;
      }
      
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      callback(scrollY, direction);
      lastScrollY = scrollY;
      cachedScrollY = scrollY;
      rafId = null;
    });
  };

  return {
    handler: handleScroll,
    cleanup: () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
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

// Optimize element queries to prevent forced reflows
export const optimizeElementQueries = () => {
  // Cache frequently accessed elements
  const elementCache = new Map<string, Element>();
  
  const getCachedElement = (selector: string): Element | null => {
    if (!elementCache.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        elementCache.set(selector, element);
      }
    }
    return elementCache.get(selector) || null;
  };

  // Clear cache when DOM changes significantly
  const observer = new MutationObserver(() => {
    elementCache.clear();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return { getCachedElement, clearCache: () => elementCache.clear() };
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  // Run immediately
  preloadCriticalResources();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeElementQueries();
    });
  } else {
    optimizeElementQueries();
  }
};