'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProject } from "../../ProjectContext";
import "./project-gallery.css";

gsap.registerPlugin(ScrollTrigger);

type PhotoItem = {
  id: string | number;
  type: "photo" | "plan";
  alt: string;
  full: string;
  thumb: string;
};

type VideoItem = { 
  id: string; 
  videoUrl: string; 
  title: string;
  thumbnail?: string;
};

// Helper to extract YouTube ID
const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtu.be")) {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v");
    }
  } catch {
    // Invalid URL
  }
  return null;
};

export const ProjectGallerySection = (): JSX.Element => {
  const { project, gallery, loading, error } = useProject();

  const [activeTab, setActiveTab] = useState<"photos" | "videos" | "plans">("photos");
  const [hovered, setHovered] = useState<string | number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Build data from the context
  const photoItems: PhotoItem[] = useMemo(() => {
    if (!gallery?.photos) return [];
    
    return gallery.photos.map((p, i) => ({
      id: p.id || `photo-${i}`,
      type: "photo" as const,
      alt: p.alt || project?.title || "Photo",
      full: p.src,
      thumb: p.src, // Use same URL for thumb, could be optimized with size params
    }));
  }, [gallery?.photos, project?.title]);

  const planItems: PhotoItem[] = useMemo(() => {
    if (!gallery?.plans) return [];
    
    return gallery.plans.map((p, i) => ({
      id: p.id || `plan-${i}`,
      type: "plan" as const,
      alt: p.alt || "Floor Plan",
      full: p.src,
      thumb: p.src,
    }));
  }, [gallery?.plans]);

  const videoItems: VideoItem[] = useMemo(() => {
    if (!gallery?.videos) return [];
    
    return gallery.videos.map((v, i) => {
      const youtubeId = getYouTubeId(v.src);
      return {
        id: youtubeId || v.id || `video-${i}`,
        videoUrl: v.src,
        title: v.alt || project?.title || "Video",
        thumbnail: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined,
      };
    });
  }, [gallery?.videos, project?.title]);

  // Debug logs
  useEffect(() => {
    console.log('Gallery data:', gallery);
    console.log('Photo items:', photoItems);
    console.log('Plan items:', planItems);
    console.log('Video items:', videoItems);
  }, [gallery, photoItems, planItems, videoItems]);

  // Set default active tab based on available content
  useEffect(() => {
    if (photoItems.length > 0) {
      setActiveTab("photos");
    } else if (planItems.length > 0) {
      setActiveTab("plans");
    } else if (videoItems.length > 0) {
      setActiveTab("videos");
    }
  }, [photoItems.length, planItems.length, videoItems.length]);

  // Animations
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
            toggleActions: "play none none none",
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
            toggleActions: "play none none none",
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
            toggleActions: "play none none none",
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
          duration: 1.0,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Fancybox setup
  useEffect(() => {
    Fancybox.destroy();
    const timer = setTimeout(() => {
      Fancybox.bind('[data-fancybox^="gallery-"]', {
        animated: true,
        showClass: "fancybox-fadeIn",
        hideClass: "fancybox-fadeOut",
        dragToClose: true,
        Images: { zoom: true },
        Image: { zoom: true, fit: "cover", preload: 1 },
        Toolbar: {
          display: {
            left: [],
            middle: [],
            right: ["zoom", "slideshow", "thumbs", "download", "close"],
          },
        },
        wheel: "slide",
        touch: { vertical: true, momentum: true },
      });
    }, 120);
    return () => {
      clearTimeout(timer);
      Fancybox.destroy();
    };
  }, [activeTab, photoItems.length, planItems.length, videoItems.length]);

  // Show loading state
  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#626161] [font-family:'Fahkwang',Helvetica]">Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <p className="text-red-600 [font-family:'Fahkwang',Helvetica]">Failed to load gallery: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Check if we have any content to show
  const hasContent = photoItems.length > 0 || planItems.length > 0 || videoItems.length > 0;

  if (!hasContent) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6">
              Project Gallery
            </h2>
            <p className="text-[#626161] [font-family:'Fahkwang',Helvetica]">
              No gallery content available for this project.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const tabs = [
    { id: "photos" as const, label: `Photos (${photoItems.length})`, count: photoItems.length },
    { id: "videos" as const, label: `Videos (${videoItems.length})`, count: videoItems.length },
    { id: "plans" as const, label: `Plans (${planItems.length})`, count: planItems.length },
  ].filter(tab => tab.count > 0); // Only show tabs with content

  const renderPhotoItem = (item: PhotoItem, idx: number) => (
    <a
      key={item.id}
      href={item.full}
      data-fancybox={`gallery-${activeTab}`}
      data-caption={`${item.alt} - ${item.type}`}
      className="block w-full cursor-pointer group"
      onMouseEnter={() => setHovered(item.id)}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
        <img
          src={item.thumb}
          alt={item.alt}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading={idx < 6 ? "eager" : "lazy"}
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/create-an-image-for-interior-design-about-us-section.png";
          }}
        />

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
            transform: hovered === item.id ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(-10deg)",
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
    const youtubeId = getYouTubeId(v.videoUrl);
    const thumbnail = v.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "");
    const href = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : v.videoUrl;

    return (
      <a
        key={v.id}
        href={href}
        data-fancybox={`gallery-${activeTab}`}
        data-caption={v.title}
        className="block w-full cursor-pointer group"
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={v.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/create-an-image-for-interior-design-about-us-section.png";
              }}
            />
          )}
          
          {/* Video play button */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary ml-1" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Video label */}
          <div className="absolute top-3 left-3 z-20">
            <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-xs font-semibold text-white rounded-full shadow-sm">
              Video
            </span>
          </div>
        </div>
      </a>
    );
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case "photos":
        return photoItems;
      case "plans":
        return planItems;
      case "videos":
        return videoItems;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
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

        {/* Tabs - Only show if we have multiple types of content */}
        {tabs.length > 1 && (
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
        )}

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-[#626161] [font-family:'Fahkwang',Helvetica]">
                  No {activeTab} available for this project.
                </p>
              </div>
            ) : activeTab === "videos" ? (
              (currentItems as VideoItem[]).map(renderVideo)
            ) : (
              (currentItems as PhotoItem[]).map((item, idx) => renderPhotoItem(item, idx))
            )}
          </motion.div>
        </AnimatePresence>

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p>Debug: Photos: {photoItems.length}, Videos: {videoItems.length}, Plans: {planItems.length}</p>
            <p>Active Tab: {activeTab}</p>
            <p>Current Items: {currentItems.length}</p>
          </div>
        )}
      </div>
    </section>
  );
};