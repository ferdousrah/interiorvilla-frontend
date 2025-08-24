// about section
import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "../../../../ui/card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { BeforeAfterSlider } from "../../../../ui/before-after-slider";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const AboutSection = (): JSX.Element => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const experienceCircleRef = useRef<HTMLDivElement>(null);
  const featuresCardRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const featureHeadingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const featureHeadingWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!headingRef.current) return;

    // Split text into characters
    const splitText = new SplitText(headingRef.current, { 
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word"
    });
    
    // Create timeline for smooth sequencing
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse"
      }
    });

    // Initial state
    gsap.set(splitText.chars, {
      opacity: 0,
      y: 100,
      rotateX: -90,
      transformOrigin: "50% 50% -50px"
    });

    // Animate each character
    tl.to(splitText.chars, {
      duration: 1.2,
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: {
        amount: 1,
        from: "start"
      },
      ease: "power4.out"
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

  // Add hover animation for feature headings
  useEffect(() => {
    featureHeadingRefs.current.forEach((heading, index) => {
      if (!heading) return;

      // Split text into characters
      const splitText = new SplitText(heading, { 
        type: "chars,words",
        charsClass: "char",
        wordsClass: "word"
      });

      // Add hover animation
      const wrapper = featureHeadingWrapperRefs.current[index];
      if (wrapper) {
        wrapper.addEventListener('mousemove', (e) => {
          const rect = wrapper.getBoundingClientRect();
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

        wrapper.addEventListener('mouseleave', () => {
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
    });

    // Cleanup function for feature headings
    return () => {
      featureHeadingWrapperRefs.current.forEach((wrapper, index) => {
        if (wrapper) {
          wrapper.removeEventListener('mousemove', () => {});
          wrapper.removeEventListener('mouseleave', () => {});
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Parallax effect for main image
    // Simplified parallax for better performance
    if (imageContainerRef.current) {
      gsap.to(imageContainerRef.current, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: imageContainerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      });
    }

    // Parallax effect for experience circle
    if (experienceCircleRef.current) {
      // Animation disabled for experience circle
      gsap.set(experienceCircleRef.current, {
        clearProps: "all"
      });
    }

    // Parallax effect for features card
    if (featuresCardRef.current) {
      gsap.to(featuresCardRef.current, {
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

    // Fade in animation for description
    if (descriptionRef.current) {
      gsap.fromTo(descriptionRef.current,
        { 
          opacity: 0,
          y: 50,
          filter: "blur(10px)"
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: "top 85%",
            end: "top 50%",
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

  // Data for the feature cards
  const features = [
    {
      id: "01",
      title: "Flexible Budget & Taste",
      description:
        "Your style, your budget, our flexible designs.",
    },
    {
      id: "02",
      title: "On-time Delivery",
      description:
        "Delivering your dream space, precisely on schedule, every time.",
    },
    {
      id: "03",
      title: "700+ Happy Customers",
      description:
        "Proudly serving 700+ happy customers with exceptional design.",
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative w-full bg-[#f7f9fb] rounded-t-[20px] py-28 overflow-hidden"
      style={{ zIndex: 4 }}
    >
      <div className="container mx-auto max-w-[1276px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div 
              ref={headingWrapperRef}
              className="perspective-[1000px] cursor-default"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h2 
                ref={headingRef}
                className="font-['Fahkwang',Helvetica] font-semibold text-[#01190c] text-[40px] tracking-[-1.00px] leading-[49.9px] mb-12"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(0)',
                }}
              >
                Elevating Interiors with Passion and Purpose
              </h2>
            </div>

            <div className="relative mt-10">
              <div 
                ref={imageContainerRef}
                className="relative overflow-hidden rounded-md"
                style={{ position: 'relative', zIndex: 5 }}
              >
                <BeforeAfterSlider
                  beforeImage="/before.jpg"
                  afterImage="/after.jpg"
                  alt="Interior design transformation"
                  className="w-full h-auto max-w-[730px] will-change-transform"
                />
              </div>

              <div 
                ref={experienceCircleRef}
                className="absolute bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-10 lg:right-8 w-[140px] h-[150px] md:w-[160px] md:h-[170px] lg:w-[180px] lg:h-[190px] z-10 cursor-pointer transition-transform duration-500 ease-out hover:scale-110 group"
                style={{
                   transform: 'none'
                }}
              >
                <div className="absolute w-[116px] h-[126px] md:w-[136px] md:h-[146px] lg:w-[146px] lg:h-[156px] top-[15px] md:top-[17px] lg:top-[20px] left-[12px] md:left-[12px] lg:left-1 bg-primary rounded-[58px/63px] md:rounded-[68px/73px] lg:rounded-[73px/78px] transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30" />
                <div className="absolute w-[116px] h-[126px] md:w-[136px] md:h-[146px] lg:w-[146px] lg:h-[156px] top-[15px] md:top-[17px] lg:top-[20px] left-[12px] md:left-[12px] lg:left-1 bg-primary rounded-[58px/63px] md:rounded-[68px/73px] lg:rounded-[73px/78px] transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-secondary/30 group-hover:bg-secondary" />
                <img
                  className="absolute w-[140px] h-[150px] md:w-[160px] md:h-[170px] lg:w-[180px] lg:h-[190px] top-0 left-0 pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105"
                  alt="Ellipse"
                  src="/ellipse-141.svg"
                  style={{
                    transform: 'none'
                  }}
                />
                <div className="absolute w-[80px] md:w-[90px] lg:w-[105px] top-[75px] md:top-[85px] lg:top-[95px] left-[30px] md:left-[35px] lg:left-[29px] font-['Fahkwang',Helvetica] font-normal text-primary text-sm md:text-base text-center tracking-[0] leading-[20px] md:leading-[24px] transition-all duration-500 ease-out group-hover:scale-105">
                  <span className="font-medium">
                    YEARS
                    <br />
                    EXPERIENCED
                  </span>
                  <span className="font-['Inter',Helvetica] font-medium">
                    {" "}
                    <br />
                  </span>
                </div>
                <div className="absolute w-[60px] md:w-[70px] lg:w-[78px] top-[45px] md:top-[50px] lg:top-[56px] left-[40px] md:left-[45px] lg:left-[46px] font-['Fahkwang',Helvetica] font-bold text-primary text-2xl md:text-3xl lg:text-4xl text-center tracking-[0] leading-[30px] md:leading-[35px] lg:leading-[40px] whitespace-nowrap transition-all duration-500 ease-out group-hover:scale-110">
                  9+
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <p 
              ref={descriptionRef}
              className="font-['Fahkwang',Helvetica] font-normal text-[#626161] text-sm text-justify tracking-[0] leading-[26.6px] mb-10 md:mb-10 pb-4 md:pb-6"
            >
              We are a full-service interior design studio dedicated to creating
              beautifully curated spaces that reflect your unique style and
              needs. From cozy homes to dynamic commercial environments, our
              team blends aesthetics with functionality to deliver results that
              exceed expectations.
            </p>

            <Card 
              ref={featuresCardRef}
              className="w-full bg-[#ffffff] rounded-[15px] border-none shadow-none will-change-transform pt-12"
              style={{
                transformOrigin: 'center center',
                backfaceVisibility: 'hidden',
                transform: 'translate3d(0, 0, 0)'
              }}
            >
              <CardContent className="p-12 space-y-10">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-8">
                    <div className="flex-shrink-0 w-[60px] h-[57px] bg-primary rounded-[11px] flex items-center justify-center">
                      <div className="font-['DM_Sans',Helvetica] font-bold text-[#01190c] text-xl">
                        {feature.id}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div 
                        ref={el => featureHeadingWrapperRefs.current[index] = el}
                        className="perspective-[1000px] cursor-default"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <h3 
                          ref={el => featureHeadingRefs.current[index] = el}
                          className="font-['Fahkwang',Helvetica] font-semibold text-black text-xl tracking-[-1.00px] leading-[42.3px]"
                          style={{ 
                            transformStyle: 'preserve-3d',
                            transform: 'translateZ(0)',
                          }}
                        >
                          {feature.title}
                        </h3>
                      </div>
                      <p className="font-['Fahkwang',Helvetica] font-normal text-[#6c6c6c] text-sm tracking-[0] leading-[26.6px]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};