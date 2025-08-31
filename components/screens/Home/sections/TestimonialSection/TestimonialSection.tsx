import { ArrowLeft, ArrowRight, PlayIcon } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Card, CardContent } from "../../../../ui/card";
import useEmblaCarousel from "embla-carousel-react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import "./testimonial.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ----------------------------------------
   Tiny hook: wait until fonts are loaded
----------------------------------------- */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // @ts-ignore
        const fonts = (document as any).fonts;
        if (fonts?.ready) await fonts.ready;
        else await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return ready;
}

/* -------- CMS image helpers: absolute URLs + size picking -------- */
const CMS_ORIGIN = "https://interiorvillabd.com"; // change to your CMS origin if needed
const absolutize = (u: string) =>
  /^https?:\/\//i.test(u) ? u : new URL(u, CMS_ORIGIN).href;

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

// prefer best size, fallback to original
const getBestImageUrl = (m?: Media | string | null): string => {
  const placeholder = "/placeholder.webp";
  if (!m) return placeholder;

  if (typeof m === "string") return absolutize(m);

  const order = ["large", "xlarge", "medium", "small", "og", "square", "thumbnail", "card"];
  for (const k of order) {
    const u = m?.sizes?.[k]?.url;
    if (u) return absolutize(u);
  }
  if (m?.url) return absolutize(m.url);
  return placeholder;
};

const getImageAlt = (m?: Media | string | null, fallback = "Client story") => {
  if (m && typeof m !== "string") {
    const a = (m.alt || "").trim();
    if (a) return a;
  }
  return fallback;
};

/* -------- YouTube helpers -------- */
const isYouTubeUrl = (u: string) =>
  /(?:youtu\.be\/|youtube\.com\/(?:watch|embed|shorts))/i.test(u);

const getYouTubeId = (u: string): string | null => {
  try {
    const url = new URL(u);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null;
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null;
    const v = url.searchParams.get("v");
    if (v) return v;
  } catch {}
  return null;
};

// replace your toYouTubeEmbed with this:
const toYouTubeEmbed = (u: string) => {
  const id = getYouTubeId(u);
  if (!id) return null;

  const base = `https://www.youtube.com/embed/${id}`;
  const qp = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    controls: "1",
    modestbranding: "1",
    playsinline: "1",
    mute: "0",
    start: "0"
  });

  // Add JS API for better control
  qp.set("enablejsapi", "1");
  if (typeof window !== "undefined") {
    qp.set("origin", window.location.origin);
  }

  return `${base}?${qp.toString()}`;
};


type Testimonial = {
  id: number;
  title: string;
  description: string;
  image: string;
  alt: string;
  video: string;
};

