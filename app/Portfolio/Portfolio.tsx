// app/Portfolio/Portfolio.tsx
import React, { useEffect, useState } from "react";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import { ProjectsSection, CTASection } from "./sections/index";
import { PageHero } from "../../components/ui/PageHero";
import SEO from "../../src/utils/SEO"; // ✅ SEO component

interface PortfolioData {
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

const Portfolio = (): JSX.Element => {
  const [data, setData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    fetch("https://interiorvillabd.com/api/globals/portfolio?depth=1&draft=false")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch Portfolio data:", err));
  }, []);

  const seo = data?.seoDetails;
  const hero = data?.hero;

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* ✅ Dynamic SEO from CMS */}
      {seo && (
        <SEO
          title={seo.metaTitle}
          description={seo.metaDescription}
          keywords={seo.metaKey}
          url="https://interiorvillabd.com/portfolio"
          extraJsonLd={seo.seoStructuredData}
        />
      )}

      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* PageHero (instead of HeroSection) */}
      <PageHero
        title={hero?.title || "Our Portfolio"}
        bgImage={
          hero?.heroImage?.url
            ? hero.heroImage.url.replace(/\.(jpg|png)$/i, ".webp")
            : "/image.png"
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Portfolio", href: "/portfolio", isActive: true },
        ]}
      />

      {/* Main Content Container */}
      <section className="w-full">
        {/* Projects Section with Filtering */}
        <ProjectsSection />
        
        {/* CTA Section */}
        <CTASection />
      </section>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export default Portfolio;
