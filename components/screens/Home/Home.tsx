'use client'

import React, { useRef, useEffect, useState } from "react";
import { ServicesSection } from "./sections/ServicesSection/ServicesSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { TestimonialSection } from "./sections/TestimonialSection/TestimonialSection";
import { AboutSection } from "./sections/AboutSection/AboutSection";
import { OurProcessSection } from "./sections/OurProcessSection/OurProcessSection";
import { OurFeaturedWorksSection } from "./sections/OurFeaturedWorksSection/OurFeaturedWorksSection";
import { FeaturedWorksHeaderSection } from "./sections/FeaturedWorksHeaderSection/FeaturedWorksHeaderSection";
import { BlogSection } from "./sections/BlogSection/BlogSection";
import { CustomCursor } from "../../ui/cursor";
import { CTASection } from "./sections/CTASection/CTASection";
import { HeroImageSlider } from "../../ui/hero-image-slider";
import { MainMenu } from "../../ui/navigation-menu";
import SEO from "../../../src/utils/SEO"; // ✅ adjust path if needed

interface HomeData {
  seoDetails?: {
    metaTitle: string;
    metaDescription: string;
    metaKey?: string;
    seoStructuredData?: string;
  };
}

const Home = (): JSX.Element => {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    fetch("https://interiorvillabd.com/api/globals/home?depth=1&draft=false")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch Home data:", err));
  }, []);

  const seo = data?.seoDetails;

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden">
      {/* ✅ Dynamic SEO from CMS */}
      {seo && (
        <SEO
          title={seo.metaTitle}
          description={seo.metaDescription}
          keywords={seo.metaKey}
          url="https://interiorvillabd.com/"
          extraJsonLd={seo.seoStructuredData}
        />
      )}

      <CustomCursor className="custom-cursor" />

      {/* Hero Section */}
      <div ref={heroContainerRef} className="w-full relative">
        <section className="w-full relative">
          <HeroImageSlider
            autoPlay={true}
            autoPlayInterval={6000}
            showControls={true}
            showIndicators={false}
            transitionEffect="fade"
            imageSize="large"
          />
        </section>

        {/* Header & Navigation */}
        <MainMenu />
      </div>

      {/* Sections */}
      <FeaturedWorksHeaderSection />
      <OurFeaturedWorksSection />
      <AboutSection />
      <ServicesSection />
      <OurProcessSection />
      <TestimonialSection />
      <BlogSection />
      <CTASection />
      <FooterSection />
    </main>
  );
};

export { Home };
