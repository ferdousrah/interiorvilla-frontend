// footer section
import { CopyrightIcon, Youtube } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../ui/button";
import { Card, CardContent } from "../../../../ui/card";
import { Input } from "../../../../ui/input";
import { Separator } from "../../../../ui/separator";
import { Textarea } from "../../../../ui/textarea";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const FooterSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const footerHeadingRef = useRef<HTMLHeadingElement>(null);
  const footerHeadingWrapperRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const socialSectionRef = useRef<HTMLDivElement>(null);
  const footerMenusRef = useRef<HTMLDivElement>(null);
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const backgroundElementsRef = useRef<HTMLDivElement>(null);

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

  // Add hover animation for footer heading
  useEffect(() => {
    if (!footerHeadingRef.current || !fontsReady) return;

    // Split text into characters
    const splitText = new SplitText(footerHeadingRef.current, { 
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word"
    });

    // Add hover animation
    const handleMouseMove = (e: MouseEvent) => {
      const rect = footerHeadingWrapperRef.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      gsap.to(splitText.chars, {
        duration: 0.5,
        y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
        x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
        rotationY: (x - 0.5) * 20,
        rotationX: (y - 0.5) * -20,
        ease: "power2.out",
        stagger: {
          amount: 0.3,
          from: "center"
        }
      });
    };

    const handleMouseLeave = () => {
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
    };

    if (footerHeadingWrapperRef.current) {
      footerHeadingWrapperRef.current.addEventListener('mousemove', handleMouseMove);
      footerHeadingWrapperRef.current.addEventListener('mouseleave', handleMouseLeave);
    }

    // Cleanup function
    return () => {
      splitText.revert();
      if (footerHeadingWrapperRef.current) {
        footerHeadingWrapperRef.current.removeEventListener('mousemove', handleMouseMove);
        footerHeadingWrapperRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [fontsReady]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Left content animation (excluding h2)
      if (leftContentRef.current) {
        const children = leftContentRef.current.children;
        // Skip the h2 (first child) and animate the rest
        const elementsToAnimate = Array.from(children).slice(1);
        
        if (elementsToAnimate.length > 0) {
          gsap.fromTo(elementsToAnimate,
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
              stagger: 0.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: leftContentRef.current,
                start: "top 95%",
                end: "top 60%",
                toggleActions: "play none none none",
              }
            }
          );
        }

        // Parallax for left content
        gsap.to(leftContentRef.current, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true
          }
        });
      }

      // Social section animation
      if (socialSectionRef.current) {
        const socialIcons = socialSectionRef.current.querySelectorAll('[aria-label]');
        
        gsap.fromTo(socialIcons,
          {
            opacity: 0,
            scale: 0.5,
            rotation: -180
          },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 1,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: socialSectionRef.current,
              start: "top 95%",
              end: "top 70%",
              toggleActions: "play none none none"
            }
          }
        );
      }

      // Footer menus animation
      if (footerMenusRef.current) {
        const menuColumns = footerMenusRef.current.children;
        
        gsap.fromTo(menuColumns,
          {
            opacity: 0,
            y: 80,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: footerMenusRef.current,
              start: "top 95%",
              end: "top 60%",
              toggleActions: "play none none none",
            }
          }
        );

        // Parallax for footer menus
        gsap.to(footerMenusRef.current, {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
            invalidateOnRefresh: true
          }
        });
      }

      // Bottom section animation
      if (bottomSectionRef.current) {
        gsap.fromTo(bottomSectionRef.current,
          {
            opacity: 0,
            y: 40
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bottomSectionRef.current,
              start: "top 98%",
              end: "top 75%",
              toggleActions: "play none none none",
            }
          }
        );
      }

      // Background elements parallax
      if (backgroundElementsRef.current) {
        gsap.to(backgroundElementsRef.current, {
          yPercent: -15,
          rotation: 45,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true
          }
        });
      }
    });

    // Cleanup function
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-[#1b1b1b] py-20 relative overflow-hidden z-20"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Background decorative elements */}
      <div 
        ref={backgroundElementsRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          transformOrigin: 'center center',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        <div className="absolute top-20 left-10 w-8 h-8 bg-primary rounded-full opacity-8 animate-pulse" />
        <div className="absolute top-1/3 right-20 w-6 h-6 bg-secondary rounded-full opacity-12 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-10 h-10 bg-primary rounded-full opacity-6 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-secondary rounded-full opacity-10 animate-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Geometric shapes */}
        <div className="absolute top-40 right-10 w-16 h-16 border-2 border-primary opacity-5 rotate-45" />
        <div className="absolute bottom-40 left-16 w-20 h-20 border border-secondary opacity-8 rounded-full" />
        <div className="absolute top-1/2 left-10 w-12 h-12 border-2 border-primary opacity-6" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="mb-20">
          <div 
            ref={leftContentRef}
            className="will-change-transform"
            style={{
              transformOrigin: 'center center',
              backfaceVisibility: 'hidden',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            {/* H2 heading - WITH HOVER ANIMATION */}
            <div 
              ref={footerHeadingWrapperRef}
              className="perspective-[1000px] cursor-default"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h2 
                ref={footerHeadingRef}
                className="text-[40px] leading-[56px] font-medium [font-family:'Fahkwang',Helvetica] text-[#fff] bg-gradient-to-b from-white to-[#fff] bg-clip-text"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(0)',
                }}
              >
                Let&apos;s Work Together and <br />
                Create Something Extraordinary!
              </h2>
            </div>

          </div>
        </div>

        <div 
          ref={footerMenusRef}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 will-change-transform"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          {/* Contact Us Column */}
          <div className="flex flex-col items-start gap-6">
            <h4 className="[font-family:'Fahkwang',Helvetica] font-medium text-white text-lg tracking-[0] leading-[26px]">
              Contact Us
            </h4>
            
            {/* Divider */}
            <div className="w-full h-px bg-white/30 -mt-2"></div>
            
            <div className="flex flex-col items-start gap-3 w-full">
              <a
                href="tel:+8801748981590"
                className="flex items-center gap-3 [font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="relative z-10">+88 01748981590</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </a>
              <a
                href="mailto:info@interiorvillabd.com"
                className="flex items-center gap-3 [font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="relative z-10">info@interiorvillabd.com</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </a>
              <div className="flex items-start gap-3 [font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                18/10-A, Block-F, Ring Road, Mohammadpur, Dhaka-1207.
              </div>
              
              <div className="flex items-center gap-4 mt-4">
              {[
                { icon: Facebook, name: "Facebook", color: "#1877F2", url: "https://www.facebook.com/interiorvila" },
                { icon: Instagram, name: "Instagram", color: "#1DA1F2", url: "https://www.instagram.com/interiorvillabd/" },
                { icon: Youtube, name: "Youtube", color: "#FF0000", url: "https://www.youtube.com/@InteriorVilla-BD" },
                { icon: Linkedin, name: "LinkedIn", color: "#0A66C2", url: "https://www.linkedin.com/company/interiorvilla" }
              ].map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer relative overflow-hidden group transform-gpu transition-all duration-500 ease-out hover:scale-125 hover:-translate-y-2 flex items-center justify-center"
                  >
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm scale-110"
                      style={{ backgroundColor: social.color }}
                    ></div>

                    {/* Ripple effect */}
                    <div
                      className="absolute inset-0 rounded-xl border-2 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 ease-out"
                      style={{ borderColor: social.color }}
                    ></div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></div>

                    {/* Icon */}
                    <IconComponent
                      className="w-5 h-5 text-white transition-all duration-500 ease-out group-hover:rotate-12 group-hover:scale-110 relative z-10"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                      }}
                    />
                  </a>
                );
              })}
              </div>
              
            </div>
          </div>

          {/* Services Column */}
          <div className="flex flex-col items-start gap-6">
            <h4 className="[font-family:'Fahkwang',Helvetica] font-medium text-white text-lg tracking-[0] leading-[26px]">
              Services
            </h4>

            {/* Divider */}
            <div className="w-full h-px bg-white/30 -mt-2"></div>

            <div className="flex flex-col items-start gap-3 w-full">
              <Link
                to="/services/residential-interior"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <span className="relative z-10">Residential Interior</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/services/commercial-interior"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <span className="relative z-10">Commercial Interior</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/services/architectural-consultancy"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <span className="relative z-10">Architectural Consultancy</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          {/* Important Links Column */}
          <div className="flex flex-col items-start gap-6">
            <h4 className="[font-family:'Fahkwang',Helvetica] font-medium text-white text-lg tracking-[0] leading-[26px]">
              Important Links
            </h4>

            {/* Divider */}
            <div className="w-full h-px bg-white/30 -mt-2"></div>

            <div className="flex flex-col items-start gap-3 w-full">
              <Link
                to="/about"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <span className="relative z-10">About Us</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/portfolio"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <span className="relative z-10">Portfolio</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/blog"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <span className="relative z-10">Blog</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                to="/contact"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-all duration-300 hover:text-primary hover:translate-x-2 relative group overflow-hidden"
              >
                <span className="relative z-10">Contact Us</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          {/* Follow Us Column */}
          <div ref={socialSectionRef} className="flex flex-col items-start gap-6">
            <h4 className="[font-family:'Fahkwang',Helvetica] font-medium text-white text-lg tracking-[0] leading-[26px]">
              Service Areas
            </h4>
            
            {/* Divider */}
            <div className="w-full h-px bg-white/30 -mt-2"></div>
            
            <div className="flex items-center gap-4">
              {/* List of service areas */}
            </div>

          </div>
        </div>

        <Separator className="bg-white/20 mb-8" />

        <div 
          ref={bottomSectionRef}
          className="flex flex-col sm:flex-row items-center justify-between py-6 will-change-transform"
          style={{
            transformOrigin: 'center center',
            backfaceVisibility: 'hidden',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <CopyrightIcon className="w-4 h-4 text-white" />
              <div className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6">
                2025 Interior Villa. All rights reserved.
              </div>
            </div>
            
            <div className="flex items-center gap-6">
             {/* <a
                href="/privacy-policy"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-colors duration-300 hover:text-primary relative group overflow-hidden cursor-pointer"
              >
                <span className="relative z-10">Privacy Policy</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </a>
              
              <a
                href="/terms-of-service"
                className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 transition-colors duration-300 hover:text-primary relative group overflow-hidden cursor-pointer"
              >
                <span className="relative z-10">Terms of Service</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary transition-all duration-500 ease-out group-hover:w-full"></span>
              </a>*/}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div className="[font-family:'Fahkwang',Helvetica] font-normal text-white text-sm tracking-[0] leading-6">
              
            </div>
          </div>
        </div>
      </div>

      {/* Background blur effects */}
      <div className="absolute w-[443px] h-[449px] right-0 top-20 bg-[#999999] blur-[294px] pointer-events-none" />
      <div className="absolute w-[443px] h-[449px] left-0 bottom-20 bg-[#999999] blur-[322px] pointer-events-none" />
    </section>
  );
};