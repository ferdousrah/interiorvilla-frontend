// components/screens/Home/sections/OurFeaturedWorksSection/OurFeaturedWorksSection.tsx
'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ArrowRight } from "lucide-react";
import { PerformanceImage } from "../../../../ui/performance-image";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface Project {
  id: string | number;
  category: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  blurPlaceholder?: string;
  color: string;
  accent: string;
}

interface ProjectsApiResponse {
  docs: any[];
  totalDocs?: number;
}

const CMS_ORIGIN = "https://interiorvillabd.com";

// Build absolute URLs when API returns "/api/media/file/..."
const absolutize = (u?: string | null): string => {
  if (!u) return '/placeholder.webp';
  if (/^https?:\/\//i.test(u)) return u;
  return new URL(u, CMS_ORIGIN).href;
};

/* ---------- Size + Alt helpers ---------- */
type MediaSize = { url?: string | null };
type Media = {
  url?: string | null;
  alt?: string | null;
  sizes?: {
    thumbnail?: MediaSize;
    square?: MediaSize;
    small?: MediaSize;
    medium?: MediaSize;
    large?: MediaSize;
    xlarge?: MediaSize;
    og?: MediaSize;
    [k: string]: MediaSize | undefined;
  };
};

/** 
 * Choose the best WebP variant automatically.
 * Prefers small/medium sizes that Payload already generated.
 */
const getOptimizedImageUrl = (img?: Media | null): string => {
  if (!img) return "/placeholder.webp";

  // Prefer medium, then small, then original
  const url =
    img.sizes?.square?.url ||
    img.sizes?.small?.url ||
    img.url;

  if (!url) return "/placeholder.webp";

  const abs = absolutize(url);

  // Always prefer .webp variant for Payload images
  if (abs.endsWith(".webp")) return abs;

  return abs.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, ".webp$2");
};

const getBlurPlaceholderUrl = (img?: any | null): string | undefined => {
  const blurUrl = img?.sizes?.blur?.url;
  return blurUrl ? absolutize(blurUrl) : undefined;
};

const getImageAlt = (img?: any | null, fallback?: string): string => {
  const altText = img?.alt?.trim?.();
  if (altText && altText.length > 0) return altText;
  return fallback || 'Project image';
};

/* ---------- Image Preloader Utility ---------- */
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve();
      return;
    }
    
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = 'high';
    
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve anyway to not block
    img.src = src;
  });
};

