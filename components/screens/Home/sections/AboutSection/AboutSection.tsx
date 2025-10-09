"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../../../../ui/card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { BeforeAfterSlider } from "../../../../ui/before-after-slider";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------- Types from your API ---------- */
type MediaSize = {
  url: string | null;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  filesize: number | null;
  filename: string | null;
};

type Media = {
  id: number;
  alt: string | null;          // ← we will use this
  caption: string | null;
  url: string | null;
  filename: string | null;
  sizes?: {
    thumbnail?: MediaSize;
    square?: MediaSize;
    small?: MediaSize;
    medium?: MediaSize;
    large?: MediaSize;
    xlarge?: MediaSize;
    og?: MediaSize;
  };
};

type AboutSectionData = {
  sectionTitle?: string | null;
  shortDescription?: string | null;
  beforeAfterImages?: { id: string; image: Media | null }[];
  highlights?: { id: string; text: string; desc?: string | null }[];
  backgroundColor?: string | null;
};

/* ---------- Constants ---------- */
const CMS_BASE = "https://interiorvillabd.com";
const HOME_ENDPOINT = `${CMS_BASE}/api/globals/home?depth=1&draft=false`;

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

/** Compose alt text with a safe fallback */
function buildAlt(baseAlt: string | null | undefined, suffix: string) {
  return baseAlt && baseAlt.trim()
    ? `${baseAlt} (${suffix})`
    : `Interior design ${suffix}`;
}

