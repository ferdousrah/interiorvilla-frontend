// Web Vitals monitoring and optimization

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Thresholds for Core Web Vitals
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 }
};

// Get rating based on thresholds
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Report metric to analytics (replace with your analytics service)
const reportMetric = (metric: WebVitalMetric) => {
  console.log(`${metric.name}: ${metric.value}ms (${metric.rating})`);
  
  // Send to analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      custom_map: { metric_rating: metric.rating }
    });
  }
};

// Measure First Contentful Paint
export const measureFCP = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        const metric: WebVitalMetric = {
          name: 'FCP',
          value: entry.startTime,
          rating: getRating('FCP', entry.startTime),
          delta: entry.startTime,
          id: generateUniqueId()
        };
        reportMetric(metric);
      }
    });
  });

  observer.observe({ entryTypes: ['paint'] });
};

// Measure Largest Contentful Paint
export const measureLCP = () => {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    const metric: WebVitalMetric = {
      name: 'LCP',
      value: lastEntry.startTime,
      rating: getRating('LCP', lastEntry.startTime),
      delta: lastEntry.startTime,
      id: generateUniqueId()
    };
    reportMetric(metric);
  });

  observer.observe({ entryTypes: ['largest-contentful-paint'] });
};

// Measure First Input Delay
export const measureFID = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const fidEntry = entry as PerformanceEventTiming;
      const value = fidEntry.processingStart - fidEntry.startTime;
      
      const metric: WebVitalMetric = {
        name: 'FID',
        value,
        rating: getRating('FID', value),
        delta: value,
        id: generateUniqueId()
      };
      reportMetric(metric);
    });
  });

  observer.observe({ entryTypes: ['first-input'] });
};

// Measure Cumulative Layout Shift
export const measureCLS = () => {
  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const layoutShiftEntry = entry as any;
      
      // Only count layout shifts without recent input
      if (!layoutShiftEntry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

        // If the entry occurred less than 1 second after the previous entry and
        // less than 5 seconds after the first entry in the session, include it
        if (sessionValue &&
            entry.startTime - lastSessionEntry.startTime < 1000 &&
            entry.startTime - firstSessionEntry.startTime < 5000) {
          sessionValue += layoutShiftEntry.value;
          sessionEntries.push(entry);
        } else {
          sessionValue = layoutShiftEntry.value;
          sessionEntries = [entry];
        }

        // If the current session value is larger than the current CLS value,
        // update CLS and report it
        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          
          const metric: WebVitalMetric = {
            name: 'CLS',
            value: clsValue,
            rating: getRating('CLS', clsValue),
            delta: clsValue,
            id: generateUniqueId()
          };
          reportMetric(metric);
        }
      }
    });
  });

  observer.observe({ entryTypes: ['layout-shift'] });
};

// Measure Time to First Byte
export const measureTTFB = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        
        const metric: WebVitalMetric = {
          name: 'TTFB',
          value: ttfb,
          rating: getRating('TTFB', ttfb),
          delta: ttfb,
          id: generateUniqueId()
        };
        reportMetric(metric);
      }
    });
  });

  observer.observe({ entryTypes: ['navigation'] });
};

// Generate unique ID for metrics
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Initialize all Web Vitals measurements
export const initializeWebVitals = () => {
  // Only measure in production
  if (import.meta.env.DEV) return;

  measureFCP();
  measureLCP();
  measureFID();
  measureCLS();
  measureTTFB();
};

// Performance budget monitoring
export const monitorPerformanceBudget = () => {
  const budget = {
    maxJSSize: 500, // KB
    maxCSSSize: 100, // KB
    maxImageSize: 2000, // KB
    maxTotalSize: 3000, // KB
    maxRequests: 50
  };

  const observer = new PerformanceObserver((list) => {
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let requestCount = 0;

    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        const size = resourceEntry.transferSize || 0;
        
        totalSize += size;
        requestCount++;

        if (resourceEntry.name.includes('.js')) {
          jsSize += size;
        } else if (resourceEntry.name.includes('.css')) {
          cssSize += size;
        } else if (resourceEntry.name.match(/\.(png|jpg|jpeg|webp|svg|gif)$/)) {
          imageSize += size;
        }
      }
    });

    // Convert to KB
    const totalKB = Math.round(totalSize / 1024);
    const jsKB = Math.round(jsSize / 1024);
    const cssKB = Math.round(cssSize / 1024);
    const imageKB = Math.round(imageSize / 1024);

    console.group('Performance Budget Check');
    console.log(`Total size: ${totalKB}KB / ${budget.maxTotalSize}KB`);
    console.log(`JavaScript: ${jsKB}KB / ${budget.maxJSSize}KB`);
    console.log(`CSS: ${cssKB}KB / ${budget.maxCSSSize}KB`);
    console.log(`Images: ${imageKB}KB / ${budget.maxImageSize}KB`);
    console.log(`Requests: ${requestCount} / ${budget.maxRequests}`);

    // Warn if budget exceeded
    if (totalKB > budget.maxTotalSize) console.warn('⚠️ Total size budget exceeded');
    if (jsKB > budget.maxJSSize) console.warn('⚠️ JavaScript size budget exceeded');
    if (cssKB > budget.maxCSSSize) console.warn('⚠️ CSS size budget exceeded');
    if (imageKB > budget.maxImageSize) console.warn('⚠️ Image size budget exceeded');
    if (requestCount > budget.maxRequests) console.warn('⚠️ Request count budget exceeded');
    
    console.groupEnd();
  });

  observer.observe({ entryTypes: ['resource'] });
};

// Optimize images on the fly
export const optimizeImages = () => {
  const images = document.querySelectorAll('img[src]:not([data-optimized])');
  
  images.forEach((img) => {
    const imgElement = img as HTMLImageElement;
    const src = imgElement.src;
    
    // Skip if already optimized or is a data URL
    if (src.includes('?') || src.startsWith('data:') || src.startsWith('blob:')) {
      return;
    }

    // Add optimization parameters
    const url = new URL(src, window.location.origin);
    const params = new URLSearchParams(url.search);
    
    // Add width based on display size
    const displayWidth = imgElement.offsetWidth;
    if (displayWidth > 0) {
      params.set('w', Math.ceil(displayWidth * window.devicePixelRatio).toString());
    }
    
    // Add quality optimization
    if (!params.has('q')) {
      params.set('q', '80');
    }
    
    // Add format optimization for supported images
    if (src.match(/\.(jpg|jpeg|png)$/i) && !params.has('f')) {
      params.set('f', 'webp');
    }

    url.search = params.toString();
    imgElement.src = url.toString();
    imgElement.setAttribute('data-optimized', 'true');
  });
};

// Initialize all performance monitoring
export const initializePerformanceMonitoring = () => {
  initializeWebVitals();
  monitorPerformanceBudget();
  
  // Optimize images after page load
  window.addEventListener('load', () => {
    setTimeout(optimizeImages, 1000);
  });
};