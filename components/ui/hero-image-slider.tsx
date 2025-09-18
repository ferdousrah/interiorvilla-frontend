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
      scale: 1.1,
      filter: 'blur(10px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      filter: 'blur(5px)',
    }),
  };

  const overlayVariants = {
    enter: {
      opacity: 0,
      y: 50,
    },
    center: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -50,
    },
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
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.6 },
              scale: { duration: 0.8 },
              filter: { duration: 0.4 },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="w-full h-full object-cover"
              style={{
                imageRendering: 'high-quality',
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            
            {/* Animated Text Overlay */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentIndex}`}
                variants={overlayVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: "easeOut"
                }}
                className="absolute inset-0 flex items-center justify-start"
              >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                  <div className="text-left text-white max-w-2xl">
                    {images[currentIndex].title && (
                      <motion.h1 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold [font-family:'Fahkwang',Helvetica] mb-4 leading-tight"
                        style={{
                          textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {images[currentIndex].title}
                      </motion.h1>
                    )}
                    
                    {images[currentIndex].subtitle && (
                      <motion.p 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="text-lg sm:text-xl md:text-2xl [font-family:'Fahkwang',Helvetica] text-white/90 font-light"
                        style={{
                          textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {images[currentIndex].subtitle}
                      </motion.p>
                    )}
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/40 hover:bg-white/60 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
          <motion.div
            key={currentIndex}
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {/* Floating Elements for Visual Interest */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
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
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 border-2 border-white/10 rounded-lg rotate-45 animate-pulse" />
        <div className="absolute bottom-32 left-16 w-12 h-12 border border-white/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-primary/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 z-20 bg-black/30 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm [font-family:'Fahkwang',Helvetica]">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};