// project section for residential interior projects
'use client'

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin"; // <-- needed for scrollTo
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin);

// ---------- helpers for image URL ----------
const CMS_ORIGIN = "https://interiorvillabd.com";
const MEDIA_BASE = `${CMS_ORIGIN}/api/media/file/`;

const absolutize = (u: string) =>
  /^https?:\/\//i.test(u) ? u : new URL(u, CMS_ORIGIN).href;

// .jpg/.jpeg -> .webp (preserve ?v=... etc.)
const convertToWebp = (url: string) =>
  url.replace(/\.jpe?g(\?[^#]*)?$/i, ".webp$1");

const getFeaturedImageUrl = (fi: any): string => {
  const placeholder = "/placeholder.webp";
  if (!fi) return placeholder;

  if (typeof fi === "string") return convertToWebp(absolutize(fi));
  if (fi?.url) return convertToWebp(absolutize(fi.url));
  if (fi?.sizes?.large?.url)  return convertToWebp(absolutize(fi.sizes.large.url));
  if (fi?.sizes?.medium?.url) return convertToWebp(absolutize(fi.sizes.medium.url));
  if (fi?.sizes?.card?.url)   return convertToWebp(absolutize(fi.sizes.card.url));
  if (fi?.filename) return convertToWebp(`${MEDIA_BASE}${fi.filename}`);

  return placeholder;
};

// ---------- types ----------
interface Project {
  id: number;
  category: string;
  title: string;
  slug: string;
  description: string;
  image: string; // resolved featuredImage (.webp)
  color: string;
  accent: string;
}

interface ProjectsApiResponse {
  docs: any[];
}

// fallback colors
const palette = ["#794a48", "#7f4d4b", "#6f4241", "#8a5653", "#7b4c49"];

export const ProjectsSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featuredWorksHeadingRef = useRef<HTMLHeadingElement>(null);
  const featuredWorksWrapperRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [projects, setProjects] = useState<Project[]>([]);

  const navigate = useNavigate();

  // -------- fetch projects from API (category 1) --------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `https://interiorvillabd.com/api/projects?where[category][equals]=5&limit=5&sort=portfolio_position`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProjectsApiResponse = await res.json();

        const mapped: Project[] = (data.docs ?? []).map((doc: any, i: number) => ({
          id: Number(doc.id ?? i + 1),
          category:
            doc?.category?.title ||
            doc?.category?.name ||
            (typeof doc?.category === "string" ? doc.category : "Residential Interior"),
          title: doc?.title || `Project ${i + 1}`,
          slug: doc?.slug || "",   // 👈 FIX: add slug from API
          description: doc?.shortDescription || doc?.description || "",
          image: getFeaturedImageUrl(doc?.featuredImage), // <-- auto .webp
          color: doc?.color || palette[i % palette.length],
          accent: doc?.accent || palette[i % palette.length],
        }));

        if (!cancelled) setProjects(mapped);
      } catch (err) {
        console.error("Projects fetch failed:", err);
        if (!cancelled) setProjects([]);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // track window width for responsive card sizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // interactive hover animation for heading
  useEffect(() => {
    if (!featuredWorksHeadingRef.current || !featuredWorksWrapperRef.current) return;

    const splitText = new SplitText(featuredWorksHeadingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    const wrapper = featuredWorksWrapperRef.current;

    const onMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      gsap.to(splitText.chars, {
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
      gsap.to(splitText.chars, {
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

    return () => {
      splitText.revert();
      wrapper.removeEventListener("mousemove", onMove);
      wrapper.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // entrance animations (title + subtitle)
  useEffect(() => {
    if (!sectionRef.current) return;

    if (featuredWorksHeadingRef.current) {
      const splitText = new SplitText(featuredWorksHeadingRef.current, {
        type: "words,chars",
        charsClass: "char",
        wordsClass: "word",
      });

      gsap.set(splitText.chars, {
        opacity: 0,
        y: 100,
        rotationX: -90,
        transformOrigin: "50% 50% -50px",
      });

      gsap.to(splitText.chars, {
        duration: 1.5,
        opacity: 1,
        y: 0,
        rotationX: 0,
        stagger: { amount: 1.2, from: "start" },
        ease: "power4.out",
        delay: 0.5,
      });
    }

    if (subtitleRef.current) {
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 50, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.8,
          ease: "power3.out",
          delay: 1.2,
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // card stacking animation
  useEffect(() => {
    if (!sectionRef.current || !containerRef.current || projects.length === 0) return;

    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;

    cards.forEach((card, index) => {
      if (!card) return;
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
        bottom: 0,
      });
    });

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
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

        const activeIndex = Math.min(
          Math.floor(progress * projects.length),
          projects.length - 1
        );
        if (activeIndex !== currentIndex) setCurrentIndex(activeIndex);

        cards.forEach((card, index) => {
          if (!card) return;

          const segment = 1 / projects.length;
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
          const yPos =
            index === 0 && progress <= 1 / projects.length
              ? 0
              : startY + eased * (finalY - startY);

          gsap.set(card, {
            y: `${yPos}vh`,
            scale: 0.92 + eased * 0.08,
            force3D: true,
            zIndex: 100 + index,
          });
        });
      },
    });

    return () => {
      st.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === sectionRef.current) t.kill();
      });
    };
  }, [projects, currentIndex]);

  // keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && currentIndex < projects.length - 1) {
        e.preventDefault();
        scrollToCard(currentIndex + 1);
      } else if (e.key === "ArrowUp" && currentIndex > 0) {
        e.preventDefault();
        scrollToCard(currentIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, projects.length]);

  const scrollToCard = (index: number) => {
    const sectionScrollHeight = (projects.length * 400 * window.innerHeight) / 100;
    const targetScroll =
      (sectionRef.current?.offsetTop ?? 0) + (index / projects.length) * sectionScrollHeight;

    gsap.to(window, {
      scrollTo: { y: targetScroll },
      duration: 2.0,
      ease: "power2.inOut",
    });
  };

  // >>> ONLY CHANGE: include project id in link <<<
  const handleViewProject = (slug: string) => navigate(`/portfolio/project-details/${slug}`);
  const handleExploreAllProjects = () => navigate("/portfolio");

  return (
    <>
      {/* Featured Works Header Section */}
      <section className="w-full pt-16 md:pt-20 lg:pt-24 pb-0 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div
            ref={featuredWorksWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2
              ref={featuredWorksHeadingRef}
              className="[font-family:'Fahkwang',Helvetica] font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[40px] text-center leading-tight mb-6"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
            >
              <span className="text-[#0d1529]">Recent </span>
              <span className="text-secondary">Projects</span>
            </h2>
          </div>

          <p
            ref={subtitleRef}
            className="text-sm md:text-base lg:text-lg text-[#626161] max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed [font-family:'Fahkwang',Helvetica]"
          >
            Explore our showcase of exceptional residential interior design projects that reflect our commitment to quality, creativity, and client satisfaction.
          </p>
        </div>
      </section>

      {/* Featured Works Section */}
      <section
        ref={sectionRef}
        className="w-full min-h-screen overflow-hidden relative bg-white"
        style={{ zIndex: 2 }}
      >
        <div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center pt-0"
        >
          {projects.map((project, index) => (
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
              {/* Main card */}
              <div
                className="w-full rounded-2xl sm:rounded-3xl overflow-hidden relative mx-auto cursor-pointer"
                onClick={() => handleViewProject(project.slug)} // <<< changed
                style={{
                  width: "90%",
                  maxWidth:
                    windowWidth < 640
                      ? "100%"
                      : windowWidth < 1024
                      ? "600px"
                      : `${1200 + index * 40}px`,
                  height:
                    windowWidth < 640 ? "70vh" : windowWidth < 1024 ? "60vh" : "80vh",
                  minHeight: windowWidth < 640 ? "500px" : "600px",
                  background: project.color,
                  transform: "translateZ(0)",
                  willChange: "transform",
                }}
              >
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Content side */}
                  <div className="w-full lg:w-2/5 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center relative z-10 flex-shrink-0">
                    <div className="mb-3 md:mb-4">
                      <span
                        className="inline-block px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-green-800"
                        style={{ background: "rgba(255, 255, 255, 0.9)" }}
                      >
                        {project.category}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight"
                        style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)" }}>
                      {project.title}
                    </h2>

                    <p className="text-sm sm:text-base md:text-base text-white mb-4 md:mb-6 leading-relaxed"
                       style={{ textShadow: "0 1px 6px rgba(255, 255, 255, 0.2)" }}>
                      {project.description}
                    </p>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewProject(project.slug); }} // <<< changed
                      className="group inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl w-fit relative overflow-hidden"
                      style={{ background: "rgba(255, 255, 255, 0.2)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.2)";
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                      <span className="mr-2 text-xs sm:text-sm">View Project</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>

                    {/* desktop project number */}
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:left-8 lg:left-10 lg:block hidden">
                      <div className="text-4xl sm:text-6xl font-bold opacity-20 text-white">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                  </div>

                  {/* visual side */}
                  <div className="w-full lg:w-3/5 relative overflow-hidden flex-1 pointer-events-none">
                    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 lg:p-10">
                      <div className="w-full h-full rounded-1xl sm:rounded-2xl overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/create-an-image-for-interior-design-about-us-section.png";
                          }}
                        />
                      </div>
                    </div>
                    {/* mobile project number */}
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 lg:hidden">
                      <div className="text-2xl sm:text-3xl font-bold opacity-30 text-white">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore All Projects Section */}
      <section className="w-full py-8 md:py-12 relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleExploreAllProjects}
              className="group flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full text-white text-sm sm:text-base font-semibold bg-black hover:bg-gray-800 transition-all duration-500 hover:scale-105 border border-gray-700 relative z-10 mx-auto"
              style={{ boxShadow: "0 15px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 0, 0, 0.2)", minWidth: "180px" }}
            >
              <span className="[font-family:'Fahkwang',Helvetica] font-medium">
                Explore All Projects
              </span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
