import React from "react";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import {
  HeroSection,
  AboutSection,
  ProcessSection,
  ProjectsSection,
  CTASection
} from "./sections";

import { PageHero } from "../../components/ui/PageHero";

const ResidentialInterior = (): JSX.Element => {
  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />
      
      {/* Hero Section */}
      <PageHero
        title="Residential Interior"
        bgImage="/image.png"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services" },
          { label: "Residential Interior", isActive: true },
        ]}
      />

      {/* Main Content Container */}
      <section className="w-full">
        {/* About Residential Interior Section */}
        <AboutSection />
        
        {/* Our Process Section */}
        <ProcessSection />
        
        {/* Featured Projects Section */}
        <ProjectsSection />
        
        {/* CTA Section */}
        <CTASection />
      </section>
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export default ResidentialInterior;