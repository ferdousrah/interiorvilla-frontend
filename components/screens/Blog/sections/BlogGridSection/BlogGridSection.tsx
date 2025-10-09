'use client';
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../ui/button";
import { Clock, User, ArrowRight, Calendar } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.defaults({ invalidateOnRefresh: true });

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  featuredImage?: {
    url?: string;
    alt?: string;
    sizes?: {
      small?: { url: string };
      medium?: { url: string };
      blur?: { url: string };
    };
  };
  category?: { title: string };
  publishedDate?: string;
  author?: string;
  readTime?: string;
}

const CMS_ORIGIN = "https://interiorvillabd.com";
const PAGE_SIZE = 2;

function waitForImages(container: HTMLElement | null, timeoutMs = 2000) {
  if (!container) return Promise.resolve();
  const imgs = Array.from(container.querySelectorAll("img"));
  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const timer = setTimeout(finish, timeoutMs);
    let left = pending.length;
    const onOne = () => {
      left -= 1;
      if (left <= 0) {
        clearTimeout(timer);
        finish();
      }
    };
    pending.forEach((img) => {
      img.addEventListener("load", onOne, { once: true });
      img.addEventListener("error", onOne, { once: true });
    });
  });
}

export const BlogGridSection = (): JSX.Element => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchingRef = useRef<boolean>(false);
  const headingSplitRef = useRef<SplitText | null>(null);
  const navigate = useNavigate();

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const formatDate = (date?: string) =>
    !date
      ? "—"
      : new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

  /* ---------------- FETCH LOGIC ---------------- */
  const fetchPage = useCallback(
    async (pageToLoad: number, replace = false, signal?: AbortSignal) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(
          `${CMS_ORIGIN}/api/blog-posts?page=${pageToLoad}&limit=${PAGE_SIZE}`,
          { signal }
        );
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const data = await res.json();
        if (!Array.isArray(data.docs)) throw new Error("Invalid data");

        setPosts((prev) => {
          const combined = replace ? data.docs : [...prev, ...data.docs];
          return combined.filter(
            (post, index, self) =>
              index === self.findIndex((p) => p.slug === post.slug)
          );
        });
        setHasMore(!!data.hasNextPage);
        setPage(pageToLoad);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error fetching posts:", err);
          setErr(err.message || "Failed to load");
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    []
  );

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    const controller = new AbortController();
    fetchPage(1, true, controller.signal);
    return () => {
      controller.abort();
      fetchingRef.current = false;
    };
  }, [fetchPage]);

  /* ---------------- INFINITE SCROLL ---------------- */
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !fetchingRef.current) {
          fetchPage(page + 1, false);
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, hasMore, loading, fetchPage]);

  /* ---------------- GSAP SETUP ---------------- */
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await waitForImages(sectionRef.current, 2500);
      if (cancelled) return;
      ScrollTrigger.getAll().forEach((t) => t.kill());

      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 80, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (!headingSplitRef.current && headingRef.current && headingWrapperRef.current) {
        const split = new SplitText(headingRef.current, { type: "chars,words" });
        headingSplitRef.current = split;
        const wrapper = headingWrapperRef.current;
        const move = (e: MouseEvent) => {
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
        const leave = () => {
          gsap.to(split.chars, {
            duration: 1,
            y: 0,
            x: 0,
            rotationY: 0,
            rotationX: 0,
            ease: "elastic.out(1,0.3)",
            stagger: { amount: 0.3, from: "center" },
          });
        };
        wrapper.addEventListener("mousemove", move);
        wrapper.addEventListener("mouseleave", leave);
        (headingSplitRef as any).cleanup = () => {
          wrapper.removeEventListener("mousemove", move);
          wrapper.removeEventListener("mouseleave", leave);
          split.revert();
          headingSplitRef.current = null;
        };
      }

      requestAnimationFrame(() => setTimeout(() => ScrollTrigger.refresh(true), 120));
    };
    run();
    return () => {
      cancelled = true;
      if ((headingSplitRef as any).cleanup) {
        (headingSplitRef as any).cleanup();
        (headingSplitRef as any).cleanup = undefined;
      }
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [posts.length]);

  const handleBlogDetailsClick = (slug: string) => navigate(`/blog/${slug}`);

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Interior: "bg-primary text-white",
      Sustainability: "bg-green-500 text-white",
      "Color Theory": "bg-purple-500 text-white",
      "Kitchen Design": "bg-orange-500 text-white",
      "Workspace Design": "bg-blue-500 text-white",
      "Luxury Design": "bg-purple-600 text-white",
    };
    return colors[category || ""] || "bg-gray-500 text-white";
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-white relative">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
            <div className="mx-3 font-fahkwang text-[#48515c] text-sm tracking-[0.9px]">
              LATEST INSIGHTS
            </div>
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
          </div>
          <div ref={headingWrapperRef} className="perspective-[1000px] cursor-default">
            <h2
              ref={headingRef}
              className="text-2xl md:text-3xl lg:text-4xl font-medium font-fahkwang text-[#01190c] mb-6"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
            >
              Get Interesting Insights into{" "}
              <span className="text-secondary">Interior Designs</span>
            </h2>
          </div>
          <p className="text-lg font-fahkwang text-[#626161] max-w-3xl mx-auto leading-relaxed">
            Discover the latest trends, tips, and inspiration for creating beautiful spaces
            that reflect your unique style.
          </p>
        </div>

        {/* Posts grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16"
        >
          {posts.map((post, index) => {
            const img =
              post.featuredImage?.sizes?.medium?.url ||
              post.featuredImage?.sizes?.small?.url ||
              post.featuredImage?.url ||
              "/a-residential-interior-image.png";
            const imgSrc = img.startsWith("http") ? img : `${CMS_ORIGIN}${img}`;
            const blur =
              post.featuredImage?.sizes?.blur?.url &&
              `${CMS_ORIGIN}${post.featuredImage.sizes.blur.url}`;

            return (
              <motion.article
                key={`blog-${post.slug}-${post.id ?? index}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                style={{ willChange: "transform, opacity" }}
                onClick={() => handleBlogDetailsClick(post.slug)}
              >
                <div className="relative overflow-hidden rounded-lg mb-6 aspect-[4/3] bg-gray-200">
                  {blur && (
                    <img
                      src={blur}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-md scale-105"
                      aria-hidden="true"
                    />
                  )}
                  <img
                    src={imgSrc.replace(/\.(jpg|jpeg|png)$/i, ".webp")}
                    onError={(e) => (e.currentTarget.src = imgSrc)}
                    alt={post.featuredImage?.alt || post.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading={index < PAGE_SIZE ? "eager" : "lazy"}
                    decoding="async"
                  />
                  {post.category?.title && (
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold font-fahkwang ${getCategoryColor(
                          post.category.title
                        )}`}
                      >
                        {post.category.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-[#626161] font-fahkwang">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.author || "Admin"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.publishedDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime || "5 min"}</span>
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-medium font-fahkwang text-[#01190c] leading-tight transition-colors duration-300 group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="text-[#626161] font-fahkwang leading-relaxed line-clamp-3">
                    {post.shortDescription}
                  </p>

                  <div className="flex items-center space-x-2 text-sm text-primary font-fahkwang font-medium group-hover:text-secondary transition-colors duration-300">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div ref={loadMoreRef} className="h-4 w-full" />
        {!hasMore && <div className="h-24 md:h-40" />}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={`skeleton-${page}-${i}`} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-[4/3] mb-6" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasMore && !loading && posts.length > 0 && (
          <div className="text-center">
            <div className="text-sm text-[#626161] font-fahkwang mb-4">
              You've reached the end of our blog posts.
            </div>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-primary text-white px-6 py-2 rounded-lg font-fahkwang font-medium hover:bg-primary-hover transition-colors duration-300"
            >
              Back to Top
            </Button>
          </div>
        )}

        {err && !loading && (
          <div className="text-center mt-4">
            <button
              onClick={() => fetchPage(page + 1, false)}
              className="text-sm text-red-700 underline font-fahkwang"
            >
              Retry loading more
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
