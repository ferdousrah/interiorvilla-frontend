// components/ui/PageHero.tsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronRight } from "lucide-react";
import { MainMenu } from "./navigation-menu";

gsap.registerPlugin(ScrollTrigger);

interface Breadcrumb {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface PageHeroProps {
  title: string;
  bgImage: string;
  breadcrumbs: Breadcrumb[];
}

export const PageHero: React.FC<PageHeroProps> = ({ title, bgImage, breadcrumbs }) => {
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);

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
          alt={title}
          src={bgImage}
        />
      </div>

      {/* Shared Sticky Header/Menu */}
      <MainMenu />

      {/* Hero Content */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-left text-white max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[48px] font-bold [font-family:'Fahkwang',Helvetica] mb-4 sm:mb-6 leading-tight"
              style={{ fontSize: "clamp(2rem, 5vw, 48px)", lineHeight: "1.1" }}
            >
              {title}
            </motion.h1>

            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center flex-wrap space-x-2"
            >
              {breadcrumbs.map((bc, index) => (
                <React.Fragment key={index}>
                  {bc.href && !bc.isActive ? (
                    <Link
                      to={bc.href}
                      className="text-white/80 hover:text-white transition-colors duration-300 text-sm sm:text-base"
                    >
                      {bc.label}
                    </Link>
                  ) : (
                    <span
                      className={`text-sm sm:text-base ${
                        bc.isActive
                          ? "text-primary font-medium"
                          : "text-white/80"
                      }`}
                    >
                      {bc.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
