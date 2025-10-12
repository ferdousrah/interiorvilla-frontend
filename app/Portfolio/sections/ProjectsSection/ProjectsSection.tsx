'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(SplitText);

/* ---------------- CMS helpers ----------------  */
const CMS_ORIGIN = 'https://interiorvillabd.com';
const MEDIA_BASE = `${CMS_ORIGIN}/api/media/file/`;

const absolutize = (u: string) =>
  /^https?:\/\//i.test(u) ? u : new URL(u, CMS_ORIGIN).href;

type ImgSrcs = { primary: string; fallback: string; blur?: string };

/* ---------------- smarter image resolver ---------------- */
const resolveFeaturedImage = (fi: any): ImgSrcs => {
  const placeholder = '/placeholder.webp';
  if (!fi) return { primary: placeholder, fallback: placeholder };

  const pick = (raw?: string): ImgSrcs => {
    if (!raw) return { primary: placeholder, fallback: placeholder };
    const abs = absolutize(raw);
    const webp = abs.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
    return { primary: webp, fallback: abs };
  };

  // New adaptive: try small/medium from Payload’s sizes
  const mobile =
    fi?.sizes?.small?.url || fi?.sizes?.square?.url || fi?.sizes?.thumbnail?.url;
  const desktop =
    fi?.sizes?.medium?.url ||
    fi?.sizes?.large?.url ||
    fi?.sizes?.xlarge?.url ||
    fi?.url;

  return {
    primary: pick(desktop).primary,
    fallback: pick(desktop).fallback,
    blur: fi?.sizes?.blur?.url ? absolutize(fi.sizes.blur.url) : undefined,
  };
};

