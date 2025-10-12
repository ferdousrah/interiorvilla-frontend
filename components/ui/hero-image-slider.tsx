'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { PerformanceImage } from './performance-image';
import SplitType from 'split-type';
import gsap from 'gsap';
import './hero-slider.css';

interface SlideImage {
  id: number;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  blurPlaceholder?: string;
  fallbackSrc: string;
}

interface HeroImageSliderProps {
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  transitionEffect?: 'fade' | 'zoom' | 'slide' | 'flip' | 'auto';
  imageSize?: 'small' | 'medium' | 'large' | 'full';
}

/** Rewrites CMS URLs to public domain */
function rewriteToPublicURL(url: string): string {
  if (!url) return '';
  return url.replace('https://cms.interiorvillabd.com', 'https://interiorvillabd.com');
}


const CMS_BASE_URL = 'https://interiorvillabd.com';

const FALLBACK_FIRST_SLIDE: SlideImage = {
  id: 0,
  src: 'https://interiorvillabd.com/api/media/file/H-1-1.webp',
  fallbackSrc: 'https://interiorvillabd.com/api/media/file/H-1-1.jpg',
  alt: 'Luxury Interior Design',
  title: 'Luxury Interior Design',
  subtitle: 'Transform your space with expert design',
};

export const HeroImageSlider: React.FC<HeroImageSliderProps> = ({
  className = '',
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  transitionEffect = 'fade',
  imageSize = 'large',
}) => {
  const [slides, setSlides] = useState<SlideImage[]>([FALLBACK_FIRST_SLIDE]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isDarkImage, setIsDarkImage] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const intervalRef = useRef<number | null>(null);

  /* ---------- Fetch slides ---------- */
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${CMS_BASE_URL}/api/slider?sort=slider.position:asc`);
        const data = await res.json();

        const mapped: SlideImage[] = data.docs.map((item: any) => {
          const img = item.slider?.image;
          const rawUrl = img?.sizes?.large?.url || img?.url || '';
          const fullUrl = rewriteToPublicURL(rawUrl);
          const webpUrl = fullUrl.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');

          return {
            id: item.id,
            src: webpUrl || fullUrl,
            fallbackSrc: fullUrl,
            alt: img?.alt || item.slider.title || 'Slide',
            title: item.slider.title,
            subtitle: item.slider.subtitle,
            blurPlaceholder: img?.sizes?.blur?.url ? rewriteToPublicURL(img.sizes.blur.url) : undefined,
          };
        });

        if (mapped.length > 0) {
          setSlides(mapped);
          setIsLoaded(true);
          setIsPlaying(autoPlay);
        }
      } catch (err) {
        console.error('Failed to load slides:', err);
        setIsLoaded(true);
      }
    };

    fetchSlides();
  }, [autoPlay]);

  /* ---------- Preload first hero image ---------- */
  useEffect(() => {
    if (slides.length > 0) {
      const first = slides[0];

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = first.src;
      link.fetchPriority = 'high';
      link.type = 'image/webp';
      document.head.appendChild(link);

      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = CMS_BASE_URL;
      preconnect.crossOrigin = '';
      document.head.appendChild(preconnect);

      const img = new Image();
      img.src = first.src;
      img.decode?.().catch(() => {});
    }
  }, [slides]);

  /* ---------- Autoplay ---------- */
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;
    intervalRef.current = window.setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [isPlaying, autoPlayInterval, slides.length]);

  /* ---------- Predictive preload ---------- */
  useEffect(() => {
    if (slides.length === 0) return;
    const nextIndex = (currentIndex + 1) % slides.length;
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    [nextIndex, prevIndex].forEach((i) => {
      const img = new Image();
      img.src = slides[i].src;
      img.decode?.().catch(() => {});
    });
  }, [currentIndex, slides]);

  /* ---------- Image brightness detector ---------- */
  const analyzeBrightness = useCallback((src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = (canvas.width = 10);
      const h = (canvas.height = 10);
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      const brightness = total / (data.length / 4);
      setIsDarkImage(brightness < 130);
    };
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      analyzeBrightness(slides[currentIndex].src);
    }
  }, [currentIndex, slides, analyzeBrightness]);

  /* ---------- Animate text with GSAP (depth reveal) ---------- */
  useEffect(() => {
    if (!titleRef.current || !isLoaded) return;
    const split = new SplitType(titleRef.current, { types: 'chars' });
    gsap.fromTo(
      split.chars,
      { y: 50, opacity: 0, filter: 'blur(6px)', rotateX: 25 },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        rotateX: 0,
        duration: 1,
        stagger: 0.035,
        ease: 'power3.out',
      }
    );
    return () => split.revert();
  }, [currentIndex, isLoaded]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const togglePlayPause = () => setIsPlaying((p) => !p);

  const variants = {
    enter: (dir: number) => ({
      x: transitionEffect === 'slide' ? (dir > 0 ? '100%' : '-100%') : 0,
      opacity: 0,
      scale: transitionEffect === 'zoom' ? 1.2 : 1,
    }),
    center: { x: 0, opacity: 1, scale: 1, zIndex: 1 },
    exit: (dir: number) => ({
      x: transitionEffect === 'slide' ? (dir < 0 ? '100%' : '-100%') : 0,
      opacity: 0,
      scale: transitionEffect === 'zoom' ? 0.95 : 1,
      zIndex: 0,
    }),
  };

  const heightMap = {
    small: 'h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]',
    medium: 'h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]',
    large: 'h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px]',
    full: 'h-screen',
  };

  if (slides.length === 0) {
    return <div className={`relative w-full ${heightMap[imageSize]} bg-gray-900 animate-pulse`} />;
  }

  const slide = slides[currentIndex];

  return (
    <div
      role="region"
      aria-label="Hero image slider"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      }}
      className={`relative w-full overflow-hidden ${heightMap[imageSize]} ${className}`}
    >
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial={isLoaded ? "enter" : "center"}
          animate="center"
          exit="exit"
          transition={{ duration: isLoaded ? 1 : 0, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <PerformanceImage
            src={slide.src}
            alt={slide.alt}
            priority={currentIndex === 0}
            fetchpriority={currentIndex === 0 ? 'high' : 'low'}
            blurDataURL={slide.blurPlaceholder}
            placeholder="blur"
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            fallbackSrc={slide.fallbackSrc}
            width={1920}
            height={900}
            className="w-full h-full object-cover object-center"
          />

          {/* Dynamic overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isDarkImage ? 'dark' : 'light'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className={`absolute inset-0 ${
                isDarkImage ? 'hero-slide-overlay--dark' : 'hero-slide-overlay--light'
              }`}
            />
          </AnimatePresence>

          {/* Text content */}
          <div className="absolute inset-0 flex items-center justify-start px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="text-white max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
              {slide.title && (
                <h1
                  ref={titleRef}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight hero-slide-title"
                >
                  {slide.title}
                </h1>
              )}
              {slide.subtitle && (
                <motion.p
                  ref={subtitleRef}
                  key={`subtitle-${slide.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: 'power2.out' }}
                  className="text-sm sm:text-base md:text-lg lg:text-xl hero-slide-subtitle text-white/90"
                >
                  {slide.subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {showControls && (
        <>
          <button
            onClick={goToPrevious}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-white p-1.5 sm:p-2 rounded-full hero-slide-control focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" aria-hidden="true" />
          </button>
          <button
            onClick={goToNext}
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-white p-1.5 sm:p-2 rounded-full hero-slide-control focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Play / Pause */}
      {autoPlay && (
        <button
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hero-slide-control text-white"
        >
          {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}: ${s.title || 'Untitled slide'}`}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                i === currentIndex ? 'bg-primary scale-125' : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
