import React, { useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomCursor } from "../../components/ui/cursor";

gsap.registerPlugin(ScrollTrigger);

const NotFound = (): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const decorativeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create timeline for entrance animations
    const tl = gsap.timeline({ delay: 0.5 });

    // Animate 404 number with bounce effect
    if (numberRef.current) {
      tl.fromTo(numberRef.current,
        {
          opacity: 0,
          scale: 0.5,
          y: -100,
          rotationX: -90
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          duration: 1.5,
          ease: "back.out(1.7)"
        }
      );
    }

    // Animate content
    if (contentRef.current) {
      tl.fromTo(contentRef.current,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        },
        "-=0.8"
      );
    }

    // Animate buttons
    if (buttonsRef.current) {
      const buttons = buttonsRef.current.children;
      tl.fromTo(buttons,
        {
          opacity: 0,
          y: 30,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out"
        },
        "-=0.5"
      );
    }

    // Animate decorative elements
    if (decorativeRef.current) {
      const elements = decorativeRef.current.children;
      tl.fromTo(elements,
        {
          opacity: 0,
          scale: 0,
          rotation: -180
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1,
          stagger: 0.1,
          ease: "elastic.out(1, 0.3)"
        },
        "-=1"
      );
    }

    // Floating animation for decorative elements
    if (decorativeRef.current) {
      gsap.to(decorativeRef.current.children, {
        y: "random(-20, 20)",
        x: "random(-10, 10)",
        rotation: "random(-15, 15)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random"
        }
      });
    }

    // Cleanup function
    return () => {
      tl.kill();
    };
  }, []);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f9fb] via-white to-[#f0f4f8] flex items-center justify-center relative overflow-hidden">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />

      {/* Background Decorative Elements */}
      <div 
        ref={decorativeRef}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-primary/10 rounded-full blur-sm" />
        <div className="absolute top-40 right-32 w-12 h-12 bg-secondary/15 rounded-lg rotate-45" />
        <div className="absolute bottom-32 left-16 w-20 h-20 bg-primary/8 rounded-full" />
        <div className="absolute bottom-20 right-20 w-14 h-14 bg-secondary/12 rounded-lg rotate-12" />
        <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-primary/20 rounded-full" />
        <div className="absolute top-2/3 right-1/3 w-10 h-10 bg-secondary/18 rounded-lg rotate-45" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-gray-300" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div 
        ref={containerRef}
        className="container mx-auto px-4 max-w-4xl text-center relative z-10"
      >
        {/* 404 Number */}
        <div 
          ref={numberRef}
          className="mb-8"
        >
          <div className="relative inline-block">
            <h1 className="text-[200px] md:text-[300px] lg:text-[400px] font-bold [font-family:'Fahkwang',Helvetica] text-transparent bg-clip-text bg-gradient-to-br from-primary via-secondary to-primary leading-none select-none">
              404
            </h1>
            
            {/* Glowing Effect */}
            <div className="absolute inset-0 text-[200px] md:text-[300px] lg:text-[400px] font-bold [font-family:'Fahkwang',Helvetica] text-primary/20 blur-sm leading-none">
              404
            </div>
            
            {/* Interior Design Icons Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 opacity-30">
                <div className="w-8 h-8 bg-primary rounded-lg rotate-12" />
                <div className="w-6 h-6 bg-secondary rounded-full" />
                <div className="w-8 h-8 bg-primary rounded-lg -rotate-12" />
                <div className="w-6 h-6 bg-secondary rounded-full" />
                <div className="w-10 h-10 bg-primary/50 rounded-lg rotate-45" />
                <div className="w-6 h-6 bg-secondary rounded-full" />
                <div className="w-8 h-8 bg-primary rounded-lg rotate-12" />
                <div className="w-6 h-6 bg-secondary rounded-full" />
                <div className="w-8 h-8 bg-primary rounded-lg -rotate-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="mb-12 space-y-6"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6">
            Oops! Page Not Found
          </h2>
          
          <p className="text-lg md:text-xl [font-family:'Fahkwang',Helvetica] text-[#626161] max-w-2xl mx-auto leading-relaxed">
            The page you're looking for seems to have been moved, deleted, or doesn't exist. 
            But don't worry, we'll help you find your way back to beautiful interior designs.
          </p>

          {/* Search Suggestion */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-gray-200/50 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="w-5 h-5 text-primary" />
              <span className="text-sm [font-family:'Fahkwang',Helvetica] text-[#626161] font-medium">
                Popular Pages
              </span>
            </div>
            <div className="space-y-2 text-left">
              <button 
                onClick={() => window.location.href = "/about"}
                className="block w-full text-sm [font-family:'Fahkwang',Helvetica] text-[#01190c] hover:text-primary transition-colors duration-300 py-1"
              >
                → About Us
              </button>
              <button 
                onClick={() => window.location.href = "/portfolio"}
                className="block w-full text-sm [font-family:'Fahkwang',Helvetica] text-[#01190c] hover:text-primary transition-colors duration-300 py-1"
              >
                → Portfolio
              </button>
              <button 
                onClick={() => window.location.href = "/residential-interior"}
                className="block w-full text-sm [font-family:'Fahkwang',Helvetica] text-[#01190c] hover:text-primary transition-colors duration-300 py-1"
              >
                → Residential Interior
              </button>
              <button 
                onClick={() => window.location.href = "/contact"}
                className="block w-full text-sm [font-family:'Fahkwang',Helvetica] text-[#01190c] hover:text-primary transition-colors duration-300 py-1"
              >
                → Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div 
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            onClick={handleGoHome}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full [font-family:'Fahkwang',Helvetica] font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-3 group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>Go Home</span>
          </Button>

          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="border-2 border-[#01190c] text-[#01190c] hover:bg-[#01190c] hover:text-white px-8 py-4 rounded-full [font-family:'Fahkwang',Helvetica] font-medium text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>Go Back</span>
          </Button>

          <Button 
            onClick={handleRefresh}
            variant="ghost"
            className="text-[#626161] hover:text-primary px-8 py-4 rounded-full [font-family:'Fahkwang',Helvetica] font-medium text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-3 group"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Bottom Message */}
        <div className="mt-16">
          <p className="text-sm [font-family:'Fahkwang',Helvetica] text-[#626161]">
            Need help? <button 
              onClick={() => window.location.href = "/contact"}
              className="text-primary hover:text-primary-hover font-medium transition-colors duration-300 underline decoration-primary/30 hover:decoration-primary"
            >
              Contact our support team
            </button>
          </p>
        </div>
      </div>

      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        /* Enhanced gradient text effect */
        .bg-clip-text {
          background-clip: text;
          -webkit-background-clip: text;
        }

        /* Smooth animations */
        * {
          transition-property: transform, opacity, background-color, border-color, color, box-shadow;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Glow effect on hover for buttons */
        button:hover {
          filter: drop-shadow(0 0 20px rgba(117, 191, 68, 0.3));
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
          background: #75bf44;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #68ab3c;
        }
      `}</style>
    </div>
  );
};

export default NotFound;