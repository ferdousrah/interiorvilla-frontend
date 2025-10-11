'use client'
import { useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  ChevronDown,
  Home as HomeIcon,
  User,
  Briefcase,
  FolderOpen,
  BookOpen,
  Mail,
} from "lucide-react";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const cachedScrollY = useRef(0);

  const location = useLocation();
  // Navigation items
  const navItems = [
    { name: "Home", icon: HomeIcon, href: "/" },
    { name: "About Us", icon: User, href: "/about" },
    {
      name: "Services",      
      icon: Briefcase,
      href: "#",
      subItems: [
        { name: "Residential Interior", href: "/residential-interior" },
        { name: "Commercial Interior", href: "/commercial-interior" },
        { name: "Architectural Consultancy", href: "/architectural-consultancy" },
      ],
      megaMenu: {
        sections: [
          {
            title: "Residential",
            description: "Transform your home into a sanctuary",
            icon: "🏠",
            color: "#75BF44",
            links: [
              { name: "Apartment Interior Design", href: "/services/residential/apartment-interior-design" },
              { name: "Home Interior Design", href: "/services/residential/home-interior-design" },
              { name: "Duplex Interior Design", href: "/services/residential/duplex-interior-design" },
              { name: "View All", href: "/services/residential-interior", featured: true },
            ],
          },
          {
            title: "Commercial",
            description: "Create inspiring workspaces",
            icon: "🏢",
            color: "#EE5428",
            links: [
              { name: "Corporate & Office Interior Design", href: "/services/commercial-interior/corporate-and-office-interior-design" },
              { name: "Buying House Office Interior Design", href: "/services/commercial-interior/buying-house-office-interior-design" },
              { name: "Travel Agency Office Interior Design", href: "/services/commercial-interior/travel-agency-office-interior-design" },
              { name: "Hotel & Hospitality Interior Design", href: "/services/commercial-interior/hotel-and-hospitality-interior-design" },
              { name: "Restaurant & Café Interior Design", href: "/services/commercial-interior/restaurant-and-cafe-interior-design" },
              { name: "Brand Showroom Interior Design", href: "/services/commercial-interior/brand-showroom-interior-design" },
              { name: "Men’s Salon & Lifestyle Interior Design", href: "/services/commercial-interior/mens-salon-and-lifestyle-interior-design" },
              { name: "Hospital & Clinic Interior Design", href: "/services/commercial-interior/hospital-and-clinic-interior-design" },
              { name: "Pharmacy Interior Design", href: "/services/commercial-interior/pharmacy-interior-design" },
              { name: "Dental Chamber Interior Design", href: "/services/commercial-interior/dental-chamber-interior-design" },
              { name: "Spa & Beauty Parlor Interior Design", href: "/services/commercial-interior/spa-and-beauty-parlor-interior-design" },
              { name: "Resort Interior Design", href: "/services/commercial-interior/resort-interior-design" },
              { name: "Retail Shop Interior Design", href: "/services/commercial-interior/retail-shop-interior-design" },
              { name: "Educational Institute Interior Design", href: "/services/commercial-interior/educational-institute-interior-design" },
              { name: "Fitness Center Interior Design", href: "/services/commercial-interior/fitness-center-interior-design" },
              { name: "View All", href: "/services/commercial-interior", featured: true },
            ],
          },
          {
            title: "Architectural",
            description: "Expert architectural solutions",
            icon: "📐",
            color: "#4F46E5",
            links: [
              { name: "View All Services", href: "/services/architectural-consultancy", featured: true },
            ],
          },
        ],
      },
    },
    { name: "Portfolio", icon: FolderOpen, href: "/portfolio" },
    { name: "Blog", icon: BookOpen, href: "/blog" },
    { name: "Contact Us", icon: Mail, href: "/contact" },
  ];

  // Hover handlers
  const handleMouseEnter = (itemName: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredMenu(itemName);
  };
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredMenu(null), 300);
  };


   // Enhanced header animations
  useEffect(() => {
    if (!headerRef.current || !logoRef.current || !menuContainerRef.current) return;

    const header = headerRef.current;
    const logo = logoRef.current;
    const menuContainer = menuContainerRef.current;

    const updateHeaderStyles = () => {
      const shouldTransform = isScrolled && isScrollingUp;

      requestAnimationFrame(() => {
        header.style.setProperty("--header-height", shouldTransform ? "60px" : "90px");
        header.style.setProperty("--header-bg", shouldTransform ? "rgba(27, 27, 27, 0.95)" : "transparent");
        header.style.setProperty("--header-backdrop", shouldTransform ? "blur(20px)" : "none");
        header.style.setProperty("--header-shadow", shouldTransform ? "0 8px 32px rgba(0, 0, 0, 0.1)" : "none");
        header.style.setProperty(
          "--header-transform",
          shouldTransform ? "translateY(0)" : isScrolled ? "translateY(-100%)" : "translateY(0)"
        );

        logo.style.setProperty("--logo-scale", shouldTransform ? "0.8" : "1");

        menuContainer.style.setProperty("--menu-height", shouldTransform ? "50px" : "60px");
        menuContainer.style.setProperty("--menu-padding", shouldTransform ? "0 16px" : "0 16px");
      });
    };

    updateHeaderStyles();
  }, [isScrolled, isScrollingUp]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        const scrollPosition = window.scrollY;
        if (Math.abs(scrollPosition - cachedScrollY.current) < 5) {
          rafId.current = null;
          return;
        }
        const scrollDirection = scrollPosition > lastScrollY.current ? "down" : "up";
        const shouldBeScrolled = scrollPosition > 100;

        if (scrollDirection === "up" && scrollPosition > 100) {
          setIsScrollingUp(true);
        } else if (scrollDirection === "down") {
          setIsScrollingUp(false);
        }
        if (shouldBeScrolled !== isScrolled) setIsScrolled(shouldBeScrolled);

        lastScrollY.current = scrollPosition;
        cachedScrollY.current = scrollPosition;
        rafId.current = null;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isScrolled]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Animations
  const submenuVariants = {
    hidden: { opacity: 0, y: -15, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.07,
      },
    },
  };
  const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };
  const sidebarVariants = { closed: { x: "-100%" }, open: { x: "0%" } };
  const overlayVariants = { closed: { opacity: 0 }, open: { opacity: 1 } };
  const menuItemVariants = {
    closed: { x: -50, opacity: 0 },
    open: (i: number) => ({ x: 0, opacity: 1, transition: { delay: i * 0.1 } }),
  };

  const handleSubmenuToggle = (itemName: string) =>
    setExpandedSubmenu(expandedSubmenu === itemName ? null : itemName);

  const handleSubmenuNavigation = (href: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
          ref={headerRef}
          className={`${
            isScrolled && isScrollingUp ? "fixed top-0 left-0 w-full z-[999]" : "absolute w-full top-[22px] z-[999]"
          } transition-all duration-700 ease-out`}
          style={{
            height: isScrolled && isScrollingUp ? "60px" : "90px",
          }}
        >
        <div className="container mx-auto px-4 relative flex items-center justify-between h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-sm rounded-lg"></div>

          {/* Logo */}
             <Link to="/" aria-label="Interior Villa Home">
               <img
                 ref={logoRef}
                 className="w-52 h-[41px] object-cover z-10 cursor-pointer logo-container relative"
                 alt="Interior villa dark"
                 src="/interior-villa-dark.png"
                 style={{
                   filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))",
                 }}
               />
             </Link>

          {/* Menu */}
          <div
              ref={menuContainerRef}
              className={`flex items-center menu-container ${
                !(isScrolled && isScrollingUp) && "bg-black/30 rounded-[50px] backdrop-blur-[10px] px-4"
              }`}
              style={{
                minWidth: "fit-content",
                backgroundColor: isScrolled && isScrollingUp ? "rgba(27, 27, 27, 0.95)" : "rgba(0, 0, 0, 0.4)",
                backdropFilter: isScrolled && isScrollingUp ? "blur(20px)" : "blur(10px)",
                boxShadow: isScrolled && isScrollingUp ? "0 8px 32px rgba(0, 0, 0, 0.1)" : "0 4px 20px rgba(0, 0, 0, 0.3)",
                transform: isScrolled && isScrollingUp ? "translateY(0)" : isScrolled ? "translateY(-100%)" : "translateY(0)",
              }}
            >
            <div className="flex items-center justify-end h-full">
              {/* Mobile toggle */}
                <button
                   aria-label="Toggle mobile menu"
                   className="lg:hidden text-white transition-all duration-300 hover:scale-110 z-50 relative bg-black/20 rounded-full p-2 backdrop-blur-sm"
                   style={{
                     filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))",
                   }}
                   onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                 >
                   <motion.div animate={isMobileMenuOpen ? "open" : "closed"} className="w-6 h-6 flex flex-col justify-center items-center">
                     <motion.span
                       variants={{
                         closed: { rotate: 0, y: 0 },
                         open: { rotate: 45, y: 6 },
                       }}
                       className="w-6 h-0.5 bg-current block transform origin-center transition-all duration-300"
                     />
                     <motion.span
                       variants={{
                         closed: { opacity: 1 },
                         open: { opacity: 0 },
                       }}
                       className="w-6 h-0.5 bg-current block mt-1.5 transition-all duration-300"
                     />
                     <motion.span
                       variants={{
                         closed: { rotate: 0, y: 0 },
                         open: { rotate: -45, y: -6 },
                       }}
                       className="w-6 h-0.5 bg-current block mt-1.5 transform origin-center transition-all duration-300"
                     />
                   </motion.div>
                 </button>

              {/* Desktop Nav */}
              <div className="hidden lg:block">
                <nav className="flex space-x-2" role="navigation" aria-label="Main navigation">
                  {navItems.map((item, index) => (
                    <div key={index} className="relative group" onMouseEnter={() => handleMouseEnter(item.name)} onMouseLeave={handleMouseLeave}>
                          <Button
                            variant={location.pathname === item.href ? "default" : "ghost"}
                                className={`min-w-[108px] px-6 rounded-[50px] whitespace-nowrap transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 hover:shadow-lg ${
                                    location.pathname === item.href ? "bg-primary text-white shadow-lg" : "text-white"
                                }`}
                            onClick={(e) => {
                              if (!item.subItems) {
                                e.preventDefault();
                                window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
                                navigate(item.href);
                              }
                            }}
                          >
                            <span className="[font-family:'Fahkwang',Helvetica] font-medium text-center transition-all duration-300">{item.name}</span>
                            {item.subItems && (
                              <motion.span className="ml-1 text-xs transition-all duration-300" animate={{ rotate: hoveredMenu === item.name ? 180 : 0 }}>
                                +
                              </motion.span>
                            )}
                          </Button>

                      {/* Mega menu / submenus */}
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
                                                      className="fixed left-0 right-0 bg-white shadow-2xl overflow-hidden z-[999] border-t border-gray-200 rounded-xl"
                                                      style={{
                                                        maxHeight: "70vh",
                                                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 0, 0, 0.1)",
                                                        top: isScrolled && isScrollingUp ? "60px" : "70px",
                                                        width: "52vw",
                                                        margin: "0 auto",
                                                      }}
                                                      onMouseEnter={() => handleMouseEnter(item.name)}
                                                      onMouseLeave={handleMouseLeave}
                                                    >
                                                      <div className="w-full px-0">
                                                        <div className="max-w-8xl mx-auto">
                                                          <div className="flex gap-0">
                                                            {item.megaMenu.sections.map((section, sectionIndex) => (
                                                              <motion.div
                                                                key={sectionIndex}
                                                                variants={itemVariants}
                                                                transition={{ delay: sectionIndex * 0.1 }}
                                                                className="p-6 group transition-all duration-300 border-r border-gray-100 last:border-r-0 hover:shadow-md hover:scale-[1.01] rounded-lg flex flex-col"
                                                                style={{
                                                                  backgroundColor: sectionIndex === 0 ? '#C7E9C0' : sectionIndex === 1 ? '#E5F5E0' : '#F7FCF5',
                                                                  width: sectionIndex === 0 ? '27%' : sectionIndex === 1 ? '48%' : '25%',
                                                                }}
                                                              >
                                                                <div className="flex flex-col mb-4">
                                                                  <Link
                                                                    to={section.links[section.links.length - 1].href}
                                                                    onClick={() => navigate(section.links[section.links.length - 1].href)}
                                                                    className="flex items-center text-xl font-semibold [font-family:'Fahkwang',Helvetica] transition-all duration-300 relative"
                                                                    style={{ color: section.color }}
                                                                  >
                                                                    
                                                                    {section.title}
                                                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                                                                  </Link>
                                                                  <p className="text-sm text-gray-500 mt-2">{section.description}</p>
                                                                </div>

                                                                <div
                                                                  className={`space-y-1 ${sectionIndex === 1 ? 'commercial-column-scroll' : ''}`}
                                                                  style={{
                                                                    maxHeight: sectionIndex === 1 ? 'calc(70vh - 120px)' : 'auto',
                                                                    overflowY: sectionIndex === 1 ? 'auto' : 'visible',
                                                                  }}
                                                                >
                                                                  {section.links
                                                                    .filter(link => !link.featured)
                                                                    .map((link, linkIndex) => (
                                                                      <motion.button
                                                                        key={linkIndex}
                                                                        role="menuitem"
                                                                        variants={itemVariants}
                                                                        transition={{ delay: sectionIndex * 0.1 + linkIndex * 0.05 }}
                                                                        onClick={() => navigate(link.href)}
                                                                        className="w-full flex items-center justify-between px-4 py-2 rounded-md text-sm text-gray-600 hover:text-primary hover:bg-white/50 transition-all duration-300 group"
                                                                      >
                                                                        <span className="relative z-10">{link.name}</span>
                                                                      </motion.button>
                                                                    ))}
                                                                </div>
                                                              </motion.div>

                                                            ))}
                                                          </div>
                                                        </div>
                                                        <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100">
                                                          <div className="max-w-7xl mx-auto">
                                                            <div className="flex items-center justify-between">
                                                              <div className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                                                                Need help choosing? <span className="text-primary font-medium">Contact our experts</span>
                                                              </div>
                                                              <button
                                                                onClick={() => navigate("/contact")}
                                                                className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium [font-family:'Fahkwang',Helvetica] hover:bg-primary-hover transition-all duration-300 hover:scale-105"
                                                              >
                                                                Get Consultation
                                                              </button>
                                                            </div>
                                                          </div>
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
                                                      className="absolute top-full left-0 mt-2 min-w-[200px] bg-[#1b1b1b] rounded-lg shadow-2xl overflow-hidden z-[999] border border-[#333333]"
                                                      style={{
                                                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 0, 0, 0.3)",
                                                      }}
                                                      onMouseEnter={() => handleMouseEnter(item.name)}
                                                      onMouseLeave={handleMouseLeave}
                                                    >
                                                      <motion.div className="py-2">
                                                        {item.subItems.map((subItem, subIndex) => (
                                                          <motion.button
                                                            key={subIndex}
                                                            role="menuitem"
                                                            variants={itemVariants}
                                                            transition={{ delay: subIndex * 0.1 }}
                                                            onClick={() => navigate(subItem.href)}
                                                            className="w-full px-4 py-3 text-left text-sm text-white hover:text-primary transition-colors duration-300 [font-family:'Fahkwang',Helvetica] relative group overflow-hidden"
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div variants={overlayVariants} initial="closed" animate="open" exit="closed" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div variants={sidebarVariants} initial="closed" animate="open" exit="closed" className="fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] z-[999] lg:hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img className="w-40 h-8 object-cover" alt="Interior villa dark" src="/interior-villa-dark.png" />
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-white hover:bg-gray-700/50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex flex-col p-6 space-y-2 overflow-y-auto h-full pb-20">
                {navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div key={index} custom={index} variants={menuItemVariants} initial="closed" animate="open" className="relative">
                      <div
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${
                          item.active ? "bg-primary text-white shadow-lg" : "text-gray-300 hover:bg-gray-800/50"
                        }`}
                        onClick={() => item.subItems ? handleSubmenuToggle(item.name) : handleSubmenuNavigation(item.href)}
                      >
                        <Link to={item.href} onClick={e => item.subItems && e.preventDefault()} className="flex items-center space-x-4 flex-1">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-700/50">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span>{item.name}</span>
                        </Link>
                        {item.subItems && <ChevronDown className="w-4 h-4" />}
                      </div>

                      <AnimatePresence>
                        {item.subItems && expandedSubmenu === item.name && (
                          item.megaMenu ? (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-y-auto max-h-[60vh] ml-4 mt-2 space-y-4 sidebar-submenu-scroll">
                              {item.megaMenu.sections.map((section, i) => (
                                <div key={i} className="p-4 rounded-xl bg-gray-800/40">
                                  <h4 style={{ color: section.color }}>{section.title}</h4>
                                  <p className="text-xs text-gray-400">{section.description}</p>
                                  <div className="space-y-2 mt-2">
                                    {section.links.map((link, j) => (
                                      <button key={j} onClick={() => handleSubmenuNavigation(link.href)} className="block w-full text-left px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white hover:bg-gray-700/40">
                                        {link.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          ) : (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-y-auto max-h-[60vh] ml-4 mt-2 sidebar-submenu-scroll">
                              {item.subItems.map((subItem, subIndex) => (
                                <button key={subIndex} onClick={() => handleSubmenuNavigation(subItem.href)} className="flex items-center p-3 text-gray-300 hover:text-white hover:bg-gray-800/30">
                                  <div className="w-2 h-2 rounded-full bg-gray-600 mr-4"></div>
                                  {subItem.name}
                                </button>
                              ))}
                            </motion.div>
                          )
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
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

        html {
          scroll-behavior: smooth;
        }

        /* Commercial column scrollbar only */
        .commercial-column-scroll {
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: rgba(238, 84, 40, 0.3) transparent;
        }
        .commercial-column-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .commercial-column-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .commercial-column-scroll::-webkit-scrollbar-thumb {
          background: rgba(238, 84, 40, 0.3);
          border-radius: 3px;
        }
        .commercial-column-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(238, 84, 40, 0.5);
        }

        /* Mobile sidebar submenu scrollbar */
        .sidebar-submenu-scroll {
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: rgba(255,255,255,0.3) transparent;
        }
        .sidebar-submenu-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-submenu-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-submenu-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
        }
        .sidebar-submenu-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }

        @supports (backdrop-filter: blur(20px)) {
          .backdrop-blur-enhanced {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        }

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

        button:focus-visible {
          outline: 2px solid #75bf44;
          outline-offset: 2px;
        }

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
          /* Smooth hover underline animation */
        .group:hover .group-hover\:w-full {
          width: 100% !important;
        }

      `}</style>
    </>
  );
};

export { MainMenu };
