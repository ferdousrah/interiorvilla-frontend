import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const FeaturedWorksHeaderSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

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

  // Add hover animation for heading
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

  // Entrance animations
  useEffect(() => {
    if (!sectionRef.current || !fontsReady) return;

    // Heading animation
    if (headingRef.current) {
      const splitText = new SplitText(headingRef.current, { 
        type: "words,chars",
        charsClass: "char",
        wordsClass: "word"
      });

      // Set initial state
      gsap.set(splitText.chars, {
        opacity: 0,
        y: 100,
        rotationX: -90,
        transformOrigin: "50% 50% -50px"
      });

      // Title reveal animation
      gsap.to(splitText.chars, {
        duration: 1.5,
        opacity: 1,
        y: 0,
        rotationX: 0,
        stagger: {
          amount: 1.2,
          from: "start"
        },
        ease: "power4.out",
        delay: 0.5
      });
    }

    // Subtitle animation
    if (subtitleRef.current) {
      gsap.fromTo(subtitleRef.current,
        {
          opacity: 0,
          y: 50,
          filter: "blur(10px)"
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.8,
          ease: "power3.out",
          delay: 1.2
        }
      );
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [fontsReady]);

  return (
    <section 
      ref={sectionRef}
      data-next-section
      className="w-full pt-16 md:pt-20 lg:pt-24 pb-0 bg-white relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-300/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-3/4 left-1/3 w-72 h-72 bg-gray-400/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-6">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '120px 120px'
            }}
          />
        </div>
        
        {/* Noise overlay */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full opacity-15"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(0,0,0,0.015) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(0,0,0,0.018) 0%, transparent 50%)
              `
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div 
          ref={headingWrapperRef}
          className="perspective-[1000px] cursor-default"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <h2
            ref={headingRef}
            className="[font-family:'Fahkwang',Helvetica] font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[40px] text-center tracking-[0] leading-tight mb-6"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'translateZ(0)',
            }}
          >
            <span className="text-[#0d1529]">Our </span>
            <span className="text-[#0d1529]">Featured </span>
            <span className="text-secondary">Works</span>
          </h2>
        </div>

        <p 
          ref={subtitleRef}
          className="text-sm md:text-base lg:text-lg text-[#626161] max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica]"
        >
          Explore our showcase of exceptional interior design projects that reflect our commitment to quality, creativity, and client satisfaction.
        </p>
      </div>
    </section>
  );
};