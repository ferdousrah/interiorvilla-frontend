'use client'

import React, { useRef } from "react";
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

const Home = (): JSX.Element => {
  const heroContainerRef = useRef<HTMLDivElement>(null);

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden">
      <CustomCursor className="custom-cursor" />

      {/* Hero Section */}
      <div ref={heroContainerRef} className="w-full relative">
        <section className="w-full h-[800px] relative">
          <HeroImageSlider
            autoPlay={true}
            autoPlayInterval={6000}
            showControls={true}
            showIndicators={false}
            transitionEffect="fade"
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
