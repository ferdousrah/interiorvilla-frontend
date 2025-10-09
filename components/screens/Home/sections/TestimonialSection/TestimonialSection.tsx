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
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

// Hardcoded CMS origin (no env usage)
const CMS_ORIGIN = "https://interiorvillabd.com";

type MediaSize = { url?: string | null };
type Media = {
  url?: string | null;
  alt?: string | null;
  sizes?: Record<string, MediaSize | undefined>;
};

/* ---------- Utils ---------- */
const absolutize = (u?: string | null): string => {
  if (!u) return '/placeholder.webp';
  if (/^https?:\/\//i.test(u)) return u;
  const CMS_ORIGIN = 'https://interiorvillabd.com'; // adjust if using local dev domain
  return new URL(u, CMS_ORIGIN).href;
};

/** Prefer best size, fallback to original */
const getBestImageUrl = (img?: Media | null): string => {
  if (!img) return "/placeholder.webp";

  // Prefer medium, then small, then original
  const url =
    img.sizes?.square?.url ||
    img.sizes?.thumbnail?.url ||
    img.url;

  if (!url) return "/placeholder.webp";

  const abs = absolutize(url);

  // Always prefer .webp variant for Payload images
  if (abs.endsWith(".webp")) return abs;

  return abs.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, ".webp$2");
};

const getImageAlt = (m?: Media | string | null, fallback = "Client story") => {
  if (m && typeof m !== "string") {
    const a = (m.alt || "").trim();
    if (a) return a;
  }
  return fallback;
};

// Convert YouTube links into embed format
const getYouTubeEmbedUrl = (url: string): string => {
  try {
    const yt = new URL(url);
    if (yt.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${yt.pathname.slice(1)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    }
    if (yt.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${yt.searchParams.get("v")}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    }
    return url;
  } catch {
    return url;
  }
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

  /* ----------------- Fetch testimonials ----------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("https://interiorvillabd.com/api/testimonials", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const docs = Array.isArray(data?.docs)
          ? data.docs
          : Array.isArray(data)
          ? data
          : [];

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
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------- Fancybox bootstrap ----------------- */
  useEffect(() => {
    Fancybox.destroy();
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
          right: ["zoom", "slideshow", "thumbs", "download", "close"],
        },
      },
      Iframe: {
        preload: true,
        attr: {
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
          allowfullscreen: "true",
        },
      },
    });

    return () => {
      Fancybox.destroy();
    };
  }, [items.length]);

  /* ----------------- Animations ----------------- */
  useLayoutEffect(() => {
    if (!fontsReady) return;
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (headingRef.current) {
        const st = new SplitText(headingRef.current, {
          type: "words,chars",
          charsClass: "char",
          wordsClass: "word",
        });
        gsap.fromTo(
          st.chars,
          { opacity: 0.2, y: 30, scale: 0.9, rotationY: -15 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 1,
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
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [fontsReady]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section
      ref={sectionRef}
      className="w-full flex items-start justify-center relative overflow-hidden bg-white pt-20 pb-16 md:pt-25 md:pb-20"
      style={{ transformStyle: "preserve-3d", perspective: "1000px", zIndex: 1 }}
    >
      {/* Background decorations */}
      <div ref={backgroundElementsRef} className="absolute inset-0 pointer-events-none" />

      <div
        className="container mx-auto px-4 relative z-10 w-full"
        style={{ maxWidth: "1219px" }}
      >
        {/* Section Header */}
        <div className="text-center mb-16">
          <div ref={headingWrapperRef} className="perspective-[1000px] cursor-default">
            <h2
              ref={headingRef}
              className="[font-family:'Fahkwang',Helvetica] font-medium text-[40px] text-center leading-[62px] mb-6 md:mb-2"
            >
              <span className="text-[#0d1529]">Client </span>
              <span className="text-secondary">Stories</span>
            </h2>
          </div>
          <p
            ref={descriptionRef}
            className="text-lg text-[#626161] max-w-4xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica] px-8"
          >
            We create spaces that inspire and reflect your unique lifestyle
          </p>
        </div>

        <div ref={carouselContainerRef} className="relative">
          <div ref={navigationRef}>
            <button
              onClick={scrollPrev}
              className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 border-2 border-primary/20"
            >
              <ArrowLeft className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 border-2 border-primary/20"
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
                  className="relative flex-[0_0_280px] md:flex-[0_0_320px] lg:flex-[0_0_360px] transition-all duration-500 ease-in-out"
                  onMouseEnter={() => setHoveredCard(t.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    transform:
                      hoveredCard === t.id
                        ? "scale(1.05) translateY(-8px)"
                        : "scale(1) translateY(0)",
                    zIndex: hoveredCard === t.id ? 10 : 1,
                  }}
                >
                  <Card
                    className="group h-[400px] w-full rounded-2xl overflow-hidden border-2 border-primary/30 relative cursor-pointer"
                    style={{
                      boxShadow:
                        hoveredCard === t.id
                          ? "0 25px 50px -12px rgba(0,0,0,0.25)"
                          : "0 8px 32px rgba(0,0,0,0.12)",
                    }}
                  >
                    <CardContent className="flex items-center justify-center h-full p-0 relative">
                      {/* Image */}
                      <img
                        src={t.image || "/placeholder.webp"}
                        alt={t.alt}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.webp";
                        }}
                      />

                      {/* Overlay */}
                      <div
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{
                          background:
                            hoveredCard === t.id
                              ? "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(117,191,68,0.3) 100%)"
                              : "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.4) 100%)",
                        }}
                      />

                      {/* Play button linked to Fancybox */}
                     <a
                        href={getYouTubeEmbedUrl(t.video)}
                        data-fancybox="testimonial-videos"
                        data-caption={t.title}
                        aria-label={`Play testimonial video: ${t.title || "Client testimonial video"}`}
                        className={`relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-3 border-white flex items-center justify-center transition-all duration-500 z-10 ${
                          hoveredCard === t.id ? "bg-white scale-110" : "bg-white/20 backdrop-blur-sm"
                        }`}
                      >
                        <span className="sr-only">
                          {`Play testimonial video: ${t.title || "Client testimonial video"}`}
                        </span>

                        <PlayIcon
                          aria-hidden="true"
                          className={`w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 transition-all duration-500 ${
                            hoveredCard === t.id ? "text-primary" : "text-white"
                          }`}
                        />
                      </a>


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
                <div className="text-center text-gray-600 py-12">
                  No testimonials available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
