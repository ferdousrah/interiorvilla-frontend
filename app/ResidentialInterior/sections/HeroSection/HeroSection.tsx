import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ChevronRight } from "lucide-react";
import { MainMenu } from "../../../../components/ui/navigation-menu"; // ✅ shared menu

gsap.registerPlugin(ScrollTrigger, SplitText);

export const HeroSection = (): JSX.Element => {
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);

  // Parallax + zoom effect
  useEffect(() => {
    if (!heroImageRef.current || !heroContainerRef.current) return;

    gsap.to(heroImageRef.current, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: heroContainerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.fromTo(
      heroImageRef.current,
      { scale: 1.1 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: heroContainerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Title hover animation
  useEffect(() => {
    if (!titleRef.current || !titleWrapperRef.current) return;
    const splitText = new SplitText(titleRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    const wrapper = titleWrapperRef.current;

    const handleMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
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

    const handleLeave = () => {
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

    wrapper.addEventListener("mousemove", handleMove);
    wrapper.addEventListener("mouseleave", handleLeave);

    return () => {
      splitText.revert();
      wrapper.removeEventListener("mousemove", handleMove);
      wrapper.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={heroContainerRef}
      className="w-full h-[60vh] md:h-[70vh] lg:h-[80vh] relative overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          ref={heroImageRef}
          className="w-full h-full object-cover will-change-transform"
          alt="Residential Interior Hero"
          src="/image.png"
        />
      </div>

      {/* Shared Header/Menu */}
      <MainMenu />

      {/* Hero Content */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left text-white max-w-2xl">
            {/* Animated Title */}
            <div
              ref={titleWrapperRef}
              className="perspective-[1000px] cursor-default"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.h1
                ref={titleRef}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[48px] font-bold [font-family:'Fahkwang',Helvetica] mb-4 sm:mb-6 leading-tight"
                style={{
                  fontSize: "clamp(2rem, 5vw, 48px)",
                  lineHeight: "1.1",
                }}
              >
                Residential Interior
              </motion.h1>
            </div>

            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center space-x-2"
            >
              <Link
                to="/"
                className="text-white/80 hover:text-white transition-colors duration-300 [font-family:'Fahkwang',Helvetica] text-sm sm:text-base"
              >
                Home
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              <span className="text-white/80 [font-family:'Fahkwang',Helvetica] text-sm sm:text-base">
                Services
              </span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              <span className="text-primary [font-family:'Fahkwang',Helvetica] text-sm sm:text-base font-medium">
                Residential Interior
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
