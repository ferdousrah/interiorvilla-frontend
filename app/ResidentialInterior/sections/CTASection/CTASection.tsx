import React, { useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const CTASection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Content animation
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Add hover animation for main heading
  useEffect(() => {
    if (!headingRef.current) return;

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
  }, []);


  const handleAppointmentClick = () => {
    window.location.href = '/book-appointment';
  };

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 bg-white"
    >
      

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Rounded Container with cta-bg.svg Background */}
        <div 
          className="relative overflow-hidden rounded-[40px] py-20 md:py-28"
          style={{
            backgroundImage: 'url(/cta-bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Content - Centered */}
          <div className="relative z-10 text-center px-6 md:px-12">
            <div ref={contentRef}>
              <div 
                ref={headingWrapperRef}
                className="perspective-[1000px] cursor-default"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <h2 
                  ref={headingRef}
                  className="text-3xl md:text-4xl lg:text-5xl font-medium [font-family:'Fahkwang',Helvetica] mb-12 leading-tight"
                  style={{ 
                    color: '#2D2D2D',
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(0)',
                  }}
                >
                  Ready to transform your space?
                </h2>
              </div>
              
              {/* Simple Button without Animation */}
              <Button
                onClick={handleAppointmentClick} 
                className="bg-secondary hover:bg-secondary-hover text-white px-10 py-4 rounded-lg [font-family:'Fahkwang',Helvetica] font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Book an Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};