import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, ChevronDown, Home as HomeIcon, User, Briefcase, FolderOpen, BookOpen, Mail, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = (): JSX.Element => {
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { 
      name: "Home", 
      active: false,
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
      href: "/services",
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const shouldBeScrolled = scrollPosition > 50;
      
      if (shouldBeScrolled !== isScrolled) {
        setIsScrolled(shouldBeScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Enhanced header animations
  useEffect(() => {
    if (!headerRef.current || !logoRef.current || !menuContainerRef.current) return;

    const header = headerRef.current;
    const logo = logoRef.current;
    const menuContainer = menuContainerRef.current;

    // Create timeline for smooth transitions
    const tl = gsap.timeline({ paused: true });

    // Header transformation
    tl.to(header, {
      height: "60px",
      backgroundColor: "rgba(27, 27, 27, 0.95)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      duration: 0.6,
      ease: "power3.out"
    }, 0)
    
    // Logo scaling and positioning
    .to(logo, {
      scale: 0.8,
      duration: 0.6,
      ease: "power3.out"
    }, 0)
    
    // Menu container adjustments
    .to(menuContainer, {
      height: "50px",
      padding: "0 16px",
      duration: 0.6,
      ease: "power3.out"
    }, 0);

    // Play or reverse animation based on scroll state
    if (isScrolled) {
      tl.play();
    } else {
      tl.reverse();
    }

    return () => {
      tl.kill();
    };
  }, [isScrolled]);

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

  const submenuVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        when: "beforeChildren"
      }
    },
    visible: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
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

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  const handleSubmenuNavigation = (href: string) => {
    setIsMobileMenuOpen(false);
    window.location.href = href;
  };

  return (
    <div ref={heroContainerRef} className="w-full h-[70vh] md:h-[80vh] lg:h-screen relative overflow-hidden">
      {/* Background Image - Full Cover */}
      <div className="absolute inset-0 w-full h-full">
        <img
          ref={heroImageRef}
          className="w-full h-full object-cover will-change-transform"
          alt="FAQ Hero"
          src="/image.png"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)'
          }}
        />
      </div>

      {/* Header */}
      <header 
        ref={headerRef}
        className={`${
          isScrolled 
            ? 'fixed top-0 left-0 w-full z-50' 
            : 'absolute w-full top-[22px] z-50'
        } transition-all duration-700 ease-out`}
        style={{
          height: isScrolled ? "60px" : "90px",
          backgroundColor: isScrolled ? "rgba(27, 27, 27, 0.95)" : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          boxShadow: isScrolled ? "0 8px 32px rgba(0, 0, 0, 0.1)" : "none"
        }}
      >
        <div className="container mx-auto px-4 relative flex items-center justify-between h-full">
          <img
            ref={logoRef}
            className="w-52 h-[41px] object-cover z-10 transition-transform duration-700 ease-out cursor-pointer"
            alt="Interior villa dark"
            src="/interior-villa-dark.png"
            onClick={() => handleNavigation("/")}
            style={{
              transform: isScrolled ? "scale(0.8)" : "scale(1)"
            }}
          />
          
          <div 
            ref={menuContainerRef}
            className={`flex items-center transition-all duration-700 ease-out ${
              !isScrolled && 'bg-white-fade rounded-[50px] backdrop-blur-[5px] px-4'
            }`}
            style={{
              height: isScrolled ? "50px" : "60px",
              padding: isScrolled ? "0 16px" : !isScrolled ? "0 16px" : "0",
              minWidth: "fit-content"
            }}
          >
            <div className="flex items-center justify-end h-full">
              <button 
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
                <nav className="flex space-x-2">
                  {navItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="relative group"
                      onMouseEnter={() => setHoveredMenu(item.name)}
                      onMouseLeave={() => setHoveredMenu(null)}
                    >
                      <Button
                        variant={item.active ? "default" : "ghost"}
                        className={`min-w-[108px] px-6 rounded-[50px] whitespace-nowrap transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 hover:shadow-lg ${
                          item.active
                            ? "bg-primary text-white shadow-lg"
                            : "bg-transparent text-[#c6c6c6] hover:shadow-[0_0_20px_rgba(117,191,68,0.3)]"
                        }`}
                        style={{
                          height: isScrolled ? "36px" : "38px",
                          fontSize: isScrolled ? "13px" : "14px"
                        }}
                        onClick={() => handleNavigation(item.href)}
                      >
                        <span className="[font-family:'Fahkwang',Helvetica] font-medium text-center transition-all duration-300">
                          {item.name}
                        </span>
                        {item.subItems && (
                          <motion.span 
                            className="ml-1 transition-transform duration-300"
                            animate={{ rotate: hoveredMenu === item.name ? 45 : 0 }}
                          >
                            +
                          </motion.span>
                        )}
                      </Button>
                      
                      <AnimatePresence>
                        {item.subItems && hoveredMenu === item.name && (
                          <motion.div
                            variants={submenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="absolute top-full left-0 mt-2 min-w-[200px] bg-[#1b1b1b] rounded-lg shadow-2xl overflow-hidden z-50 border border-[#333333]"
                            style={{
                              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 0, 0, 0.3)"
                            }}
                          >
                            <motion.div className="py-2">
                              {item.subItems.map((subItem, subIndex) => (
                                <motion.button
                                  key={subIndex}
                                  variants={itemVariants}
                                  transition={{ delay: subIndex * 0.1 }}
                                  className="w-full px-4 py-3 text-left text-sm text-white hover:text-primary transition-colors duration-300 [font-family:'Fahkwang',Helvetica] relative group overflow-hidden"
                                  onClick={() => handleNavigation(subItem.href)}
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
              className="fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] z-50 lg:hidden shadow-2xl"
              style={{
                boxShadow: "20px 0 40px rgba(0, 0, 0, 0.3)"
              }}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <img
                  className="w-40 h-8 object-cover cursor-pointer"
                  alt="Interior villa dark"
                  src="/interior-villa-dark.png"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavigation("/");
                  }}
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-white hover:bg-gray-700/50 transition-all duration-300 hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col p-6 space-y-2 overflow-y-auto h-full pb-20">
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
                            handleNavigation(item.href);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-4">
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
                        </div>
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
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: subIndex * 0.1 }}
                                className="flex items-center p-3 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-800/30 transition-all duration-300 cursor-pointer group"
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

      {/* Hero Content Overlay - Left Aligned */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left text-white max-w-2xl">
            {/* Page Title - Responsive Font Size */}
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[48px] font-bold [font-family:'Fahkwang',Helvetica] mb-4 sm:mb-6 leading-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 48px)', // Responsive font size with 48px max
                lineHeight: '1.1'
              }}
            >
              FAQ
            </motion.h1>

            {/* Breadcrumb - Positioned after title */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center space-x-2"
            >
              <button 
                onClick={() => handleNavigation("/")}
                className="text-white/80 hover:text-white transition-colors duration-300 [font-family:'Fahkwang',Helvetica] text-sm sm:text-base"
              >
                Home
              </button>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              <span className="text-primary [font-family:'Fahkwang',Helvetica] text-sm sm:text-base font-medium">
                FAQ
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};