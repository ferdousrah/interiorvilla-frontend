import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../../ui/button";
import { Clock, User, ArrowRight, Calendar, Tag } from "lucide-react";
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
}

export const BlogGridSection = (): JSX.Element => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  // Fetch posts
  const fetchPosts = async (pageNum: number, limit = 6) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://cms.interiorvillabd.com/api/blog-posts?page=${pageNum}&limit=${limit}`
      );
      const data = await res.json();

      if (pageNum === 1) {
        setPosts(data.docs || []);
      } else {
        setPosts((prev) => [...prev, ...(data.docs || [])]);
      }

      setHasNextPage(data.hasNextPage);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch: load 6
  useEffect(() => {
    fetchPosts(1, 6);
  }, []);

  // Infinite scroll observer (only after 6 posts)
  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasNextPage || posts.length < 6) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, 3); // load 3 more per scroll
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => {
      if (loadMoreTriggerRef.current)
        observer.unobserve(loadMoreTriggerRef.current);
    };
  }, [page, hasNextPage, loading, posts]);

  // GSAP scroll animations
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
      const posts = gridRef.current.children;
      gsap.fromTo(
        posts,
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

  // GSAP SplitText hover animation for heading
  useEffect(() => {
    if (!headingRef.current) return;

    const splitText = new SplitText(headingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    if (headingWrapperRef.current) {
      headingWrapperRef.current.addEventListener("mousemove", (e) => {
        const rect = headingWrapperRef.current!.getBoundingClientRect();
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
      });

      headingWrapperRef.current.addEventListener("mouseleave", () => {
        gsap.to(splitText.chars, {
          duration: 1,
          y: 0,
          x: 0,
          rotationY: 0,
          rotationX: 0,
          ease: "elastic.out(1, 0.3)",
          stagger: { amount: 0.3, from: "center" },
        });
      });
    }

    return () => {
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
        {/* Header Section */}
        <div ref={headerRef} className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
            <div className="mx-3 [font-family:'Fahkwang',Helvetica] font-normal text-[#48515c] text-sm tracking-[0.90px]">
              LATEST INSIGHTS
            </div>
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
          </div>

          <div ref={headingWrapperRef} className="perspective-[1000px] cursor-default">
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

        {/* Blog Posts Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-12 md:mb-16"
        >
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
              onClick={() => handleBlogDetailsClick(post.slug)}
              style={{
                transform:
                  hoveredPost === post.id
                    ? "translateY(-8px) scale(1.02)"
                    : "translateY(0) scale(1)",
                boxShadow:
                  hoveredPost === post.id
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 25px rgba(117, 191, 68, 0.15)"
                    : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              {/* Blog Post Image */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={
                    post.featuredImage?.url
                      ? `https://cms.interiorvillabd.com${post.featuredImage.url}`
                      : "/placeholder.png"
                  }
                  alt={post.featuredImage?.alt || post.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />

                {/* Category Badge */}
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

                {/* Hover Overlay */}
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    background:
                      hoveredPost === post.id
                        ? "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(117, 191, 68, 0.2) 100%)"
                        : "transparent",
                    opacity: hoveredPost === post.id ? 1 : 0,
                  }}
                />

                {/* Read More Button Overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                  style={{
                    opacity: hoveredPost === post.id ? 1 : 0,
                    transform: hoveredPost === post.id ? "scale(1)" : "scale(0.8)",
                  }}
                >
                  <Button className="bg-white text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full px-6 py-2 font-semibold">
                    Read Article
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Blog Post Content */}
              <div className="p-6 space-y-4">
                {/* Meta Information */}
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

                {/* Title */}
                <h3 className="text-xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight transition-colors duration-300 group-hover:text-primary line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-sm leading-relaxed line-clamp-3">
                  {post.shortDescription}
                </p>

                {/* Read More Link */}
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
        </div>

        {/* Infinite Scroll Trigger */}
        {hasNextPage && posts.length >= 6 && (
          <div ref={loadMoreTriggerRef} className="h-10 flex justify-center items-center">
            {loading && <p>Loading...</p>}
          </div>
        )}
      </div>
    </section>
  );
};
