'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, User, ArrowRight, Calendar, Tag } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CMS_ORIGIN = "https://cms.interiorvillabd.com";

interface BlogPost {
  id: number;
  title: string;
  slug?: string;
  shortDescription: string;
  featuredImage?: { url: string; alt?: string };
  category?: { title: string };
  publishedDate?: string;
  author?: string;
  readTime?: string;
}

interface ApiResponse {
  docs: BlogPost[];
  page?: number;
  nextPage?: number | null;
  totalDocs?: number;
  totalPages?: number;
}

const PAGE_SIZE = 6;

export const BlogGridSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);

  const navigate = useNavigate();

  // Fallback blog posts for when API is not available
  const fallbackPosts: BlogPost[] = [
    {
      id: 1,
      title: "Small Space, Big Impact: Interior Design Hacks for Compact Living",
      shortDescription: "Discover clever design strategies to maximize your small space and create a home that feels spacious, organized, and stylish.",
      featuredImage: { url: "/a-residential-interior-image.png", alt: "Small space interior design" },
      category: { title: "Interior Design" },
      publishedDate: "2024-12-15",
      author: "Admin",
      readTime: "5 min"
    },
    {
      id: 2,
      title: "Sustainable Chic: Eco-Friendly Interior Design Ideas You'll Love",
      shortDescription: "Learn how to create beautiful, environmentally conscious interiors using sustainable materials and eco-friendly design principles.",
      featuredImage: { url: "/create-an-image-where-a-beautiful-girl-shows-her-bedroom-interio.png", alt: "Eco-friendly bedroom design" },
      category: { title: "Sustainability" },
      publishedDate: "2024-12-14",
      author: "Admin",
      readTime: "7 min"
    },
    {
      id: 3,
      title: "The Psychology of Color in Interior Design",
      shortDescription: "Explore how different colors affect mood and atmosphere in your home, and learn to choose the perfect palette for each room.",
      featuredImage: { url: "/a-office-interior-image.png", alt: "Colorful interior design" },
      category: { title: "Color Theory" },
      publishedDate: "2024-12-13",
      author: "Admin",
      readTime: "6 min"
    },
    {
      id: 4,
      title: "Modern Kitchen Design Trends for 2025",
      shortDescription: "Stay ahead of the curve with the latest kitchen design trends that combine functionality with stunning aesthetics.",
      featuredImage: { url: "/dining-interior.png", alt: "Modern kitchen design" },
      category: { title: "Kitchen Design" },
      publishedDate: "2024-12-12",
      author: "Admin",
      readTime: "8 min"
    },
    {
      id: 5,
      title: "Creating the Perfect Home Office: Design Tips for Productivity",
      shortDescription: "Transform your workspace into a productive and inspiring environment with these professional interior design tips.",
      featuredImage: { url: "/rectangle-8.png", alt: "Home office design" },
      category: { title: "Workspace Design" },
      publishedDate: "2024-12-11",
      author: "Admin",
      readTime: "6 min"
    },
    {
      id: 6,
      title: "Luxury Living: High-End Interior Design Elements",
      shortDescription: "Discover the key elements that define luxury interior design and how to incorporate them into your own home.",
      featuredImage: { url: "/rectangle-9.png", alt: "Luxury interior design" },
      category: { title: "Luxury Design" },
      publishedDate: "2024-12-10",
      author: "Admin",
      readTime: "9 min"
    },
    {
      id: 7,
      title: "Minimalist Design: Less is More in Modern Interiors",
      shortDescription: "Embrace the beauty of simplicity with minimalist design principles that create calm, clutter-free spaces.",
      featuredImage: { url: "/a-residential-interior-image.png", alt: "Minimalist interior" },
      category: { title: "Minimalism" },
      publishedDate: "2024-12-09",
      author: "Admin",
      readTime: "4 min"
    },
    {
      id: 8,
      title: "Smart Home Integration in Interior Design",
      shortDescription: "Learn how to seamlessly integrate smart home technology into your interior design for a modern lifestyle.",
      featuredImage: { url: "/a-office-interior-image.png", alt: "Smart home interior" },
      category: { title: "Technology" },
      publishedDate: "2024-12-08",
      author: "Admin",
      readTime: "7 min"
    }
  ];

  const fetchPage = useCallback(
    async (pageToLoad: number, replace: boolean, signal?: AbortSignal) => {
      setLoading(true);
      setErr(null);

      try {
        // Try to fetch from API first
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
        } catch (apiError) {
          console.warn('API not available, using fallback data:', apiError);
          
          // Use fallback data with pagination simulation
          const startIndex = (pageToLoad - 1) * PAGE_SIZE;
          const endIndex = startIndex + PAGE_SIZE;
          const pageData = fallbackPosts.slice(startIndex, endIndex);
          
          setPosts(prev => replace ? pageData : [...prev, ...pageData]);
          setPage(pageToLoad);
          setHasMore(endIndex < fallbackPosts.length);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    },
    [fallbackPosts]
  );

  // ---------- Initial load ----------
  useEffect(() => {
    const controller = new AbortController();
    setPosts([]);
    setPage(0);
    setHasMore(true);
    setErr(null);

    fetchPage(1, true, controller.signal);

    return () => controller.abort();
  }, [fetchPage]);

  // ---------- Infinite scroll ----------
  useEffect(() => {
    if (page < 1 || !hasMore || loading) return;
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
      rootMargin: "100px 0px",
      threshold: 0,
    });

    io.observe(sentinel);

    return () => {
      io.disconnect();
      controller?.abort();
    };
  }, [page, hasMore, loading, fetchPage]);

  // ---------- GSAP Animations ----------
  useEffect(() => {
    if (!sectionRef.current) return;

    // Header animation
    if (headingRef.current) {
      gsap.fromTo(headingRef.current,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 55%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Grid animation
    if (gridRef.current) {
      const posts = gridRef.current.children;
      
      gsap.fromTo(posts,
        {
          opacity: 0,
          y: 80,
          scale: 0.9
        },
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
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [posts.length]);

  const handleBlogDetailsClick = (post: BlogPost) => {
    if (post.slug) {
      navigate(`/blog/${post.slug}`);
    } else {
      navigate('/blog-details');
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      "Interior Design": "bg-primary text-white",
      "Home Decor": "bg-secondary text-white",
      Sustainability: "bg-green-500 text-white",
      "Color Theory": "bg-purple-500 text-white",
      "Kitchen Design": "bg-orange-500 text-white",
      "Workspace Design": "bg-blue-500 text-white",
      "Luxury Design": "bg-purple-600 text-white",
      Minimalism: "bg-gray-600 text-white",
      Technology: "bg-indigo-500 text-white",
      "Seasonal Design": "bg-pink-500 text-white",
    };
    return colors[category || ""] || "bg-gray-500 text-white";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Dec 15, 2024";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Dec 15, 2024";
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-white -mt-48 relative z-10"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            ref={headingRef}
            className="text-2xl md:text-3xl lg:text-4xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] mb-6"
          >
            Get Interesting Insights into{" "}
            <span className="text-secondary">Interior Designs</span>
          </h2>

          <p className="text-lg [font-family:'Fahkwang',Helvetica] text-[#626161] max-w-3xl mx-auto leading-relaxed">
            Discover the latest trends, tips, and inspiration for creating beautiful spaces that reflect your unique style
          </p>
        </div>

        {/* Loading state for initial load */}
        {posts.length === 0 && loading && (
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

        {/* Error state */}
        {err && posts.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 [font-family:'Fahkwang',Helvetica] mb-4">
                Unable to load blog posts: {err}
              </p>
              <Button 
                onClick={() => fetchPage(1, true)}
                className="bg-primary text-white px-6 py-2 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium hover:bg-primary-hover"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Grid */}
        {posts.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16"
            >
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredPost(post.id)}
                  onMouseLeave={() => setHoveredPost(null)}
                  onClick={() => handleBlogDetailsClick(post)}
                >
                  {/* Blog Post Image */}
                  <div className="relative overflow-hidden rounded-lg mb-6 bg-gray-200 aspect-[4/3]">
                    <img
                      src={
                        post.featuredImage?.url
                          ? (post.featuredImage.url.startsWith('http') 
                              ? post.featuredImage.url 
                              : `${CMS_ORIGIN}${post.featuredImage.url}`)
                          : "/a-residential-interior-image.png"
                      }
                      alt={post.featuredImage?.alt || post.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading={index < 4 ? "eager" : "lazy"}
                    />
                    
                    {/* Category Badge */}
                    {post.category?.title && (
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold [font-family:'Fahkwang',Helvetica] ${getCategoryColor(post.category.title)}`}>
                          {post.category.title}
                        </span>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div 
                      className="absolute inset-0 transition-all duration-500"
                      style={{
                        background: hoveredPost === post.id 
                          ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(117, 191, 68, 0.2) 100%)'
                          : 'transparent',
                        opacity: hoveredPost === post.id ? 1 : 0
                      }}
                    />
                  </div>

                  {/* Blog Post Content */}
                  <div className="space-y-4">
                    {/* Meta Information */}
                    <div className="flex items-center space-x-4 text-sm text-[#626161] [font-family:'Fahkwang',Helvetica]">
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

                    {/* Title */}
                    <h3 
                      className="text-xl md:text-2xl font-medium [font-family:'Fahkwang',Helvetica] text-[#01190c] leading-tight transition-colors duration-300 group-hover:text-primary"
                    >
                      {post.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[#626161] [font-family:'Fahkwang',Helvetica] leading-relaxed line-clamp-3">
                      {post.shortDescription}
                    </p>

                    {/* Read More Link */}
                    <div className="flex items-center space-x-2 text-sm text-primary [font-family:'Fahkwang',Helvetica] font-medium group-hover:text-secondary transition-colors duration-300">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={loadMoreRef} className="h-4 w-full" />

        {/* Loading indicator */}
        {posts.length > 0 && loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#626161] [font-family:'Fahkwang',Helvetica]">Loading more posts...</span>
            </div>
          </div>
        )}

        {/* End / Error feedback */}
        {posts.length > 0 && !loading && (
          <div className="flex items-center justify-center mt-6 min-h-[32px]">
            {!hasMore && (
              <div className="text-center">
                <div className="text-sm text-[#626161] [font-family:'Fahkwang',Helvetica] mb-4">
                  You've reached the end of our blog posts.
                </div>
                <Button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-primary text-white px-6 py-2 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium hover:bg-primary-hover transition-colors duration-300"
                >
                  Back to Top
                </Button>
              </div>
            )}
            {err && (
              <button
                onClick={() => fetchPage(page + 1, false)}
                className="text-sm text-red-700 underline [font-family:'Fahkwang',Helvetica]"
              >
                Retry loading more
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {posts.length === 0 && !loading && !err && (
          <div className="text-center py-16">
            <div className="text-[#626161] [font-family:'Fahkwang',Helvetica] text-lg mb-4">
              No blog posts available at the moment.
            </div>
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-primary text-white px-6 py-3 rounded-lg [font-family:'Fahkwang',Helvetica] font-medium hover:bg-primary-hover transition-colors duration-300"
            >
              Contact Us for Updates
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};