import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initializePerformanceOptimizations } from './utils/performance-optimizations'

// Initialize performance optimizations immediately
initializePerformanceOptimizations();

// Create root with concurrent features
const root = ReactDOM.createRoot(document.getElementById('root'), {
  // Enable concurrent features for better performance
  unstable_strictMode: true
});

// Render app with performance monitoring
root.render(
  <React.StrictMode>
    <App />
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