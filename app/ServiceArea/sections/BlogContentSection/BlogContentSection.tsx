"use client";
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { ArrowRight } from "lucide-react";
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


interface BlogContentSectionProps {
  serviceArea?: {
    name?: string;
    fullContent?: any;
    googleEmbedCode?: string;
  };
}

export const BlogContentSection = ({ serviceArea }: BlogContentSectionProps): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ---------------- GSAP Animations ---------------- */
  useEffect(() => {
    if (!serviceArea) return;

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
  }, [serviceArea]);

  /* ---------------- Render ---------------- */
  if (!serviceArea) {
    return (
      <div className="py-16 text-center">
        <p>Loading service area information...</p>
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 bg-white relative z-10"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Content */}
        <div ref={contentRef} className="max-w-4xl mx-auto">
          {/* Content */}
          {serviceArea.fullContent?.root && (
            <div
              className="prose prose-lg max-w-none text-[#626161] leading-relaxed text-justify mb-12"
              dangerouslySetInnerHTML={{
                __html: renderLexical(serviceArea.fullContent.root) || '',
              }}
            />
          )}

          {/* Google Maps Embed */}
          {serviceArea.googleEmbedCode && typeof serviceArea.googleEmbedCode === 'string' && (
            <div className="mt-12">
              <h2 className="text-2xl md:text-3xl font-medium text-[#01190c] mb-6">
                Location
              </h2>
              <div
                className="w-full h-[450px] rounded-lg overflow-hidden shadow-lg"
                dangerouslySetInnerHTML={{ __html: serviceArea.googleEmbedCode }}
              />
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-medium text-[#01190c] mb-4">
              Ready to Transform Your Space in {serviceArea.name}?
            </h3>
            <p className="text-[#626161] mb-8 max-w-2xl mx-auto">
              Let's bring your interior design vision to life. Contact us today for a free consultation
              and discover how we can create the perfect space for you.
            </p>
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
