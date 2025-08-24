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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { FloorPlan3D } from "../../ui/3d-floor-plan";
import { X, ChevronDown, Home as HomeIcon, User, Briefcase, FolderOpen, BookOpen, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Static image fallback for low-end devices
const StaticHeroBackground = () => (
  <div className="w-full h-[800px] bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
    <img 
      src="/floor-plan-static.jpg" 
      alt="3D Floor Plan" 
      className="w-full h-full object-cover opacity-60"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
  </div>
);

gsap.registerPlugin(ScrollTrigger, SplitText);

const Home = (): JSX.Element => {
  const navigate = useNavigate();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const submenuItemRefs = useRef<{ [key: string]: (HTMLButtonElement | null)[] }>({});

  // Check if device is likely low-end
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  
  useEffect(() => {
    // Simple performance detection
    const checkPerformance = () => {
      // Check for mobile devices which typically have lower performance
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check for low memory (if available in the browser)
      const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
      
      // Check for low CPU cores (if available in the browser)
      const hasLowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      
      return isMobile || hasLowMemory || hasLowCPU;
    };
    
    setIsLowEndDevice(checkPerformance());
  }, []);

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
      ]
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
      const scrollPosition = window.scrollY;
      const scrollDirection = scrollPosition > lastScrollY ? 'down' : 'up';
      const shouldBeScrolled = scrollPosition > 100; // Minimum scroll distance
      const shouldShowSticky = shouldBeScrolled && scrollDirection === 'up';
      
      // Update scroll direction state
      if (scrollDirection === 'up' && scrollPosition > 100) {
        setIsScrollingUp(true);
      } else if (scrollDirection === 'down') {
        setIsScrollingUp(false);
      }
      
      // Update scrolled state
      if (shouldBeScrolled !== isScrolled) {
        setIsScrolled(shouldBeScrolled);
      }
      
      setLastScrollY(scrollPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled, lastScrollY]);

  // Enhanced header animations
  useEffect(() => {
    if (!headerRef.current || !logoRef.current || !menuContainerRef.current) return;

    const header = headerRef.current;
    const logo = logoRef.current;
    const menuContainer = menuContainerRef.current;

    // Create timeline for smooth transitions - only when scrolling up
    const tl = gsap.timeline({ paused: true });

    // Header transformation
    tl.to(header, {
      height: "60px", // Reduced from 90px
      backgroundColor: "rgba(27, 27, 27, 0.95)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      duration: 0.6,
      ease: "power3.out"
    }, 0)
    
    // Logo scaling and positioning
    .to(logo, {
      scale: 0.8, // Slightly smaller in sticky mode
      duration: 0.6,
      ease: "power3.out"
    }, 0)
    
    // Menu container adjustments
    .to(menuContainer, {
      height: "50px", // Reduced height
      padding: "0 16px", // Adjust padding
      duration: 0.6,
      ease: "power3.out"
    }, 0);

    // Play or reverse animation based on scroll state and direction
    if (isScrolled && isScrollingUp) {
      tl.play();
    } else {
      tl.reverse();
    }

    return () => {
      tl.kill();
    };
  }, [isScrolled, isScrollingUp]);

  useEffect(() => {
    if (!heroImageRef.current || !heroContainerRef.current) return;

    // Create parallax effect for hero image
    gsap.to(heroImageRef.current, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: heroContainerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    // Add subtle scale effect on scroll
    gsap.fromTo(heroImageRef.current, 
      {
        scale: 1.1,
      },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: heroContainerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      }
    );

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
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
    // Initialize submenu item animations for each service
    navItems.forEach((item) => {
      if (item.subItems) {
        item.subItems.forEach((subItem, subIndex) => {
          const key = `${item.name}-${subIndex}`;
          // Animation will be applied when submenu items are rendered
        });
      }
    });
  }, []);

  // Function to add hover animation to submenu item
  const addSubmenuItemAnimation = (element: HTMLButtonElement, key: string) => {
    if (!element) return;

    // Split text into characters
    const splitText = new SplitText(element.querySelector('span'), { 
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word"
    });

    // Add hover animation
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      gsap.to(splitText.chars, {
        duration: 0.3,
        y: (i, target) => (y - 0.5) * 8 * Math.sin((i + 1) * 0.5),
        x: (i, target) => (x - 0.5) * 8 * Math.cos((i + 1) * 0.5),
        rotationY: (x - 0.5) * 10,
        rotationX: (y - 0.5) * -10,
        ease: "power2.out",
        stagger: {
          amount: 0.2,
          from: "center"
        }
      });
    });

    element.addEventListener('mouseleave', () => {
      gsap.to(splitText.chars, {
        duration: 0.8,
        y: 0,
        x: 0,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.3)",
        stagger: {
          amount: 0.2,
          from: "center"
        }
      });
    });

    // Store cleanup function
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
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      <div ref={heroContainerRef} className="w-full relative overflow-hidden">
        {isLowEndDevice ? (
          <StaticHeroBackground />
        ) : (
          <section className="w-full h-[800px] bg-gradient-to-br from-black via-gray-900 to-black">
            <FloorPlan3D className="w-full h-full" lowPerformanceMode={true} />
          </section>
        )}

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
                className="w-52 h-[41px] object-cover z-10 transition-transform duration-700 ease-out cursor-pointer"
                alt="Interior villa dark"
                src="/interior-villa-dark.png"
                style={{
                  transform: (isScrolled && isScrollingUp) ? "scale(0.8)" : "scale(1)"
                }}
              />
            </Link>
            
            <div 
              ref={menuContainerRef}
              className={`flex items-center transition-all duration-700 ease-out ${
                !(isScrolled && isScrollingUp) && 'bg-white-fade rounded-[50px] backdrop-blur-[5px] px-4'
              }`}
              style={{
                height: (isScrolled && isScrollingUp) ? "50px" : "60px",
                padding: (isScrolled && isScrollingUp) ? "0 16px" : !(isScrolled && isScrollingUp) ? "0 16px" : "0",
                minWidth: "fit-content"
              }}
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
                          >
                            <span className="[font-family:'Fahkwang',Helvetica] font-medium text-center transition-all duration-300">
                              {item.name}
                            </span>
                            {item.subItems && (
                              <motion.span 
                                animate={{ rotate: hoveredMenu === item.name ? 45 : 0 }}
                              >
                                +
                              </motion.span>
                            )}
                          </Button>
                        </Link>
                        
                        <AnimatePresence>
                          {item.subItems && hoveredMenu === item.name && (
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
                                    if (el) {
                                      const button = el.querySelector('span');
                                      if (button && !el.dataset.animationKey) {
                                        // Add animation to mobile submenu items
                                        const splitText = new SplitText(button, { 
                                          type: "chars,words",
                                          charsClass: "char",
                                          wordsClass: "word"
                                        });

                                        el.addEventListener('mousemove', (e) => {
                                          const rect = el.getBoundingClientRect();
                                          const x = (e.clientX - rect.left) / rect.width;
                                          const y = (e.clientY - rect.top) / rect.height;
                                          
                                          gsap.to(splitText.chars, {
                                            duration: 0.3,
                                            y: (i, target) => (y - 0.5) * 6 * Math.sin((i + 1) * 0.5),
                                            x: (i, target) => (x - 0.5) * 6 * Math.cos((i + 1) * 0.5),
                                            rotationY: (x - 0.5) * 8,
                                            rotationX: (y - 0.5) * -8,
                                            ease: "power2.out",
                                            stagger: {
                                              amount: 0.15,
                                              from: "center"
                                            }
                                          });
                                        });

                                        el.addEventListener('mouseleave', () => {
                                          gsap.to(splitText.chars, {
                                            duration: 0.6,
                                            y: 0,
                                            x: 0,
                                            rotationY: 0,
                                            rotationX: 0,
                                            ease: "elastic.out(1, 0.3)",
                                            stagger: {
                                              amount: 0.15,
                                              from: "center"
                                            }
                                          });
                                        });

                                        el.dataset.animationKey = key;
                                      }
                                    }
                                  }}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: subIndex * 0.1 }}
                                  className="flex items-center p-3 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-800/30 transition-all duration-300 cursor-pointer group"
                                  style={{ 
                                    transformStyle: 'preserve-3d',
                                    perspective: '300px'
                                  }}
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
        * {
          transition-property: transform, opacity, background-color, border-color, color, box-shadow;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

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