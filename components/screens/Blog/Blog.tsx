import React, { useEffect, useState } from "react";
import { CustomCursor } from "../../ui/cursor";
import { FooterSection } from "../Home/sections/FooterSection/FooterSection";
import { BlogGridSection } from "./sections";
import { PageHero } from "../../ui/PageHero";
import SEO from "../../../src/utils/SEO"; // ✅ SEO component

interface BlogData {
  hero?: {
    heroImage?: { url?: string };
    title?: string;
  };
  seoDetails?: {
    metaTitle: string;
    metaDescription: string;
    metaKey?: string;
    seoStructuredData?: string;
  };
}

const Blog = (): JSX.Element => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("https://interiorvillabd.com/api/globals/blog?depth=1&draft=false")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch Blog data:", err));
  }, []);

  const seo = data?.seoDetails;
  const hero = data?.hero;

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* ✅ Dynamic SEO */}
      {seo && (
        <SEO
          title={seo.metaTitle}
          description={seo.metaDescription}
          keywords={seo.metaKey}
          url="https://interiorvillabd.com/blog"
          extraJsonLd={seo.seoStructuredData}
        />
      )}

      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />

      <PageHero
        title={hero?.title || "Blog"}
        bgImage={
          hero?.heroImage?.url
            ? hero.heroImage.url.replace(/\.(jpg|png)$/i, ".webp")
            : "/image.png"
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", isActive: true },
        ]}
      />      

      {/* Main Content */}
      <section className="w-full">
        <BlogGridSection />
      </section>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export { Blog };
