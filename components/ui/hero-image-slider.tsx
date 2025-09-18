'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface SlideImage {
  id: number;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

interface HeroImageSliderProps {
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}

export const HeroImageSlider: React.FC<HeroImageSliderProps> = ({
  className = '',
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hero images for the slider
  const images: SlideImage[] = [
    {
      id: 1,
      src: '/image.png',
      alt: 'Modern Living Room Design',
      title: 'Transform Your Space',
      subtitle: 'Premium Interior Design Services'
    },
    {
      id: 2,
      src: '/a-residential-interior-image.png',
      alt: 'Elegant Residential Interior',
      title: 'Residential Excellence',
      subtitle: 'Creating Beautiful Homes'
    },
    {
      id: 3,
      src: '/a-office-interior-image.png',
      alt: 'Professional Office Design',
      title: 'Commercial Spaces',
      subtitle: 'Inspiring Work Environments'
    },
    {
      id: 4,
      src: '/dining-interior.png',
      alt: 'Sophisticated Dining Area',
      title: 'Dining Elegance',
      subtitle: 'Where Style Meets Function'
    },
    {
      id: 5,
      src: '/create-an-image-where-a-beautiful-girl-shows-her-bedroom-interio.png',
      alt: 'Luxurious Bedroom Design',
      title: 'Dream Bedrooms',
      subtitle: 'Your Personal Sanctuary'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, autoPlayInterval, images.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.2,
      rotateY: direction > 0 ? 15 : -15,
      rotateX: 5,
      filter: 'blur(20px) brightness(0.7) saturate(1.3)',
      transformOrigin: 'center center',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      filter: 'blur(0px) brightness(1) saturate(1)',
      transformOrigin: 'center center',
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 15 : -15,
      rotateX: -5,
      filter: 'blur(15px) brightness(1.2) saturate(0.8)',
      transformOrigin: 'center center',
    }),
  };

  const overlayVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      y: direction > 0 ? 80 : -80,
      x: direction > 0 ? 30 : -30,
      scale: 0.9,
      rotateX: 10,
      filter: 'blur(8px)',
    }),
    center: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotateX: 0,
      filter: 'blur(0px)',
    },
    exit: (direction: number) => ({
      opacity: 0,
      y: direction < 0 ? 80 : -80,
      x: direction < 0 ? 30 : -30,
      scale: 1.1,
      rotateX: -10,
      filter: 'blur(6px)',
    }),
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Image Slider */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 200, damping: 25 },
              opacity: { duration: 0.8, ease: "easeInOut" },
              scale: { duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] },
              rotateY: { duration: 0.9, ease: "easeOut" },
              rotateX: { duration: 0.7, ease: "easeInOut" },
              filter: { duration: 0.6, ease: "easeOut" },
            }}
            className="absolute inset-0 w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px',
            }}
          >
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="w-full h-full object-cover will-change-transform"
              style={{
                imageRendering: 'high-quality',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            />
            
            {/* Dynamic Gradient Overlay with Animation */}
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                background: `linear-gradient(
                  ${45 + (currentIndex * 15)}deg, 
                  rgba(0,0,0,0.7) 0%, 
                  rgba(0,0,0,0.4) 30%, 
                  rgba(0,0,0,0.2) 60%, 
                  transparent 100%
                )`
              }}
            />
            
            {/* Animated Light Rays */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 0.1, rotate: 10 }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
              style={{
                background: `conic-gradient(
                  from ${currentIndex * 60}deg at 70% 30%, 
                  transparent 0deg, 
                  rgba(255,255,255,0.1) 45deg, 
                  transparent 90deg, 
                  rgba(255,255,255,0.05) 135deg, 
                  transparent 180deg
                )`
              }}
            />
            
            {/* Animated Text Overlay */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentIndex}`}
                custom={direction}
                variants={overlayVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 1.0,
                  delay: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  staggerChildren: 0.1
                }}
                className="absolute inset-0 flex items-center justify-start"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                  <div className="text-left text-white max-w-2xl">
                    {images[currentIndex].title && (
                      <motion.h1
                        initial={{ opacity: 0, x: -80, y: 30, rotateX: -15, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, y: 0, rotateX: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, y: -30, rotateX: 15, scale: 1.1 }}
                        transition={{ 
                          duration: 1.2, 
                          delay: 0.6,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          type: "spring",
                          stiffness: 100,
                          damping: 15
                        }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold [font-family:'Fahkwang',Helvetica] mb-4 leading-tight"
                        style={{
                          textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {images[currentIndex].title}
                      </motion.h1>
                    )}
                    
                    {images[currentIndex].subtitle && (
                      <motion.p
                        initial={{ opacity: 0, x: -60, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 60, y: -20, scale: 1.05 }}
                        transition={{ 
                          duration: 1.0, 
                          delay: 0.9,
                          ease: [0.25, 0.46, 0.45, 0.94],
                          type: "spring",
                          stiffness: 120,
                          damping: 20
                        }}
                        className="text-lg sm:text-xl md:text-2xl [font-family:'Fahkwang',Helvetica] text-white/90 font-light"
                        style={{
                          textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {images[currentIndex].subtitle}
                      </motion.p>
                    )}
                    
                    {/* Animated Call-to-Action Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -40, scale: 1.2 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 1.2,
                        ease: "backOut",
                        type: "spring",
                        stiffness: 150,
                        damping: 25
                      }}
                      className="mt-8"
                    >
                      <button
                        onClick={() => navigate('/portfolio')}
                        className="group relative px-8 py-4 bg-primary/90 backdrop-blur-md text-white rounded-full font-medium [font-family:'Fahkwang',Helvetica] transition-all duration-500 hover:bg-primary hover:scale-110 hover:shadow-2xl overflow-hidden"
                      >
                        <span className="relative z-10">Explore Our Work</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {showControls && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </>
      )}

      {/* Play/Pause Control */}
      {autoPlay && (
        <button
          onClick={togglePlayPause}
          className="absolute bottom-6 left-6 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
      )}

      {/* Slide Indicators */}
      {showIndicators && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3 bg-black/20 backdrop-blur-md rounded-full px-4 py-2">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary shadow-lg shadow-primary/50'
                  : 'bg-white/40 hover:bg-white/60 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-primary rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20 overflow-hidden">
          <motion.div
            key={currentIndex}
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary relative"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          >
            {/* Animated shine effect on progress bar */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            />
          </motion.div>
        </div>
      )}

      {/* Floating Elements for Visual Interest */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {/* Animated particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: i % 3 === 0 ? 'rgba(117, 191, 68, 0.3)' : i % 3 === 1 ? 'rgba(238, 84, 40, 0.3)' : 'rgba(255, 255, 255, 0.2)',
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [1, 2, 1],
              rotate: [0, 360, 720],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Enhanced Geometric shapes with complex animations */}
        <motion.div 
          className="absolute top-20 right-20 w-16 h-16 border-2 border-white/15 rounded-lg"
          animate={{ 
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
            borderColor: ['rgba(255,255,255,0.15)', 'rgba(117,191,68,0.3)', 'rgba(238,84,40,0.3)', 'rgba(255,255,255,0.15)']
          }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-32 left-16 w-12 h-12 border border-white/20 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
            borderWidth: ['1px', '3px', '1px']
          }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/4 w-8 h-8 bg-primary/20 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.3, 1],
            backgroundColor: ['rgba(117,191,68,0.2)', 'rgba(238,84,40,0.3)', 'rgba(117,191,68,0.2)']
          }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 2 }}
        />
        
        {/* Floating orbs with complex paths */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-4 h-4 rounded-full"
            style={{
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(117,191,68,0.4)' : 'rgba(238,84,40,0.4)'} 0%, transparent 70%)`,
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 60, 0],
              scale: [1, 1.5, 0.8, 1],
              opacity: [0.4, 0.8, 0.3, 0.4],
            }}
            transition={{
              duration: 15 + i * 2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <motion.div 
        className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm [font-family:'Fahkwang',Helvetica] border border-white/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <motion.span
          key={currentIndex}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentIndex + 1} / {images.length}
        </motion.span>
      </motion.div>
    </div>
  );
};