'use client'

import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../ui/button";
import { ServicesSection } from "./sections/ServicesSection/ServicesSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { TestimonialSection } from "./sections/TestimonialSection/TestimonialSection";
import { AboutSection } from "./sections/AboutSection/AboutSection";
import { OurProcessSection } from "./sections/OurProcessSection/OurProcessSection";
import { OurFeaturedWorksSection } from "./sections/OurFeaturedWorksSection/OurFeaturedWorksSection";
import { FeaturedWorksHeaderSection } from "./sections/FeaturedWorksHeaderSection/FeaturedWorksHeaderSection";
import { motion, AnimatePresence } from "framer-motion";
import { BlogSection } from "./sections/BlogSection/BlogSection";
import { CustomCursor } from "../../ui/cursor";
import { CTASection } from "./sections/CTASection/CTASection";
import { X, ChevronDown, Home as HomeIcon, User, Briefcase, FolderOpen, BookOpen, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LazyComponent } from "../../ui/lazy-component";

// Lazy load heavy components
const GLBModelViewer = React.lazy(() => 
  import("../../ui/glb-model-viewer").then(m => ({ default: m.GLBModelViewer }))
);

// Lazy load GSAP only when needed
const loadGSAP = async () => {
  const [gsap, ScrollTrigger, SplitText] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
    import("gsap/SplitText")
  ]);
  
  gsap.default.registerPlugin(ScrollTrigger.ScrollTrigger, SplitText.SplitText);
  return { gsap: gsap.default, ScrollTrigger: ScrollTrigger.ScrollTrigger, SplitText: SplitText.SplitText };
};

