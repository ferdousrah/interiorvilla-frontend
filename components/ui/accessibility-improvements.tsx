'use client'

import React, { useEffect } from 'react';

export const AccessibilityImprovements: React.FC = () => {
  useEffect(() => {
    // Add skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50';
    skipLink.style.cssText = `
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.cssText = `
        position: absolute;
        top: 1rem;
        left: 1rem;
        width: auto;
        height: auto;
        overflow: visible;
        background: #75BF44;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        z-index: 50;
        text-decoration: none;
      `;
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.cssText = `
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content landmark
    const mainContent = document.querySelector('main') || document.querySelector('#root > div');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }

    // Improve button accessibility
    const improveButtonAccessibility = () => {
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      buttons.forEach((button) => {
        const text = button.textContent?.trim();
        if (!text || text.length < 2) {
          // Add aria-label for icon-only buttons
          const icon = button.querySelector('svg');
          if (icon) {
            const title = button.getAttribute('title');
            if (title) {
              button.setAttribute('aria-label', title);
            } else {
              button.setAttribute('aria-label', 'Button');
            }
          }
        }
      });
    };

    // Improve heading hierarchy
    const improveHeadingHierarchy = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let currentLevel = 1; // Start from h1 level
      
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > currentLevel + 1 && currentLevel > 0) {
          console.warn(`Heading hierarchy issue: ${heading.tagName} follows h${currentLevel}`);
        }
        if (level > 0) {
          currentLevel = level;
        }
      });
    };

    // Add focus indicators
    const addFocusIndicators = () => {
      const style = document.createElement('style');
      style.textContent = `
        *:focus-visible {
          outline: 2px solid #75BF44 !important;
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
      `;
      document.head.appendChild(style);
    };

    // Run improvements
    setTimeout(() => {
      improveButtonAccessibility();
      improveHeadingHierarchy();
      addFocusIndicators();
    }, 1000);

    return () => {
      // Cleanup
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  return null;
};

// Color contrast checker utility
export const checkColorContrast = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      const val = parseInt(c) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};