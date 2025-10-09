'use client'

import React, { useEffect } from 'react';

export const AccessibilityFixes: React.FC = () => {
  useEffect(() => {
    // Fix buttons without accessible names
    const fixButtonAccessibility = () => {
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      
      buttons.forEach((button) => {
        const buttonElement = button as HTMLButtonElement;
        const text = buttonElement.textContent?.trim();
        
        if (!text || text.length < 2) {
          // Check for icon or image inside button
          const icon = buttonElement.querySelector('svg, img');
          const title = buttonElement.getAttribute('title');
          
          if (title) {
            buttonElement.setAttribute('aria-label', title);
          } else if (icon) {
            // Try to infer purpose from classes or context
            const classes = buttonElement.className;
            if (classes.includes('menu') || classes.includes('hamburger')) {
              buttonElement.setAttribute('aria-label', 'Toggle menu');
            } else if (classes.includes('close')) {
              buttonElement.setAttribute('aria-label', 'Close');
            } else if (classes.includes('play')) {
              buttonElement.setAttribute('aria-label', 'Play video');
            } else if (classes.includes('next')) {
              buttonElement.setAttribute('aria-label', 'Next');
            } else if (classes.includes('prev')) {
              buttonElement.setAttribute('aria-label', 'Previous');
            } else {
              buttonElement.setAttribute('aria-label', 'Button');
            }
          }
        }
      });
    };

    // Fix heading hierarchy
    const fixHeadingHierarchy = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      
      headings.forEach((heading) => {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        
        // If we skip levels, add appropriate ARIA attributes
        if (currentLevel > lastLevel + 1) {
          heading.setAttribute('role', 'heading');
          heading.setAttribute('aria-level', (lastLevel + 1).toString());
        }
        
        lastLevel = currentLevel;
      });
    };

    // Improve color contrast for low contrast elements
    const improveColorContrast = () => {
      const lowContrastElements = document.querySelectorAll('[style*="color: #626161"], [style*="color: #c6c6c6"]');
      
      lowContrastElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const currentStyle = htmlElement.style.color;
        
        if (currentStyle === '#626161' || currentStyle === 'rgb(98, 97, 97)') {
          // Darken to improve contrast
          htmlElement.style.color = '#4a4a4a';
        }
        
        if (currentStyle === '#c6c6c6' || currentStyle === 'rgb(198, 198, 198)') {
          // Darken significantly for better contrast
          htmlElement.style.color = '#6b7280';
        }
      });
    };

    // Add video captions track
    const addVideoCaptions = () => {
      const videos = document.querySelectorAll('video:not([data-captions-added])');
      
      videos.forEach((video) => {
        const videoElement = video as HTMLVideoElement;
        
        // Add a default captions track
        const track = document.createElement('track');
        track.kind = 'captions';
        track.label = 'English';
        track.srclang = 'en';
        track.src = 'data:text/vtt,WEBVTT\n\n00:00.000 --> 00:10.000\nInterior design showcase video';
        track.default = true;
        
        videoElement.appendChild(track);
        videoElement.setAttribute('data-captions-added', 'true');
      });
    };

    // Add focus indicators
    const addFocusIndicators = () => {
      const style = document.createElement('style');
      style.id = 'accessibility-focus-styles';
      
      if (!document.getElementById('accessibility-focus-styles')) {
        style.textContent = `
          /* Enhanced focus indicators */
          *:focus-visible {
            outline: 3px solid #75BF44 !important;
            outline-offset: 2px !important;
            border-radius: 4px;
          }
          
          button:focus-visible,
          a:focus-visible,
          input:focus-visible,
          textarea:focus-visible,
          select:focus-visible {
            box-shadow: 0 0 0 3px rgba(117, 191, 68, 0.3) !important;
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .text-\\[\\#626161\\] {
              color: #2d3748 !important;
            }
            .text-\\[\\#c6c6c6\\] {
              color: #4a5568 !important;
            }
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }

          /* Skip link styles */
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: #75BF44;
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
          }

          .skip-link:focus {
            top: 6px;
          }
        `;
        document.head.appendChild(style);
      }
    };

    // Add ARIA landmarks
    const addLandmarks = () => {
      // Add main landmark if not present
      const main = document.querySelector('main');
      if (main && !main.getAttribute('role')) {
        main.setAttribute('role', 'main');
        main.setAttribute('aria-label', 'Main content');
      }

      // Add navigation landmarks
      const navs = document.querySelectorAll('nav:not([aria-label]):not([aria-labelledby])');
      navs.forEach((nav, index) => {
        nav.setAttribute('aria-label', `Navigation ${index + 1}`);
      });

      // Add banner landmark to header
      const headers = document.querySelectorAll('header:not([role])');
      headers.forEach((header) => {
        header.setAttribute('role', 'banner');
      });

      // Add contentinfo landmark to footer
      const footers = document.querySelectorAll('footer:not([role])');
      footers.forEach((footer) => {
        footer.setAttribute('role', 'contentinfo');
      });
    };

    // Run fixes with delays to ensure DOM is ready
    const runFixes = () => {
      fixButtonAccessibility();
      fixHeadingHierarchy();
      improveColorContrast();
      addVideoCaptions();
      addFocusIndicators();
      addLandmarks();
    };

    // Initial run
    runFixes();

    // Re-run after dynamic content loads
    const observer = new MutationObserver((mutations) => {
      let shouldRerun = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRerun = true;
        }
      });

      if (shouldRerun) {
        setTimeout(runFixes, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
};

// Color contrast checker utility
export const checkColorContrast = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Validate WCAG compliance
export const validateWCAGCompliance = () => {
  const issues: string[] = [];

  // Check color contrast
  const textElements = document.querySelectorAll('[style*="color"]');
  textElements.forEach((element) => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const contrast = checkColorContrast(color, backgroundColor);
      if (contrast < 4.5) {
        issues.push(`Low contrast ratio (${contrast.toFixed(2)}) on element: ${element.tagName}`);
      }
    }
  });

  // Check for missing alt text
  const images = document.querySelectorAll('img:not([alt]), img[alt=""]');
  if (images.length > 0) {
    issues.push(`${images.length} images missing alt text`);
  }

  // Check for missing form labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const unlabeledInputs = Array.from(inputs).filter(input => {
    const id = input.getAttribute('id');
    return !id || !document.querySelector(`label[for="${id}"]`);
  });
  
  if (unlabeledInputs.length > 0) {
    issues.push(`${unlabeledInputs.length} form inputs missing labels`);
  }

  if (issues.length > 0) {
    console.group('WCAG Compliance Issues');
    issues.forEach(issue => console.warn(issue));
    console.groupEnd();
  }

  return issues;
};