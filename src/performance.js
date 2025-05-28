import { lazy, Suspense } from 'react';
import reportWebVitals from './reportWebVitals';

// Simple lazy loading
export const lazyLoad = (importFunc) => {
  const LazyComponent = lazy(importFunc);
  return (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Basic resource preloading
export const preloadCriticalResources = () => {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/static/css/main.chunk.css';
  document.head.appendChild(criticalCSS);
};

// Basic image optimization
export const optimizeImages = () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!isInViewport(img)) {
      img.loading = 'lazy';
    }
  });
};

// Simple viewport check
const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Initialize basic performance optimizations
export const initPerformanceOptimizations = () => {
  reportWebVitals(console.log);
  preloadCriticalResources();
  optimizeImages();
}; 