/* ---------- Component ---------- */
export const AboutSection = (): JSX.Element => {
  const [data, setData] = useState<AboutSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Fetch in the same component
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(HOME_ENDPOINT, { cache: "no-store", mode: "cors" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json?.aboutSection ?? null);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derive images strictly by order: 0 = before, 1 = after
  const {
    beforeUrl,
    afterUrl,
    beforeAlt,
    afterAlt,
    features,
    bg,
  } = useMemo(() => {
    const list = Array.isArray(data?.beforeAfterImages) ? data!.beforeAfterImages : [];

    const beforeImg = list[0]?.image ?? null;
    const afterImg  = list[1]?.image ?? null;

    const beforeUrl = getBestImageUrl(beforeImg);
    const afterUrl  = getBestImageUrl(afterImg);

    const beforeAlt = buildAlt(beforeImg?.alt, "before");
    const afterAlt  = buildAlt(afterImg?.alt, "after");

    const features =
      (data?.highlights ?? []).map((h, idx) => ({
        id: String(idx + 1).padStart(2, "0"),
        title: h.text,
        description: h.desc ?? "",
      })) || [];

    const bg = data?.backgroundColor && data.backgroundColor.trim()
      ? data.backgroundColor
      : "#f7f9fb";

    return { beforeUrl, afterUrl, beforeAlt, afterAlt, features, bg };
  }, [data]);

  /* ---------- Refs for GSAP ---------- */
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const experienceCircleRef = useRef<HTMLDivElement>(null);
  const featuresCardRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const featureHeadingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const featureHeadingWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ---------- Heading GSAP ---------- */
  useEffect(() => {
    if (!data?.sectionTitle) return; // Wait for data to load
    
    if (!headingRef.current) return;

    const split = new SplitText(headingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse",
      },
    });

    gsap.set(split.chars, { opacity: 0, y: 100, rotateX: -90, transformOrigin: "50% 50% -50px" });
    tl.to(split.chars, {
      duration: 1.2,
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: { amount: 1, from: "start" },
      ease: "power4.out",
    });

    const onMove = (e: MouseEvent) => {
      const wrap = headingWrapperRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      gsap.to(split.chars, {
        duration: 0.5,
        y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
        x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
        rotationY: (x - 0.5) * 20,
        rotationX: (y - 0.5) * -20,
        ease: "power2.out",
        stagger: { amount: 0.3, from: "center" },
      });
    };

    const onLeave = () => {
      gsap.to(split.chars, {
        duration: 1,
        y: 0,
        x: 0,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.3)",
        stagger: { amount: 0.3, from: "center" },
      });
    };

    const wrap = headingWrapperRef.current;
    wrap?.addEventListener("mousemove", onMove);
    wrap?.addEventListener("mouseleave", onLeave);

    return () => {
      wrap?.removeEventListener("mousemove", onMove);
      wrap?.removeEventListener("mouseleave", onLeave);
      split.revert();
    };
  }, [data?.sectionTitle]);

  /* ---------- Feature headings hover ---------- */
  useEffect(() => {
    if (!data?.highlights || features.length === 0) return; // Wait for data to load
    
    const cleanups: Array<() => void> = [];

    featureHeadingRefs.current.forEach((heading, index) => {
      if (!heading) return;
      const split = new SplitText(heading, { type: "chars,words", charsClass: "char", wordsClass: "word" });
      const wrapper = featureHeadingWrapperRefs.current[index];
      if (!wrapper) return;

      const onMove = (e: MouseEvent) => {
        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        gsap.to(split.chars, {
          duration: 0.5,
          y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
          x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
          rotationY: (x - 0.5) * 20,
          rotationX: (y - 0.5) * -20,
          ease: "power2.out",
          stagger: { amount: 0.3, from: "center" },
        });
      };

      const onLeave = () => {
        gsap.to(split.chars, {
          duration: 1,
          y: 0,
          x: 0,
          rotationY: 0,
          rotationX: 0,
          ease: "elastic.out(1, 0.3)",
          stagger: { amount: 0.3, from: "center" },
        });
      };

      wrapper.addEventListener("mousemove", onMove);
      wrapper.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        wrapper.removeEventListener("mousemove", onMove);
        wrapper.removeEventListener("mouseleave", onLeave);
        split.revert();
      });
    });

    return () => void cleanups.forEach((fn) => fn());
  }, [features.length]);

  /* ---------- Parallax & description fade ---------- */
  useEffect(() => {
    if (!sectionRef.current) return;

    if (imageContainerRef.current) {
      gsap.to(imageContainerRef.current, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: imageContainerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
    }

    if (experienceCircleRef.current) {
      gsap.set(experienceCircleRef.current, { clearProps: "all" });
    }

    if (featuresCardRef.current) {
      gsap.to(featuresCardRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }

    if (descriptionRef.current) {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 50, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  /* ---------- Loading / Error ---------- */
  if (loading) {
    return (
      <section className="py-28" style={{ backgroundColor: "#f7f9fb" }}>
        <div className="container mx-auto max-w-[1276px] text-sm text-gray-500">Loading About…</div>
      </section>
    );
  }

  if (err) {
    return (
      <section className="py-28" style={{ backgroundColor: "#fff4f4" }}>
        <div className="container mx-auto max-w-[1276px] text-sm text-red-600">
          Failed to load About section: {err}
        </div>
      </section>
    );
  }

  /* ---------- Render ---------- */
  return (
    <section
      ref={sectionRef}
      className="relative w-full rounded-t-[20px] py-28 overflow-hidden"
      style={{ zIndex: 4, backgroundColor: bg }}
    >
      <div className="container mx-auto max-w-[1276px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <div>
            <div
              ref={headingWrapperRef}
              className="perspective-[1000px] cursor-default"
              style={{ transformStyle: "preserve-3d" }}
            >
              <h2
                ref={headingRef}
                className="font-['Fahkwang',Helvetica] font-semibold text-[#01190c] text-[40px] tracking-[-1.00px] leading-[49.9px] mb-12"
                style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
              >
                {data?.sectionTitle ?? "Elevating Interiors with Passion and Purpose"}
              </h2>
            </div>

            <div className="relative mt-10">
              <div
                ref={imageContainerRef}
                className="relative overflow-hidden rounded-md"
                style={{ position: "relative", zIndex: 5 }}
              >
                {/* Only mount slider when both URLs exist; key forces remount on change */}
                {beforeUrl && afterUrl ? (
                  <BeforeAfterSlider
                    key={`${beforeUrl}|${afterUrl}`}      // force remount when URLs change after fetch
                    beforeImage={beforeUrl}               // e.g. https://cms.../about-before-704x521.jpg
                    afterImage={afterUrl}                 // e.g. https://cms.../about-after-704x521.jpg
                    altBefore={beforeAlt}                 // from API: image.alt (before) + “(before)” if you like
                    altAfter={afterAlt}                   // from API: image.alt (after)
                  />

                ) : (
                  <div className="aspect-[704/521] w-full max-w-[730px] bg-gray-100 rounded-md" />
                )}
              </div>

              {/* Experience badge (unchanged UI) */}
              <div
                ref={experienceCircleRef}
                className="absolute bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-10 lg:right-8 w-[140px] h-[150px] md:w-[160px] md:h-[170px] lg:w-[180px] lg:h-[190px] z-10 cursor-pointer transition-transform duration-500 ease-out hover:scale-110 group"
                style={{ transform: "none" }}
              >
                <div className="absolute w-[116px] h-[126px] md:w-[136px] md:h-[146px] lg:w-[146px] lg:h-[156px] top-[15px] md:top-[17px] lg:top-[20px] left-[12px] md:left-[12px] lg:left-1 bg-primary rounded-[58px/63px] md:rounded-[68px/73px] lg:rounded-[73px/78px] transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30" />
                <div className="absolute w-[116px] h-[126px] md:w-[136px] md:h-[146px] lg:w-[146px] lg:h-[156px] top-[15px] md:top-[17px] lg:top-[20px] left-[12px] md:left-[12px] lg:left-1 bg-primary rounded-[58px/63px] md:rounded-[68px/73px] lg:rounded-[73px/78px] transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-secondary/30 group-hover:bg-secondary" />
                <img
                  className="absolute w-[140px] h-[150px] md:w-[160px] md:h-[170px] lg:w-[180px] lg:h-[190px] top-0 left-0 pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105"
                  alt="Ellipse"
                  src="/ellipse-141.svg"
                  style={{ transform: "none" }}
                />
                <div className="absolute w-[80px] md:w-[90px] lg:w-[105px] top-[75px] md:top-[85px] lg:top-[95px] left-[30px] md:left-[35px] lg:left-[29px] font-['Fahkwang',Helvetica] font-normal text-primary text-sm md:text-base text-center leading-[20px] md:leading-[24px] transition-all duration-500 ease-out group-hover:scale-105">
                  <span className="font-medium">
                    YEARS
                    <br />
                    EXPERIENCED
                  </span>
                  <span className="font-['Inter',Helvetica] font-medium">
                    {" "}
                    <br />
                  </span>
                </div>
                <div className="absolute w-[60px] md:w-[70px] lg:w-[78px] top-[45px] md:top-[50px] lg:top-[56px] left-[40px] md:left-[45px] lg:left-[46px] font-['Fahkwang',Helvetica] font-bold text-primary text-2xl md:text-3xl lg:text-4xl text-center leading-[30px] md:leading-[35px] lg:leading-[40px] whitespace-nowrap transition-all duration-500 ease-out group-hover:scale-110">
                  9+
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col">
            <p
              ref={descriptionRef}
              className="font-['Fahkwang',Helvetica] font-normal text-[#626161] text-sm text-justify leading-[26.6px] mb-10 md:mb-10 pb-4 md:pb-6"
            >
              {data?.shortDescription ??
                "We are a full-service interior design studio dedicated to creating beautifully curated spaces that reflect your unique style and needs."}
            </p>

            <Card
              ref={featuresCardRef}
              className="w-full bg-[#ffffff] rounded-[15px] border-none shadow-none will-change-transform pt-12"
              style={{ transformOrigin: "center center", backfaceVisibility: "hidden", transform: "translate3d(0,0,0)" }}
            >
              <CardContent className="p-12 space-y-10">
                {(features.length
                  ? features
                  : [
                      { id: "01", title: "Flexible Budget & Taste", description: "Your style, your budget, our flexible designs." },
                      { id: "02", title: "On-time Delivery", description: "Delivering your dream space, precisely on schedule, every time." },
                      { id: "03", title: "700+ Happy Customers", description: "Proudly serving 700+ happy customers with exceptional design." },
                    ]
                ).map((feature, index) => (
                  <div key={feature.id + feature.title} className="flex items-start gap-8">
                    <div className="flex-shrink-0 w-[60px] h-[57px] bg-primary rounded-[11px] flex items-center justify-center">
                      <div className="font-['DM_Sans',Helvetica] font-bold text-[#01190c] text-xl">
                        {feature.id}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div
                        ref={(el) => (featureHeadingWrapperRefs.current[index] = el)}
                        className="perspective-[1000px] cursor-default"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <h3
                          ref={(el) => (featureHeadingRefs.current[index] = el)}
                          className="font-['Fahkwang',Helvetica] font-semibold text-black text-xl tracking-[-1.00px] leading-[42.3px]"
                          style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
                        >
                          {feature.title}
                        </h3>
                      </div>
                      {feature.description && (
                        <p className="font-['Fahkwang',Helvetica] font-normal text-[#6c6c6c] text-sm leading-[26.6px]">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
