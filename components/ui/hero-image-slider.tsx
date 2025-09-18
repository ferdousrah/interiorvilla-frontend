'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  transitionEffect?: 'slide' | 'fade' | 'zoom' | 'flip' | 'auto';
}

export const HeroImageSlider: React.FC<HeroImageSliderProps> = ({
  className = '',
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  transitionEffect = 'slide',
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const images: SlideImage[] = [
    {
      id: 1,
      src: '/slide/slide1.jpg',
      alt: 'Modern Living Room Design',
      title: 'Transform Your Space',
      subtitle: 'Premium Interior Design Services',
    },
    {
      id: 2,
      src: '/slide/slide2.jpg',
      alt: 'Elegant Residential Interior',
      title: 'Residential Excellence',
      subtitle: 'Creating Beautiful Homes',
    },
    {
      id: 3,
      src: '/slide/slide3.jpg',
      alt: 'Professional Office Design',
      title: 'Commercial Spaces',
      subtitle: 'Inspiring Work Environments',
    },
  ];

  if (!images || images.length === 0) {
    return null;
  }

  const safeCurrentIndex = currentIndex % images.length;
  const currentImage = images[safeCurrentIndex];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, autoPlayInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, autoPlayInterval, images.length]);

  const goToSlide = (index: number) => {
    setDirection(index > safeCurrentIndex ? 1 : -1);
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

  // Animation variants for different effects
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.2,
      rotateY: direction > 0 ? 15 : -15,
      rotateX: 5,
      filter: 'blur(20px) brightness(0.7) saturate(1.3)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      filter: 'blur(0px) brightness(1) saturate(1)',
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 15 : -15,
      rotateX: -5,
      filter: 'blur(15px) brightness(1.2) saturate(0.8)',
    }),
  };

  const fadeVariants = {
    enter: () => ({
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: () => ({
      opacity: 0,
      scale: 1.05,
    }),
  };

  const zoomVariants = {
    enter: () => ({
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      opacity: 1,
      scale: 1,
    }),
    exit: () => ({
      opacity: 0,
      scale: 1.2,
    }),
  };

  const flipVariants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
    }),
  };

  // Choose or cycle effects
  let currentVariants;
  if (transitionEffect === 'auto') {
    const effects = [slideVariants, fadeVariants, zoomVariants, flipVariants];
    currentVariants = effects[safeCurrentIndex % effects.length];
  } else {
    const map: Record<string, any> = {
      slide: slideVariants,
      fade: fadeVariants,
      zoom: zoomVariants,
      flip: flipVariants,
    };
    currentVariants = map[transitionEffect] || slideVariants;
  }

  // Overlay animations
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
    }),
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
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={safeCurrentIndex}
            custom={direction}
            variants={currentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 200, damping: 25 },
              opacity: { duration: 0.8, ease: 'easeInOut' },
              scale: { duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] },
              rotateY: { duration: 0.9, ease: 'easeOut' },
              rotateX: { duration: 0.7, ease: 'easeInOut' },
              filter: { duration: 0.6, ease: 'easeOut' },
            }}
            className="absolute inset-0 w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px',
            }}
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className="w-full h-full object-cover will-change-transform"
              style={{
                imageRendering: 'auto',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            />

            {/* Gradient overlay */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                background: `linear-gradient(
                  ${45 + safeCurrentIndex * 15}deg,
                  rgba(0, 0, 0, 0.7) 0%,
                  rgba(0, 0, 0, 0.4) 30%,
                  rgba(0, 0, 0, 0.2) 60%,
                  transparent 100%
                )`,
              }}
            />

            {/* Animated light rays */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 0.1, rotate: 10 }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
              style={{
                background: `conic-gradient(
                  from ${safeCurrentIndex * 60}deg at 70% 30%,
                  transparent 0deg,
                  rgba(255, 255, 255, 0.1) 45deg,
                  transparent 90deg,
                  rgba(255, 255, 255, 0.05) 135deg,
                  transparent 180deg
                )`,
              }}
            />

            {/* Text & CTA (without nested AnimatePresence) */}
            <motion.div
              key={`text-${safeCurrentIndex}`}
              custom={direction}
              variants={overlayVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 1.0,
                delay: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                staggerChildren: 0.1,
              }}
              className="absolute inset-0 flex items-center justify-start"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-left text-white max-w-2xl">
                  {currentImage.title && (
                    <motion.h1
                      initial={{ opacity: 0, x: -80, y: 30, rotateX: -15, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, y: 0, rotateX: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 80, y: -30, rotateX: 15, scale: 1.1 }}
                      transition={{
                        duration: 1.2,
                        delay: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        type: 'spring',
                        stiffness: 100,
                        damping: 15,
                      }}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold [font-family:'Fahkwang',Helvetica] mb-4 leading-tight"
                      style={{
                        textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {currentImage.title}
                    </motion.h1>
                  )}

                  {currentImage.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, x: -60, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 60, y: -20, scale: 1.05 }}
                      transition={{
                        duration: 1.0,
                        delay: 0.9,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        type: 'spring',
                        stiffness: 120,
                        damping: 20,
                      }}
                      className="text-lg sm:text-xl md:text-2xl [font-family:'Fahkwang',Helvetica] text-white/90 font-light"
                      style={{
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {currentImage.subtitle}
                    </motion.p>
                  )}

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 1.2 }}
                    transition={{
                      duration: 0.8,
                      delay: 1.2,
                      ease: 'backOut',
                      type: 'spring',
                      stiffness: 150,
                      damping: 25,
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
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
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
                index === safeCurrentIndex
                  ? 'bg-primary shadow-lg shadow-primary/50'
                  : 'bg-white/40 hover:bg-white/60 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === safeCurrentIndex && (
                <motion.div
                  className="absolute inset-0 bg-primary rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
            key={safeCurrentIndex}
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary relative"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            />
          </motion.div>
        </div>
      )}

      {/* Decorative elements omitted for brevity */}
    </div>
  );
};
