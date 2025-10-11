import { ArrowRightIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../../../ui/button";
import { Card, CardContent } from "../../../../ui/card";
import { PerformanceImage } from "../../../../ui/performance-image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger, SplitText);

const CMS_ORIGIN = "https://interiorvillabd.com";

interface ImageSize {
  url: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  featuredImage?: {
    url: string;
    alt?: string;
    sizes?: {
      thumbnail?: ImageSize;
      small?: ImageSize;
      medium?: ImageSize;
      large?: ImageSize;
      square?: ImageSize;
      blur?: ImageSize;
    };
  };
  publishedDate?: string;
}

export const BlogSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingWrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------- Fetch latest posts ---------- */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${CMS_ORIGIN}/api/blog-posts?limit=3&sort=-publishedDate&depth=2`
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

  /* ---------- Section title hover animation ---------- */
  useEffect(() => {
    if (!headingRef.current || !headingWrapperRef.current) return;
    const split = new SplitText(headingRef.current, { type: "chars" });
    const wrapper = headingWrapperRef.current;

    const handleMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      gsap.to(split.chars, {
        duration: 0.4,
        y: (i) => (y - 0.5) * 15 * Math.sin((i + 1) * 0.5),
        x: (i) => (x - 0.5) * 15 * Math.cos((i + 1) * 0.5),
        rotationY: (x - 0.5) * 25,
        rotationX: (y - 0.5) * -25,
        ease: "power2.out",
        stagger: { amount: 0.25, from: "center" },
      });
    };

    const handleLeave = () => {
      gsap.to(split.chars, {
        duration: 1,
        y: 0,
        x: 0,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.4)",
        stagger: { amount: 0.2, from: "center" },
      });
    };

    wrapper.addEventListener("mousemove", handleMove);
    wrapper.addEventListener("mouseleave", handleLeave);
    return () => {
      wrapper.removeEventListener("mousemove", handleMove);
      wrapper.removeEventListener("mouseleave", handleLeave);
      split.revert();
    };
  }, []);

  const handleReadMoreClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const getImageUrl = (image?: BlogPost["featuredImage"]) => {
  if (!image) return "/a-residential-interior-image.webp";

  // Prefer medium → small → original
  const sizeUrl =
    image?.sizes?.small?.url ||
    image?.sizes?.square?.url ||
    image?.url ||
    "";

  // ✅ Normalize the domain from cms → public
  const normalized = sizeUrl.replace(
    "https://cms.interiorvillabd.com",
    "https://interiorvillabd.com"
  );

  return normalized;
};


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
    <section ref={sectionRef} className="w-full py-20 bg-[#f7f9fb] relative">
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-20">
          <div className="flex items-center justify-center mb-3">
            <div className="w-1 h-[25px] bg-primary rounded-sm" />
            <div className="mx-3 font-normal text-[#48515c] text-sm tracking-[0.9px]">
              BLOG
            </div>
            <div className="w-1 h-[25px] bg-primary rounded-sm" />
          </div>
          <div ref={headingWrapperRef} className="cursor-default perspective-[1000px]">
            <h2
              ref={headingRef}
              className="font-medium text-[40px] text-center leading-[62px] mb-6"
            >
              <span className="text-[#0d1529]">Latest </span>
              <span className="text-secondary">Stories</span>
            </h2>
          </div>
        </div>

        {/* Featured Blog */}
        {featured && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
            <div className="lg:w-1/2">
              <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-500 aspect-[16/10]">
                <PerformanceImage
                  className="w-full h-full object-cover rounded-lg"
                  alt={featured.featuredImage?.alt || featured.title}
                  src={getImageUrl(featured.featuredImage)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 900px"
                  loading="lazy"
                  placeholder="blur"
                />

              </div>
            </div>
            <div className="lg:w-1/2 flex flex-col justify-center">
              <div className="mb-3 text-xs text-[#48515c]">
                {featured.publishedDate
                  ? new Date(featured.publishedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}{" "}
                | 5 MIN READ
              </div>
              <h3 className="text-[#0d1529] text-[32px] leading-[48px] mb-4 font-semibold">
                {featured.title}
              </h3>
              <p className="text-[#48515c] text-sm leading-6 mb-6">
                {featured.shortDescription}
              </p>
              <Button
                className="bg-primary rounded-[25px] h-9 px-6 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary-hover"
                onClick={() => handleReadMoreClick(featured.slug)}
                aria-label={`Read more about ${featured.title}`}
              >
                <span className="font-bold text-white text-xs">READ MORE</span>
                <div className="w-[26px] h-[26px] bg-white rounded-full flex items-center justify-center">
                  <ArrowRightIcon className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Blog Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {others.map((post) => (
            <Card
              key={post.id}
              onMouseEnter={() => setHoveredCard(post.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`bg-white rounded-3xl border-none transition-all duration-500 shadow-md ${
                hoveredCard === post.id ? "hover:shadow-xl hover:-translate-y-1" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="mb-4 text-xs text-[#48515c]">
                  {post.publishedDate
                    ? new Date(post.publishedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}{" "}
                  | 5 MIN READ
                </div>
                <h3 className="text-[#0d1529] text-xl md:text-2xl mb-6 leading-tight">
                  {post.title}
                </h3>
                <Button
                  className="bg-primary rounded-[25px] h-10 px-8 transition-all duration-300 hover:bg-primary-hover hover:scale-105"
                  onClick={() => handleReadMoreClick(post.slug)}
                >
                  <span className="font-bold text-white text-xs">READ MORE</span>
                  <div className="w-[28px] h-[28px] bg-white rounded-full ml-3 flex items-center justify-center">
                    <ArrowRightIcon className="h-5 w-5 text-primary" />
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
