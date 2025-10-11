import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface AboutSectionProps {
  title?: string;
  description?: string;
}

export const AboutSection = ({ title, description }: AboutSectionProps): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Scroll animation for content
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Heading hover animation
  useEffect(() => {
    if (!headingRef.current) return;

    const splitText = new SplitText(headingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!headingWrapperRef.current) return;
      const rect = headingWrapperRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      gsap.to(splitText.chars, {
        duration: 0.5,
        y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
        x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
        rotationY: (x - 0.5) * 20,
        rotationX: (y - 0.5) * -20,
        ease: "power2.out",
        stagger: { amount: 0.3, from: "center" },
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
        stagger: { amount: 0.3, from: "center" },
      });
    };

    headingWrapperRef.current?.addEventListener("mousemove", handleMouseMove);
    headingWrapperRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      splitText.revert();
      headingWrapperRef.current?.removeEventListener("mousemove", handleMouseMove);
      headingWrapperRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white -mt-48 relative z-10">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div ref={contentRef}>
          {/* Animated Heading */}
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8 leading-tight"
              style={{
                transformStyle: "preserve-3d",
                transform: "translateZ(0)",
              }}
            >
              {title || "Transforming Your Home Into a Sanctuary of Style and Comfort."}
            </h2>
          </div>

          {/* Description */}
          <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed max-w-3xl mx-auto">
            {description ||
              "We specialize in creating personalized residential interiors that reflect your unique taste and lifestyle. Our designs blend comfort, style, and functionality to transform your living spaces into beautiful, harmonious environments."}
          </p>
        </div>
      </div>
    </section>
  );
};
