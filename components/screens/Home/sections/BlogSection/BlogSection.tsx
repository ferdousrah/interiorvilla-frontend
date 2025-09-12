import { ArrowRightIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "../../../../ui/badge";
import { Button } from "../../../../ui/button";
import { Card, CardContent } from "../../../../ui/card";
import { PerformanceImage } from "../../../../ui/performance-image";
import VanillaTilt from "vanilla-tilt";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, SplitText);

const CMS_ORIGIN = "https://cms.interiorvillabd.com";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  featuredImage?: { url: string; alt?: string };
  publishedDate?: string;
  category?: { title: string };
}

export const BlogSection = (): JSX.Element => {
  const imageRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const featuredPostRef = useRef<HTMLDivElement>(null);
  const featuredImageRef = useRef<HTMLDivElement>(null);
  const featuredContentRef = useRef<HTMLDivElement>(null);
  const blogCardsRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const backgroundElementsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch latest posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${CMS_ORIGIN}/api/blog-posts?limit=3&sort=-publishedDate&depth=1`
        );
        const data = await res.json();
        setPosts(data.docs || []);
      } catch (e) {
        console.error("Error fetching blog posts:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleReadMoreClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  // VanillaTilt for featured image
  useEffect(() => {
    if (imageRef.current) {
      VanillaTilt.init(imageRef.current, {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.3,
        scale: 1.1,
        transition: true,
        easing: "cubic-bezier(.03,.98,.52,.99)",
        perspective: 1000,
      });
    }
  }, []);

  // Hover animation for section title (SplitText)
  useEffect(() => {
    if (!headingRef.current) return;

    const splitText = new SplitText(headingRef.current, {
      type: "chars,words",
      charsClass: "char",
      wordsClass: "word",
    });

    if (headingWrapperRef.current) {
      const wrapper = headingWrapperRef.current;

      const handleMove = (e: MouseEvent) => {
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

      const handleLeave = () => {
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

      wrapper.addEventListener("mousemove", handleMove);
      wrapper.addEventListener("mouseleave", handleLeave);

      return () => {
        wrapper.removeEventListener("mousemove", handleMove);
        wrapper.removeEventListener("mouseleave", handleLeave);
        splitText.revert();
      };
    }
  }, []);

  if (loading || posts.length === 0) {
    return (
      <section className="py-20 bg-[#f7f9fb]">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse text-gray-500">Loading blogs…</div>
        </div>
      </section>
    );
  }

  const featured = posts[0];
  const others = posts.slice(1);

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 bg-[#f7f9fb] relative overflow-hidden"
    >
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col items-center mb-20">
          <div className="flex items-center justify-center mb-3">
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
            <div className="mx-3 font-normal text-[#48515c] text-sm text-center tracking-[0.90px]">
              BLOG
            </div>
            <div className="w-1 h-[25px] bg-primary rounded-sm"></div>
          </div>
          <div
            ref={headingWrapperRef}
            className="perspective-[1000px] cursor-default"
          >
            <h2
              ref={headingRef}
              className="font-medium text-[40px] text-center leading-[62px] mb-6"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(0)" }}
            >
              <span className="text-[#0d1529]">Latest </span>
              <span className="text-secondary">Stories</span>
            </h2>
          </div>
        </div>

        {/* Featured Blog Post */}
        {featured && (
          <div
            ref={featuredPostRef}
            className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12 md:mb-16"
          >
            <div className="lg:w-1/2">
              <div
                ref={featuredImageRef}
                className="relative overflow-hidden rounded-lg shadow-lg"
              >
                <PerformanceImage
                  ref={imageRef}
                  className="w-full h-auto object-cover rounded-lg transition-transform duration-500 ease-out hover:scale-110"
                  alt={featured.featuredImage?.alt || featured.title}
                  src={
                    featured.featuredImage?.url
                      ? `${CMS_ORIGIN}${featured.featuredImage.url}`
                      : "/a-residential-interior-image.png"
                  }
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={80}
                  placeholder="blur"
                />
              </div>
            </div>

            <div ref={featuredContentRef} className="lg:w-1/2">
              <div className="flex items-center mb-3">
                <Badge className="bg-primary border-[6px] border-primary/35 rounded-full h-10 w-10 flex items-center justify-center p-0">
                  <span className="text-white text-xs"></span>
                </Badge>
                <span className="ml-4 text-[#48515c] text-xs">
                  {featured.publishedDate
                    ? new Date(featured.publishedDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" }
                      )
                    : "—"}{" "}
                  | 5 MIN READ
                </span>
              </div>

              <h3 className="text-[#0d1529] text-[32px] leading-[51px] mb-6">
                {featured.title}
              </h3>

              <p className="text-[#48515c] text-sm leading-6 mb-8">
                {featured.shortDescription}
              </p>

              <Button
                className="bg-primary rounded-[25px] h-9 px-6 relative transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary-hover"
                onClick={() => handleReadMoreClick(featured.slug)}
              >
                <span className="font-bold text-white text-xs">READ MORE</span>
                <div className="w-[26px] h-[26px] bg-white rounded-full ml-3 flex items-center justify-center">
                  <ArrowRightIcon className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Other Blog Posts */}
        <div
          ref={blogCardsRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-8 md:mb-12"
        >
          {others.map((post, index) => (
            <Card
              key={post.id}
              ref={(el) => (cardRefs.current[index] = el)}
              className="bg-[#f7f9fb] rounded-3xl border-none transform-gpu transition-all duration-500 ease-out hover:scale-[1.02] h-full"
              onMouseEnter={() => setHoveredCard(post.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <div
                    className="mb-6 text-xs"
                    style={{
                      color: hoveredCard === post.id ? "#75bf44" : "#48515c",
                    }}
                  >
                    {post.publishedDate
                      ? new Date(post.publishedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}{" "}
                    | 5 MIN READ
                  </div>

                  <h3
                    className="text-[#0d1529] text-xl md:text-2xl leading-tight mb-8 transition-all duration-300"
                    style={{
                      transform:
                        hoveredCard === post.id ? "translateX(4px)" : "translateX(0)",
                      color: hoveredCard === post.id ? "#0a1420" : "#0d1529",
                    }}
                  >
                    {post.title}
                  </h3>

                  <Button
                    className="bg-primary rounded-[25px] h-10 px-8 relative transition-all duration-300 hover:bg-primary-hover hover:scale-105 mt-auto"
                    onClick={() => handleReadMoreClick(post.slug)}
                  >
                    <span className="font-bold text-white text-xs">READ MORE</span>
                    <div
                      className="w-[28px] h-[28px] bg-white rounded-full ml-3 flex items-center justify-center transition-transform duration-300"
                      style={{
                        transform:
                          hoveredCard === post.id ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      <ArrowRightIcon className="h-5 w-5 text-primary" />
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
