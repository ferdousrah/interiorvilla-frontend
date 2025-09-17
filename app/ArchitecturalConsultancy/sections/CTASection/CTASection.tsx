import React, { useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const CTASection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleAppointmentClick = () => {
    window.location.href = '/contact';
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
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium [font-family:'Fahkwang',Helvetica] mb-12 leading-tight"
                  style={{ color: '#2D2D2D' }}>
                Ready to bring your vision to life?
              </h2>
              
              <Button
                onClick={handleAppointmentClick} 
                className="bg-secondary hover:bg-secondary-hover text-white px-10 py-4 rounded-lg [font-family:'Fahkwang',Helvetica] font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};