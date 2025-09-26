import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import SEO, { seoData } from './utils/SEO'
import { AccessibilityImprovements } from '../components/ui/accessibility-improvements'
import { LazyComponent } from '../components/ui/lazy-component'

// Lazy load ALL components to reduce initial bundle size
const Home = React.lazy(() => import('../components/screens/Home/Home').then(m => ({ default: m.Home })));
const About = React.lazy(() => import('../components/screens/About/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('../components/screens/Contact/Contact').then(m => ({ default: m.Contact })));
const Blog = React.lazy(() => import('../components/screens/Blog/Blog').then(m => ({ default: m.Blog })));
const BlogDetails = React.lazy(() => import('../components/screens/BlogDetails/BlogDetails').then(m => ({ default: m.BlogDetails })));

const Portfolio = React.lazy(() => import('../app/Portfolio').then(m => ({ default: m.Portfolio })));
const ProjectDetails = React.lazy(() => import('../app/ProjectDetails').then(m => ({ default: m.ProjectDetails })));
const ResidentialInterior = React.lazy(() => import('../app/ResidentialInterior').then(m => ({ default: m.ResidentialInterior })));
const ApartmentInteriorDesign = React.lazy(() => import('../app/ResidentialInterior/ApartmentInteriorDesign').then(m => ({ default: m.ApartmentInteriorDesign })));
const HomeInteriorDesign = React.lazy(() => import('../app/ResidentialInterior/HomeInteriorDesign').then(m => ({ default: m.HomeInteriorDesign })));
const DuplexInteriorDesign = React.lazy(() => import('../app/ResidentialInterior/DuplexInteriorDesign').then(m => ({ default: m.DuplexInteriorDesign })));
const CorporateOfficeInterior = React.lazy(() => import('../app/CommercialInterior/CorporateOfficeInterior').then(m => ({ default: m.CorporateOfficeInterior })));
const CommercialInterior = React.lazy(() => import('../app/CommercialInterior').then(m => ({ default: m.CommercialInterior })));
const ArchitecturalConsultancy = React.lazy(() => import('../app/ArchitecturalConsultancy').then(m => ({ default: m.ArchitecturalConsultancy })));
const BookAppointment = React.lazy(() => import('../app/BookAppointment').then(m => ({ default: m.BookAppointment })));
const FAQ = React.lazy(() => import('../app/FAQ').then(m => ({ default: m.FAQ })));
const NotFound = React.lazy(() => import('../app/NotFound').then(m => ({ default: m.NotFound })));

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    document.documentElement.classList.add('scroll-instant');
    document.body.classList.add('scroll-instant');
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('scroll-instant');
      document.body.classList.remove('scroll-instant');
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
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
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SEO {...seoData.home} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <Home />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <SEO {...seoData.about} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <About />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <SEO {...seoData.contact} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <Contact />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/blog"
          element={
            <>
              <SEO {...seoData.blog} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <Blog />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <>
              {/* For dynamic blog posts, override SEO manually inside BlogDetails */}
              <SEO {...seoData.blog} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <BlogDetails />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/portfolio"
          element={
            <>
              <SEO {...seoData.portfolio} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <Portfolio />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/portfolio/project-details/:slug"
          element={
            <>
              {/* For dynamic project pages, override SEO inside ProjectDetails */}
              <SEO {...seoData.portfolio} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <ProjectDetails />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/residential-interior"
          element={
            <>
              <SEO {...seoData.residentialInterior} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <ResidentialInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/residential/apartment-interior-design"
          element={
            <>
              {/* No predefined seoData, add one if needed */}
              <SEO
                title="Apartment Interior Design - Interior Villa"
                description="Expert apartment interior design services tailored to maximize space and aesthetics. Discover smart, functional, and stylish interiors."
                url="https://interiorvillabd.com/services/residential/apartment-interior-design"
                type="service"
              />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <ApartmentInteriorDesign />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/residential/home-interior-design"
          element={
            <>
              {/* No predefined seoData, add one if needed */}
              <SEO
                title="Home Interior Design - Interior Villa"
                description="Expert home interior design services tailored to maximize space and aesthetics. Discover smart, functional, and stylish interiors."
                url="https://interiorvillabd.com/services/residential/home-interior-design"
                type="service"
              />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <HomeInteriorDesign />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/residential/duplex-interior-design"
          element={
            <>
              {/* No predefined seoData, add one if needed */}
              <SEO
                title="Duplex Interior Design - Interior Villa"
                description="Expert duplex interior design services tailored to maximize space and aesthetics. Discover smart, functional, and stylish interiors."
                url="https://interiorvillabd.com/services/residential/duplex-interior-design"
                type="service"
              />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <DuplexInteriorDesign />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior"
          element={
            <>
              <SEO {...seoData.commercialInterior} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <CommercialInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/corporate-and-office-interior-design"
          element={
            <>
              {/* No predefined seoData, add one if needed */}
              <SEO
                title="Corporate and Office Interior Design - Interior Villa"
                description="Corporate and Office Interior Design services tailored to maximize space and aesthetics. Discover smart, functional, and stylish interiors."
                url="https://interiorvillabd.com/services/commercial/corporate-and-office-interior-design"
                type="service"
              />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <CorporateOfficeInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/architectural-consultancy"
          element={
            <>
              <SEO {...seoData.architecturalConsultancy} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <ArchitecturalConsultancy />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/book-appointment"
          element={
            <>
              <SEO {...seoData.bookAppointment} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <BookAppointment />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/faq"
          element={
            <>
              <SEO {...seoData.faq} />
              <LazyComponent fallback={<PageLoadingFallback />}>
                <FAQ />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services"
          element={
            <div className="min-h-screen flex items-center justify-center">
              Services Page Coming Soon
            </div>
          }
        />
        <Route
          path="*"
           element={<Navigate to="/" replace />}
        />
      </Routes>
      <AccessibilityImprovements />
    </Router>
  )
}

export default App