/* ---------------- Types ---------------- */
interface ProjectCard {
  id: number;
  category: string;
  title: string;
  slug: string;
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

/* ---------------- Filters ---------------- */
const filterOptions = [
  'All',
  'Residential Interior',
  'Commercial Interior',
  'Architectural Consultancy',
] as const;
type Filter = typeof filterOptions[number];

const API_BY_FILTER: Record<Filter, string> = {
  All: `${CMS_ORIGIN}/api/projects?sort=portfolioPosition`,
  'Residential Interior': `${CMS_ORIGIN}/api/projects?where[isResidential][equals]=true&sort=portfolioPosition`,
  'Commercial Interior': `${CMS_ORIGIN}/api/projects?where[isCommercial][equals]=true&sort=portfolioPosition`,
  'Architectural Consultancy': `${CMS_ORIGIN}/api/projects?where[isArchitectural][equals]=true&sort=portfolioPosition`,
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

  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const fetchingRef = useRef<boolean>(false);
  const navigate = useNavigate();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Residential Interior':
        return '#75BF44';
      case 'Commercial Interior':
        return '#EE5428';
      case 'Architectural Consultancy':
        return '#4F46E5';
      default:
        return '#75BF44';
    }
  };

  /* ---------- Fetch helper ---------- */
  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;

  const fetchPage = useCallback(
    async (pageToLoad: number, replace: boolean, signal?: AbortSignal) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      setErr(null);

      try {
        const base = API_BY_FILTER[activeFilterRef.current];
        const url = new URL(base);
        url.searchParams.set('depth', '1');
        url.searchParams.set('limit', PAGE_SIZE.toString());
        url.searchParams.set('page', String(pageToLoad));

        const res = await fetch(url.toString(), { cache: 'no-store', signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ApiResponse = await res.json();

        const mapped: ProjectCard[] = (data.docs ?? []).map(
          (doc: any, i: number) => {
            const image = resolveFeaturedImage(doc?.featuredImage);
            const categoryText =
              doc?.category?.title ||
              doc?.category?.name ||
              (typeof doc?.category === 'string'
                ? doc.category
                : 'Project');

            const uniqueId = doc?.id
              ? Number(doc.id)
              : `${activeFilterRef.current}-${pageToLoad}-${i}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

            return {
              id: uniqueId,
              category: categoryText,
              title:
                doc?.title ||
                doc?.name ||
                `Project ${(pageToLoad - 1) * PAGE_SIZE + i + 1}`,
              slug: doc?.slug || '',
              description:
                doc?.shortDescription || doc?.description || '',
              image,
              year: doc?.year || '',
              client: doc?.client || '',
              area: doc?.area || '',
              tags: Array.isArray(doc?.tags) ? doc.tags : [],
            };
          }
        );

        setProjects((prev) => {
          if (replace) return mapped;
          const existingSlugs = new Set(prev.map(p => p.slug));
          const newProjects = mapped.filter(p => !existingSlugs.has(p.slug));
          return [...prev, ...newProjects];
        });
        setPage(data.page ?? pageToLoad);
        setHasMore(
          Boolean(data.nextPage) ||
            (typeof data.totalPages === 'number'
              ? (data.page ?? pageToLoad) < data.totalPages
              : mapped.length === PAGE_SIZE)
        );
        if (typeof data.totalDocs === 'number')
          setTotalCount(data.totalDocs);
      } catch (e: any) {
        if (e?.name !== 'AbortError')
          setErr(e?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    []
  );

  /* ---------- reset on filter ---------- */
  useEffect(() => {
    const controller = new AbortController();
    setProjects([]);
    setPage(0);
    setHasMore(true);
    setTotalCount(null);
    setErr(null);
    fetchingRef.current = false;
    fetchPage(1, true, controller.signal);
    return () => controller.abort();
  }, [activeFilter, fetchPage]);

  /* ---------- Infinite scroll ---------- */
  useEffect(() => {
    if (page < 1 || !hasMore || loading) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const onIntersect: IntersectionObserverCallback = (entries) => {
      if (entries[0].isIntersecting && hasMore && !loading && !fetchingRef.current) {
        fetchPage(page + 1, false);
      }
    };

    const io = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: '300px',
      threshold: 0.1,
    });
    io.observe(sentinel);
    return () => io.disconnect();
  }, [page, hasMore, loading, fetchPage]);

  /* ---------- Heading hover ---------- */
  useEffect(() => {
    if (!headingRef.current || !headingWrapperRef.current) return;
    const splitText = new SplitText(headingRef.current, { type: 'chars,words' });
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
        ease: 'power2.out',
        stagger: { amount: 0.3, from: 'center' },
      });
    };

    const handleMouseLeave = () => {
      gsap.to(splitText.chars, {
        duration: 1,
        y: 0,
        x: 0,
        rotationY: 0,
        rotationX: 0,
        ease: 'elastic.out(1, 0.3)',
        stagger: { amount: 0.3, from: 'center' },
      });
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
      splitText.revert();
    };
  }, []);

  const headerText = useMemo(
    () => (activeFilter === 'All' ? 'Our Portfolio' : `${activeFilter}`),
    [activeFilter]
  );

  const handleProjectClick = (slug: string) => {
    navigate(`/portfolio/project-details/${slug}`);
  };

  /* ---------------- Render ---------------- */
  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white -mt-48 relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-8"
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
            >
              {headerText.split(' ').slice(0, -1).join(' ') || 'Our'}{' '}
              <span className="text-secondary">
                {headerText.split(' ').slice(-1)[0]}
              </span>
            </h2>
          </div>

          <p className="text-base [font-family:'Fahkwang',Helvetica] text-[#626161] leading-relaxed max-w-3xl mx-auto mb-12">
            Explore our diverse collection of interior design projects that showcase
            creativity, craftsmanship, and client satisfaction.
          </p>

          {/* Filters */}
          <div ref={filtersRef} className="flex flex-wrap justify-center gap-4 mb-12">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  activeFilter === filter
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 text-[#626161] hover:bg-gray-200 hover:text-[#01190c]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
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
            {projects.map((project, i) => (
              <motion.div
                key={`${activeFilter}-${project.slug || project.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                onClick={() => handleProjectClick(project.slug)}
              >
                <div className="relative overflow-hidden rounded-3xl aspect-[4/3] transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl">
                  <picture>
                    <source
                      srcSet={project.image.primary}
                      type="image/webp"
                    />
                    <img
                      src={project.image.fallback}
                      alt={project.title}
                      loading={i < 2 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                      style={{
                        filter: project.image.blur ? `blur(10px)` : 'none',
                        opacity: 1,
                      }}
                      onLoad={(e) => {
                        const el = e.currentTarget;
                        el.style.filter = 'none';
                        el.style.transition = 'filter 0.4s ease';
                      }}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.src = '/placeholder.webp';
                      }}
                    />
                  </picture>

                  <div
                    className="absolute inset-0 bg-black/60 transition-all duration-500 ease-out flex flex-col justify-end p-6"
                    style={{
                      opacity: hoveredProject === project.id ? 1 : 0,
                      transform:
                        hoveredProject === project.id
                          ? 'translateY(0)'
                          : 'translateY(20px)',
                    }}
                  >
                    <div className="absolute top-6 left-6">
                      <span
                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md border border-white/20"
                        style={{ backgroundColor: getCategoryColor(project.category) }}
                      >
                        {project.category}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                        {project.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Sentinel */}
        <div ref={loadMoreRef} className="h-8 w-full" />

        {/* Feedback */}
        {loading && (
          <div className="text-center text-sm text-[#626161] mt-4">
            Loading more…
          </div>
        )}
        {!loading && !hasMore && (
          <div className="text-center text-sm text-[#626161] mt-4">
            You've reached the end.
          </div>
        )}
      </div>
    </section>
  );
};
