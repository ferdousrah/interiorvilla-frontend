// Performance monitoring component to detect and prevent forced reflows

'use client'

import { useEffect } from 'react';

export const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Batch DOM reads to prevent forced reflows
    const batchDOMReads = () => {
      const reads: Array<() => any> = [];
      const writes: Array<() => void> = [];
      let scheduled = false;

      const flush = () => {
        // Execute all reads first
        const results = reads.map(read => read());
        reads.length = 0;
        
        // Then execute all writes
        writes.forEach(write => write());
        writes.length = 0;
        
        scheduled = false;
        return results;
      };

      return {
        read: (fn: () => any) => {
          reads.push(fn);
          if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(flush);
          }
        },
        write: (fn: () => void) => {
          writes.push(fn);
          if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(flush);
          }
        }
      };
    };

    // Create global batch scheduler
    (window as any).batchDOM = batchDOMReads();

    // Monitor for forced reflows
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(Element.prototype, 'offsetWidth');
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'offsetHeight');
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

    let reflowCount = 0;
    const reflowThreshold = 10; // Warn after 10 forced reflows

    const wrapGeometryProperty = (property: string, originalDescriptor: any) => {
      Object.defineProperty(Element.prototype, property, {
        get: function() {
          reflowCount++;
          if (reflowCount > reflowThreshold && process.env.NODE_ENV === 'development') {
            console.warn(`Potential forced reflow detected: ${property} accessed ${reflowCount} times`);
            console.trace();
          }
          return originalDescriptor.get.call(this);
        },
        configurable: true
      });
    };

    // Only monitor in development
    if (process.env.NODE_ENV === 'development') {
      if (originalOffsetWidth) wrapGeometryProperty('offsetWidth', originalOffsetWidth);
      if (originalOffsetHeight) wrapGeometryProperty('offsetHeight', originalOffsetHeight);

      Element.prototype.getBoundingClientRect = function() {
        reflowCount++;
        if (reflowCount > reflowThreshold) {
          console.warn(`getBoundingClientRect called ${reflowCount} times - potential performance issue`);
        }
        return originalGetBoundingClientRect.call(this);
      };
    }

    // Optimize GSAP ScrollTrigger refresh
    const optimizeScrollTrigger = () => {
      if (window.gsap?.ScrollTrigger) {
        const ST = window.gsap.ScrollTrigger;
        
        // Debounce refresh calls
        const originalRefresh = ST.refresh;
        let refreshTimeout: NodeJS.Timeout;
        
        ST.refresh = function(safe?: boolean) {
          clearTimeout(refreshTimeout);
          refreshTimeout = setTimeout(() => {
            originalRefresh.call(this, safe);
          }, 100);
        };

        // Batch ScrollTrigger updates
        ST.batch = function(targets: any, vars: any) {
          return targets.map((target: any, i: number) => {
            return ST.create({
              ...vars,
              trigger: target,
              start: vars.start || "top bottom",
              end: vars.end || "bottom top",
              fastScrollEnd: true,
              refreshPriority: i === 0 ? 0 : -1 // Only first trigger gets priority
            });
          });
        };
      }
    };

    optimizeScrollTrigger();

    // Cleanup function
    return () => {
      // Restore original methods
      if (originalOffsetWidth) {
        Object.defineProperty(Element.prototype, 'offsetWidth', originalOffsetWidth);
      }
      if (originalOffsetHeight) {
        Object.defineProperty(Element.prototype, 'offsetHeight', originalOffsetHeight);
      }
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
      
      // Clear batch scheduler
      delete (window as any).batchDOM;
    };
  }, []);

  return null;
};

// Utility functions to prevent forced reflows

export const batchDOMOperations = (operations: Array<() => void>) => {
  requestAnimationFrame(() => {
    operations.forEach(op => op());
  });
};

export const measureElement = (element: HTMLElement) => {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
    top: element.offsetTop,
    left: element.offsetLeft,
    rect: element.getBoundingClientRect()
  };
};

export const batchMeasureElements = (elements: HTMLElement[]) => {
  return elements.map(measureElement);
};

// Optimized resize observer that batches measurements
export const createOptimizedResizeObserver = (
  callback: (entries: ResizeObserverEntry[]) => void
) => {
  let pendingEntries: ResizeObserverEntry[] = [];
  let rafId: number;

  const flushEntries = () => {
    if (pendingEntries.length > 0) {
      callback(pendingEntries);
      pendingEntries = [];
    }
  };

  return new ResizeObserver((entries) => {
    pendingEntries.push(...entries);
    
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(flushEntries);
  });
};

// Throttle utility specifically for scroll events
export const throttleScroll = <T extends (...args: any[]) => any>(
  func: T,
  limit: number = 16
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};