/* ---------- Boundary Error Handler ---------- */
class Boundary extends React.Component<{ children: React.ReactNode }, { err?: string }> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }
  static getDerivedStateFromError(e: any) {
    return { err: e?.message || 'Render error' };
  }
  componentDidCatch(e: any) {
    console.error('Render error:', e);
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 16 }}>
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <b>Something went wrong:</b> {this.state.err}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const OurFeaturedWorksSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // ============================================
  // OPTIMIZATION 1: Fetch + Preload Immediately
  // ============================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    
    (async () => {
      try {
        // Start fetching immediately
        const fetchPromise = fetch(
          `${CMS_ORIGIN}/api/projects?where[featuredOnHome][equals]=true&sort=position`,
          { 
            cache: "no-store",
            // Add priority hint for faster fetch
            priority: 'high' as any
          }
        );

        const res = await fetchPromise;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data: ProjectsApiResponse = await res.json();

        const mapped: Project[] = (data.docs || []).map((doc: any, i: number) => {
          const media = typeof doc?.featuredImage === 'object' ? doc.featuredImage : null;

          return {
            id: doc.id ?? i + 1,
            category: doc?.category?.title || 'Project',
            title: doc.title || `Project ${i + 1}`,
            slug: doc.slug || '',
            description: doc.shortDescription || '',
            image: getOptimizedImageUrl(media),
            imageAlt: getImageAlt(media, doc.title),
            blurPlaceholder: getBlurPlaceholderUrl(media),
            color: doc.color || '#6db53e',
            accent: doc.accent || '#6db53e',
          };
        });

        if (cancelled) return;
        
        // Set projects immediately for instant render with blur placeholders
        setProjects(mapped);

        // ============================================
        // OPTIMIZATION 2: Aggressive Image Preloading
        // ============================================
        // Preload first 3 images immediately (visible cards)
        const priorityImages = mapped.slice(0, 3).map(p => p.image);
        const priorityPreloads = priorityImages.map(src => preloadImage(src));
        
        // Preload remaining images in background
        const remainingImages = mapped.slice(3).map(p => p.image);
        const remainingPreloads = remainingImages.map(src => preloadImage(src));

        // Wait for priority images, then mark as loaded
        await Promise.all(priorityPreloads);
        if (!cancelled) {
          setImagesPreloaded(true);
          
          // Continue loading remaining in background
          Promise.all(remainingPreloads).catch(err => 
            console.warn('Background image preload failed:', err)
          );
        }

      } catch (e) {
        console.error("Failed to fetch projects:", e);
        if (!cancelled) {
          setProjects([]);
          setImagesPreloaded(true);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ============================================
  // OPTIMIZATION 3: Debounced Resize Handler
  // ============================================
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ============================================
  // OPTIMIZATION 4: Memoized Card Sizes
  // ============================================
  const cardSizes = useMemo(() => {
    return projects.map((_, index) => ({
      maxWidth:
        windowWidth < 640
          ? "100%"
          : windowWidth < 1024
          ? "600px"
          : `${1200 + index * 40}px`,
      height:
        windowWidth < 640 ? "70vh" : windowWidth < 1024 ? "60vh" : "80vh",
      minHeight: windowWidth < 640 ? "500px" : "600px",
    }));
  }, [projects.length, windowWidth]);

  // ============================================
  // GSAP Scroll Animation
  // ============================================
  useEffect(() => {
    if (!sectionRef.current || !containerRef.current || projects.length === 0) return;
    
    let ctx: gsap.Context | undefined;
    let lastIndex = -1;
    
    try {
      ctx = gsap.context(() => {
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        if (cards.length === 0) return;

        cards.forEach((card, index) => {
          gsap.set(card, {
            x: 0,
            y: index === 0 ? 0 : `${80 + index * 10}vh`,
            scale: 1,
            opacity: 1,
            zIndex: 100 + index,
            transformOrigin: "center center",
            willChange: "transform",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          });
        });

        ScrollTrigger.create({
          trigger: sectionRef.current!,
          start: "top top",
          end: () => `+=${projects.length * 400}vh`,
          pin: true,
          pinSpacing: true,
          scrub: 8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
          onUpdate: (self) => {
            const progress = self.progress;
            const total = projects.length;
            const activeIndex = Math.min(Math.floor(progress * total), total - 1);
            
            // Only update state when index changes
            if (activeIndex !== lastIndex) {
              lastIndex = activeIndex;
              setCurrentIndex(activeIndex);
            }

            cards.forEach((card, index) => {
              gsap.set(card, { zIndex: 100 + index });
              const segment = 1 / total;
              const cardStart = index * segment;
              const cardEnd = (index + 1) * segment;

              let moveProgress = 0;
              if (progress >= cardStart && progress <= cardEnd) {
                moveProgress = (progress - cardStart) / segment;
              } else if (progress > cardEnd) {
                moveProgress = 1;
              }

              const eased =
                moveProgress < 0.5
                  ? 2 * moveProgress * moveProgress
                  : 1 - Math.pow(-2 * moveProgress + 2, 3) / 2;

              const stackGap = 2;
              const finalY = index * stackGap;
              const startY = index === 0 ? 0 : 100;
              const yPos = index === 0 && progress <= 1 / total ? 0 : startY + eased * (finalY - startY);

              gsap.set(card, { y: `${yPos}vh`, scale: 0.92 + eased * 0.08, force3D: true });
            });
          }
        });

        // Refresh after images load
        if (imagesPreloaded) {
          setTimeout(() => ScrollTrigger.refresh(), 100);
        }
      }, sectionRef);
    } catch (err) {
      console.error("GSAP init failed:", err);
    }
    
    return () => ctx?.revert();
  }, [projects, imagesPreloaded]);

  // ============================================
  // Navigation Handler
  // ============================================
  const navigate = useNavigate();
  const handleViewProject = useCallback((slug: string) => {
    if (!slug) return;
    navigate(`/portfolio/project-details/${slug}`);
  }, [navigate]);

  const scrollToCard = useCallback((index: number) => {
    const sectionScrollHeight = (projects.length * 400 * window.innerHeight) / 100;
    const targetScroll =
      (sectionRef.current?.offsetTop ?? 0) + (index / projects.length) * sectionScrollHeight;
    try {
      gsap.to(window, { scrollTo: { y: targetScroll }, duration: 2.0, ease: "power2.inOut" });
    } catch {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [projects.length]);

  return (
    <Boundary>
      <section
        ref={sectionRef}
        className="w-full min-h-screen overflow-hidden relative bg-white"
        style={{ zIndex: 2 }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-screen flex items-center justify-center pt-0"
        >
          {projects.length === 0 && (
            <div className="text-center text-gray-600">Loading projects…</div>
          )}

          {projects.map((project, index) => {
            const sizes = cardSizes[index] || {};
            
            return (
              <div
                key={project.id}
                ref={(el) => (cardRefs.current[index] = el)}
                className="absolute flex items-center justify-center p-1 sm:p-2 md:p-4 lg:p-6"
                style={{
                  zIndex: 100 + index,
                  willChange: "transform",
                  width: "100%",
                  height: "100%",
                  top: 0,
                  left: 0,
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${project.title} project details`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleViewProject(project.slug);
                    }
                  }}
                  onClick={() => handleViewProject(project.slug)}
                  className="w-full rounded-2xl sm:rounded-3xl overflow-hidden relative mx-auto cursor-pointer"
                  style={{
                    width: "90%",
                    maxWidth: sizes.maxWidth,
                    height: sizes.height,
                    minHeight: sizes.minHeight,
                    background: project.color,
                    transform: "translateZ(0)",
                    willChange: "transform",
                  }}
                >
                  <div className="flex flex-col lg:flex-row h-full">
                    <div className="w-full lg:w-2/5 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center relative z-10 flex-shrink-0">
                      <div className="mb-3 md:mb-4">
                        <span
                          className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-green-800"
                          style={{ background: "rgba(255, 255, 255, 0.9)" }}
                        >
                          {project.category}
                        </span>
                      </div>

                      <h2
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight"
                        style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)" }}
                      >
                        {project.title}
                      </h2>

                      <p
                        className="text-sm sm:text-base md:text-base text-white mb-4 md:mb-6 leading-relaxed"
                        style={{ textShadow: "0 1px 6px rgba(255, 255, 255, 0.2)" }}
                      >
                        {project.description}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProject(project.slug);
                        }}
                        className="group inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl w-fit relative overflow-hidden"
                        style={{ background: "rgba(255, 255, 255, 0.2)" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                        <span className="mr-2 text-xs sm:text-sm">View Project</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>

                      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:left-8 lg:left-10 lg:block hidden">
                        <div className="text-4xl sm:text-6xl font-bold opacity-20 text-white">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-3/5 relative overflow-hidden flex-1 pointer-events-none">
                      <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 lg:p-10">
                        <div className="w-full h-full rounded-1xl sm:rounded-2xl overflow-hidden">
                          {/* ============================================
                              OPTIMIZATION 5: Enhanced Image Component
                              - First image: eager loading + high priority
                              - Next 2: eager loading
                              - Rest: lazy loading
                              ============================================ */}
                          <PerformanceImage
                            src={project.image}
                            alt={project.imageAlt}
                            className="w-full h-full object-cover"
                            blurDataURL={project.blurPlaceholder}
                            loading={index < 3 ? 'eager' : 'lazy'}
                            priority={index === 0}
                            fetchPriority={index === 0 ? 'high' : index < 3 ? 'high' : 'auto'}
                            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 600px, 900px"
                            quality={index < 3 ? 85 : 70}
                            placeholder="blur"
                            decoding={index < 3 ? 'sync' : 'async'}
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:hidden">
                        <div className="text-2xl sm:text-3xl font-bold opacity-30 text-white">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="w-full py-16 md:py-20 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 text-center relative z-5">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                navigate("/portfolio");
              }}
              className="group flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-white text-sm sm:text-base font-semibold bg-black hover:bg-gray-800 transition-all duration-500 hover:scale-105 border border-gray-700 relative z-10 mx-auto"
              style={{ boxShadow: "0 15px 50px rgba(0,0,0,0.3), 0 0 30px rgba(0,0,0,0.2)", minWidth: "180px" }}
            >
              <span className="[font-family:'Fahkwang',Helvetica] font-medium">Explore All Projects</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </div>
        </div>
      </section>
    </Boundary>
  );
};