"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Clock, User, Calendar, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CMS_ORIGIN = "https://interiorvillabd.com";

/* ---------------- Lexical → HTML Renderer ---------------- */
function renderLexical(node: any): string {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(renderLexical).join("");

  switch (node.type) {
    case "root":
      return (node.children || []).map(renderLexical).join("");
    case "paragraph":
      return `<p>${(node.children || []).map(renderLexical).join("")}</p>`;
    case "text": {
      let text = node.text || "";
      if (node.format & 1) text = `<strong>${text}</strong>`;
      if (node.format & 2) text = `<em>${text}</em>`;
      if (node.format & 4) text = `<u>${text}</u>`;
      return text;
    }
    case "heading":
      return `<${node.tag || "h2"}>${(node.children || [])
        .map(renderLexical)
        .join("")}</${node.tag || "h2"}>`;
    case "quote":
      return `<blockquote>${(node.children || [])
        .map(renderLexical)
        .join("")}</blockquote>`;
    case "list": {
      const listTag = node.listType === "ordered" ? "ol" : "ul";
      return `<${listTag}>${(node.children || [])
        .map(renderLexical)
        .join("")}</${listTag}>`;
    }
    case "listitem":
      return `<li>${(node.children || []).map(renderLexical).join("")}</li>`;
    case "upload":
      if (node.value?.url) {
        return `<div class="my-6"><img src="${CMS_ORIGIN}${node.value.url}" alt="${
          node.value.alt || ""
        }" class="rounded-lg w-full h-auto"/></div>`;
      }
      return "";
    default:
      return (node.children || []).map(renderLexical).join("");
  }
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  featuredImage?: { url: string; alt?: string };
  category?: { id: number; title: string; slug: string };
  tags?: { id: string; tag: string }[];
  publishedDate?: string;
  fullContent?: any;
}

interface Category {
  id: number;
  title: string;
  slug: string;
}

export const BlogContentSection = (): JSX.Element => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  /* ---------------- Fetch Blog Post ---------------- */
  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();

    const fetchPost = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(
          `${CMS_ORIGIN}/api/blog-posts?where[slug][equals]=${slug}&depth=2`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPost(data.docs?.[0] || null);
      } catch (e: any) {
        if (e.name !== "AbortError")
          setErr(e.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    return () => controller.abort();
  }, [slug]);

  /* ---------------- Fetch Categories ---------------- */
  useEffect(() => {
    fetch(`${CMS_ORIGIN}/api/blog-categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.docs || []))
      .catch(() => {});
  }, []);

  /* ---------------- GSAP Animations ---------------- */
  useEffect(() => {
    if (!post) return;

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (sidebarRef.current) {
        gsap.fromTo(
          sidebarRef.current,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sidebarRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    // ✅ Refresh ScrollTrigger after content & images are loaded
    const refreshAfterImages = () => {
      const imgs = sectionRef.current?.querySelectorAll("img") || [];
      let loaded = 0;
      const total = imgs.length;
      if (total === 0) ScrollTrigger.refresh();
      imgs.forEach((img) => {
        img.addEventListener(
          "load",
          () => {
            loaded++;
            if (loaded === total) ScrollTrigger.refresh();
          },
          { once: true }
        );
      });
    };
    refreshAfterImages();

    // Small delayed refresh (in case of Lexical async hydration)
    const timeout = setTimeout(() => ScrollTrigger.refresh(), 800);

    return () => {
      ctx.revert();
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [post]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-15 bg-white relative z-10"
    >
      <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div ref={contentRef} className="lg:col-span-2">
          {loading && (
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          )}

          {err && <p className="text-red-600">{err}</p>}

          {post && (
            <>
              {/* Featured Image */}
              {post.featuredImage?.url && (
                <div className="mb-8 w-full h-[400px] bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={`${CMS_ORIGIN}${post.featuredImage.url}`}
                    alt={post.featuredImage.alt || post.title}
                    className="w-full h-full object-cover"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[#626161]">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Admin</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.publishedDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>5 min read</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-medium text-[#01190c] mb-8 leading-tight">
                {post.title}
              </h1>

              {/* Content */}
              <div
                className="prose prose-lg max-w-none text-[#626161] leading-relaxed text-justify"
                dangerouslySetInnerHTML={{
                  __html: renderLexical(post.fullContent?.root),
                }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm font-medium text-[#01190c]">
                      Tags:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 bg-[#f7f9fb] text-sm text-[#626161] rounded-full hover:bg-primary hover:text-white transition-colors duration-300 cursor-pointer"
                        >
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div ref={sidebarRef} className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-[#01190c] mb-6 uppercase tracking-wider">
              Categories
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => {
                const isActive = post?.category?.slug === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    to={`#`} // to={`/blog/category/${cat.slug}`}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-300 ${
                      isActive
                        ? "bg-primary text-white"
                        : "hover:bg-[#f7f9fb] text-[#626161]"
                    }`}
                  >
                    <span>{cat.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-[#1d1e24] text-white rounded-lg p-6 text-center">
            <h3 className="text-xl font-medium mb-4">How Can We Help?</h3>
            <p className="text-sm text-gray-300 mb-6">
              Contact our experts for personalized interior design consultation
            </p>
            <Link to="/contact">
              <Button className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors duration-300 w-full flex justify-center items-center gap-2">
                Start Consultation
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
