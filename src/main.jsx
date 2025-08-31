import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { PerformanceMonitor } from '../components/ui/performance-monitor'
import { preloadCriticalResources, measureWebVitals, optimizeGSAP } from './utils/performance'

// Initialize performance optimizations
preloadCriticalResources();
measureWebVitals();
optimizeGSAP();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PerformanceMonitor />
    <App />
  </React.StrictMode>,
)