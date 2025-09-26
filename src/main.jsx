import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '../app/globals.css';
import { HelmetProvider } from 'react-helmet-async';

// Create root with concurrent features
const root = ReactDOM.createRoot(document.getElementById('root'), {
  // Enable concurrent features for better performance
  unstable_strictMode: true
});

// Render app with HelmetProvider for SEO
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Service Worker registration for caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize performance optimizations after app loads
import('./utils/performance-optimizations').then(module => {
  module.initializePerformanceOptimizations();
});

import('./utils/web-vitals').then(module => {
  module.initializePerformanceMonitoring();
});
