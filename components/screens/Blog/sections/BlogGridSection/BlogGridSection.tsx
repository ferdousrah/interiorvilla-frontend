'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Clock, User, ArrowRight, Calendar, Tag } from "lucide-react";

gsap.registerPlugin(SplitText);

const CMS_ORIGIN = "https://cms.interiorvillabd.com";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  featuredImage?: { url: string; alt?: string };
  category?: { title: string };
  publishedDate?: string;
}

interface ApiResponse {
  docs: BlogPost[];
  page?: number;
  nextPage?: number | null;
  totalDocs?: number;
  totalPages?: number;
}

const PAGE_SIZE = 3;

export const BlogGridSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchPage = useCallback(
    async (pageToLoad: number, replace: boolean, signal?: AbortSignal) => {
      if (pageToLoad === 1) setInitialLoading(true);
      setLoading(true);
      setErr(null);

      try {
        const url = new URL(`${CMS_ORIGIN}/api/blog-posts`);
        url.searchParams.set("limit", PAGE_SIZE.toString());
        url.searchParams.set("page", String(pageToLoad));
        url.searchParams.set("sort", "-publishedDate");

        const res = await fetch(url.toString(), { cache: "no-store", signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ApiResponse = await res.json();

        setPosts(prev =>
          replace ? (data.docs ?? []) : [...prev, ...(data.docs ?? [])]
        );
        setPage(data.page ?? pageToLoad);
        setHasMore(Boolean(data.nextPage));
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message || "Failed to load posts");
      } finally {
        setLoading(false);
        if (pageToLoad === 1) setInitialLoading(false);
      }
    },
    []
  );

  // ---------- Initial load (page 1 + 2) ----------
  useEffect(() => {
    const controller = new AbortController();
    setPosts([]);
    setPage(0);
    setHasMore(true);
    setErr(null);

    (async () => {
      await fetchPage(1, true, controller.signal);
      await fetchPage(2, false, controller.signal);
    })();

    return () => controller.abort();
  }, [fetchPage]);

  // ---------- Infinite scroll ----------
  useEffect(() => {
    if (page < 2 || !hasMore) return; // wait until page 2 is loaded
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
      rootMargin: "1200px 0px",
      threshold: 0,
    });

    io.observe(sentinel);

    return () => {
      io.disconnect();
      controller?.abort();
    };
  }, [page, hasMore, loading, fetchPage]);

  // ---------- Heading hover animation ----------
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

  const handleBlogDetailsClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Interior: "bg-primary text-white",
      "Home Decor": "bg-secondary text-white",
      Sustainability: "bg-green-500 text-white",
      "Color Theory": "bg-purple-500 text-white",
      "Kitchen Design": "bg-orange-500 text-white",
      "Workspace Design": "bg-blue-500 text-white",
    };
    return colors[category || ""] || "bg-gray-500 text-white";
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-white -mt-48 relative z-10 min-h-screen"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
            <div className="mx-3 [font-family:'Fahkwang',Helvetica] font-normal text-[#48515c] text-sm tracking-[0.90px]">
              LATEST INSIGHTS
            </div>
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
          </div>

          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
            style={{ transformStyle: "preserve-3d" }}
          >
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
            >
              Get Interesting Insights into{" "}
              <span className="text-secondary">Interior Designs</span>
            </h2>
          </div>

          <p className="text-lg [font-family:'Fahkwang',Helvetica] text-[#626161] max-w-3xl mx-auto leading-relaxed">
            Discover the latest trends, tips, and inspiration for creating beautiful spaces that reflect your unique style
          </p>
        </div>

        {/* Skeleton on first load */}
        {posts.length === 0 && initialLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl shimmer aspect-[4/3]" />
            ))}
          </div>
        )}

        {/* Grid */}
        {posts.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key="blog-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-12 md:mb-16"
            >
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                  onClick={() => handleBlogDetailsClick(post.slug)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={
                        post.featuredImage?.url
                          ? `${CMS_ORIGIN}${post.featuredImage.url}`
                          : "/placeholder.png"
                      }
                      alt={post.featuredImage?.alt || post.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />

                    {post.category?.title && (
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold [font-family:'Fahkwang',Helvetica] ${getCategoryColor(
                            post.category.title
                          )}`}
                        >
                          {post.category.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Admin</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {post.publishedDate
                              ? new Date(post.publishedDate).toDateString()
                              : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>5 min</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight transition-colors duration-300 group-hover:text-primary line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-sm leading-relaxed line-clamp-3">
                      {post.shortDescription}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm text-primary [font-family:'Fahkwang',Helvetica] font-medium group-hover:text-secondary transition-colors duration-300">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                      {post.category?.title && (
                        <div className="flex items-center space-x-1 text-xs text-[#626161]">
                          <Tag className="w-3 h-3" />
                          <span>{post.category.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}

              {/* Skeletons for load-more */}
              {loading && !initialLoading &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="rounded-2xl shimmer aspect-[4/3]" />
                ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Sentinel */}
        <div ref={loadMoreRef} className="h-4 w-full" />

        {/* End / Error feedback */}
        {posts.length > 0 && !loading && (
          <div className="flex items-center justify-center mt-6 min-h-[32px]">
            {!hasMore && (
              <div className="text-sm text-[#626161]">You’ve reached the end.</div>
            )}
            {err && (
              <button
                onClick={() => fetchPage(page + 1, false)}
                className="text-sm text-red-700 underline"
              >
                Retry loading more
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shimmer CSS */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            #f3f3f3 25%,
            #e0e0e0 50%,
            #f3f3f3 75%
          );
          background-size: 1000px 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </section>
  );
};
