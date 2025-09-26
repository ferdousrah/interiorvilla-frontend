'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface SlideImage {
  id: number;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  fallbackSrc: string;
}

interface HeroImageSliderProps {
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  transitionEffect?: 'slide' | 'fade' | 'zoom' | 'flip' | 'auto';
}

const CMS_BASE_URL = 'https://interiorvillabd.com';

export const HeroImageSlider: React.FC<HeroImageSliderProps> = ({
  className = '',
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  transitionEffect = 'slide',
}) => {
  const [images, setImages] = useState<SlideImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<number | null>(null);

  /* -------------------- Fetch from CMS -------------------- */
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${CMS_BASE_URL}/api/slider?sort=slider.position:asc`);
        const data = await res.json();

        const mappedSlides: SlideImage[] = data.docs.map((item: any) => {
          const rawUrl = item.slider.image?.url || '';
          const fullUrl = `${CMS_BASE_URL}${rawUrl}`;

          // Replace extension with .webp (keep ?v=)
          const webpUrl = fullUrl.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');

          return {
            id: item.id,
            src: webpUrl || fullUrl,
            fallbackSrc: fullUrl,
            alt: item.slider.image?.alt || item.slider.title || 'Slide',
            title: item.slider.title,
            subtitle: item.slider.subtitle,
          };
        });

        setImages(mappedSlides);
      } catch (err) {
        console.error('Failed to load slides:', err);
      }
    };

    fetchSlides();
  }, []);

  /* -------------------- Autoplay -------------------- */
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;
    intervalRef.current = window.setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
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

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  /* -------------------- Variants -------------------- */
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.2,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
    }),
  };

  const fadeVariants = {
    enter: () => ({ opacity: 0, scale: 0.95 }),
    center: { opacity: 1, scale: 1 },
    exit: () => ({ opacity: 0, scale: 1.05 }),
  };

  const zoomVariants = {
    enter: () => ({ opacity: 0, scale: 0.8 }),
    center: { opacity: 1, scale: 1 },
    exit: () => ({ opacity: 0, scale: 1.2 }),
  };

  const flipVariants = {
    enter: (direction: number) => ({ rotateY: direction > 0 ? -90 : 90, opacity: 0 }),
    center: { rotateY: 0, opacity: 1 },
    exit: (direction: number) => ({ rotateY: direction > 0 ? 90 : -90, opacity: 0 }),
  };

  let currentVariants;
  if (transitionEffect === 'auto') {
    const effects = [slideVariants, fadeVariants, zoomVariants, flipVariants];
    currentVariants = effects[currentIndex % effects.length];
  } else {
    const map: Record<string, any> = {
      slide: slideVariants,
      fade: fadeVariants,
      zoom: zoomVariants,
      flip: flipVariants,
    };
    currentVariants = map[transitionEffect] || slideVariants;
  }

  /* -------------------- Render -------------------- */

  if (images.length === 0) {
    // Skeleton shimmer
    return (
      <div className={`relative w-full h-[80vh] overflow-hidden bg-gray-900 ${className}`}>
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={currentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Main image */}
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              onError={(e) => {
                (e.target as HTMLImageElement).src = currentImage.fallbackSrc;
              }}
              className="w-full h-full object-cover"
            />

            {/* 🔥 Gradient shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

            {/* 🔥 Animated light rays */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 0.12, rotate: 10 }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                background: `conic-gradient(
                  from ${currentIndex * 60}deg at 70% 30%,
                  transparent 0deg,
                  rgba(255, 255, 255, 0.15) 45deg,
                  transparent 90deg,
                  rgba(255, 255, 255, 0.08) 135deg,
                  transparent 180deg
                )`,
              }}
            />

            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center justify-start">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-left text-white max-w-4xl">
                  {currentImage.title && (
                    <motion.h1
                      key={`title-${currentIndex}`}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold [font-family:'Fahkwang',Helvetica] mb-4 leading-tight flex flex-wrap"
                      style={{ textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: { staggerChildren: 0.04, delayChildren: 0.2 },
                        },
                        exit: {
                          transition: { staggerChildren: 0.03, staggerDirection: -1 },
                        },
                      }}
                    >
                      {currentImage.title.split('').map((char, i) => (
                        <motion.span
                          key={i}
                          variants={{
                            hidden: { opacity: 0, y: 30, rotateX: -90 },
                            visible: { opacity: 1, y: 0, rotateX: 0 },
                            exit: { opacity: 0, y: -20, rotateX: 90 },
                          }}
                          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="inline-block"
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                      ))}
                    </motion.h1>
                  )}

                  {currentImage.subtitle && (
                    <motion.p
                      key={`subtitle-${currentIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.6, // after title
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="text-lg sm:text-xl md:text-2xl [font-family:'Fahkwang',Helvetica] text-white/90 font-light"
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                    >
                      {currentImage.subtitle}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {showControls && (
        <>
          <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* Play/Pause */}
      {autoPlay && (
        <button
          onClick={togglePlayPause}
          className="absolute bottom-6 left-6 z-20 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? 'bg-primary' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
