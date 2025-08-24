'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProject } from "../../ProjectContext";
import { swapToWebp, toMediaUrl, toWebpCandidate, youtubeId } from "../../../../lib/media";

gsap.registerPlugin(ScrollTrigger);

type PhotoItem = {
  id: string | number;
  type: "photo" | "plan";
  alt: string;
  full: string;
  fullWebp: string;
  thumb: string;
  thumbWebp: string;
};

type VideoItem = { id: string; videoUrl: string; title: string };

export const ProjectGallerySection = (): JSX.Element => {
  const { project } = useProject();

  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "plans">(
    "photos"
  );
  const [hovered, setHovered] = useState<string | number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // ---------- Build data from API ----------
  const photoItems: PhotoItem[] = useMemo(() => {
    const arr = (project?.gallery?.photos as any[]) || [];
    return arr.map((p, i) => {
      const src = p?.image ?? p?.photo ?? p?.file ?? p; // accept string or object
      const full = toMediaUrl(src, { width: 1600 });
      const thumb = toMediaUrl(src, { width: 700 });
      return {
        id: p?.id ?? `photo-${i}`,
        type: "photo",
        alt: p?.alt || project?.title || "Photo",
        full,
        thumb,
        fullWebp: toWebpCandidate(full),
        thumbWebp: toWebpCandidate(thumb),
      };
    });
  }, [project]);

  const planItems: PhotoItem[] = useMemo(() => {
    const arr = (project?.gallery?.plans as any[]) || [];
    return arr.map((p, i) => {
      const src = p?.image ?? p?.plan ?? p?.file ?? p;
      const full = toMediaUrl(src, { width: 1600 });
      const thumb = toMediaUrl(src, { width: 800 });
      return {
        id: p?.id ?? `plan-${i}`,
        type: "plan",
        alt: p?.alt || "Plan",
        full,
        thumb,
        fullWebp: toWebpCandidate(full),
        thumbWebp: toWebpCandidate(thumb),
      };
    });
  }, [project]);

  const videoItems: VideoItem[] = useMemo(() => {
    const arr = (project?.gallery?.videos as any[]) || [];
    return arr.map((v, i) => ({
      id: youtubeId(v?.videoUrl) || v?.id || `video-${i}`,
      videoUrl: v?.videoUrl || "",
      title: project?.title || "Video",
    }));
  }, [project]);

  // ---------- Animations ----------
  useEffect(() => {
    if (!sectionRef.current) return;

    if (headingRef.current) {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    if (descriptionRef.current) {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: "top 85%",
            end: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    if (tabsRef.current) {
      gsap.fromTo(
        tabsRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: tabsRef.current,
            start: "top 85%",
            end: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    if (gridRef.current) {
      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // ---------- Fancybox ----------
  useEffect(() => {
    Fancybox.destroy();
    const timer = setTimeout(() => {
      Fancybox.bind('[data-fancybox^="gallery-"]', {
        animated: true,
        showClass: "fancybox-fadeIn",
        hideClass: "fancybox-fadeOut",
        dragToClose: true,
        Image: { zoom: true, fit: "cover", preload: 1 },
        Toolbar: {
          display: {
            left: [],
            middle: [],
            right: ["zoom", "slideshow", "thumbs", "download", "close"],
          },
        },
        closeButton: true,
        wheel: "slide",
        touch: { vertical: true, momentum: true },
      });
    }, 150);
    return () => {
      clearTimeout(timer);
      Fancybox.destroy();
    };
  }, [activeTab, photoItems, planItems, videoItems]);

  // ---------- UI ----------
  const tabs = [
    { id: "photos" as const, label: `Photos (${photoItems.length})` },
    { id: "videos" as const, label: `Videos (${videoItems.length})` },
    { id: "plans" as const, label: `Plans (${planItems.length})` },
  ];

  const renderThumb = (item: PhotoItem) => (
    <a
      key={item.id}
      href={item.full} // keep JPG/PNG as the lightbox href for compatibility
      data-fancybox={`gallery-${activeTab}`}
      data-caption={`${item.alt} - ${item.type}`}
      className="block w-full h-80 cursor-pointer group"
      onMouseEnter={() => setHovered(item.id)}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="relative w-full h-80 overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
        <picture>
          {/* Prefer server-transcoded WebP */}
          <source srcSet={item.thumbWebp} type="image/webp" />
          {/* Also try extension-swapped webp just in case */}
          <source srcSet={swapToWebp(item.thumb)} type="image/webp" />
          {/* Fallback */}
          <img
            src={item.thumb}
            alt={item.alt}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </picture>

        {/* Category pill */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-800 rounded-full shadow-sm">
            {item.type === "photo" ? "Photo" : "Plan"}
          </span>
        </div>

        {/* Zoom icon on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-500 z-20"
          style={{
            opacity: hovered === item.id ? 1 : 0,
            transform:
              hovered === item.id ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(-10deg)",
          }}
        >
          <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/20">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
          <h4 className="text-white font-medium text-sm [font-family:'Fahkwang',Helvetica] truncate">
            {item.alt}
          </h4>
        </div>
      </div>
    </a>
  );

  const renderVideo = (v: VideoItem) => {
    const id = v.id;
    const thumb = id
      ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
      : ""; // fallback empty
    return (
      <a
        key={v.id}
        href={v.videoUrl}
        data-fancybox={`gallery-${activeTab}`}
        data-caption={v.title}
        className="block w-full h-80 cursor-pointer group"
      >
        <div className="relative w-full h-80 overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
          {!!thumb && (
            <img
              src={thumb}
              alt={v.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
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
    activeTab === "photos"
      ? photoItems
      : activeTab === "plans"
      ? planItems
      : videoItems;

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            ref={headingRef}
            className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6"
          >
            Project Gallery
          </h2>
          <p
            ref={descriptionRef}
            className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] max-w-3xl mx-auto leading-relaxed"
          >
            Explore a curated collection of visuals that showcase the transformation of this
            space into a harmonious blend of style and functionality.
          </p>
        </div>

        {/* tabs */}
        <div ref={tabsRef} className="flex justify-center mb-16">
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

        {/* grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeTab === "videos"
              ? (current as VideoItem[]).map(renderVideo)
              : (current as PhotoItem[]).map(renderThumb)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fancybox polish */}
      <style jsx global>{`
        .fancybox__container {
          --fancybox-bg: rgba(0, 0, 0, 0.95);
          --fancybox-accent-color: #75bf44;
        }
        .fancybox__backdrop { background: var(--fancybox-bg); }
        .fancybox__toolbar {
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          margin: 20px;
          padding: 8px;
        }
        .fancybox__button {
          color: #fff !important;
          background: rgba(255,255,255,0.12) !important;
          border-radius: 50% !important;
          transition: all .3s ease !important;
          width: 40px !important;
          height: 40px !important;
          margin: 0 2px !important;
        }
        .fancybox__button:hover { background: #75bf44 !important; transform: scale(1.07) !important; }
        .fancybox__nav { background: rgba(0,0,0,0.7) !important; color:#fff !important; border-radius:50% !important; width:48px !important; height:48px !important; }
        .fancybox__nav:hover { background:#75bf44 !important; }
        .fancybox__caption {
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          margin: 20px;
          text-align: center;
        }
        @media (max-width: 768px) {
          .fancybox__button { width: 35px !important; height: 35px !important; }
          .fancybox__nav { width: 40px !important; height: 40px !important; }
          .fancybox__toolbar { margin: 10px !important; padding: 6px !important; }
        }
      `}</style>
    </section>
  );
};
