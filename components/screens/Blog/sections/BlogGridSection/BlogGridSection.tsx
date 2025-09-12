import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../ui/button";
import { Clock, User, ArrowRight, Calendar } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  featuredImage?: { url: string; alt?: string };
  category?: { title: string };
  publishedDate?: string;
  author?: string;
  readTime?: string;
}

const CMS_ORIGIN = "https://cms.interiorvillabd.com";
const PAGE_SIZE = 3;

export const BlogGridSection = (): JSX.Element => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchPage = useCallback(
    async (pageToLoad: number, replace = false, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(
          `${CMS_ORIGIN}/api/blog-posts?page=${pageToLoad}&limit=${PAGE_SIZE}`,
          { signal }
        );
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);

        const data = await res.json();

        setPosts((prev) =>
          replace ? data.docs || [] : [...prev, ...(data.docs || [])]
        );
        setHasMore(data.hasNextPage);
        setPage(pageToLoad);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Error fetching posts:", err);
          setErr(err.message || "Failed to load");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const controller = new AbortController();

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && hasMore) {
          fetchPage(page + 1, false, controller.signal);
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 }
    );

    io.observe(loadMoreRef.current);
    return () => io.disconnect();
  }, [page, hasMore, loading, fetchPage]);

  // Animations
  useEffect(() => {
    if (!sectionRef.current) return;

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
            end: "top 55%",
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
  }, [posts]);

  // SplitText hover animation
  useEffect(() => {
    if (!headingRef.current) return;

    const splitText = new SplitText(headingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    if (headingWrapperRef.current) {
      const wrapper = headingWrapperRef.current;
      const moveHandler = (e: MouseEvent) => {
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
      const leaveHandler = () => {
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
      wrapper.addEventListener("mousemove", moveHandler);
      wrapper.addEventListener("mouseleave", leaveHandler);

      return () => {
        wrapper.removeEventListener("mousemove", moveHandler);
        wrapper.removeEventListener("mouseleave", leaveHandler);
        splitText.revert();
      };
    }
  }, [posts.length]);

  const handleBlogDetailsClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

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
    <section ref={sectionRef} className="py-16 md:py-20 bg-white -mt-48 relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
            <div className="mx-3 font-fahkwang font-normal text-[#48515c] text-sm tracking-[0.90px]">
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
              Get Interesting Insights into <span className="text-secondary">Interior Designs</span>
            </h2>
          </div>
          <p className="text-lg font-fahkwang text-[#626161] max-w-3xl mx-auto leading-relaxed">
            Discover the latest trends, tips, and inspiration for creating beautiful spaces that reflect your unique
            style
          </p>
        </div>

        {/* Posts grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          {posts.length === 0 && loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-[4/3] mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            : posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredPost(post.id)}
                  onMouseLeave={() => setHoveredPost(null)}
                  onClick={() => handleBlogDetailsClick(post.slug)}
                >
                  <div className="relative overflow-hidden rounded-lg mb-6 bg-gray-200 aspect-[4/3]">
                    <img
                      src={
                        post.featuredImage?.url
                          ? post.featuredImage.url.startsWith("http")
                            ? post.featuredImage.url
                            : `${CMS_ORIGIN}${post.featuredImage.url}`
                          : "/a-residential-interior-image.png"
                      }
                      alt={post.featuredImage?.alt || post.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading={index < PAGE_SIZE ? "eager" : "lazy"}
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
              ))}
        </div>

        {/* Sentinel */}
        <div ref={loadMoreRef} className="h-4 w-full" />

        {/* Loading shimmer for more */}
        {loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-[4/3] mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* End / Error feedback */}
        {!hasMore && !loading && (
          <div className="text-center">
            <div className="text-sm text-[#626161] font-fahkwang mb-4">You've reached the end of our blog posts.</div>
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
