import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { updateSEO, seoData } from './utils/seo'
import { Home } from '../components/screens/Home/Home'
import { About } from '../components/screens/About/About'
import { Contact } from '../components/screens/Contact/Contact'
import { Blog } from '../components/screens/Blog/Blog'
import { Portfolio } from '../app/Portfolio'
import { ProjectDetails } from '../app/ProjectDetails'
import { ResidentialInterior } from '../app/ResidentialInterior'
import { CommercialInterior } from '../app/CommercialInterior'
import { ArchitecturalConsultancy } from '../app/ArchitecturalConsultancy'
import { BookAppointment } from '../app/BookAppointment'
import { FAQ } from '../app/FAQ'
import { NotFound } from '../app/NotFound'
import { BlogDetails } from '../components/screens/BlogDetails/BlogDetails'
import '../app/globals.css'

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
function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SEORoute seoKey="home"><Home /></SEORoute>} />
        <Route path="/about" element={<SEORoute seoKey="about"><About /></SEORoute>} />
        <Route path="/contact" element={<SEORoute seoKey="contact"><Contact /></SEORoute>} />
        <Route path="/blog" element={<SEORoute seoKey="blog"><Blog /></SEORoute>} />
        <Route path="/blog/:id" element={<SEORoute seoKey="blog"><BlogDetails /></SEORoute>} />
        <Route path="/blog-details" element={<SEORoute seoKey="blog"><BlogDetails /></SEORoute>} />
        <Route path="/portfolio" element={<SEORoute seoKey="portfolio"><Portfolio /></SEORoute>} />
        <Route path="/project-details/:id" element={<SEORoute seoKey="portfolio"><ProjectDetails /></SEORoute>} />
        <Route path="/residential-interior" element={<SEORoute seoKey="residentialInterior"><ResidentialInterior /></SEORoute>} />
        <Route path="/commercial-interior" element={<SEORoute seoKey="commercialInterior"><CommercialInterior /></SEORoute>} />
        <Route path="/architectural-consultancy" element={<SEORoute seoKey="architecturalConsultancy"><ArchitecturalConsultancy /></SEORoute>} />
        <Route path="/book-appointment" element={<SEORoute seoKey="bookAppointment"><BookAppointment /></SEORoute>} />
        <Route path="/faq" element={<SEORoute seoKey="faq"><FAQ /></SEORoute>} />
        <Route path="/services" element={<div className="min-h-screen flex items-center justify-center">Services Page Coming Soon</div>} />
        <Route path="*" element={<SEORoute seoKey="notFound"><NotFound /></SEORoute>} />
      </Routes>
    </Router>
  )
}

export default App