import { ArrowRightIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../../ui/button";
import { Card, CardContent, CardFooter } from "../../../../ui/card";
import { PerformanceImage } from "../../../../ui/performance-image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Service data for mapping with video backgrounds and unique color themes
const services = [
  {
    title: "Residential interior",
    icon: "home.webp",
    description:
      "Sustainable living. Luxurious design. We specialize in creating intelligent, eco-friendly homes, from single-family residences to multi-housing solutions.",
    iconBg: "#f5fdfd",
    video: "/videos/residential.mp4",
    colorTheme: {
      primary: "#4F46E5", // Indigo
      secondary: "#6366F1",
      accent: "#8B5CF6",
    },
    features: [
      "Personalized design consultation",
      "3D visualization and planning", 
      "Premium material selection",
      "Professional installation"
    ]
  },
  {
    title: "Commercial Interior",
    icon: "/create-a-svg-long-stroied-building-icon.webp",
    description:
      "Experience the difference. Our minimalist designs transform your workplace into an inspiring and productive environment, whether it's a factory or a corporate office.",
    iconBg: "#f5fdfd",
    video: "/videos/commercial.mp4",
    colorTheme: {
      primary: "#059669", // Emerald
      secondary: "#10B981",
      accent: "#34D399",
    },
    features: [
      "Brand-focused design strategy",
      "Productivity-optimized layouts",
      "Modern workspace solutions", 
      "Sustainable design practices"
    ]
  },
  {
    title: "Architectural consultancy",
    icon: "/create-a-svg-geometry-icon.webp",
    description:
      "Stand out from the competition with innovative designs. Our architects specialize in a wide range of projects, from small-scale rentals to large-scale developments, ensuring your vision comes to life.",
    iconBg: "#f5fdfd",
    video: "/videos/architecture.mp4",
    colorTheme: {
      primary: "#DC2626", // Red
      secondary: "#EF4444",
      accent: "#F87171",
    },
    features: [
      "Structural design analysis",
      "Building code compliance",
      "Innovative space planning",
      "Technical documentation"
    ]
  },
];

export const ServicesSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<HTMLVideoElement | null>(null);

  // Wait for fonts to load before using SplitText
  const [fontsReady, setFontsReady] = useState(false);
  
  useEffect(() => {
    const checkFonts = async () => {
      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        setFontsReady(true);
      } catch (error) {
        // Fallback if fonts API not available
        setTimeout(() => setFontsReady(true), 1000);
      }
    };
    checkFonts();
  }, []);

  // Add hover animation for main heading
  useEffect(() => {
    if (!headingRef.current || !fontsReady) return;

    // Split text into characters
    const splitText = new SplitText(headingRef.current, { 
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word"
    });

    // Add hover animation
    if (headingWrapperRef.current) {
      headingWrapperRef.current.addEventListener('mousemove', (e) => {
        const rect = headingWrapperRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        gsap.to(splitText.chars, {
          duration: 0.5,
          y: (i, target) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
          x: (i, target) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
          rotationY: (x - 0.5) * 20,
          rotationX: (y - 0.5) * -20,
          ease: "power2.out",
          stagger: {
            amount: 0.3,
            from: "center"
          }
        });
      });

      headingWrapperRef.current.addEventListener('mouseleave', () => {
        gsap.to(splitText.chars, {
          duration: 1,
          y: 0,
          x: 0,
          rotationY: 0,
          rotationX: 0,
          ease: "elastic.out(1, 0.3)",
          stagger: {
            amount: 0.3,
            from: "center"
          }
        });
      });
    }

    // Cleanup function
    return () => {
      splitText.revert();
      if (headingWrapperRef.current) {
        headingWrapperRef.current.removeEventListener('mousemove', () => {});
        headingWrapperRef.current.removeEventListener('mouseleave', () => {});
      }
    };
  }, [fontsReady]);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Parallax effect for background grid
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        yPercent: -25,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
          invalidateOnRefresh: true
        }
      });
    }

    // Header animation with parallax
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        {
          opacity: 0,
          y: 60,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Subtle parallax for header
      gsap.to(headerRef.current, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }

    // Staggered card animations with individual parallax
    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Initial entrance animation
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 80,
          rotationX: -15,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          delay: index * 0.2,
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "top 60%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Individual parallax movement for each card
      gsap.to(card, {
        yPercent: -5 - (index * 3), // Different speeds for depth
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1 + (index * 0.2), // Different scrub speeds
          invalidateOnRefresh: true
        }
      });

      // Store cleanup functions
      card.dataset.cleanup = 'true';
    });

    // Grid container parallax
    if (gridRef.current) {
      gsap.to(gridRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      // Remove event listeners
      cardRefs.current.forEach(card => {
        if (card && card.dataset.cleanup) {
          card.removeEventListener('mouseenter', () => {});
          card.removeEventListener('mouseleave', () => {});
        }
      });
    };
  }, []);

  // Setup videos on mount
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = true;
        video.playsInline = true;
        video.defaultMuted = true;
      }
    });
  }, []);

  // Handle card hover for video playback
  const handleCardHover = (index: number, isHovering: boolean) => {
    setHoveredCard(isHovering ? index : null);

    const video = videoRefs.current[index];

    if (isHovering && video) {
      // Stop any currently playing video
      if (activeVideo && activeVideo !== video) {
        activeVideo.pause();
        activeVideo.currentTime = 0;
      }

      // Reset and play
      video.currentTime = 0;

      // Use requestAnimationFrame to ensure smooth playback
      requestAnimationFrame(() => {
        video.play().then(() => {
          setActiveVideo(video);
        }).catch((error) => {
          console.warn('Video play failed:', error.message);
        });
      });
    } else {
      // Pause and reset video
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      if (activeVideo && activeVideo !== video) {
        activeVideo.pause();
        activeVideo.currentTime = 0;
      }
      setActiveVideo(null);
    }
  };

  return (
    <section 
  ref={sectionRef}
  className="w-full flex flex-col items-start pt-10 pb-12 relative overflow-hidden"
  style={{
    backgroundColor: hoveredCard !== null ? 'transparent' : '#ffffff',
    transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
  }}
>



      {/* Section Background Videos */}
      <div className="absolute inset-0 w-full h-full">
        {services.map((service, index) => (
          <video
            key={index}
            ref={el => videoRefs.current[index] = el}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: hoveredCard === index ? 1 : 0,
              transform: hoveredCard === index ? 'scale(1.05)' : 'scale(1)',
              transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none'
            }}
            muted
            playsInline
            loop
            preload="auto"
            autoPlay={false}
            controls={false}
            webkit-playsinline="true"
          >
            <source src={service.video} type="video/mp4" />
          </video>
        ))}
        
        {/* MORE TRANSPARENT Dark Overlay - NO COLOR GRADIENTS */}
        <div 
          className="absolute inset-0"
          style={{
            background: hoveredCard !== null 
              ? 'rgba(0, 0, 0, 0.3)' // More transparent - reduced from 0.6 to 0.3
              : 'transparent',
            opacity: hoveredCard !== null ? 1 : 0,
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
        
        {/* Glassmorphism Effect - More transparent */}
        <div 
          className="absolute inset-0"
          style={{
            background: hoveredCard !== null 
              ? 'rgba(255, 255, 255, 0.02)' // More transparent - reduced from 0.05 to 0.02
              : 'transparent',
            backdropFilter: hoveredCard !== null ? 'blur(2px)' : 'none', // Reduced blur from 3px to 2px
            transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header with MORE GAP */}
        <div 
          ref={headerRef}
          className="flex flex-col items-center text-center mb-24 mt-5" // Added mt-5 for 20px top gap
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          
          <div 
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: 'preserve-3d', marginTop: '0px' }}
          >
            <h2 
              ref={headingRef}
              className="[font-family:'Fahkwang',Helvetica] font-medium text-[40px] text-center tracking-[0] leading-[62px] mb-6 md:mb-2"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateZ(0)',
              }}
            >
              <span 
                className="transition-colors duration-1200"
                style={{ 
                  color: hoveredCard !== null ? '#ffffff' : '#0d1529' 
                }}
              >
                Services <span className="text-[#0d1529]" style={{ color: hoveredCard !== null ? '#ffffff' : '#0d1529' }}>We</span> 
              </span>
              <span 
                className="transition-colors duration-1200"
                style={{ 
                  color: hoveredCard !== null ? '#ffffff' : '#EE5428' 
                }}
              >
                &nbsp;Offer
              </span>
            </h2>
          </div>

          <p 
            className="text-sm md:text-base lg:text-lg max-w-4xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica] will-change-transform px-8 transition-colors duration-1200"
            style={{
              color: hoveredCard !== null ? '#ffffff' : '#626161'
            }}
          >
            From consultation to installation, we handle all your interior design needs, 
            whether it's your home, office, or a large-scale project.
          </p>
        </div>

        {/* Service Cards with FIXED ALIGNMENT - EXPAND ONLY TO BOTTOM */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 will-change-transform items-start" // Added items-start for proper alignment
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)',
            overflow: 'visible', // important
          }}
        >
          {services.map((service, index) => {
            const isHovered = hoveredCard === index;
            
            return (
              <div
                key={index}
                ref={el => cardRefs.current[index] = el}
                className="will-change-transform flex" // Added flex for consistent alignment
                style={{
                  transformOrigin: 'center top', // FIXED: Changed from 'center center' to 'center top'
                  backfaceVisibility: 'hidden',
                  transform: 'translate3d(0, 0, 0)',
                  transformStyle: 'preserve-3d'
                }}
                onMouseEnter={() => handleCardHover(index, true)}
                onMouseLeave={() => handleCardHover(index, false)}
              >
                <Card 
                      className="rounded-[20px] overflow-hidden relative group w-full"
                      style={{
                        height: isHovered ? '460px' : '360px', // Reduced from 700px/320px
                        backgroundColor: isHovered 
                          ? 'rgba(0, 0, 0, 0.25)'
                          : '#f6f8fa',
                        backdropFilter: isHovered ? 'blur(10px)' : 'none',
                        border: 'none',
                        boxShadow: isHovered 
                          ? '0 30px 60px -12px rgba(0, 0, 0, 0.4)'
                          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transformOrigin: 'center top',
                        transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'translateY(0) scale(1.02)' : 'translateY(0) scale(1)'
                      }}
                    >

                  <CardContent className="p-11 pt-11 relative z-10 h-full flex flex-col">
                    {/* Header Section - FIXED POSITION */}
                    <div className="flex gap-6 mb-8 flex-shrink-0"> {/* Added flex-shrink-0 to prevent compression */}
                      <div
                        className="w-[82px] h-[82px] rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: isHovered 
                            ? 'rgba(255, 255, 255, 0.15)' // More transparent - reduced from 0.2 to 0.15
                            : service.iconBg,
                          border: isHovered 
                            ? '2px solid rgba(255, 255, 255, 0.2)' // More transparent - reduced from 0.3 to 0.2
                            : '1px solid #000000',
                          transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          backdropFilter: isHovered ? 'blur(8px)' : 'none' // Reduced blur from 10px to 8px
                        }}
                      >
                        <img 
                          src={service.icon} 
                          alt={`${service.title} icon`} 
                          className="w-11 h-[37px] object-contain" 
                        />

                      </div>
                      <div className="mt-[6px] flex-1">
                        <h3 
                          className="[font-family:'Fahkwang',Helvetica] font-medium text-xl leading-9"
                          style={{
                            color: isHovered ? '#ffffff' : '#010212',
                            transition: 'color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            textShadow: isHovered ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none'
                          }}
                        >
                          {service.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Description - FIXED POSITION */}
                    <div className="mb-8 flex-shrink-0"> {/* Added flex-shrink-0 to prevent compression */}
                      <p 
                        className="opacity-80 [font-family:'Fahkwang',Helvetica] font-normal text-sm leading-8"
                        style={{
                          color: isHovered ? 'rgba(255, 255, 255, 0.95)' : '#000000',
                          transition: 'color 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          textShadow: isHovered ? '0 1px 6px rgba(0, 0, 0, 0.3)' : 'none'
                        }}
                      >
                        {service.description}
                      </p>
                    </div>

                    {/* Expanded content on hover - EXPANDS DOWNWARD ONLY */}
                    {/* Expanded content on hover - EXPANDS DOWNWARD ONLY */}
<div 
  className="overflow-hidden flex-1 flex flex-col"
  style={{
    maxHeight: isHovered ? '400px' : '0px',
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? 'translateY(0)' : 'translateY(-30px)',
    transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
  }}
>
  {/* REMOVE this entire features list block */}
  {/* <div className="pt-6 mb-8 flex-1">...</div> */}

  {/* KEEP ONLY this "Explore Service" button */}
  <div className="mt-auto">
    <Button
      className="rounded-full px-8 py-4 w-full text-base font-medium group relative overflow-hidden"
      style={{
        backgroundColor: `${service.colorTheme.primary}15`,
        border: `2px solid ${service.colorTheme.primary}40`,
        color: '#ffffff',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${service.colorTheme.primary}30`;
        e.currentTarget.style.borderColor = `${service.colorTheme.primary}80`;
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 10px 25px ${service.colorTheme.primary}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `${service.colorTheme.primary}15`;
        e.currentTarget.style.borderColor = `${service.colorTheme.primary}40`;
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span className="[font-family:'Fahkwang',Helvetica] font-medium relative z-10">
        Explore Service
      </span>
      <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />

      {/* Animated background on button hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(45deg, ${service.colorTheme.primary}15, ${service.colorTheme.secondary}15)`
        }}
      />
    </Button>
  </div>
</div>

                  </CardContent>

                  {/* Footer - only visible when not hovered */}
                  <CardFooter 
                    className="p-0 relative z-10 mt-auto"
                    style={{
                      opacity: isHovered ? 0 : 1,
                      height: isHovered ? '0px' : '49px',
                      overflow: 'hidden',
                      transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div className="w-full h-[49px] bg-primary flex items-center justify-center transition-all duration-300 hover:bg-primary-hover group">
                      <Button
                        variant="ghost"
                        className="[font-family:'Inter',Helvetica] font-semibold text-base text-white hover:text-white transition-all duration-300 hover:scale-105"
                      >
                        Read More
                        <ArrowRightIcon className="ml-2 w-[22px] h-[22px] transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Background with Parallax */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          transformOrigin: 'center center',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)',
          opacity: hoveredCard !== null ? 0 : 1,
          transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Vertical lines */}
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`vline-${index}`}
            className="absolute top-6 bottom-6 w-px bg-[url(/line-7.svg)] opacity-30"
            style={{ left: `${(index + 1) * 7.8}%` }}
          />
        ))}

        {/* Horizontal lines */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`hline-${index}`}
            className="absolute left-0 right-0 h-px bg-[url(/line-14.svg)] opacity-30"
            style={{ top: `${(index + 1) * 140 + 26}px` }}
          />
        ))}
      </div>

      {/* Floating decorative elements */}
      <div 
        className="absolute top-20 left-10 w-4 h-4 rounded-full opacity-20 animate-pulse"
        style={{
          backgroundColor: hoveredCard !== null ? '#ffffff' : '#75BF44',
          transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      <div 
        className="absolute bottom-32 right-16 w-6 h-6 rounded-full opacity-15 animate-pulse"
        style={{ 
          backgroundColor: hoveredCard !== null ? '#ffffff' : '#EE5428',
          animationDelay: '1s',
          transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      <div 
        className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full opacity-25 animate-pulse"
        style={{ 
          backgroundColor: hoveredCard !== null ? '#ffffff' : '#75BF44',
          animationDelay: '2s',
          transition: 'background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </section>
  );
};