export const TestimonialSection = (): JSX.Element => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [items, setItems] = useState<Testimonial[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 3 },
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(max-width: 767px)": { slidesToScroll: 1 },
    },
  });

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const backgroundElementsRef = useRef<HTMLDivElement>(null);

  const fontsReady = useFontsReady();

  /* ----------------- Fetch testimonials from CMS ----------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://cms.interiorvillabd.com/api/testimonials", { 
          cache: "no-store",
          mode: "cors"
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const docs = Array.isArray(data?.docs) ? data.docs : Array.isArray(data) ? data : [];

        const mapped: Testimonial[] = docs
          .map((doc: any, i: number) => {
            const media: Media | string | null =
              doc?.thumbnail || doc?.image || doc?.coverImage || doc?.photo || null;

            const title = doc?.title || doc?.name || `Testimonial ${i + 1}`;
            return {
              id: Number(doc?.id ?? i + 1),
              title,
              description: doc?.shortDescription || doc?.description || "",
              image: getBestImageUrl(media),
              alt: getImageAlt(media, title),
              video:
                doc?.videoUrl ||
                doc?.video?.url ||
                (typeof doc?.video === "string" ? doc.video : "") ||
                "",
            };
          })
          .filter((t) => !!t.video);

        if (!cancelled) setItems(mapped);
      } catch (e) {
        console.error("Failed to fetch testimonials:", e);
        // Fallback to empty array to prevent UI breaking
        if (!cancelled) setItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ----------------- Fancybox bootstrap ----------------- */
  useEffect(() => {
    Fancybox.destroy();
    
    // Only bind if we have items
    if (items.length === 0) return;
    
    Fancybox.bind("[data-fancybox='testimonial-videos']", {
      animated: true,
      showClass: "fancybox-fadeIn",
      hideClass: "fancybox-fadeOut",
      dragToClose: false,
      Toolbar: { 
        display: { 
          left: [], 
          middle: [], 
          right: ["zoom", "slideshow", "thumbs", "download", "close"] 
        } 
      },
      Iframe: {
        preload: true,
        attr: {
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
          allowfullscreen: "true",
          referrerpolicy: "strict-origin-when-cross-origin",
          sandbox: "allow-same-origin allow-scripts allow-popups allow-presentation"
        }
      },
      on: {
        reveal: (fancybox, slide) => {
          console.log('Fancybox opened:', slide.src);
        },
        destroy: () => {
          console.log('Fancybox destroyed');
        }
      }
    });
    
    return () => {
      Fancybox.destroy();
    };
  }, [items.length]);

  /* ----------------- Hover heading animation (fonts gated) ----------------- */
  useLayoutEffect(() => {
    if (!fontsReady) {
      console.warn('SplitText called before fonts loaded');
      return;
    }
    if (!sectionRef.current || !headingRef.current || !headingWrapperRef.current) return;

    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = new SplitText(headingRef.current!, {
        type: "chars,words",
        charsClass: "char",
        wordsClass: "word",
      });

      const wrapper = headingWrapperRef.current!;
      const onMove = (e: MouseEvent) => {
        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        gsap.to(split!.chars, {
          duration: 0.5,
          y: (_, i) => (y - 0.5) * 15 * Math.sin((Number(i) + 1) * 0.5),
          x: (_, i) => (x - 0.5) * 15 * Math.cos((Number(i) + 1) * 0.5),
          rotationY: (x - 0.5) * 20,
          rotationX: (y - 0.5) * -20,
          ease: "power2.out",
          stagger: { amount: 0.3, from: "center" },
        });
      };
      const onLeave = () => {
        gsap.to(split!.chars, {
          duration: 1,
          y: 0, x: 0, rotationY: 0, rotationX: 0,
          ease: "elastic.out(1, 0.3)",
          stagger: { amount: 0.3, from: "center" },
        });
      };

      wrapper.addEventListener("mousemove", onMove);
      wrapper.addEventListener("mouseleave", onLeave);

      // return cleanup for DOM listeners inside context
      return () => {
        wrapper.removeEventListener("mousemove", onMove);
        wrapper.removeEventListener("mouseleave", onLeave);
      };
    }, sectionRef);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [fontsReady]);

  /* ----------------- Parallax & scroll anims (fonts + refs gated) ----------------- */
  useLayoutEffect(() => {
    if (!fontsReady) return;
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // heading entrance + slight parallax
      if (headingRef.current) {
        const st = new SplitText(headingRef.current, {
          type: "words,chars",
          charsClass: "char",
          wordsClass: "word",
        });
        gsap.set(st.chars, { opacity: 1, y: 0, rotationX: 0 });
        gsap.fromTo(
          st.chars,
          { opacity: 0.2, y: 30, scale: 0.9, rotationY: -15 },
          {
            opacity: 1, y: 0, scale: 1, rotationY: 0, duration: 1,
            stagger: { amount: 0.6, from: "start" },
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 90%",
              end: "top 60%",
              toggleActions: "play none none reverse",
            },
          }
        );
        gsap.to(headingRef.current, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      if (descriptionRef.current) {
        gsap.fromTo(
          descriptionRef.current,
          { opacity: 0, y: 40, filter: "blur(8px)" },
          {
            opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power2.out",
            scrollTrigger: {
              trigger: descriptionRef.current, start: "top 85%", end: "top 65%",
              toggleActions: "play none none reverse",
            },
          }
        );
        gsap.to(descriptionRef.current, {
          yPercent: -5, ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current!, start: "top bottom", end: "bottom top", scrub: 0.5,
          },
        });
      }

      if (carouselContainerRef.current) {
        gsap.fromTo(
          carouselContainerRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "power3.out",
            scrollTrigger: {
              trigger: carouselContainerRef.current,
              start: "top 85%", end: "top 55%",
              toggleActions: "play none none reverse",
            },
          }
        );
        gsap.to(carouselContainerRef.current, {
          yPercent: -3, ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current!, start: "top bottom", end: "bottom top", scrub: 0.3,
          },
        });
      }

      if (navigationRef.current) {
        const navButtons = navigationRef.current.querySelectorAll("button");
        if (navButtons.length) {
          gsap.fromTo(
            navButtons,
            { opacity: 0, scale: 0.8, x: (i) => (i === 0 ? -30 : 30) },
            {
              opacity: 1, scale: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: carouselContainerRef.current!, start: "top 80%", end: "top 60%",
                toggleActions: "play none none reverse",
              },
            }
          );
          gsap.to(navButtons, {
            yPercent: -6, ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current!, start: "top bottom", end: "bottom top", scrub: 0.4,
            },
          });
        }
      }

      if (backgroundElementsRef.current) {
        gsap.to(backgroundElementsRef.current, {
          yPercent: -15, rotation: 90, ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current!, start: "top bottom", end: "bottom top", scrub: 1.2,
          },
        });
      }

      const cards = carouselContainerRef.current?.querySelectorAll<HTMLElement>("[data-card]");
      cards?.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 80, rotationX: -20, scale: 0.9 },
          {
            opacity: 1, y: 0, rotationX: 0, scale: 1, duration: 1.2, delay: index * 0.15, ease: "power3.out",
            scrollTrigger: {
              trigger: card, start: "top 90%", end: "top 70%", toggleActions: "play none none reverse",
            },
          }
        );
        gsap.to(card, {
          yPercent: -2 - index * 1.5, ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current!, start: "top bottom", end: "bottom top", scrub: 0.2 + index * 0.1,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [fontsReady, items.length]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const handleVideoClick = (
    e: React.MouseEvent,
    videoUrl: string,
    title: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!videoUrl) return;

    if (isYouTubeUrl(videoUrl)) {
      const youtubeId = getYouTubeId(videoUrl);
      if (!youtubeId) {
        console.error('Could not extract YouTube ID from:', videoUrl);
        return;
      }

      // Use Fancybox to show YouTube video
      const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
      
      Fancybox.show([{
        src: embedUrl,
        type: "iframe",
        caption: title
      }], {
        animated: true,
        showClass: "fancybox-fadeIn",
        hideClass: "fancybox-fadeOut",
        dragToClose: false,
        closeButton: "top",
        Toolbar: { 
          display: { 
            left: [], 
            middle: [], 
            right: ["zoom", "slideshow", "thumbs", "download", "close"] 
          } 
        },
        Iframe: {
          preload: true,
          css: {
            width: "100%",
            height: "100%"
          },
          attr: {
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
            allowfullscreen: "true",
            referrerpolicy: "strict-origin-when-cross-origin",
            frameborder: "0"
          }
        },
        on: {
          reveal: (fancybox, slide) => {
            console.log('YouTube video opened in Fancybox');
          }
        }
      });
    } else {
      // Handle non-YouTube videos
      const videoHtml = `
        <video 
          controls 
          autoplay 
          muted 
          style="width:100%;height:100%;max-width:1200px;max-height:675px;background:#000"
        >
          <source src="${videoUrl}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>`;
        
      Fancybox.show([{
        src: videoHtml,
        type: "html",
        caption: title
      }], {
        animated: true,
        showClass: "fancybox-fadeIn",
        hideClass: "fancybox-fadeOut",
        dragToClose: false,
        on: {
          reveal: (fancybox, slide) => {
            const video = slide.$content?.querySelector("video");
            if (video) {
              video.muted = false;
              video.play().catch(console.error);
            }
          }
        }
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="w-full flex items-start justify-center relative overflow-hidden bg-white pt-20 pb-16 md:pt-25 md:pb-20"
      style={{ transformStyle: "preserve-3d", perspective: "1000px", zIndex: 1 }}
    >
      {/* Background decorative elements */}
      <div
        ref={backgroundElementsRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ transformOrigin: "center center", backfaceVisibility: "hidden", transform: "translate3d(0,0,0)" }}
      >
        <div className="absolute top-20 left-10 w-8 h-8 bg-primary rounded-full opacity-8 animate-pulse" />
        <div className="absolute top-1/3 right-20 w-6 h-6 bg-secondary rounded-full opacity-12 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/4 w-10 h-10 bg-primary rounded-full opacity-6 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-secondary rounded-full opacity-10 animate-pulse" style={{ animationDelay: "3s" }} />
        <div className="absolute top-40 right-10 w-16 h-16 border-2 border-primary opacity-5 rotate-45" />
        <div className="absolute bottom-40 left-16 w-20 h-20 border border-secondary opacity-8 rounded-full" />
        <div className="absolute top-1/2 left-10 w-12 h-12 border-2 border-primary opacity-6" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10 w-full" style={{ maxWidth: "1219px" }}>
        {/* Section Header */}
        <div className="text-center mb-16">
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2
              ref={headingRef}
              className="[font-family:'Fahkwang',Helvetica] font-medium text-[40px] text-center tracking-[0] leading-[62px] mb-6 md:mb-2"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
            >
              <span className="text-[#0d1529]">Client </span>
              <span className="text-secondary">Stories</span>
            </h2>
          </div>

          <p
            ref={descriptionRef}
            className="text-lg text-[#626161] max-w-4xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica] will-change-transform px-8"
            style={{ transformOrigin: "center center", backfaceVisibility: "hidden", transform: "translate3d(0,0,0)" }}
          >
            We create spaces that inspire and reflect your unique lifestyle
          </p>
        </div>

        <div
          ref={carouselContainerRef}
          className="relative will-change-transform"
          style={{ transformOrigin: "center center", backfaceVisibility: "hidden", transform: "translate3d(0,0,0)" }}
        >
          <div ref={navigationRef}>
            <button
              onClick={scrollPrev}
              className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl cursor-pointer hover:bg-gray-50 transition-all duration-300 hover:scale-110 will-change-transform border-2 border-primary/20"
              style={{ transformOrigin: "center center", backfaceVisibility: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
            >
              <ArrowLeft className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </button>

            <button
              onClick={scrollNext}
              className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl cursor-pointer hover:bg-gray-50 transition-all duration-300 hover:scale-110 will-change-transform border-2 border-primary/20"
              style={{ transformOrigin: "center center", backfaceVisibility: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
            >
              <ArrowRight className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </button>
          </div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 md:gap-8">
              {items.map((t) => (
                <div
                  key={t.id}
                  data-card
                  className="relative flex-[0_0_280px] md:flex-[0_0_320px] lg:flex-[0_0_360px] transition-all duration-500 ease-in-out will-change-transform"
                  onMouseEnter={() => setHoveredCard(t.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    transform: hoveredCard === t.id ? "scale(1.05) translateY(-8px)" : "scale(1) translateY(0)",
                    zIndex: hoveredCard === t.id ? 10 : 1,
                    transformOrigin: "center center",
                    backfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <Card
                    className="group h-[400px] w-full rounded-2xl md:rounded-3xl overflow-hidden border-2 border-solid border-primary/30 relative cursor-pointer"
                    style={{
                      boxShadow:
                        hoveredCard === t.id
                          ? "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 30px rgba(117,191,68,0.3)"
                          : "0 8px 32px rgba(0,0,0,0.12)",
                      transformOrigin: "center center",
                      backfaceVisibility: "hidden",
                      transformStyle: "preserve-3d",
                    }}
                    onClick={(e) => handleVideoClick(e, t.video, t.title)}
                  >
                    <CardContent className="flex items-center justify-center h-full p-0 relative">
                      {/* Actual image so alt is applied */}
                      <img
                        src={t.image}
                        alt={t.alt}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/create-an-image-for-interior-design-about-us-section.png";
                        }}
                      />

                      {/* overlay */}
                      <div
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{
                          background:
                            hoveredCard === t.id
                              ? "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(117,191,68,0.3) 100%)"
                              : "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.4) 100%)",
                          opacity: 1,
                        }}
                      />

                      {/* Play button */}
                      <div
                        className={`relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-3 border-solid border-white shadow-2xl flex items-center justify-center transition-all duration-500 z-10 ${
                          hoveredCard === t.id ? "bg-white scale-110" : "bg-white/20 backdrop-blur-sm"
                        }`}
                        style={{
                          transform: hoveredCard === t.id ? "scale(1.2) rotateY(10deg)" : "scale(1) rotateY(0deg)",
                          boxShadow:
                            hoveredCard === t.id
                              ? "0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.6)"
                              : "0 8px 25px rgba(0,0,0,0.3)",
                          borderWidth: "3px",
                        }}
                      >
                        <PlayIcon
                          className={`w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 transition-all duration-500 ${
                            hoveredCard === t.id ? "text-primary" : "text-white"
                          }`}
                          style={{ transform: hoveredCard === t.id ? "translateX(3px)" : "translateX(2px)" }}
                        />
                      </div>

                      {/* Text */}
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-lg md:text-xl font-semibold [font-family:'Fahkwang',Helvetica] mb-2">
                          {t.title}
                        </h3>
                        <p className="text-sm md:text-base text-white/90 [font-family:'Fahkwang',Helvetica]">
                          {t.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center text-gray-600 py-12">No testimonials available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
