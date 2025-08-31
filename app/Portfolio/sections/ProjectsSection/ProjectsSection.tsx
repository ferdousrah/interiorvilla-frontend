'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(SplitText);

/* ---------------- CMS & image helpers ----------------  */
const CMS_ORIGIN = "https://cms.interiorvillabd.com";
const MEDIA_BASE = `${CMS_ORIGIN}/api/media/file/`;

const absolutize = (u: string) =>
  /^https?:\/\//i.test(u) ? u : new URL(u, CMS_ORIGIN).href;

const toWebp = (url: string) => url.replace(/\.jpe?g(\?[^#]*)?$/i, ".webp$1");

type ImgSrcs = { primary: string; fallback: string };

const resolveFeaturedImage = (fi: any): ImgSrcs => {
  const placeholder = "/placeholder.webp";

  const pick = (raw?: string): ImgSrcs => {
    if (!raw) return { primary: placeholder, fallback: placeholder };
    const abs = absolutize(raw);
    const primary = /\.jpe?g(\?[^#]*)?$/i.test(abs) ? toWebp(abs) : abs;
    return { primary, fallback: abs };
  };

  if (!fi) return { primary: placeholder, fallback: placeholder };
  if (typeof fi === "string") return pick(fi);
  if (fi?.url) return pick(fi.url);
  if (fi?.sizes?.large?.url)  return pick(fi.sizes.large.url);
  if (fi?.sizes?.medium?.url) return pick(fi.sizes.medium.url);
  if (fi?.sizes?.card?.url)   return pick(fi.sizes.card.url);
  if (fi?.filename)           return pick(`${MEDIA_BASE}${fi.filename}`);
  return { primary: placeholder, fallback: placeholder };
};

/* ---------------- Types ---------------- */
interface ProjectCard {
  id: number;
  category: string;
  title: string;
  description: string;
  image: ImgSrcs;
  year: string;
  client: string;
  area: string;
  tags: string[];
}

interface ApiResponse {
  docs: any[];
  page?: number;
  limit?: number;
  nextPage?: number | null;
  totalDocs?: number;
  totalPages?: number;
}

/* ---------------- Filters & endpoints ---------------- */
const filterOptions = [
  "All",
  "Residential Interior",
  "Commercial Interior",
  "Architectural Consultancy",
] as const;
type Filter = typeof filterOptions[number];

const API_BY_FILTER: Record<Filter, string> = {
  All: `https://cms.interiorvillabd.com/api/projects`,
  "Residential Interior": `https://cms.interiorvillabd.com/api/projects?where[category][equals]=1`,
  "Commercial Interior": `https://cms.interiorvillabd.com/api/projects?where[category][equals]=2`,
  "Architectural Consultancy": `https://cms.interiorvillabd.com/api/projects?where[category][equals]=3`,
};

const PAGE_SIZE = 4;

/* ---------------- Component ---------------- */
export const ProjectsSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const navigate = useNavigate();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Residential Interior": return "#75BF44";
      case "Commercial Interior":  return "#EE5428";
      case "Architectural Consultancy": return "#4F46E5";
      default: return "#75BF44";
    }
  };

  /* ---------- fetch helper ---------- */
  const fetchPage = useCallback(
    async (pageToLoad: number, replace: boolean, signal?: AbortSignal) => {
      setLoading(true);
      setErr(null);

      try {
        const base = API_BY_FILTER[activeFilter];
        const url = new URL(base);
        url.searchParams.set("depth", "1");
        url.searchParams.set("limit", PAGE_SIZE.toString());
        url.searchParams.set("page", String(pageToLoad));

        const res = await fetch(url.toString(), { cache: "no-store", signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ApiResponse = await res.json();

        const mapped: ProjectCard[] = (data.docs ?? []).map((doc: any, i: number) => {
          const image = resolveFeaturedImage(doc?.featuredImage);
          const categoryText =
            doc?.category?.title ||
            doc?.category?.name ||
            (typeof doc?.category === "string" ? doc.category : "Project");

          return {
            id: Number(doc?.id ?? (pageToLoad - 1) * PAGE_SIZE + i + 1),
            category: categoryText,
            title: doc?.title || doc?.name || `Project ${(pageToLoad - 1) * PAGE_SIZE + i + 1}`,
            description: doc?.shortDescription || doc?.description || "",
            image,
            year: doc?.year || "",
            client: doc?.client || "",
            area: doc?.area || "",
            tags: Array.isArray(doc?.tags) ? doc.tags : [],
          };
        });

        setProjects(prev => (replace ? mapped : [...prev, ...mapped]));
        setPage(data.page ?? pageToLoad);
        setHasMore(
          Boolean(data.nextPage) ||
          (typeof data.totalPages === "number"
            ? (data.page ?? pageToLoad) < data.totalPages
            : mapped.length === PAGE_SIZE)
        );
        if (typeof data.totalDocs === "number") setTotalCount(data.totalDocs);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    },
    [activeFilter]
  );

  /* ---------- reset on filter ---------- */
  useEffect(() => {
    const controller = new AbortController();
    setProjects([]);
    setPage(0);
    setHasMore(true);
    setTotalCount(null);
    setErr(null);
    fetchPage(1, true, controller.signal);
    return () => controller.abort();
  }, [activeFilter, fetchPage]);

  /* ---------- IntersectionObserver for infinite scroll ---------- */
  useEffect(() => {
    if (page < 1 || !hasMore) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    let controller: AbortController | null = null;

    const onIntersect: IntersectionObserverCallback = (entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !loading) {
        controller?.abort();
        controller = new AbortController();
        fetchPage(page + 1, false, controller.signal);
      }
    };

    const io = new IntersectionObserver(onIntersect, {
      root: null,
      // generous margins so we prefetch before the user actually hits the bottom
      rootMargin: "1200px 0px 1200px 0px",
      threshold: 0,
    });

    io.observe(sentinel);

    return () => {
      io.disconnect();
      controller?.abort();
    };
  }, [page, hasMore, loading, fetchPage]);

  /* ---------- Manual “nudge” if sentinel starts in view ---------- */
  useEffect(() => {
    if (page < 1 || !hasMore || loading) return;
    const s = loadMoreRef.current;
    if (!s) return;
    const r = s.getBoundingClientRect();
    const inView = r.top <= window.innerHeight && r.bottom >= 0;
    if (inView) {
      fetchPage(page + 1, false);
    }
  }, [loading, page, hasMore, fetchPage]);

  /* ---------- Heading hover animation ---------- */
  useEffect(() => {
    if (!headingRef.current || !headingWrapperRef.current) return;
    const splitText = new SplitText(headingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    const wrapper = headingWrapperRef.current;

    const handleMouseMove = (e: MouseEvent) => {
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

    const handleMouseLeave = () => {
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

    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
      splitText.revert();
    };
  }, []);

  const headerText = useMemo(
    () => (activeFilter === "All" ? "Our Portfolio" : `${activeFilter}`),
    [activeFilter]
  );

  const handleProjectClick = (projectId: number) => {
  navigate(`/project-details/${projectId}`);
};


  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white -mt-48 relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
            >
              {headerText.split(" ").slice(0, -1).join(" ") || "Our"}{" "}
              <span className="text-secondary">{headerText.split(" ").slice(-1)[0]}</span>
            </h2>
          </div>

          <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed max-w-3xl mx-auto mb-12">
            Explore our diverse collection of interior design projects that showcase our
            commitment to excellence, creativity, and client satisfaction.
          </p>

          {/* Filters */}
          <div ref={filtersRef} className="flex flex-wrap justify-center gap-4 mb-12">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-full text-sm font-medium [font-family:'Fahkwang',Helvetica] transition-all duration-300 hover:scale-105 ${
                  activeFilter === filter
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-100 text-[#626161] hover:bg-gray-200 hover:text-[#01190c]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* First-load skeleton */}
        {projects.length === 0 && loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-gray-100 aspect-[4/3] animate-pulse" />
            ))}
          </div>
        )}

        {/* First-load error */}
        {err && projects.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-red-700 bg-red-50 border border-red-200 inline-block px-4 py-2 rounded-lg">
              {err}
            </p>
          </div>
        )}

        {/* Grid */}
        {projects.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="relative overflow-hidden rounded-3xl aspect-[4/3] transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl">
                    <img
                      src={project.image.primary}
                      alt={`${project.title} image`}
                      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.dataset.fallback !== "done") {
                          img.dataset.fallback = "done";
                          img.src = project.image.fallback;
                        } else {
                          img.src = "/create-an-image-for-interior-design-about-us-section.png";
                        }
                      }}
                    />
                    <div
                      className="absolute inset-0 bg-black/60 transition-all duration-500 ease-out flex flex-col justify-end p-6"
                      style={{
                        opacity: hoveredProject === project.id ? 1 : 0,
                        transform:
                          hoveredProject === project.id ? "translateY(0)" : "translateY(20px)",
                      }}
                    >
                      <div className="absolute top-6 left-6">
                        <span
                          className="px-3 py-1.5 rounded-full text-xs font-semibold text-white [font-family:'Fahkwang',Helvetica] backdrop-blur-md border border-white/20"
                          style={{ backgroundColor: getCategoryColor(project.category) }}
                        >
                          {project.category}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0">
                        <div
                          className="p-6 pt-12"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                          }}
                        >
                          <h3 className="text-xl md:text-2xl font-bold text-white [font-family:'Fahkwang',Helvetica] leading-tight">
                            {project.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Sentinel (kept just above the count) */}
        <div ref={loadMoreRef} className="h-4 w-full" />

        {/* Load-more feedback */}
        {projects.length > 0 && (
          <div className="flex items-center justify-center mt-6 min-h-[32px]">
            {loading && <div className="text-sm text-[#626161]">Loading more…</div>}
            {!loading && !hasMore && (
              <div className="text-sm text-[#626161]">You’ve reached the end.</div>
            )}
            {!loading && err && (
              <button
                onClick={() => fetchPage(page + 1, false)}
                className="text-sm text-red-700 underline"
              >
                Retry loading more
              </button>
            )}
          </div>
        )}

        {/* Count */}
        {projects.length > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
              Showing {projects.length}
              {typeof totalCount === "number" ? ` of ${totalCount}` : ""} project
              {(totalCount ?? projects.length) !== 1 ? "s" : ""}
              {activeFilter !== "All" ? ` in ${activeFilter}` : ""}
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        * { transition-property: transform, opacity, background-color, border-color, color, box-shadow; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
        button:focus-visible { outline: 2px solid #75bf44; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #75bf44; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #68ab3c; }
      `}</style>
    </section>
  );
};