// Throttle function for performance
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const Home = (): JSX.Element => {
  const navigate = useNavigate();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const submenuItemRefs = useRef<{ [key: string]: (HTMLButtonElement | null)[] }>({});
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const cachedScrollY = useRef(0);
  const cachedHeaderRect = useRef<DOMRect | null>(null);

  const navItems = [
    { 
      name: "Home", 
      active: true,
      icon: HomeIcon,
      href: "/"
    },
    { 
      name: "About Us", 
      active: false,
      icon: User,
      href: "/about"
    },
    { 
      name: "Services", 
      active: false,
      icon: Briefcase,
      href: "#",
      subItems: [
        { name: "Residential Interior", href: "/residential-interior" },
        { name: "Commercial Interior", href: "/commercial-interior" },
        { name: "Architectural Consultancy", href: "/architectural-consultancy" }
      ],
      megaMenu: {
        sections: [
          {
            title: "Residential",
            description: "Transform your home into a sanctuary",
            icon: "🏠",
            color: "#75BF44",
            links: [
              { name: "Living Room Design", href: "/residential-interior#living-room" },
              { name: "Bedroom Design", href: "/residential-interior#bedroom" },
              { name: "Kitchen Design", href: "/residential-interior#kitchen" },
              { name: "Bathroom Design", href: "/residential-interior#bathroom" },
              { name: "Home Office", href: "/residential-interior#home-office" },
              { name: "View All Residential", href: "/residential-interior", featured: true }
            ]
          },
          {
            title: "Commercial",
            description: "Create inspiring workspaces",
            icon: "🏢",
            color: "#EE5428",
            links: [
              { name: "Office Design", href: "/commercial-interior#office" },
              { name: "Retail Spaces", href: "/commercial-interior#retail" },
              { name: "Restaurant Design", href: "/commercial-interior#restaurant" },
              { name: "Hotel Interiors", href: "/commercial-interior#hotel" },
              { name: "Corporate Spaces", href: "/commercial-interior#corporate" },
              { name: "View All Commercial", href: "/commercial-interior", featured: true }
            ]
          },
          {
            title: "Architectural",
            description: "Expert architectural solutions",
            icon: "📐",
            color: "#4F46E5",
            links: [
              { name: "Building Design", href: "/architectural-consultancy#building" },
              { name: "Space Planning", href: "/architectural-consultancy#planning" },
              { name: "3D Visualization", href: "/architectural-consultancy#visualization" },
              { name: "Technical Drawings", href: "/architectural-consultancy#drawings" },
              { name: "Project Management", href: "/architectural-consultancy#management" },
              { name: "View All Services", href: "/architectural-consultancy", featured: true }
            ]
          }
        ]
      }
    },
    { 
      name: "Portfolio", 
      active: false,
      icon: FolderOpen,
      href: "/portfolio"
    },
    { 
      name: "Blog", 
      active: false,
      icon: BookOpen,
      href: "/blog"
    },
    { 
      name: "Contact Us", 
      active: false,
      icon: Mail,
      href: "/contact"
    },
  ];

  // Handle mouse enter with immediate response
  const handleMouseEnter = (itemName: string) => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredMenu(itemName);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    // Set a delay before hiding the submenu
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 300); // Increased delay to 300ms
  };

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) return;
      
      rafId.current = requestAnimationFrame(() => {
      const scrollPosition = window.scrollY;
      
        // Only update if scroll changed significantly
        if (Math.abs(scrollPosition - cachedScrollY.current) < 5) {
          rafId.current = null;
          return;
        }
        
        const scrollDirection = scrollPosition > lastScrollY.current ? 'down' : 'up';
        const shouldBeScrolled = scrollPosition > 100;
        
        // Batch state updates
        if (scrollDirection === 'up' && scrollPosition > 100) {
          setIsScrollingUp(true);
        } else if (scrollDirection === 'down') {
          setIsScrollingUp(false);
        }
        
        if (shouldBeScrolled !== isScrolled) {
          setIsScrolled(shouldBeScrolled);
        }
        
        lastScrollY.current = scrollPosition;
        cachedScrollY.current = scrollPosition;
        rafId.current = null;
      });
    };
      
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isScrolled]);

  // Enhanced header animations
  useEffect(() => {
    if (!headerRef.current || !logoRef.current || !menuContainerRef.current) return;

    const header = headerRef.current;
    const logo = logoRef.current;
    const menuContainer = menuContainerRef.current;

    // Use CSS custom properties to avoid forced reflows
    const updateHeaderStyles = () => {
      const shouldTransform = isScrolled && isScrollingUp;
      
      // Batch all style updates in a single RAF
      requestAnimationFrame(() => {
        header.style.setProperty('--header-height', shouldTransform ? '60px' : '90px');
        header.style.setProperty('--header-bg', shouldTransform ? 'rgba(27, 27, 27, 0.95)' : 'transparent');
        header.style.setProperty('--header-backdrop', shouldTransform ? 'blur(20px)' : 'none');
        header.style.setProperty('--header-shadow', shouldTransform ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none');
        header.style.setProperty('--header-transform', shouldTransform ? 'translateY(0)' : isScrolled ? 'translateY(-100%)' : 'translateY(0)');
        
        logo.style.setProperty('--logo-scale', shouldTransform ? '0.8' : '1');
        
        menuContainer.style.setProperty('--menu-height', shouldTransform ? '50px' : '60px');
        menuContainer.style.setProperty('--menu-padding', shouldTransform ? '0 16px' : '0 16px');
      });
    };
    
    updateHeaderStyles();
  }, [isScrolled, isScrollingUp]);

  useEffect(() => {
    if (!heroImageRef.current || !heroContainerRef.current) return;

    const heroImage = heroImageRef.current;
    const heroContainer = heroContainerRef.current;
    let cachedRect: DOMRect | null = null;
    let parallaxRafId: number | null = null;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      
      // Only update if scroll position changed significantly
      if (Math.abs(scrolled - cachedScrollY.current) < 2) {
        parallaxRafId = requestAnimationFrame(updateParallax);
        return;
      }
      
      cachedScrollY.current = scrolled;
      
      // Cache rect calculation and only update when needed  
      if (!cachedRect || Math.abs(scrolled - cachedScrollY.current) > 50) {
        cachedRect = heroContainer.getBoundingClientRect();
      }
      
      if (cachedRect.bottom >= 0 && cachedRect.top <= window.innerHeight) {
        const rate = scrolled * -0.2; // Further reduced parallax intensity
        const scale = Math.max(1, 1.03 - scrolled * 0.00003); // Reduced scale effect
        
        // Use CSS custom properties to avoid forced reflows
        heroImage.style.setProperty('--parallax-y', `${rate}px`);
        heroImage.style.setProperty('--parallax-scale', scale.toString());
      }
      
      parallaxRafId = requestAnimationFrame(updateParallax);
    };

    parallaxRafId = requestAnimationFrame(updateParallax);
    
    return () => {
      if (parallaxRafId) {
        cancelAnimationFrame(parallaxRafId);
      }
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Add hover animation for submenu items
  useEffect(() => {
    // Defer submenu animations to reduce initial load
    const timer = setTimeout(() => {
      navItems.forEach((item) => {
        if (item.subItems) {
          item.subItems.forEach((subItem, subIndex) => {
            const key = `${item.name}-${subIndex}`;
            // Animation will be applied when submenu items are rendered
          });
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Function to add hover animation to submenu item
  const addSubmenuItemAnimation = (element: HTMLButtonElement, key: string) => {
    if (!element || element.dataset.animationKey) return;

    // Use simple CSS transforms instead of GSAP for better performance
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'translateX(4px) scale(1.02)';
      element.style.transition = 'transform 0.2s ease-out';
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translateX(0) scale(1)';
      element.style.transition = 'transform 0.2s ease-out';
    });

    element.dataset.animationKey = key;
  };

  const submenuVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.3,
        when: "beforeChildren"
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const sidebarVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const menuItemVariants = {
    closed: {
      x: -50,
      opacity: 0
    },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const handleSubmenuToggle = (itemName: string) => {
    setExpandedSubmenu(expandedSubmenu === itemName ? null : itemName);
  };

  const handleSubmenuNavigation = (href: string) => {
    // Ensure scroll to top before navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      <div ref={heroContainerRef} className="w-full relative overflow-hidden">
        <section className="w-full h-[800px] bg-gradient-to-br from-black via-gray-900 to-black">
          <LazyComponent fallback={
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-white text-lg font-medium [font-family:'Fahkwang',Helvetica]">Loading 3D Experience</div>
              </div>
            </div>
          }>
            <GLBModelViewer className="w-full h-full" modelPath="https://assets.interiorvillabd.com/intro.glb" />
          </LazyComponent>
        </section>

        <header 
          ref={headerRef}
          className={`${
            isScrolled && isScrollingUp
              ? 'fixed top-0 left-0 w-full z-50' 
              : 'absolute w-full top-[22px] z-50'
          } transition-all duration-700 ease-out`}
          style={{
            height: (isScrolled && isScrollingUp) ? "60px" : "90px",
            backgroundColor: (isScrolled && isScrollingUp) ? "rgba(27, 27, 27, 0.95)" : "transparent",
            backdropFilter: (isScrolled && isScrollingUp) ? "blur(20px)" : "none",
            boxShadow: (isScrolled && isScrollingUp) ? "0 8px 32px rgba(0, 0, 0, 0.1)" : "none",
            transform: (isScrolled && isScrollingUp) ? "translateY(0)" : isScrolled ? "translateY(-100%)" : "translateY(0)"
          }}
        >
          <div className="container mx-auto px-4 relative flex items-center justify-between h-full">
            <Link to="/" aria-label="Interior Villa Home">
              <img
                ref={logoRef}
                className="w-52 h-[41px] object-cover z-10 cursor-pointer logo-container"
                alt="Interior villa dark"
                src="/interior-villa-dark.png"
              />
            </Link>
            
            <div 
              ref={menuContainerRef}
              className={`flex items-center menu-container ${
                !(isScrolled && isScrollingUp) && 'bg-white-fade rounded-[50px] backdrop-blur-[5px] px-4'
              }`}
              style={{ minWidth: "fit-content" }}
            >
              <div className="flex items-center justify-end h-full">
                <button 
                  aria-label="Toggle mobile menu"
                  className="lg:hidden text-white transition-all duration-300 hover:scale-110 z-50 relative"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <motion.div
                    animate={isMobileMenuOpen ? "open" : "closed"}
                    className="w-6 h-6 flex flex-col justify-center items-center"
                  >
                    <motion.span
                      variants={{
                        closed: { rotate: 0, y: 0 },
                        open: { rotate: 45, y: 6 }
                      }}
                      className="w-6 h-0.5 bg-current block transform origin-center transition-all duration-300"
                    />
                    <motion.span
                      variants={{
                        closed: { opacity: 1 },
                        open: { opacity: 0 }
                      }}
                      className="w-6 h-0.5 bg-current block mt-1.5 transition-all duration-300"
                    />
                    <motion.span
                      variants={{
                        closed: { rotate: 0, y: 0 },
                        open: { rotate: -45, y: -6 }
                      }}
                      className="w-6 h-0.5 bg-current block mt-1.5 transform origin-center transition-all duration-300"
                    />
                  </motion.div>
                </button>

                <div className="hidden lg:block">
                  <nav className="flex space-x-2" role="navigation" aria-label="Main navigation">
                    {navItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="relative group"
                        onMouseEnter={() => handleMouseEnter(item.name)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link to={item.href} aria-label={`Navigate to ${item.name}`}>
                          <Button
                            variant={item.active ? "default" : "ghost"}
                            className={`min-w-[108px] px-6 rounded-[50px] whitespace-nowrap transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 hover:shadow-lg ${
                              item.active
                                ? "bg-primary text-white shadow-lg"
                                : "bg-transparent text-[#c6c6c6] hover:shadow-[0_0_20px_rgba(117,191,68,0.3)]"
                            }`}
                            style={{
                             height: (isScrolled && isScrollingUp) ? "36px" : "38px",
                             fontSize: (isScrolled && isScrollingUp) ? "13px" : "14px"
                            }}
                            onClick={() => {
                              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                            }}
                          >
                            <span className="[font-family:'Fahkwang',Helvetica] font-medium text-center transition-all duration-300">
                              {item.name}
                            </span>
                            {item.subItems && (
                              <motion.span
                                className="ml-1 text-xs transition-all duration-300"
                                animate={{ rotate: hoveredMenu === item.name ? 180 : 0 }}
                              >
                                +
                              </motion.span>
                            )}
                          </Button>
                        </Link>
                        
                        <AnimatePresence>
                          {item.subItems && hoveredMenu === item.name && (
                            item.name === "Services" && item.megaMenu ? (
                              <motion.div
                                variants={submenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                role="menu"
                                aria-label="Services mega menu"
                               className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200"
                                style={{
                                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 0, 0, 0.1)"
                                }}
                                onMouseEnter={() => handleMouseEnter(item.name)}
                                onMouseLeave={handleMouseLeave}
                              >
                                {/* Mega Menu Header */}
                                <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 px-8 py-6 border-b border-gray-100">
                                  <h3 className="text-2xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-2">
                                    Our Services
                                  </h3>
                                  <p className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                                    Comprehensive interior design solutions for every space
                                  </p>
                                </div>

                                {/* Mega Menu Content */}
                                <div className="grid grid-cols-3 gap-0">
                                  {item.megaMenu.sections.map((section, sectionIndex) => (
                                    <motion.div
                                      key={sectionIndex}
                                      variants={itemVariants}
                                      transition={{ delay: sectionIndex * 0.1 }}
                                      className="p-6 hover:bg-gray-50/50 transition-colors duration-300 border-r border-gray-100 last:border-r-0"
                                    >
                                      {/* Section Header */}
                                      <div className="flex items-center mb-4">
                                        <div 
                                          className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 text-lg"
                                          style={{ backgroundColor: `${section.color}15` }}
                                        >
                                          {section.icon}
                                        </div>
                                        <div>
                                          <h4 
                                            className="text-lg font-semibold [font-family:'Fahkwang',Helvetica] mb-1"
                                            style={{ color: section.color }}
                                          >
                                            {section.title}
                                          </h4>
                                          <p className="text-xs text-[#626161] [font-family:'Fahkwang',Helvetica]">
                                            {section.description}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Section Links */}
                                      <div className="space-y-2">
                                        {section.links.map((link, linkIndex) => (
                                          <motion.button
                                            key={linkIndex}
                                            role="menuitem"
                                            variants={itemVariants}
                                            transition={{ delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                                            onClick={() => navigate(link.href)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 [font-family:'Fahkwang',Helvetica] relative group overflow-hidden ${
                                              link.featured 
                                                ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-[#01190c] font-medium border border-primary/20 hover:border-primary/40 hover:shadow-md' 
                                                : 'text-[#626161] hover:text-[#01190c] hover:bg-gray-100/80'
                                            }`}
                                          >
                                            <span className="relative z-10 text-sm">
                                              {link.name}
                                            </span>
                                            {link.featured && (
                                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                                            )}
                                          </motion.button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>

                                {/* Mega Menu Footer */}
                                <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                                      Need help choosing? <span className="text-primary font-medium">Contact our experts</span>
                                    </div>
                                    <button
                                      onClick={() => navigate('/contact')}
                                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium [font-family:'Fahkwang',Helvetica] hover:bg-primary-hover transition-all duration-300 hover:scale-105"
                                    >
                                      Get Consultation
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                variants={submenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                role="menu"
                                aria-label={`${item.name} submenu`}
                                className="absolute top-full left-0 mt-2 min-w-[200px] bg-[#1b1b1b] rounded-lg shadow-2xl overflow-hidden z-50 border border-[#333333]"
                                style={{
                                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 0, 0, 0.3)"
                                }}
                                onMouseEnter={() => handleMouseEnter(item.name)}
                                onMouseLeave={handleMouseLeave}
                              >
                                <motion.div className="py-2">
                                  {item.subItems.map((subItem, subIndex) => (
                                    <motion.button
                                      key={subIndex}
                                      role="menuitem"
                                      ref={(el) => {
                                        const key = `${item.name}-${subIndex}`;
                                        if (el && !el.dataset.animationKey) {
                                          addSubmenuItemAnimation(el, key);
                                        }
                                      }}
                                      variants={itemVariants}
                                      transition={{ delay: subIndex * 0.1 }}
                                      onClick={() => navigate(subItem.href)}
                                      className="w-full px-4 py-3 text-left text-sm text-white hover:text-primary transition-colors duration-300 [font-family:'Fahkwang',Helvetica] relative group overflow-hidden"
                                      style={{ 
                                        transformStyle: 'preserve-3d',
                                        perspective: '500px'
                                      }}
                                    >
                                      <span className="relative z-10">{subItem.name}</span>
                                    </motion.button>
                                  ))}
                                </motion.div>
                              </motion.div>
                            )
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Sidebar */}
              <motion.div
                variants={sidebarVariants}
                initial="closed"
                animate="open"
                exit="closed"
                role="navigation"
                aria-label="Mobile navigation"
                className="fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] z-50 lg:hidden shadow-2xl"
                style={{
                  boxShadow: "20px 0 40px rgba(0, 0, 0, 0.3)"
                }}
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} aria-label="Interior Villa Home">
                    <img
                      className="w-40 h-8 object-cover"
                      alt="Interior villa dark"
                      src="/interior-villa-dark.png"
                    />
                  </Link>
                  <button
                    aria-label="Close mobile menu"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-white hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex flex-col p-6 space-y-2 overflow-y-auto h-full pb-20" role="navigation" aria-label="Mobile menu items">
                  {navItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.div
                        key={index}
                        custom={index}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                        className="relative"
                      >
                        <div
                          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer group ${
                            item.active
                              ? "bg-primary text-white shadow-lg"
                              : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                          }`}
                          onClick={() => {
                            if (item.subItems) {
                              handleSubmenuToggle(item.name);
                            } else {
                              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                              navigate(item.href);
                              setIsMobileMenuOpen(false);
                            }
                          }}
                        >
                          <Link to={item.href} className="flex items-center space-x-4 flex-1" aria-label={`Navigate to ${item.name}`} onClick={(e) => {
                            if (item.subItems) {
                              e.preventDefault();
                            }
                          }}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              item.active 
                                ? "bg-white/20" 
                                : "bg-gray-700/50 group-hover:bg-gray-600/50"
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <span className="[font-family:'Fahkwang',Helvetica] font-medium text-base">
                              {item.name}
                            </span>
                          </Link>
                          {item.subItems && (
                            <motion.div
                              animate={{ rotate: expandedSubmenu === item.name ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="w-6 h-6 flex items-center justify-center"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          )}
                        </div>

                        {/* Submenu */}
                        <AnimatePresence>
                          {item.subItems && expandedSubmenu === item.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden ml-4 mt-2"
                            >
                              {item.subItems.map((subItem, subIndex) => (
                                <motion.div
                                  key={subIndex}
                                  ref={(el) => {
                                    const key = `mobile-${item.name}-${subIndex}`;
                                  }}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: subIndex * 0.1 }}
                                  className="flex items-center p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/30 transition-all duration-300 cursor-pointer group"
                                  onClick={() => handleSubmenuNavigation(subItem.href)}
                                >
                                  <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-primary transition-colors duration-300 mr-4"></div>
                                  <span className="[font-family:'Fahkwang',Helvetica] font-normal text-sm">
                                    {subItem.name}
                                  </span>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/50 bg-gradient-to-t from-[#1a1a1a] to-transparent">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs [font-family:'Fahkwang',Helvetica]">
                      © 2025 Interior Villa
                    </p>
                    <p className="text-gray-500 text-xs [font-family:'Fahkwang',Helvetica] mt-1">
                      Elevating Interiors with Passion
                    </p>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-32 left-6 w-16 h-16 bg-primary/5 rounded-full blur-lg"></div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <FeaturedWorksHeaderSection />
      <OurFeaturedWorksSection />
      <AboutSection />
      
      <ServicesSection />
      <OurProcessSection />
      
      <TestimonialSection />
      <BlogSection />
      <CTASection />
      <FooterSection />
      
      <style jsx>{`
        /* CSS custom properties for header animations to avoid forced reflows */
        header {
          height: var(--header-height, 90px);
          background-color: var(--header-bg, transparent);
          backdrop-filter: var(--header-backdrop, none);
          box-shadow: var(--header-shadow, none);
          transform: var(--header-transform, translateY(0));
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .logo-container {
          transform: scale(var(--logo-scale, 1));
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .menu-container {
          height: var(--menu-height, 60px);
          padding: var(--menu-padding, 0 16px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hero-image {
          transform: translate3d(0, var(--parallax-y, 0), 0) scale(var(--parallax-scale, 1));
          will-change: transform;
        }
        
        /* Enhanced smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Improved backdrop blur support */
        @supports (backdrop-filter: blur(20px)) {
          .backdrop-blur-enhanced {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        }

        /* Custom scrollbar for better UX */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #75bf44;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #68ab3c;
        }

        /* Enhanced focus states for accessibility */
        button:focus-visible {
          outline: 2px solid #75bf44;
          outline-offset: 2px;
        }

        /* Smooth transitions for all interactive elements */

        /* Sidebar scrollbar styling */
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(117, 191, 68, 0.3);
          border-radius: 2px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(117, 191, 68, 0.5);
        }
      `}</style>
    </main>
  );
};

export { Home };