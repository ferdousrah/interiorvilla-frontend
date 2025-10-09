import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useLayoutEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { AccessibilityImprovements } from '../components/ui/accessibility-improvements'
import { LazyComponent } from '../components/ui/lazy-component'
import { WhatsAppWidget } from '../components/ui/whatsapp-widget.jsx'
import SEO from './utils/SEO';

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
const BuyingHouseOfficeInterior = React.lazy(() => import('../app/CommercialInterior/BuyingHouseOfficeInterior').then(m => ({ default: m.BuyingHouseOfficeInterior })));
const TravelAgencyOfficeInterior = React.lazy(() => import('../app/CommercialInterior/TravelAgencyOfficeInterior').then(m => ({ default: m.TravelAgencyOfficeInterior })));
const HotelHospitalityInterior = React.lazy(() => import('../app/CommercialInterior/HotelHospitalityInterior').then(m => ({ default: m.HotelHospitalityInterior })));
const RestaurantCafeInterior = React.lazy(() => import('../app/CommercialInterior/RestaurantCafeInterior').then(m => ({ default: m.RestaurantCafeInterior })));
const BrandShowroomInterior = React.lazy(() => import('../app/CommercialInterior/BrandShowroomInterior').then(m => ({ default: m.BrandShowroomInterior })));
const SalonLifestyleInterior = React.lazy(() => import('../app/CommercialInterior/SalonLifestyleInterior').then(m => ({ default: m.SalonLifestyleInterior })));
const HospitalClinicInterior = React.lazy(() => import('../app/CommercialInterior/HospitalClinicInterior').then(m => ({ default: m.HospitalClinicInterior })));
const PharmacyInterior = React.lazy(() => import('../app/CommercialInterior/PharmacyInterior').then(m => ({ default: m.PharmacyInterior })));
const DentalChamberInterior = React.lazy(() => import('../app/CommercialInterior/DentalChamberInterior').then(m => ({ default: m.DentalChamberInterior })));
const SpaAndBeautyParlorInterior = React.lazy(() => import('../app/CommercialInterior/SpaAndBeautyParlorInterior').then(m => ({ default: m.SpaAndBeautyParlorInterior })));
const ResortInterior = React.lazy(() => import('../app/CommercialInterior/ResortInterior').then(m => ({ default: m.ResortInterior })));
const RetailShopInterior = React.lazy(() => import('../app/CommercialInterior/RetailShopInterior').then(m => ({ default: m.RetailShopInterior })));
const EducationalInstituteInterior = React.lazy(() => import('../app/CommercialInterior/EducationalInstituteInterior').then(m => ({ default: m.EducationalInstituteInterior })));
const FitnessCenterInterior = React.lazy(() => import('../app/CommercialInterior/FitnessCenterInterior').then(m => ({ default: m.FitnessCenterInterior })));

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
              <LazyComponent fallback={<PageLoadingFallback />}>
                <CorporateOfficeInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/buying-house-office-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <BuyingHouseOfficeInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/travel-agency-office-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <TravelAgencyOfficeInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/hotel-and-hospitality-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <HotelHospitalityInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/restaurant-and-cafe-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <RestaurantCafeInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/brand-showroom-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <BrandShowroomInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/mens-salon-and-lifestyle-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <SalonLifestyleInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/hospital-and-clinic-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <HospitalClinicInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/pharmacy-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <PharmacyInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/dental-chamber-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <DentalChamberInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/spa-and-beauty-parlor-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <SpaAndBeautyParlorInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/resort-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <ResortInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/retail-shop-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <RetailShopInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/educational-institute-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <EducationalInstituteInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/commercial-interior/fitness-center-interior-design"
          element={
            <>              
              <LazyComponent fallback={<PageLoadingFallback />}>
                <FitnessCenterInterior />
              </LazyComponent>
            </>
          }
        />
        <Route
          path="/services/architectural-consultancy"
          element={
            <>              
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
              <LazyComponent fallback={<PageLoadingFallback />}>
                <FAQ />
              </LazyComponent>
            </>
          }
        />        
        <Route
          path="*"
           element={<Navigate to="/" replace />}
        />
      </Routes>
      <AccessibilityImprovements />
      <WhatsAppWidget />
    </Router>
  )
}

export default App
