import React, { useEffect, useState } from "react";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import { BlogGridSection } from "./sections";
import { PageHero } from "../../components/ui/PageHero";
import SEO from "../../src/utils/SEO";

interface BlogData {
  hero?: {
    heroImage?: { url?: string };
    title?: string;
    subtitle?: string;
  };
  seoDetails?: {
    metaTitle: string;
    metaDescription: string;
    metaKey?: string;
    seoStructuredData?: string;
  };
}

const Blog = (): JSX.Element => {
  const [data, setData] = useState<BlogData | null>(null);

  useEffect(() => {
    fetch("https://interiorvillabd.com/api/globals/blog?depth=1&draft=false")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch Blog data:", err));
  }, []);

  const seo = data?.seoDetails;
  const hero = data?.hero;

  return (
    <div className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* SEO */}
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

      {/* PageHero (consistent with other pages) */}
      <PageHero
        title={hero?.title || "Blog"}
        bgImage={
          hero?.heroImage?.url
            ? hero.heroImage.url.replace(/\.(jpg|png)$/i, ".webp")
            : "/image.png"
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog", isActive: true },
        ]}
      />

      {/* Main Content Container */}
      <div className="w-full">
        {/* Blog Grid Section */}
        <BlogGridSection />
      </div>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default Blog;