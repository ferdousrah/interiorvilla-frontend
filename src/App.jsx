import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { updateSEO, seoData } from './utils/seo'
import { AccessibilityImprovements } from '../components/ui/accessibility-improvements'
import { LazyComponent } from '../components/ui/lazy-component'
import { Home } from '../components/screens/Home/Home'
import { About } from '../components/screens/About/About'
import { Contact } from '../components/screens/Contact/Contact'
import { Blog } from '../components/screens/Blog/Blog'
import { BlogDetails } from '../components/screens/BlogDetails/BlogDetails'
import '../app/globals.css'

// Lazy load non-critical pages
const Portfolio = React.lazy(() => import('../app/Portfolio').then(m => ({ default: m.Portfolio })));
const ProjectDetails = React.lazy(() => import('../app/ProjectDetails').then(m => ({ default: m.ProjectDetails })));
const ResidentialInterior = React.lazy(() => import('../app/ResidentialInterior').then(m => ({ default: m.ResidentialInterior })));
const CommercialInterior = React.lazy(() => import('../app/CommercialInterior').then(m => ({ default: m.CommercialInterior })));
const ArchitecturalConsultancy = React.lazy(() => import('../app/ArchitecturalConsultancy').then(m => ({ default: m.ArchitecturalConsultancy })));
const BookAppointment = React.lazy(() => import('../app/BookAppointment').then(m => ({ default: m.BookAppointment })));
const FAQ = React.lazy(() => import('../app/FAQ').then(m => ({ default: m.FAQ })));
const NotFound = React.lazy(() => import('../app/NotFound').then(m => ({ default: m.NotFound })));

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// SEO wrapper component
const SEORoute = ({ children, seoKey }) => {
  useEffect(() => {
    if (seoData[seoKey]) {
      updateSEO(seoData[seoKey]);
    }
  }, [seoKey]);

  return children;
};

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 [font-family:'Fahkwang',Helvetica]">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AccessibilityImprovements />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SEORoute seoKey="home"><Home /></SEORoute>} />
        <Route path="/about" element={<SEORoute seoKey="about"><About /></SEORoute>} />
        <Route path="/contact" element={<SEORoute seoKey="contact"><Contact /></SEORoute>} />
        <Route path="/blog" element={<SEORoute seoKey="blog"><Blog /></SEORoute>} />
        <Route path="/blog/:id" element={<SEORoute seoKey="blog"><BlogDetails /></SEORoute>} />
        <Route path="/blog-details" element={<SEORoute seoKey="blog"><BlogDetails /></SEORoute>} />
        <Route path="/portfolio" element={
          <SEORoute seoKey="portfolio">
            <LazyComponent fallback={<PageLoadingFallback />}>
              <Portfolio />
            </LazyComponent>
          </SEORoute>
        } />
        <Route path="/project-details/:id" element={
          <SEORoute seoKey="portfolio">
            <LazyComponent fallback={<PageLoadingFallback />}>
              <ProjectDetails />
            </LazyComponent>
          </SEORoute>
        } />
        <Route path="/residential-interior" element={
          <SEORoute seoKey="residentialInterior">
            <LazyComponent fallback={<PageLoadingFallback />}>
              <ResidentialInterior />
            </LazyComponent>
          </SEORoute>
        } />
        <Route path="/commercial-interior" element={
          <SEORoute seoKey="commercialInterior">
            <LazyComponent fallback={<PageLoadingFallback />}>
              <CommercialInterior />
            </LazyComponent>
          </SEORoute>
        } />
        <Route path="/architectural-consultancy" element={
          <SEORoute seoKey="architecturalConsultancy">
            <LazyComponent fallback={<PageLoadingFallback />}>
              <ArchitecturalConsultancy />
            </LazyComponent>
          </SEORoute>
        } />
        <Route path="/book-appointment" element={
          <SEORoute seoKey="bookAppointment">
            <LazyComponent fallback={<PageLoadingFallback />}>
              <BookAppointment />
            </LazyComponent>
          </SEORoute>
        } />
        <Route path="/faq" element={
          <SEORoute seoKey="faq">
            <LazyComponent fallback={<PageLoadingFallback />}>
              <FAQ />
            </LazyComponent>
          </SEORoute>
        } />
        <Route path="/services" element={<div className="min-h-screen flex items-center justify-center">Services Page Coming Soon</div>} />
        <Route path="*" element={
          <SEORoute seoKey="notFound">
            <LazyComponent fallback={<PageLoadingFallback />}>
              <NotFound />
            </LazyComponent>
          </SEORoute>
        } />
      </Routes>
    </Router>
  )
}

export default App