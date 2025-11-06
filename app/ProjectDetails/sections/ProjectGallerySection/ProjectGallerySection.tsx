'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./project-gallery.css";
import { useProject } from "../../ProjectContext";

gsap.registerPlugin(ScrollTrigger);

/* ---------------- helpers ---------------- */
type PhotoItem = {
  id: string | number;
  type: "photo" | "plan";
  alt: string;
  full: string;
  thumb: string;
  blur?: string;
};
type VideoItem = { id: string; videoUrl: string; title: string };

const CMS_ORIGIN = "https://interiorvillabd.com";
const absolutize = (u: string) =>
  /^https?:\/\//i.test(u) ? u : new URL(u, CMS_ORIGIN).href;

const getYouTubeId = (u?: string) => {
  if (!u) return "";
  try {
    const url = new URL(u);
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
    if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || "";
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || "";
    return url.searchParams.get("v") || "";
  } catch {
    return "";
  }
};

/* ---------------- component ---------------- */
export const ProjectGallerySection = (): JSX.Element => {
  const { gallery, title } = useProject();

  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "plans">("photos");
  const [hovered, setHovered] = useState<string | number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* ---- map photos/plans with adaptive sizes ---- */
  const mapImage = (p: any, i: number, type: "photo" | "plan"): PhotoItem => {
    const getSize = () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const size = isMobile
        ? p?.sizes?.small?.url || p?.sizes?.square?.url
        : p?.sizes?.medium?.url || p?.sizes?.large?.url;
      return absolutize(size || p?.url || p?.src || "");
    };
    return {
      id: p.id ?? `${type}-${i}`,
      type,
      alt: p.alt || title || type,
      full: getSize(),
      thumb: getSize(),
      blur: p?.sizes?.blur?.url ? absolutize(p.sizes.blur.url) : undefined,
    };
  };

  const photoItems: PhotoItem[] = useMemo(
    () => (gallery.photos || []).map((p, i) => mapImage(p, i, "photo")),
    [gallery.photos, title]
  );

  const planItems: PhotoItem[] = useMemo(
    () => (gallery.plans || []).map((p, i) => mapImage(p, i, "plan")),
    [gallery.plans, title]
  );

  const videoItems: VideoItem[] = useMemo(
    () =>
      (gallery.videos || []).map((v, i) => {
        const id = getYouTubeId(v.src);
        return {
          id: id || v.id || `video-${i}`,
          videoUrl: v.src,
          title: v.alt || title || "Video",
        };
      }),
    [gallery.videos, title]
  );

  /* ---- Fancybox ---- */
  useEffect(() => {
    Fancybox.destroy();

    const hasAny =
      (activeTab === "photos" && photoItems.length) ||
      (activeTab === "plans" && planItems.length) ||
      (activeTab === "videos" && videoItems.length);

    if (!hasAny) return;

    const t = setTimeout(() => {
      Fancybox.bind('[data-fancybox^="gallery-"]', {
        animated: true,
        dragToClose: true,
        showClass: "fancybox-fadeIn",
        hideClass: "fancybox-fadeOut",
        l10n: { CLOSE: "×" },
        Hash: false,
        Thumbs: {
          autoStart: false,
        },
        Toolbar: {
          display: {
            left: [],
            middle: [],
            right: ["zoom", "slideshow", "thumbs", "close"],
          },
        },
        Images: {
          protected: true,
          zoom: true,
          Panzoom: {
            maxScale: 3,
            friction: 0.85,
            decelFriction: 0.9,
          },
        },
        wheel: "slide",
        transitionEffect: "zoom-in-out",
        transitionDuration: 300,
        preload: 2,
        idle: 2500,
        animatedSlideShow: true,
        touch: {
          vertical: true,
          momentum: true,
          velocity: 0.9,
        },
        Iframe: {
          preload: true,
          attr: {
            allow:
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
            allowfullscreen: "true",
            referrerpolicy: "strict-origin-when-cross-origin",
          },
        },
        on: {
          reveal: (fancybox, slide) => {
            const el = slide.$content?.firstElementChild as HTMLElement | null;
            if (el) {
              el.style.willChange = "transform, opacity";
            }
          },
          done: (fancybox, slide) => {
            const el = slide.$content?.firstElementChild as HTMLElement | null;
            if (el) {
              el.style.willChange = "auto";
            }
          },
        },
      });

      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]'));
      imgs.forEach((img) => {
        if (img.decoding === "async" && img.dataset.prefetched !== "true") {
          const prefetch = new Image();
          prefetch.src = img.src;
          img.dataset.prefetched = "true";
        }
      });
    }, 0);

    return () => {
      clearTimeout(t);
      Fancybox.destroy();
    };
  }, [activeTab, photoItems.length, planItems.length, videoItems.length]);

  /* ---- animations ---- */
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    
    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 95%",
            toggleActions: "play none none none",
            onEnter: (self) => triggers.push(self),
          },
        }
      );
    }
    
    return () => {
      triggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        const children = Array.from(gridRef.current.children);
        if (children.length > 0) {
          gsap.fromTo(
            children,
            { opacity: 0, y: 60, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: gridRef.current,
                start: "top 95%",
                end: "bottom 5%",
                toggleActions: "play none none none",
                once: false,
              },
            }
          );
        }
      }
    });

    return () => ctx.revert();
  }, [activeTab, photoItems.length, planItems.length, videoItems.length]);

  /* ---- Tabs ---- */
  const tabs = [
    { id: "photos" as const, label: `Photos (${photoItems.length})` },
    { id: "videos" as const, label: `Videos (${videoItems.length})` },
    { id: "plans" as const, label: `Plans (${planItems.length})` },
  ];

  /* ---- Renders ---- */
  const renderThumb = (item: PhotoItem, idx: number) => (
    <a
      key={item.id}
      href={item.full}
      data-fancybox={`gallery-${activeTab}`}
      data-caption={`${item.alt} - ${item.type}`}
      className="block w-full cursor-pointer group"
      onMouseEnter={() => setHovered(item.id)}
      onMouseLeave={() => setHovered(null)}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-lg transition-all duration-500 ease-out group-hover:shadow-2xl">
        <picture>
          <source srcSet={item.full.replace(/\.(jpg|jpeg|png)$/i, ".webp")} type="image/webp" />
          <img
            src={item.thumb}
            alt={item.alt}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading={idx < 3 ? "eager" : "lazy"}
            decoding="async"
            style={{
              filter: item.blur ? "blur(10px)" : "none",
              transition: "filter 0.4s ease",
            }}
            onLoad={(e) => {
              e.currentTarget.style.filter = "none";
            }}
          />
        </picture>

        <div className="absolute top-3 left-3 z-20">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-800 rounded-full shadow-sm">
            {item.type === "photo" ? "Photo" : "Plan"}
          </span>
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-500 z-20"
          style={{
            opacity: hovered === item.id ? 1 : 0,
            transform: hovered === item.id ? "scale(1)" : "scale(0.9)",
          }}
        >
          <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/20">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
          <h4 className="text-white font-medium text-sm [font-family:'Fahkwang',Helvetica] truncate">
            {item.alt}
          </h4>
        </div>
      </div>
    </a>
  );

  const renderVideo = (v: VideoItem) => {
    const id = v.id || getYouTubeId(v.videoUrl);
    const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
    const watchUrl = id ? `https://www.youtube.com/watch?v=${id}` : v.videoUrl;

    return (
      <a
        key={v.id}
        href={watchUrl}
        data-fancybox={`gallery-${activeTab}`}
        data-type="iframe"
        data-caption={v.title}
        className="block w-full cursor-pointer group"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl shadow-lg transition-all duration-500 ease-out group-hover:shadow-2xl">
          {!!thumb && (
            <img
              src={thumb}
              alt={v.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    );
  };

  const current =
    activeTab === "photos" ? photoItems : activeTab === "plans" ? planItems : videoItems;

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <h2
            ref={headingRef}
            className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-2"
          >
            Project Gallery
          </h2>
          {!!title && (
            <p className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">{title}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-16">
          <div className="relative bg-white rounded-2xl p-2 shadow-lg border border-gray-100 inline-flex space-x-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative px-6 py-3 text-base [font-family:'Fahkwang',Helvetica] font-medium transition-all duration-300 rounded-xl z-10 min-w-[140px] ${
                  activeTab === t.id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-transparent text-[#626161] hover:text-[#01190c] hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]"
          >
            {activeTab === "videos"
              ? (current as VideoItem[]).map(renderVideo)
              : (current as PhotoItem[]).map((it, idx) => renderThumb(it, idx))}
          </motion.div>
        </AnimatePresence>

        {activeTab !== "videos" && (current as PhotoItem[]).length === 0 && (
          <div className="w-full py-16 text-center text-[#626161] min-h-[200px] flex items-center justify-center">
            No items found.
          </div>
        )}
        {activeTab === "videos" && (current as VideoItem[]).length === 0 && (
          <div className="w-full py-16 text-center text-[#626161] min-h-[200px] flex items-center justify-center">
            No videos.
          </div>
        )}
      </div>
    </section>
  );
};