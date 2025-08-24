import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const ProcessSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Heading animation
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Steps animation
    if (stepsContainerRef.current) {
      const steps = stepsContainerRef.current.children;

      gsap.fromTo(
        steps,
        {
          opacity: 0,
          y: 60,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stepsContainerRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (!headingRef.current) return;

    const splitText = new SplitText(headingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    if (headingWrapperRef.current) {
      const mouseMoveHandler = (e: MouseEvent) => {
        const rect = headingWrapperRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        gsap.to(splitText.chars, {
          duration: 0.5,
          y: (i: number) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
          x: (i: number) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
          rotationY: (x - 0.5) * 20,
          rotationX: (y - 0.5) * -20,
          ease: "power2.out",
          stagger: {
            amount: 0.3,
            from: "center",
          },
        });
      };

      const mouseLeaveHandler = () => {
        gsap.to(splitText.chars, {
          duration: 1,
          y: 0,
          x: 0,
          rotationY: 0,
          rotationX: 0,
          ease: "elastic.out(1, 0.3)",
          stagger: {
            amount: 0.3,
            from: "center",
          },
        });
      };

      headingWrapperRef.current.addEventListener("mousemove", mouseMoveHandler);
      headingWrapperRef.current.addEventListener("mouseleave", mouseLeaveHandler);

      return () => {
        splitText.revert();
        if (headingWrapperRef.current) {
          headingWrapperRef.current.removeEventListener(
            "mousemove",
            mouseMoveHandler
          );
          headingWrapperRef.current.removeEventListener(
            "mouseleave",
            mouseLeaveHandler
          );
        }
      };
    }
  }, []);

  const processSteps = [
    {
      step: "01",
      title: "Site Analysis & Programming",
      description:
        "We conduct thorough site analysis and develop comprehensive project requirements and specifications.",
      backgroundColor: "#FFFEF3",
    },
    {
      step: "02",
      title: "Conceptual Design & Development",
      description:
        "We create innovative design concepts that balance aesthetics, functionality, and regulatory compliance.",
      backgroundColor: "#F8FFFF",
    },
    {
      step: "03",
      title: "Technical Documentation & Support",
      description:
        "Our team provides detailed technical drawings, specifications, and ongoing project support through completion.",
      backgroundColor: "#F6EFEF",
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-[#f7f9fb]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-16 md:mb-24">
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6"
              style={{
                transformStyle: "preserve-3d",
                transform: "translateZ(0)",
              }}
            >
              Our Approach
            </h2>
          </div>
          <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed max-w-2xl mx-auto">
            A Comprehensive Path to Architectural Excellence
          </p>
        </div>

        <div ref={stepsContainerRef} className="relative">
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-center items-stretch">
            {processSteps.map((step, index) => (
              <React.Fragment key={index}>
                <div
                  className="relative border-2 border-[#E5E5E5] rounded-2xl text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:border-primary/30 flex flex-col justify-center group"
                  style={{
                    width: "340px",
                    height: "400px",
                    padding: "40px 30px",
                    backgroundColor: step.backgroundColor,
                  }}
                >
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-2 border-dashed border-[#CCCCCC] rounded-full"></div>
                    <div
                      className="absolute inset-0 border-2 border-dashed border-[#CCCCCC] rounded-full transition-colors group-hover:border-[#D74C25] group-hover:animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                    <div
                      className="absolute inset-2 bg-white border-2 border-[#333333] rounded-full flex items-center justify-center"
                    >
                      <span className="text-[#333333] font-bold [font-family:'Fahkwang',Helvetica] text-lg">
                        {step.step}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 leading-tight">
                    {step.title}
                  </h3>

                  <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < processSteps.length - 1 && (
                  <div
                    className="flex items-center flex-shrink-0"
                    style={{
                      alignItems: index === 0 ? "flex-start" : "flex-end",
                      paddingTop: index === 0 ? "60px" : "0",
                      paddingBottom: index === 1 ? "60px" : "0",
                    }}
                  >
                    <img
                      src={
                        index === 0
                          ? "/approach-arrow-one.svg"
                          : "/approach-arrow-two.svg"
                      }
                      alt="Process Arrow"
                      className="object-contain"
                      style={{
                        width: "118.47px",
                        height: "auto",
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-12 flex flex-col items-center">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className="relative border-2 border-[#E5E5E5] rounded-3xl text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:border-primary/30 flex flex-col justify-center"
                style={{
                  width: "340px",
                  height: "350px",
                  padding: "30px 25px",
                  backgroundColor: step.backgroundColor,
                }}
              >
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-2 border-dashed border-[#CCCCCC] rounded-full"></div>
                  <div className="absolute inset-2 bg-white border-2 border-[#333333] rounded-full flex items-center justify-center">
                    <span className="text-[#333333] font-bold [font-family:'Fahkwang',Helvetica] text-lg">
                      {step.step}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-4 leading-tight">
                  {step.title}
                </h3>

                <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-sm leading-relaxed">
                  {step.description}
                </p>

                {index < processSteps.length - 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="w-10 h-10 border-2 border-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
