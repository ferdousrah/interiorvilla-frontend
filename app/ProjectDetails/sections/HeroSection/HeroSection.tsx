"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MainMenu } from "../../../../components/ui/navigation-menu"; 
import { useProject } from "../../ProjectContext";

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = (): JSX.Element => {
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const { title, loading } = useProject(); // ✅ get project title

  useEffect(() => {
    if (!heroImageRef.current || !heroContainerRef.current) return;

    // Parallax effect
    gsap.to(heroImageRef.current, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: heroContainerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    // Subtle zoom out
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
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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
          alt="Project Hero"
          src="/image.png"
          style={{
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            transform: "translate3d(0, 0, 0)",
          }}
        />
      </div>

      {/* Shared Header/Menu */}
      <MainMenu />

      {/* Hero Content */}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left text-white max-w-5xl">
            {/* Page Title */}
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[48px] font-bold [font-family:'Fahkwang',Helvetica] mb-4 sm:mb-6 leading-tight"
              style={{
                fontSize: "clamp(2rem, 5vw, 48px)",
                lineHeight: "1.1",
              }}
            >
              {loading ? "Loading..." : title || "Project"}
            </motion.h1>

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
              <Link
                to="/portfolio"
                className="text-white/80 hover:text-white transition-colors duration-300 [font-family:'Fahkwang',Helvetica] text-sm sm:text-base"
              >
                Portfolio
              </Link>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              <span className="text-white [font-family:'Fahkwang',Helvetica] text-sm sm:text-base font-medium">
                Project Details
              </span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
              <span className="text-primary [font-family:'Fahkwang',Helvetica] text-sm sm:text-base font-medium">
                {loading ? "Loading..." : title || "Project"}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
